import { useState, useMemo, useEffect, useCallback } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormSelect, FormTextarea, FormCheckbox } from '../../../shared/components/ui/FormFields';
import { useTimeOffTypes, useCreateTimeOffRequest } from '../hooks/useTimeOff';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import type { HalfDayPeriod } from '../types/timeoff.types';

const HALF_DAY_PERIOD_OPTIONS = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
];

interface RequestTimeOffModalProps {
  onClose: () => void;
}

export default function RequestTimeOffModal({ onClose }: RequestTimeOffModalProps) {
  const { data: types } = useTimeOffTypes();
  const createRequest = useCreateTimeOffRequest();

  const [typeId, setTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<HalfDayPeriod>('MORNING');
  const [reason, setReason] = useState('');

  // Reset mutation state on mount so stale errors from prior opens are cleared
  useEffect(() => {
    createRequest.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    if (!createRequest.isPending) onClose();
  }, [createRequest.isPending, onClose]);

  const isSingleDay = startDate && endDate && startDate === endDate;

  const businessDaysPreview = useMemo(() => {
    if (!startDate || !endDate) return null;
    if (halfDay) return 0.5;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, [startDate, endDate, halfDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRequest.mutateAsync({
        timeOffTypeId: typeId,
        startDate,
        endDate,
        halfDay: halfDay || undefined,
        halfDayPeriod: halfDay ? halfDayPeriod : undefined,
        reason: reason || undefined,
      });
      onClose();
    } catch {
      // Error is handled by mutation state (createRequest.isError)
    }
  };

  const typeOptions = types?.map((type) => ({ value: type.id, label: type.name })) ?? [];

  return (
    <Modal
      open
      onClose={handleClose}
      title="Request Time Off"
      size="md"
      closeDisabled={createRequest.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormSelect
            label="Leave Type"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            options={typeOptions}
            placeholder="Select type..."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate}
            />
          </div>

          {isSingleDay && (
            <div className="space-y-2">
              <FormCheckbox
                label="Half day"
                checked={halfDay}
                onChange={(e) => setHalfDay(e.target.checked)}
              />
              {halfDay && (
                <FormSelect
                  value={halfDayPeriod}
                  onChange={(e) => setHalfDayPeriod(e.target.value as HalfDayPeriod)}
                  options={HALF_DAY_PERIOD_OPTIONS}
                />
              )}
            </div>
          )}

          {businessDaysPreview !== null && (
            <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-700">
              {businessDaysPreview} business day{businessDaysPreview !== 1 ? 's' : ''}
            </div>
          )}

          <FormTextarea
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Why are you requesting time off?"
          />

          <ModalError error={createRequest.isError ? getApiErrorMessage(createRequest.error, 'Failed to submit request') : null} />
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createRequest.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
