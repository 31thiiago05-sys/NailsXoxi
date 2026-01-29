import { AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useRef } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'info' | 'warning';
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}: ConfirmationModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
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

    // Close on click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: AlertTriangle,
            iconColor: 'text-red-600',
            iconBg: 'bg-red-100',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            buttonText: 'text-white'
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-yellow-600',
            iconBg: 'bg-yellow-100',
            buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
            buttonText: 'text-white'
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            buttonText: 'text-white'
        }
    };

    const currentStyle = variantStyles[variant];
    const Icon = currentStyle.icon;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200 border border-white/20"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header with Icon */}
                <div className="p-6 flex flex-col items-center text-center">
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110", currentStyle.iconBg)}>
                        <Icon size={28} className={currentStyle.iconColor} />
                    </div>

                    <h3 id="modal-title" className="text-xl font-bold text-gray-900 mb-2 font-serif">
                        {title}
                    </h3>

                    <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                        {message}
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-1/2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors shadow-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={cn(
                            "w-full sm:w-1/2 px-4 py-2.5 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                            currentStyle.buttonBg,
                            currentStyle.buttonText
                        )}
                    >
                        {confirmText}
                    </button>
                </div>

                {/* Close X Button absolute top-right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Cerrar"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
