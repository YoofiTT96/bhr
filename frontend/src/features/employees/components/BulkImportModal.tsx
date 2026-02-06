import { useState, useRef } from 'react';
import { X, Download, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useBulkImportEmployees } from '../hooks/useEmployees';
import { employeeService } from '../services/employeeService';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import type { BulkImportResult, ImportRowStatus } from '../types/employee.types';

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
}

const statusConfig: Record<ImportRowStatus, { color: string; icon: typeof CheckCircle }> = {
  SUCCESS: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  FAILED: { color: 'bg-red-100 text-red-700', icon: XCircle },
  SKIPPED: { color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
};

export default function BulkImportModal({ open, onClose }: BulkImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useBulkImportEmployees();

  if (!open) return null;

  const handleDownloadTemplate = async () => {
    try {
      const blob = await employeeService.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employee_import_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // template download failed silently
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    try {
      const result = await importMutation.mutateAsync(selectedFile);
      setImportResult(result);
    } catch {
      // error handled by mutation state
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setImportResult(null);
    importMutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    if (importMutation.isPending) return;
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={handleClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Import Employees</h2>
          <button
            onClick={handleClose}
            disabled={importMutation.isPending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {!importResult ? (
            <>
              {/* Step 1: Download template */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">1. Download the CSV template</p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} />
                  Download Template
                </button>
                <p className="text-xs text-gray-500 mt-1.5">
                  Required columns: firstName, lastName, email, hireDate. Optional: phoneNumber, position, location, birthday, role, managerEmail.
                </p>
              </div>

              {/* Step 2: Upload file */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">2. Upload your CSV file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] || null);
                    importMutation.reset();
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-gray-300 rounded-lg px-4 py-6 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex flex-col items-center gap-2"
                >
                  <Upload size={24} className="text-gray-400" />
                  {selectedFile ? selectedFile.name : 'Click to select a CSV file'}
                </button>

                {selectedFile && (
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Error */}
              {importMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700">
                    {getApiErrorMessage(importMutation.error, 'Import failed. Please check your CSV file.')}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{importResult.totalRows}</p>
                  <p className="text-xs text-blue-600">Total Rows</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{importResult.successCount}</p>
                  <p className="text-xs text-green-600">Succeeded</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{importResult.failureCount}</p>
                  <p className="text-xs text-red-600">Failed</p>
                </div>
              </div>

              {/* Results table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Row</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Email</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Status</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importResult.results.map((row) => {
                        const config = statusConfig[row.status];
                        const Icon = config.icon;
                        return (
                          <tr key={row.rowNumber}>
                            <td className="px-4 py-2 text-gray-700">{row.rowNumber}</td>
                            <td className="px-4 py-2 text-gray-700 truncate max-w-[180px]">{row.email || '—'}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                                <Icon size={12} />
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500">
                              {row.errors.length > 0 ? row.errors.join('; ') : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          {!importResult ? (
            <>
              <button
                onClick={handleClose}
                disabled={importMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || importMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload size={16} />
                {importMutation.isPending ? 'Importing...' : 'Import Employees'}
              </button>
            </>
          ) : (
            <>
              {importResult.failureCount > 0 && (
                <button
                  onClick={resetState}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Import Again
                </button>
              )}
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
