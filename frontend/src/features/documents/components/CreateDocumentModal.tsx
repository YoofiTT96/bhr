import { useState, useRef } from 'react';
import { X, Upload, FolderSearch } from 'lucide-react';
import { useCreateDocument, useSharePointStatus, useSharePointUpload } from '../hooks/useDocuments';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import SharePointBrowser from './SharePointBrowser';
import type { SharePointItem, SharePointLibrary } from '../types/document.types';

interface CreateDocumentModalProps {
  open: boolean;
  onClose: () => void;
}

const documentTypes = ['GENERAL', 'POLICY', 'CONTRACT', 'ONBOARDING', 'COMPLIANCE', 'OTHER'];

type Mode = 'browse' | 'upload' | null;

export default function CreateDocumentModal({ open, onClose }: CreateDocumentModalProps) {
  const createDocument = useCreateDocument();
  const uploadMutation = useSharePointUpload();
  const { data: spStatus } = useSharePointStatus();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState('GENERAL');
  const [companyWide, setCompanyWide] = useState(false);
  const [requiresSignature, setRequiresSignature] = useState(false);
  const [signatureDeadline, setSignatureDeadline] = useState('');
  const [mode, setMode] = useState<Mode>(null);

  // SharePoint fields
  const [spSiteId, setSpSiteId] = useState('');
  const [spDriveId, setSpDriveId] = useState('');
  const [spItemId, setSpItemId] = useState('');
  const [spWebUrl, setSpWebUrl] = useState('');
  const [spFileName, setSpFileName] = useState('');
  const [spFileSize, setSpFileSize] = useState<number | undefined>();
  const [spMimeType, setSpMimeType] = useState('');

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<SharePointLibrary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const configuredLibraries = spStatus?.libraries?.filter((lib) => lib.configured) || [];

  const resetFields = () => {
    setTitle('');
    setDescription('');
    setDocumentType('GENERAL');
    setCompanyWide(false);
    setRequiresSignature(false);
    setSignatureDeadline('');
    setSpSiteId('');
    setSpDriveId('');
    setSpItemId('');
    setSpWebUrl('');
    setSpFileName('');
    setSpFileSize(undefined);
    setSpMimeType('');
    setMode(null);
    setSelectedFile(null);
    setSelectedLibrary(null);
  };

  const handleSelectFile = (item: SharePointItem, siteId: string, driveId: string) => {
    setSpSiteId(siteId);
    setSpDriveId(driveId);
    setSpItemId(item.itemId);
    setSpWebUrl(item.webUrl);
    setSpFileName(item.name);
    setSpFileSize(item.size);
    setSpMimeType(item.mimeType || '');
    if (!title) setTitle(item.name);
    setMode(null);
  };

  const handleUploadAndCreate = async () => {
    if (!selectedFile || !selectedLibrary) return;

    try {
      const uploaded = await uploadMutation.mutateAsync({
        driveId: selectedLibrary.driveId,
        file: selectedFile,
      });

      // Create the document record with the uploaded file's metadata
      await createDocument.mutateAsync({
        title: title || selectedFile.name,
        description: description || undefined,
        documentType: documentType as 'GENERAL',
        companyWide,
        requiresSignature,
        signatureDeadline: signatureDeadline || undefined,
        sharepointSiteId: selectedLibrary.siteId,
        sharepointDriveId: selectedLibrary.driveId,
        sharepointItemId: uploaded.itemId,
        sharepointWebUrl: uploaded.webUrl,
        sharepointFileName: uploaded.name,
        sharepointFileSize: uploaded.size,
        sharepointMimeType: uploaded.mimeType || undefined,
      });

      resetFields();
      onClose();
    } catch {
      // handled by mutation state
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If we're in upload mode, do upload flow
    if (mode === 'upload' && selectedFile && selectedLibrary) {
      await handleUploadAndCreate();
      return;
    }

    // Otherwise, standard browse flow
    try {
      await createDocument.mutateAsync({
        title,
        description: description || undefined,
        documentType: documentType as 'GENERAL',
        companyWide,
        requiresSignature,
        signatureDeadline: signatureDeadline || undefined,
        sharepointSiteId: spSiteId || undefined,
        sharepointDriveId: spDriveId || undefined,
        sharepointItemId: spItemId || undefined,
        sharepointWebUrl: spWebUrl || undefined,
        sharepointFileName: spFileName || undefined,
        sharepointFileSize: spFileSize,
        sharepointMimeType: spMimeType || undefined,
      });
      resetFields();
      onClose();
    } catch {
      // handled by mutation state
    }
  };

  const isUploading = uploadMutation.isPending;
  const isCreating = createDocument.isPending;
  const isBusy = isUploading || isCreating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Add Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {documentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="companyWide"
              checked={companyWide}
              onChange={(e) => {
                setCompanyWide(e.target.checked);
                if (e.target.checked) {
                  setRequiresSignature(false);
                  setSignatureDeadline('');
                }
              }}
              className="rounded border-gray-300"
            />
            <label htmlFor="companyWide" className="text-sm text-gray-700">
              Company-wide <span className="text-gray-400">(visible to all employees)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresSignature"
              checked={requiresSignature}
              onChange={(e) => setRequiresSignature(e.target.checked)}
              disabled={companyWide}
              className="rounded border-gray-300 disabled:opacity-50"
            />
            <label htmlFor="requiresSignature" className={`text-sm ${companyWide ? 'text-gray-400' : 'text-gray-700'}`}>
              Requires signature
            </label>
          </div>

          {requiresSignature && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signature Deadline</label>
              <input
                type="date"
                value={signatureDeadline}
                onChange={(e) => setSignatureDeadline(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}

          {/* SharePoint integration */}
          {spFileName && mode !== 'upload' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 font-medium">SharePoint file linked:</p>
              <p className="text-sm text-blue-900 mt-1">{spFileName}</p>
              <button
                type="button"
                onClick={() => { setSpFileName(''); setSpItemId(''); }}
                className="text-xs text-blue-600 underline mt-1"
              >
                Remove
              </button>
            </div>
          ) : mode === 'upload' ? (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Upload to SharePoint</span>
                <button type="button" onClick={() => { setMode(null); setSelectedFile(null); setSelectedLibrary(null); }} className="text-xs text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Library</label>
                <select
                  value={selectedLibrary?.key || ''}
                  onChange={(e) => {
                    const lib = configuredLibraries.find((l) => l.key === e.target.value) || null;
                    setSelectedLibrary(lib);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select a library...</option>
                  {configuredLibraries.map((lib) => (
                    <option key={lib.key} value={lib.key}>{lib.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                    if (file && !title) setTitle(file.name);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-4 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  {selectedFile ? selectedFile.name : 'Click to select a file'}
                </button>
              </div>

              {isUploading && (
                <p className="text-xs text-blue-600">Uploading to SharePoint...</p>
              )}
            </div>
          ) : spStatus?.configured ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('browse')}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <FolderSearch size={14} />
                Browse SharePoint
              </button>
              {configuredLibraries.length > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Upload size={14} />
                    Upload to SharePoint
                  </button>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">SharePoint integration not configured.</p>
          )}

          {mode === 'browse' && (
            <SharePointBrowser onSelect={handleSelectFile} onCancel={() => setMode(null)} />
          )}

          {(createDocument.isError || uploadMutation.isError) && (
            <p className="text-sm text-red-600">
              {getApiErrorMessage(createDocument.error || uploadMutation.error, 'Failed to create document')}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy || (mode === 'upload' && (!selectedFile || !selectedLibrary))}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : isCreating ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
