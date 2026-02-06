import { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormSelect, FormTextarea } from '../../../shared/components/ui/FormFields';
import { useUpdateEvent } from '../hooks/useDashboard';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import { EVENT_TYPE_OPTIONS } from '../constants';
import type { CompanyEvent, EventType } from '../types/dashboard.types';

interface EditEventModalProps {
  open: boolean;
  event: CompanyEvent | null;
  onClose: () => void;
}

export default function EditEventModal({ open, event, onClose }: EditEventModalProps) {
  const updateEvent = useUpdateEvent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState<EventType>('MEETING');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? '');
      setEventDate(event.eventDate);
      setStartTime(event.startTime ?? '');
      setEndTime(event.endTime ?? '');
      setLocation(event.location ?? '');
      setEventType(event.eventType);
    }
  }, [event]);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        data: {
          title,
          description: description || undefined,
          eventDate,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          location: location || undefined,
          eventType,
        },
      });
      onClose();
    } catch {
      // Error is handled by mutation state
    }
  };

  const handleClose = () => {
    if (!updateEvent.isPending) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Event"
      closeDisabled={updateEvent.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
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

          <ModalError error={updateEvent.isError ? getApiErrorMessage(updateEvent.error, 'Failed to update event') : null} />
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
            disabled={updateEvent.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {updateEvent.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
