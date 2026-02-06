import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';

const typeColors: Record<string, string> = {
  POLICY: 'bg-purple-100 text-purple-700',
  CONTRACT: 'bg-blue-100 text-blue-700',
  ONBOARDING: 'bg-green-100 text-green-700',
  COMPLIANCE: 'bg-red-100 text-red-700',
  GENERAL: 'bg-gray-100 text-gray-700',
  OTHER: 'bg-yellow-100 text-yellow-700',
};

export default function AllDocuments() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useDocuments(page);
  const navigate = useNavigate();

  if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>;

  const documents = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Scope</th>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
            <th className="text-center px-4 py-3 font-medium text-gray-700">Shares</th>
            <th className="text-center px-4 py-3 font-medium text-gray-700">Signed</th>
            <th className="text-center px-4 py-3 font-medium text-gray-700">Pending</th>
            <th className="text-left px-4 py-3 font-medium text-gray-700">Uploaded By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <td className="px-4 py-3 font-medium text-gray-900">{doc.title}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[doc.documentType] || typeColors.GENERAL}`}>
                  {doc.documentType}
                </span>
              </td>
              <td className="px-4 py-3">
                {doc.companyWide ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Company</span>
                ) : (
                  <span className="text-xs text-gray-500">Shared</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{doc.status}</td>
              <td className="px-4 py-3 text-center text-gray-600">{doc.shareCount}</td>
              <td className="px-4 py-3 text-center text-green-600">{doc.signedCount}</td>
              <td className="px-4 py-3 text-center text-orange-600">{doc.pendingSignatureCount}</td>
              <td className="px-4 py-3 text-gray-600">{doc.uploadedByName}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-sm text-gray-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="text-sm text-gray-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
