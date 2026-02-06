import { useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormTextarea } from '../../../shared/components/ui/FormFields';
import { useCreateClient } from '../hooks/useProjects';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateClientModal({ open, onClose }: Props) {
  const createClient = useCreateClient();

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setName('');
    setIndustry('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setWebsite('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClient.mutate(
      {
        name: name.trim(),
        industry: industry.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        website: website.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    if (!createClient.isPending) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Client"
      closeDisabled={createClient.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Client name"
          />

          <FormInput
            label="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Technology, Finance, Healthcare"
          />

          <FormInput
            label="Contact Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Primary contact person"
          />

          <FormInput
            label="Contact Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contact@example.com"
          />

          <FormInput
            label="Contact Phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
          />

          <FormInput
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />

          <FormTextarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any additional notes about this client..."
          />

          <ModalError error={createClient.isError ? getApiErrorMessage(createClient.error, 'Failed to create client') : null} />
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || createClient.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createClient.isPending ? 'Creating...' : 'Create Client'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
