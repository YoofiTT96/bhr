import { useState, useEffect, useCallback } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormTextarea, FormCheckbox } from '../../../shared/components/ui/FormFields';
import { useUpdateClient } from '../hooks/useProjects';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import type { Client } from '../types/project.types';

interface EditClientModalProps {
  open: boolean;
  onClose: () => void;
  client: Client;
}

export default function EditClientModal({ open, onClose, client }: EditClientModalProps) {
  const updateClient = useUpdateClient();

  const [name, setName] = useState(client.name);
  const [industry, setIndustry] = useState(client.industry ?? '');
  const [contactName, setContactName] = useState(client.contactName ?? '');
  const [contactEmail, setContactEmail] = useState(client.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(client.contactPhone ?? '');
  const [website, setWebsite] = useState(client.website ?? '');
  const [notes, setNotes] = useState(client.notes ?? '');
  const [isActive, setIsActive] = useState(client.isActive);

  useEffect(() => {
    setName(client.name);
    setIndustry(client.industry ?? '');
    setContactName(client.contactName ?? '');
    setContactEmail(client.contactEmail ?? '');
    setContactPhone(client.contactPhone ?? '');
    setWebsite(client.website ?? '');
    setNotes(client.notes ?? '');
    setIsActive(client.isActive);
  }, [client]);

  useEffect(() => {
    updateClient.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    if (!updateClient.isPending) onClose();
  }, [updateClient.isPending, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateClient.mutateAsync({
        id: client.id,
        data: {
          name,
          industry: industry || undefined,
          contactName: contactName || undefined,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
          website: website || undefined,
          notes: notes || undefined,
          isActive,
        },
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
      title="Edit Client"
      size="md"
      closeDisabled={updateClient.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FormInput
            label="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />

          <FormInput
            label="Contact Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />

          <FormInput
            label="Contact Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />

          <FormInput
            label="Contact Phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />

          <FormInput
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <FormTextarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <FormCheckbox
            label="Active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />

          <ModalError error={updateClient.isError ? getApiErrorMessage(updateClient.error, 'Failed to update client') : null} />
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
            disabled={updateClient.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {updateClient.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
