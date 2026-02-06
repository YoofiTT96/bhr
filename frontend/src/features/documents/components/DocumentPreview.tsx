import { ExternalLink } from 'lucide-react';
import { useDocumentPreview } from '../hooks/useDocuments';

interface DocumentPreviewProps {
  driveId: string;
  itemId: string;
  webUrl?: string | null;
}

export default function DocumentPreview({ driveId, itemId, webUrl }: DocumentPreviewProps) {
  const { data: preview, isLoading } = useDocumentPreview(driveId, itemId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-xs text-gray-400">Loading preview...</p>
      </div>
    );
  }

  if (preview?.available && preview.previewUrl) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <span className="text-xs font-medium text-gray-600">Document Preview</span>
          {webUrl && (
            <a
              href={webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <ExternalLink size={12} />
              Open in SharePoint
            </a>
          )}
        </div>
        <iframe
          src={preview.previewUrl}
          className="w-full border-0"
          style={{ height: '600px' }}
          title="Document Preview"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    );
  }

  // Fallback: no preview available
  if (webUrl) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Preview is not available for this document.</p>
        <a
          href={webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
        >
          <ExternalLink size={14} />
          Open in SharePoint
        </a>
      </div>
    );
  }

  return null;
}
