import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function PaymentFailure() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
                    Pago Rechazado ❌
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    No pudimos procesar tu pago. Por favor, intentá nuevamente.
                </p>

                {/* Payment Details */}
                {(paymentId || status) && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                        {status && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Estado:</span>
                                <span className="font-bold text-red-600 capitalize">{status}</span>
                            </div>
                        )}
                        {paymentId && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">ID de Pago:</span>
                                <span className="font-mono text-xs text-gray-700">{paymentId}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-bold mb-1">Posibles Causas:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Fondos insuficientes</li>
                                <li>Datos de tarjeta incorrectos</li>
                                <li>Límite de compra excedido</li>
                                <li>Tarjeta bloqueada o vencida</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/booking')}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                    >
                        Intentar Nuevamente
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Inicio
                    </button>
                </div>

                {/* Help Section */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        ¿Necesitás ayuda?{' '}
                        <a href="https://wa.me/5491234567890" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                            Contactanos
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
