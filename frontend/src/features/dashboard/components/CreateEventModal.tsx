import { useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormSelect, FormTextarea } from '../../../shared/components/ui/FormFields';
import { useCreateEvent } from '../hooks/useDashboard';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import { EVENT_TYPE_OPTIONS } from '../constants';
import type { EventType } from '../types/dashboard.types';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateEventModal({ open, onClose }: CreateEventModalProps) {
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState<EventType>('MEETING');

  const resetFields = () => {
    setTitle('');
    setDescription('');
    setEventDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setEventType('MEETING');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvent.mutateAsync({
        title,
        description: description || undefined,
        eventDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        location: location || undefined,
        eventType,
      });
      resetFields();
      onClose();
    } catch {
      // Error is handled by mutation state
    }
  };

  const handleClose = () => {
    if (!createEvent.isPending) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Event"
      closeDisabled={createEvent.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Event title"
          />

          <FormSelect
            label="Event Type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            options={EVENT_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
          />

          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Event description (optional)"
          />

          <FormInput
            label="Date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <FormInput
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <FormInput
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
          />

          <ModalError error={createEvent.isError ? getApiErrorMessage(createEvent.error, 'Failed to create event') : null} />
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
            disabled={createEvent.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createEvent.isPending ? 'Creating...' : 'Create Event'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
