import { useState, useEffect, useCallback } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormTextarea } from '../../../shared/components/ui/FormFields';
import { useLogTime } from '../hooks/useProjects';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';

interface LogTimeModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export default function LogTimeModal({ open, onClose, projectId }: LogTimeModalProps) {
  const logTime = useLogTime();

  const today = new Date().toISOString().split('T')[0];

  const [logDate, setLogDate] = useState(today);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  // Reset mutation state on mount so stale errors from prior opens are cleared
  useEffect(() => {
    logTime.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    if (!logTime.isPending) onClose();
  }, [logTime.isPending, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logTime.mutateAsync({
        projectId,
        logDate,
        hours: parseFloat(hours),
        description: description || undefined,
      });
      onClose();
    } catch {
      // Error is handled by mutation state
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Log Time"
      size="md"
      closeDisabled={logTime.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormInput
            label="Date"
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            required
          />

          <FormInput
            label="Hours"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            step={0.5}
            min={0.5}
            max={24}
            placeholder="e.g. 2.5"
          />

          <FormTextarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What did you work on?"
          />

          <ModalError error={logTime.isError ? getApiErrorMessage(logTime.error, 'Failed to log time') : null} />
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
            disabled={logTime.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {logTime.isPending ? 'Logging...' : 'Log Time'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
