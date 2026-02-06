import { useState } from 'react';
import { Folder, FileText, ArrowLeft, Library } from 'lucide-react';
import { useSharePointSites, useSharePointDrives, useSharePointItems, useSharePointStatus } from '../hooks/useDocuments';
import type { SharePointItem } from '../types/document.types';

interface SharePointBrowserProps {
  onSelect: (item: SharePointItem, siteId: string, driveId: string) => void;
  onCancel: () => void;
}

export default function SharePointBrowser({ onSelect, onCancel }: SharePointBrowserProps) {
  const [siteId, setSiteId] = useState('');
  const [driveId, setDriveId] = useState('');
  const [folderId, setFolderId] = useState<string | undefined>();

  const { data: spStatus } = useSharePointStatus();
  const { data: sites, isLoading: loadingSites } = useSharePointSites();
  const { data: drives, isLoading: loadingDrives } = useSharePointDrives(siteId);
  const { data: items, isLoading: loadingItems } = useSharePointItems(siteId, driveId, folderId);

  const configuredLibraries = spStatus?.libraries?.filter((lib) => lib.configured) || [];

  const handleLibraryClick = (lib: { siteId: string; driveId: string }) => {
    setSiteId(lib.siteId);
    setDriveId(lib.driveId);
    setFolderId(undefined);
  };

  const handleItemClick = (item: SharePointItem) => {
    if (item.folder) {
      setFolderId(item.itemId);
    } else {
      onSelect(item, siteId, driveId);
    }
  };

  const goBack = () => {
    if (folderId) {
      setFolderId(undefined);
    } else if (driveId) {
      setDriveId('');
    } else if (siteId) {
      setSiteId('');
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {(siteId || driveId || folderId) && (
            <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} />
            </button>
          )}
          <span className="text-sm font-medium text-gray-700">
            {!siteId ? 'Select Site' : !driveId ? 'Select Drive' : 'Select File'}
          </span>
        </div>
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>

      {/* Quick Access Libraries */}
      {!siteId && configuredLibraries.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Quick Access</p>
          <div className="space-y-1">
            {configuredLibraries.map((lib) => (
              <button
                key={lib.key}
                onClick={() => handleLibraryClick(lib)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded bg-blue-50 hover:bg-blue-100 text-sm text-blue-700 font-medium"
              >
                <Library size={14} />
                {lib.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 mb-1">Or browse all sites</p>
        </div>
      )}

      {/* Sites */}
      {!siteId && (
        loadingSites ? (
          <p className="text-xs text-gray-400">Loading sites...</p>
        ) : sites && sites.length > 0 ? (
          <div className="space-y-1">
            {sites.map((site) => (
              <button
                key={site.siteId}
                onClick={() => setSiteId(site.siteId)}
                className="w-full text-left px-3 py-2 rounded hover:bg-white text-sm text-gray-700"
              >
                {site.displayName}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No SharePoint sites available.</p>
        )
      )}

      {/* Drives */}
      {siteId && !driveId && (
        loadingDrives ? (
          <p className="text-xs text-gray-400">Loading drives...</p>
        ) : drives && drives.length > 0 ? (
          <div className="space-y-1">
            {drives.map((drive) => (
              <button
                key={drive.driveId}
                onClick={() => setDriveId(drive.driveId)}
                className="w-full text-left px-3 py-2 rounded hover:bg-white text-sm text-gray-700"
              >
                {drive.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No drives available.</p>
        )
      )}

      {/* Items */}
      {siteId && driveId && (
        loadingItems ? (
          <p className="text-xs text-gray-400">Loading files...</p>
        ) : items && items.length > 0 ? (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <button
                key={item.itemId}
                onClick={() => handleItemClick(item)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded hover:bg-white text-sm text-gray-700"
              >
                {item.folder ? <Folder size={14} className="text-yellow-500" /> : <FileText size={14} className="text-gray-400" />}
                <span className="truncate">{item.name}</span>
                {!item.folder && <span className="text-xs text-gray-400 ml-auto">{formatBytes(item.size)}</span>}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No files found.</p>
        )
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
