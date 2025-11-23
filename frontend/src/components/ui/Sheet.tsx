// frontend/src/components/ui/Sheet.tsx
import { ReactNode, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}: SheetProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div
          className="bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300"
          style={{ maxHeight: '85vh' }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close sheet"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SheetFooterProps {
  children: ReactNode;
  className?: string;
}

export function SheetFooter({ children, className = '' }: SheetFooterProps) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-t border-gray-200 bg-white ${className}`}>
      {children}
    </div>
  );
}