import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);

    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    useEffect(() => {
        // Simular una pequeña carga para mejor UX
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Verificando pago...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
                    ¡Pago Exitoso! ✅
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Tu turno ha sido confirmado y el pago procesado correctamente.
                </p>

                {/* Payment Details */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Estado:</span>
                        <span className="font-bold text-green-600 capitalize">{status || 'Aprobado'}</span>
                    </div>
                    {paymentId && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">ID de Pago:</span>
                            <span className="font-mono text-xs text-gray-700">{paymentId}</span>
                        </div>
                    )}
                    {externalReference && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">ID de Turno:</span>
                            <span className="font-mono text-xs text-gray-700">{externalReference.substring(0, 8)}...</span>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800 text-center">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Recordá que podés ver todos tus turnos en la sección "Mis Citas"
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/my-appointments')}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                    >
                        Ver Mis Citas
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
