import { useState, useEffect, useCallback } from 'react';
import { Check, XCircle } from 'lucide-react';
import { Modal, ModalBody, ModalError } from '../../../shared/components/ui/Modal';
import { FormTextarea } from '../../../shared/components/ui/FormFields';
import { useReviewTimesheet } from '../hooks/useAttendance';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import type { Timesheet } from '../types/attendance.types';

interface ReviewTimesheetModalProps {
  timesheet: Timesheet;
  onClose: () => void;
}

export default function ReviewTimesheetModal({ timesheet, onClose }: ReviewTimesheetModalProps) {
  const reviewMutation = useReviewTimesheet();
  const [note, setNote] = useState('');

  useEffect(() => {
    reviewMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    if (!reviewMutation.isPending) onClose();
  }, [reviewMutation.isPending, onClose]);

  const handleReview = async (decision: 'APPROVED' | 'REJECTED') => {
    try {
      await reviewMutation.mutateAsync({
        id: timesheet.id,
        data: { decision, note: note || undefined },
      });
      onClose();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <Modal
      open
      onClose={handleClose}
      title="Review Timesheet"
      size="md"
      closeDisabled={reviewMutation.isPending}
    >
      <ModalBody>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Employee</span>
            <span className="font-medium text-gray-900">{timesheet.employeeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Week of</span>
            <span className="font-medium text-gray-900">{timesheet.weekStart}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Hours</span>
            <span className="font-medium text-gray-900">{timesheet.totalHours}h</span>
          </div>
        </div>

        <FormTextarea
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Add a note..."
        />

        <ModalError error={reviewMutation.isError ? getApiErrorMessage(reviewMutation.error, 'Failed to review timesheet') : null} />

        {/* Actions - custom layout with Approve/Reject buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => handleReview('REJECTED')}
            disabled={reviewMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            <XCircle size={16} />
            Reject
          </button>
          <button
            onClick={() => handleReview('APPROVED')}
            disabled={reviewMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Check size={16} />
            Approve
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
}
