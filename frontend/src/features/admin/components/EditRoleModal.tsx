import { useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormTextarea, FormLabel } from '../../../shared/components/ui/FormFields';
import { useUpdateRole, usePermissions } from '../hooks/useAdmin';
import PermissionChecklist from './PermissionChecklist';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import type { RoleDto } from '../types/admin.types';

interface Props {
  role: RoleDto;
  onClose: () => void;
}

export default function EditRoleModal({ role, onClose }: Props) {
  const { data: permissions } = usePermissions();
  const updateRole = useUpdateRole();

  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || '');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(
    new Set(role.permissions.map((p) => p.id)),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRole.mutate(
      {
        id: role.id,
        data: {
          name: name.trim() !== role.name ? name.trim() : undefined,
          description: description.trim() !== (role.description || '') ? description.trim() : undefined,
          permissionIds: [...selectedPermissionIds],
        },
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <Modal open onClose={onClose} title={`Edit Role: ${role.name}`} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalBody className="max-h-[60vh] overflow-y-auto">
          <FormInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          <div>
            <FormLabel>Permissions</FormLabel>
            <PermissionChecklist
              permissions={permissions ?? []}
              selected={selectedPermissionIds}
              onChange={setSelectedPermissionIds}
            />
          </div>

          <ModalError error={updateRole.isError ? getApiErrorMessage(updateRole.error, 'Failed to update role') : null} />
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
            disabled={!name.trim() || updateRole.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {updateRole.isPending ? 'Saving...' : 'Save'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
