import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import { useClients } from '../hooks/useProjects';
import CreateClientModal from './CreateClientModal';

export default function ClientsPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data, isLoading, isError } = useClients(page);

  const canCreate = hasPermission('CLIENT_CREATE');

  return (
    <>
      <Header title="Clients" />

      <div className="p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Clients</h3>

          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Create Client
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-gray-500">
            Loading clients...
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center justify-center py-20 text-red-500">
            Failed to load clients. Please try again later.
          </div>
        )}

        {/* Empty state */}
        {data && data.content.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Building2 size={48} className="mb-4" />
            <p className="text-lg font-medium text-gray-500">No clients yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {canCreate
                ? 'Create your first client to get started.'
                : 'No clients have been added yet.'}
            </p>
          </div>
        )}

        {/* Table */}
        {data && data.content.length > 0 && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.content.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/clients/${client.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700 text-sm"
                        >
                          {client.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {client.industry || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {client.contactName || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {client.projectCount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            client.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                Showing {data.number * data.size + 1}–
                {Math.min((data.number + 1) * data.size, data.totalElements)} of{' '}
                {data.totalElements}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={data.first}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span>
                  Page {data.number + 1} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.last}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Client Modal */}
      {showCreateModal && (
        <CreateClientModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
