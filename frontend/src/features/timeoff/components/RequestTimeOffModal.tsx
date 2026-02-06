import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormSelect, FormTextarea, FormCheckbox } from '../../../shared/components/ui/FormFields';
import { useTimeOffTypes, useCreateTimeOffRequest, useUploadAttachment } from '../hooks/useTimeOff';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import { Paperclip, X, AlertCircle } from 'lucide-react';
import type { HalfDayPeriod } from '../types/timeoff.types';

const HALF_DAY_PERIOD_OPTIONS = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
];

interface RequestTimeOffModalProps {
  onClose: () => void;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function RequestTimeOffModal({ onClose }: RequestTimeOffModalProps) {
  const { data: types } = useTimeOffTypes();
  const createRequest = useCreateTimeOffRequest();
  const uploadAttachment = useUploadAttachment();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [typeId, setTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<HalfDayPeriod>('MORNING');
  const [reason, setReason] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Reset mutation state on mount so stale errors from prior opens are cleared
  useEffect(() => {
    createRequest.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    if (!createRequest.isPending) onClose();
  }, [createRequest.isPending, onClose]);

  const isSingleDay = startDate && endDate && startDate === endDate;

  // Get selected type to check attachment requirements
  const selectedType = useMemo(() => {
    if (!typeId || !types) return null;
    return types.find((t) => t.id === typeId) ?? null;
  }, [typeId, types]);

  const businessDaysPreview = useMemo(() => {
    if (!startDate || !endDate) return null;
    if (halfDay) return 0.5;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, [startDate, endDate, halfDay]);

  // Check if attachment is required based on type and business days
  const isAttachmentRequired = useMemo(() => {
    if (!selectedType || businessDaysPreview === null) return false;
    if (selectedType.attachmentRequirement === 'ALWAYS') return true;
    if (selectedType.attachmentRequirement === 'CONDITIONAL') {
      const afterDays = selectedType.attachmentRequiredAfterDays ?? 0;
      return businessDaysPreview > afterDays;
    }
    return false;
  }, [selectedType, businessDaysPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError('Invalid file type. Allowed: PDF, JPEG, PNG, GIF, DOC, DOCX');
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File too large. Maximum size is 10MB');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate attachment if required
    if (isAttachmentRequired && !selectedFile) {
      setFileError('An attachment is required for this request');
      return;
    }

    try {
      const newRequest = await createRequest.mutateAsync({
        timeOffTypeId: typeId,
        startDate,
        endDate,
        halfDay: halfDay || undefined,
        halfDayPeriod: halfDay ? halfDayPeriod : undefined,
        reason: reason || undefined,
      });

      // Upload attachment if file is selected
      if (selectedFile && newRequest.id) {
        try {
          await uploadAttachment.mutateAsync({
            requestId: newRequest.id,
            file: selectedFile,
          });
        } catch {
          // Request was created but attachment failed - still close modal
          // The user can upload the attachment later
        }
      }

      onClose();
    } catch {
      // Error is handled by mutation state (createRequest.isError)
    }
  };

  const typeOptions = types?.map((type) => ({ value: type.id, label: type.name })) ?? [];

  return (
    <Modal
      open
      onClose={handleClose}
      title="Request Time Off"
      size="md"
      closeDisabled={createRequest.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormSelect
            label="Leave Type"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            options={typeOptions}
            placeholder="Select type..."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate}
            />
          </div>

          {isSingleDay && (
            <div className="space-y-2">
              <FormCheckbox
                label="Half day"
                checked={halfDay}
                onChange={(e) => setHalfDay(e.target.checked)}
              />
              {halfDay && (
                <FormSelect
                  value={halfDayPeriod}
                  onChange={(e) => setHalfDayPeriod(e.target.value as HalfDayPeriod)}
                  options={HALF_DAY_PERIOD_OPTIONS}
                />
              )}
            </div>
          )}

          {businessDaysPreview !== null && (
            <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-700">
              {businessDaysPreview} business day{businessDaysPreview !== 1 ? 's' : ''}
            </div>
          )}

          <FormTextarea
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Why are you requesting time off?"
          />

          {/* Attachment Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="block text-sm font-medium text-gray-700">
                Attachment
                {isAttachmentRequired && <span className="text-red-500 ml-1">*</span>}
              </span>
              {isAttachmentRequired && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertCircle size={12} />
                  Required
                </span>
              )}
            </div>

            {selectedFile ? (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <Paperclip size={16} className="text-gray-400" />
                <span className="text-sm text-gray-700 flex-1 truncate">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Paperclip size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload a file</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, GIF, DOC, DOCX (max 10MB)</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {fileError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {fileError}
              </p>
            )}
          </div>

          <ModalError error={createRequest.isError ? getApiErrorMessage(createRequest.error, 'Failed to submit request') : null} />
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createRequest.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
