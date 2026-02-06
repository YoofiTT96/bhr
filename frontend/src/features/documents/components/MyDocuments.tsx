import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink } from 'lucide-react';
import { useMyDocuments } from '../hooks/useDocuments';
import { documentService } from '../services/documentService';
import type { Document } from '../types/document.types';

const typeColors: Record<string, string> = {
  POLICY: 'bg-purple-100 text-purple-700',
  CONTRACT: 'bg-blue-100 text-blue-700',
  ONBOARDING: 'bg-green-100 text-green-700',
  COMPLIANCE: 'bg-red-100 text-red-700',
  GENERAL: 'bg-gray-100 text-gray-700',
  OTHER: 'bg-yellow-100 text-yellow-700',
};

export default function MyDocuments() {
  const { data: documents, isLoading } = useMyDocuments();
  const navigate = useNavigate();

  const handleOpen = (doc: Document) => {
    documentService.markViewed(doc.id);
    navigate(`/documents/${doc.id}`);
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading documents...</div>;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No documents shared with you yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 cursor-pointer transition-colors"
          onClick={() => handleOpen(doc)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">{doc.title}</h3>
                {doc.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[doc.documentType] || typeColors.GENERAL}`}>
                    {doc.documentType}
                  </span>
                  {doc.mySignatureStatus === 'PENDING' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      Pending Signature
                    </span>
                  )}
                  {doc.mySignatureStatus === 'SIGNED' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Signed
                    </span>
                  )}
                  {doc.mySignatureStatus === 'DECLINED' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Declined
                    </span>
                  )}
                  <span className="text-xs text-gray-400">by {doc.uploadedByName}</span>
                </div>
              </div>
            </div>
            {doc.sharePointDocument && (
              <ExternalLink size={16} className="text-gray-400 shrink-0" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
