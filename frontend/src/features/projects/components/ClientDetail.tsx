import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Globe,
  Mail,
  Phone,
  User,
  StickyNote,
  FolderOpen,
} from 'lucide-react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import { useClient, useDeleteClient } from '../hooks/useProjects';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import EditClientModal from './EditClientModal';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data: client, isLoading, isError, error } = useClient(id!);
  const deleteClient = useDeleteClient();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canUpdate = hasPermission('CLIENT_UPDATE');
  const canDelete = hasPermission('CLIENT_DELETE');

  const handleDelete = () => {
    deleteClient.mutate(id!, {
      onSuccess: () => {
        navigate('/clients');
      },
    });
  };

  if (isLoading) {
    return (
      <>
        <Header title="Client Details" />
        <div className="flex items-center justify-center py-20 text-gray-500">
          Loading client...
        </div>
      </>
    );
  }

  if (isError || !client) {
    return (
      <>
        <Header title="Client Details" />
        <div className="p-6">
          <Link
            to="/clients"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft size={16} />
            Back to clients
          </Link>
          <div className="flex items-center justify-center py-20 text-red-500">
            {getApiErrorMessage(error, 'Client not found')}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Client Details" />

      <div className="p-6 space-y-6">
        {/* Back link */}
        <Link
          to="/clients"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to clients
        </Link>

        {/* Header area */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">{client.name}</h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    client.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {client.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {client.industry && (
                <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  {client.industry}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {canUpdate && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Contact info grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
            <InfoItem
              icon={User}
              label="Contact Name"
              value={client.contactName || '—'}
            />
            <InfoItem
              icon={Mail}
              label="Contact Email"
              value={client.contactEmail || '—'}
            />
            <InfoItem
              icon={Phone}
              label="Contact Phone"
              value={client.contactPhone || '—'}
            />
            <InfoItem
              icon={Globe}
              label="Website"
              value={client.website || '—'}
              href={client.website || undefined}
            />
            <InfoItem
              icon={StickyNote}
              label="Notes"
              value={client.notes || '—'}
            />
          </div>
        </div>

        {/* Projects section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={18} className="text-gray-400" />
            <h4 className="font-semibold text-gray-900">Projects</h4>
          </div>
          <p className="text-sm text-gray-600">
            This client has{' '}
            <span className="font-medium text-gray-900">{client.projectCount}</span>{' '}
            {client.projectCount === 1 ? 'project' : 'projects'} associated.
          </p>
          {client.projectCount > 0 && (
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
            >
              View all projects
            </Link>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Client</h4>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{client.name}</span>?
              This action cannot be undone.
            </p>

            {deleteClient.isError && (
              <p className="text-sm text-red-600 mb-4">
                {getApiErrorMessage(deleteClient.error, 'Failed to delete client')}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteClient.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteClient.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && (
        <EditClientModal
          client={client}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        {href ? (
          <a
            href={href.startsWith('http') ? href : `https://${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}
