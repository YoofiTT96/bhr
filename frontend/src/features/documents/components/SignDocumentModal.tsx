import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useSignDocument, useDeclineSignature } from '../hooks/useDocuments';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import SignatureCanvas from './SignatureCanvas';
import type { DocumentSignature } from '../types/document.types';

interface SignDocumentModalProps {
  signature: DocumentSignature;
  open: boolean;
  onClose: () => void;
}

export default function SignDocumentModal({ signature, open, onClose }: SignDocumentModalProps) {
  const signDocument = useSignDocument();
  const declineSignature = useDeclineSignature();
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  if (!open) return null;

  const handleSign = async () => {
    if (!signatureData) return;
    try {
      await signDocument.mutateAsync({ sigId: signature.id, data: { signatureData } });
      onClose();
    } catch {
      // handled by mutation state
    }
  };

  const handleDecline = async () => {
    try {
      await declineSignature.mutateAsync({ sigId: signature.id, reason: declineReason || undefined });
      onClose();
    } catch {
      // handled by mutation state
    }
  };

  const error = signDocument.isError
    ? getApiErrorMessage(signDocument.error, 'Failed to sign document')
    : declineSignature.isError
    ? getApiErrorMessage(declineSignature.error, 'Failed to decline signature')
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Sign Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{signature.documentTitle}</h3>
            {signature.documentSharepointUrl && (
              <a
                href={signature.documentSharepointUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
              >
                <ExternalLink size={12} />
                Open Document to Review
              </a>
            )}
          </div>

          {!showDecline ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Signature</label>
                <SignatureCanvas onSignatureChange={setSignatureData} />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowDecline(true)}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Decline to Sign
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSign}
                    disabled={!signatureData || signDocument.isPending}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {signDocument.isPending ? 'Signing...' : 'Sign Document'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for declining (optional)</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Explain why you are declining..."
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDecline(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleDecline}
                  disabled={declineSignature.isPending}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {declineSignature.isPending ? 'Declining...' : 'Decline Signature'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
