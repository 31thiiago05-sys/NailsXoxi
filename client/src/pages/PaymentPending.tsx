import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Info, Home } from 'lucide-react';

export default function PaymentPending() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Pending Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
                        <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />
                    </div>
                </div>

                {/* Pending Message */}
                <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
                    Pago Pendiente ⏳
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Tu pago está siendo procesado. Te notificaremos cuando se confirme.
                </p>

                {/* Payment Details */}
                {(paymentId || status) && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                        {status && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Estado:</span>
                                <span className="font-bold text-yellow-600 capitalize">{status === 'in_process' ? 'En Proceso' : status}</span>
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
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-bold mb-2">¿Qué significa esto?</p>
                            <p className="mb-3">
                                Tu pago está siendo verificado. Esto puede ocurrir cuando:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Pagaste con transferencia bancaria</li>
                                <li>Elegiste pagar en efectivo (ej: Rapipago, Pago Fácil)</li>
                                <li>El banco está validando la transacción</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Timeline Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-700 text-center">
                        <span className="font-bold">Tiempo estimado:</span> 1-3 días hábiles
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/my-appointments')}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                    >
                        Ver Estado del Turno
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Volver al Inicio
                    </button>
                </div>

                {/* Help Section */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        Te enviaremos un email cuando se confirme tu pago
                    </p>
                </div>
            </div>
        </div>
    );
}
