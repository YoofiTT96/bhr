import { useState } from 'react';
import { Globe, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCompanyWideDocuments } from '../hooks/useDocuments';
import { useNavigate } from 'react-router-dom';

export default function CompanyDocuments() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useCompanyWideDocuments(page, 12);
  const navigate = useNavigate();

  const documents = data?.content || [];
  const totalPages = data?.totalPages || 0;

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading company documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Globe size={48} strokeWidth={1.5} />
        <p className="mt-4 text-sm">No company-wide documents yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => navigate(`/documents/${doc.id}`)}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  {doc.documentType}
                </span>
              </div>
            </div>
            {doc.description && (
              <p className="mt-2 text-xs text-gray-500 line-clamp-2">{doc.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">Uploaded by {doc.uploadedByName}</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
