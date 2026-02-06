import type { ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * Modal size presets for consistent sizing across the application.
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Modal title displayed in the header */
  title: string;
  /** Modal content */
  children: ReactNode;
  /** Modal width preset (default: 'lg') */
  size?: ModalSize;
  /** Whether clicking the backdrop closes the modal (default: true) */
  closeOnBackdrop?: boolean;
  /** Whether the close button is disabled (e.g., during form submission) */
  closeDisabled?: boolean;
}

/**
 * Reusable modal wrapper component.
 *
 * Provides consistent modal structure including:
 * - Semi-transparent backdrop with click-to-close
 * - Header with title and close button
 * - Responsive sizing with configurable max-width
 * - Proper z-indexing and centering
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Create Item">
 *   <ModalBody>
 *     <form>...</form>
 *   </ModalBody>
 *   <ModalFooter>
 *     <Button onClick={handleSubmit}>Save</Button>
 *   </ModalFooter>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'lg',
  closeOnBackdrop = true,
  closeDisabled = false,
}: ModalProps) {
  if (!open) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop && !closeDisabled) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (!closeDisabled) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={handleCloseClick}
            disabled={closeDisabled}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * Modal body section for form content.
 */
export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={`p-6 space-y-4 ${className}`}>
      {children}
    </div>
  );
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * Modal footer section for action buttons.
 */
export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`flex justify-end gap-3 px-6 py-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export interface ModalErrorProps {
  error: string | null | undefined;
}

/**
 * Standardized error display for modals.
 */
export function ModalError({ error }: ModalErrorProps) {
  if (!error) return null;
  return <p className="text-sm text-red-600">{error}</p>;
}
