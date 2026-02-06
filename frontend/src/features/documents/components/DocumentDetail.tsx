import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Share2, FileSignature, Trash2, Globe, AlertCircle } from 'lucide-react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import { useDocument, useDocumentShares, useDocumentSignatures, useDeleteDocument } from '../hooks/useDocuments';
import ShareDocumentModal from './ShareDocumentModal';
import RequestSignatureModal from './RequestSignatureModal';
import DocumentPreview from './DocumentPreview';
import SignDocumentModal from './SignDocumentModal';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data: doc, isLoading } = useDocument(id!);
  const { data: shares } = useDocumentShares(id!);
  const { data: signatures } = useDocumentSignatures(id!);
  const deleteDoc = useDeleteDocument();

  const [showShareModal, setShowShareModal] = useState(false);
  const [showRequestSigModal, setShowRequestSigModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  const canShare = hasPermission('DOCUMENT_SHARE');
  const canDelete = hasPermission('DOCUMENT_DELETE');

  if (isLoading) {
    return (
      <>
        <Header title="Document" />
        <div className="p-6 text-sm text-gray-500">Loading...</div>
      </>
    );
  }

  if (!doc) {
    return (
      <>
        <Header title="Document" />
        <div className="p-6 text-sm text-gray-500">Document not found.</div>
      </>
    );
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    await deleteDoc.mutateAsync(doc.id);
    navigate('/documents');
  };

  return (
    <>
      <Header title={doc.title} />

      <div className="p-6">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </button>

        {/* Document info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{doc.title}</h2>
              {doc.description && (
                <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span>Type: <strong>{doc.documentType}</strong></span>
                <span>Status: <strong>{doc.status}</strong></span>
                {doc.companyWide && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                    <Globe size={12} />
                    Company-wide
                  </span>
                )}
                <span>Uploaded by: <strong>{doc.uploadedByName}</strong></span>
                {doc.signatureDeadline && (
                  <span>Deadline: <strong>{doc.signatureDeadline}</strong></span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.sharePointDocument && doc.sharepointWebUrl && (
                <a
                  href={doc.sharepointWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-100"
                >
                  <ExternalLink size={14} />
                  Open in SharePoint
                </a>
              )}
              {canShare && !doc.companyWide && (
                <>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-200"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                  <button
                    onClick={() => setShowRequestSigModal(true)}
                    className="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-orange-100"
                  >
                    <FileSignature size={14} />
                    Request Signatures
                  </button>
                </>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-red-100"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pending Signature Action Pane */}
        {doc.mySignatureStatus === 'PENDING' && doc.mySignatureId && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">Your Signature Required</h3>
                <p className="text-sm text-gray-600 mt-1">
                  This document has been assigned to you for signature. Please review the document and sign it.
                  {doc.signatureDeadline && (
                    <span className="text-orange-700 font-medium">
                      {' '}Deadline: {new Date(doc.signatureDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setShowSignModal(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  <FileSignature size={16} />
                  Sign Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inline document preview */}
        {doc.sharePointDocument && doc.sharepointDriveId && doc.sharepointItemId && (
          <div className="mb-6">
            <DocumentPreview
              driveId={doc.sharepointDriveId}
              itemId={doc.sharepointItemId}
              webUrl={doc.sharepointWebUrl}
            />
          </div>
        )}

        {/* Shares panel */}
        {doc.companyWide ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-blue-600" />
              <p className="text-sm text-blue-800 font-medium">This document is visible to all employees.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Shared With ({shares?.length || 0})
            </h3>
            {shares && shares.length > 0 ? (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="text-sm text-gray-900">{share.employeeName}</span>
                      <span className="text-xs text-gray-400 ml-2">shared by {share.sharedByName}</span>
                    </div>
                    <span className={`text-xs ${share.viewedAt ? 'text-green-600' : 'text-gray-400'}`}>
                      {share.viewedAt ? `Viewed ${new Date(share.viewedAt).toLocaleDateString()}` : 'Not viewed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Not shared with anyone yet.</p>
            )}
          </div>
        )}

        {/* Signatures panel */}
        {doc.requiresSignature && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Signatures ({doc.signedCount} signed, {doc.pendingSignatureCount} pending)
            </h3>
            {signatures && signatures.length > 0 ? (
              <div className="space-y-2">
                {signatures.map((sig) => (
                  <div key={sig.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-900">{sig.employeeName}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        sig.status === 'SIGNED'
                          ? 'bg-green-100 text-green-700'
                          : sig.status === 'DECLINED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {sig.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No signature requests yet.</p>
            )}
          </div>
        )}
      </div>

      <ShareDocumentModal docId={doc.id} open={showShareModal} onClose={() => setShowShareModal(false)} />
      <RequestSignatureModal docId={doc.id} open={showRequestSigModal} onClose={() => setShowRequestSigModal(false)} />

      {doc.mySignatureId && (
        <SignDocumentModal
          signature={{
            id: doc.mySignatureId,
            documentId: doc.id,
            documentTitle: doc.title,
            documentSharepointUrl: doc.sharepointWebUrl ?? undefined,
            employeeId: '',
            employeeName: '',
            status: doc.mySignatureStatus ?? 'PENDING',
            hasSignatureData: false,
            createdAt: doc.createdAt,
          }}
          open={showSignModal}
          onClose={() => setShowSignModal(false)}
        />
      )}
    </>
  );
}
