import { useState, useEffect, useCallback } from 'react';
import { Check, XCircle } from 'lucide-react';
import { Modal, ModalBody, ModalError } from '../../../shared/components/ui/Modal';
import { FormTextarea } from '../../../shared/components/ui/FormFields';
import { useReviewTimeOffRequest } from '../hooks/useTimeOff';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import type { TimeOffRequest } from '../types/timeoff.types';

interface ReviewModalProps {
  request: TimeOffRequest;
  onClose: () => void;
}

export default function ReviewModal({ request, onClose }: ReviewModalProps) {
  const reviewMutation = useReviewTimeOffRequest();
  const [note, setNote] = useState('');

  // Reset mutation state on mount so stale errors from prior opens are cleared
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
        id: request.id,
        data: { decision, note: note || undefined },
      });
      onClose();
    } catch {
      // Error is handled by mutation state (reviewMutation.isError)
    }
  };

  return (
    <Modal
      open
      onClose={handleClose}
      title="Review Request"
      size="md"
      closeDisabled={reviewMutation.isPending}
    >
      <ModalBody>
        {/* Request details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Employee</span>
            <span className="font-medium text-gray-900">{request.employeeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="font-medium text-gray-900">{request.timeOffTypeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Dates</span>
            <span className="font-medium text-gray-900">
              {request.startDate} — {request.endDate}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium text-gray-900">
              {request.businessDays} day{request.businessDays !== 1 ? 's' : ''}
              {request.halfDay && ` (${request.halfDayPeriod?.toLowerCase()})`}
            </span>
          </div>
          {request.reason && (
            <div>
              <span className="text-gray-500 block mb-1">Reason</span>
              <p className="text-gray-900">{request.reason}</p>
            </div>
          )}
        </div>

        <FormTextarea
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Add a note..."
        />

        <ModalError error={reviewMutation.isError ? getApiErrorMessage(reviewMutation.error, 'Failed to review request') : null} />

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
