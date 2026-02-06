import { useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormTextarea, FormLabel } from '../../../shared/components/ui/FormFields';
import { useCreateRole, usePermissions } from '../hooks/useAdmin';
import PermissionChecklist from './PermissionChecklist';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';

interface Props {
  onClose: () => void;
}

export default function CreateRoleModal({ onClose }: Props) {
  const { data: permissions } = usePermissions();
  const createRole = useCreateRole();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRole.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        permissionIds: [...selectedPermissionIds],
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <Modal open onClose={onClose} title="Create Role" size="lg">
      <form onSubmit={handleSubmit}>
        <ModalBody className="max-h-[60vh] overflow-y-auto">
          <FormInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. TEAM_LEAD"
          />

          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What is this role for?"
          />

          <div>
            <FormLabel>Permissions</FormLabel>
            <PermissionChecklist
              permissions={permissions ?? []}
              selected={selectedPermissionIds}
              onChange={setSelectedPermissionIds}
            />
          </div>

          <ModalError error={createRole.isError ? getApiErrorMessage(createRole.error, 'Failed to create role') : null} />
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || createRole.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createRole.isPending ? 'Creating...' : 'Create'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
