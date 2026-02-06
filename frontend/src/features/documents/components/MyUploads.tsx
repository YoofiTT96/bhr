import { Upload, FileText } from 'lucide-react';
import { useMyUploads } from '../hooks/useDocuments';
import { useNavigate } from 'react-router-dom';

export default function MyUploads() {
  const { data: documents, isLoading } = useMyUploads();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading your uploads...</div>;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Upload size={48} strokeWidth={1.5} />
        <p className="mt-4 text-sm">You haven't uploaded any documents yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          onClick={() => navigate(`/documents/${doc.id}`)}
          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  {doc.documentType}
                </span>
                {doc.companyWide && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    Company-wide
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span>{doc.shareCount} shared</span>
            {doc.requiresSignature && (
              <span>{doc.signedCount} signed / {doc.pendingSignatureCount} pending</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
