import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRoles, useDeleteRole } from '../hooks/useAdmin';
import { useAuth } from '../../auth/context/AuthContext';
import CreateRoleModal from './CreateRoleModal';
import EditRoleModal from './EditRoleModal';
import type { RoleDto } from '../types/admin.types';

const DEFAULT_ROLES = new Set(['ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE']);

export default function RolesTab() {
  const { hasPermission } = useAuth();
  const { data: roles, isLoading } = useRoles();
  const deleteRole = useDeleteRole();

  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);

  const canCreate = hasPermission('ROLE_CREATE');
  const canUpdate = hasPermission('ROLE_UPDATE');
  const canDelete = hasPermission('ROLE_DELETE');

  const handleDelete = (role: RoleDto) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    deleteRole.mutate(role.id);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Loading roles...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Roles</h3>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Create Role
          </button>
        )}
      </div>

      {!roles || roles.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No roles found.</div>
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{role.name}</h4>
                    {DEFAULT_ROLES.has(role.name) && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {canUpdate && (
                    <button
                      onClick={() => setEditingRole(role)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                      title="Edit role"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {canDelete && !DEFAULT_ROLES.has(role.name) && (
                    <button
                      onClick={() => handleDelete(role)}
                      disabled={deleteRole.isPending}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                      title="Delete role"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions summary */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role.permissions.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                ) : (
                  role.permissions.map((p) => (
                    <span
                      key={p.id}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                    >
                      {p.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateRoleModal onClose={() => setShowCreate(false)} />}
      {editingRole && (
        <EditRoleModal role={editingRole} onClose={() => setEditingRole(null)} />
      )}
    </div>
  );
}
