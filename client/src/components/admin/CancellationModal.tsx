import { X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface CancellationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
}

export default function CancellationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Cancelar Turno'
}: CancellationModalProps) {
    const [reason, setReason] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

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

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!reason.trim()) return;
        onConfirm(reason);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200 border border-white/20 overflow-hidden"
                role="dialog"
                aria-modal="true"
            >
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Por favor, indica el motivo de la cancelación:
                    </p>

                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej: Imprevisto personal..."
                        className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none resize-none transition-all text-gray-700"
                        autoFocus
                    />
                </div>

                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Volver
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!reason.trim()}
                        className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all ${reason.trim()
                            ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Confirmar Cancelación
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="Cerrar"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
