import { usePermissions } from '../hooks/useAdmin';
import type { PermissionDto } from '../types/admin.types';

export default function PermissionsTab() {
  const { data: permissions, isLoading } = usePermissions();

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Loading permissions...</div>;
  }

  if (!permissions || permissions.length === 0) {
    return <div className="text-center py-10 text-gray-500">No permissions found.</div>;
  }

  // Group by resource
  const grouped = permissions.reduce<Record<string, PermissionDto[]>>((acc, p) => {
    (acc[p.resource] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
        <p className="text-sm text-gray-500 mt-1">
          Permissions are managed through database migrations when new features are built.
        </p>
      </div>

      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([resource, perms]) => (
          <div key={resource} className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
              <h4 className="text-sm font-semibold text-gray-700">{resource}</h4>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {perms.map((p) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-mono text-gray-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{p.action}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}
