import { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { useRoles, useEmployeeRoles, useAssignRoles } from '../hooks/useAdmin';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';

interface Props {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

export default function AssignRolesModal({ employeeId, employeeName, onClose }: Props) {
  const { data: allRoles } = useRoles();
  const { data: currentRoles } = useEmployeeRoles(employeeId);
  const assignRoles = useAssignRoles();

  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentRoles) {
      setSelectedRoleIds(new Set(currentRoles.map((r) => r.id)));
    }
  }, [currentRoles]);

  const toggle = (id: string) => {
    const next = new Set(selectedRoleIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRoleIds(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignRoles.mutate(
      {
        employeeId,
        data: { roleIds: [...selectedRoleIds] },
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <Modal open onClose={onClose} title="Manage Roles" size="md">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <p className="text-sm text-gray-500 -mt-2">{employeeName}</p>

          {!allRoles ? (
            <p className="text-sm text-gray-500">Loading roles...</p>
          ) : (
            <div className="space-y-3">
              {allRoles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.has(role.id)}
                    onChange={() => toggle(role.id)}
                    className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{role.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <ModalError error={assignRoles.isError ? getApiErrorMessage(assignRoles.error, 'Failed to assign roles') : null} />
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
            disabled={assignRoles.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {assignRoles.isPending ? 'Saving...' : 'Save'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
