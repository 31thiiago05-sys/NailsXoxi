import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertTriangle, Ban, CheckCircle } from 'lucide-react';

export default function PoliciesPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <header className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/50 rounded-full transition-colors text-primary"
                        aria-label="Volver atrás"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-serif font-bold text-primary">Términos y Condiciones</h2>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10 animate-fade-in-up">
                    <h3 className="text-xl font-bold text-primary-dark mb-6 text-center text-balance">
                        Política de Cancelación
                    </h3>

                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-center">
                        Para mantener el orden y respeto por los turnos de todas, aplicamos las siguientes reglas automáticas:
                    </p>

                    <div className="space-y-6">
                        {/* Cancelación Anticipada */}
                        <div className="bg-green-50 rounded-xl p-5 border-l-4 border-green-500">
                            <div className="flex items-center gap-2 mb-3 font-bold text-green-800">
                                <CheckCircle size={20} />
                                <span>Cancelación con anticipación (+72hs)</span>
                            </div>
                            <p className="text-green-800 text-sm mb-3">
                                Si cancelas con más de 3 días de aviso, tu seña queda guardada como <strong>crédito a favor</strong>.
                            </p>
                            <ul className="list-disc list-inside text-sm text-green-700 space-y-1 ml-1">
                                <li><strong>Validez:</strong> El crédito dura <strong>30 días</strong> para reagendar.</li>
                                <li><strong>Límite:</strong> Solo se permite <strong>1 reagendamiento cada 30 días</strong>.</li>
                                <li><strong>Importante:</strong> Las señas <strong>NO TIENEN REEMBOLSO</strong>.</li>
                            </ul>
                        </div>

                        {/* Cancelación Tardía */}
                        <div className="bg-red-50 rounded-xl p-5 border-l-4 border-red-500">
                            <div className="flex items-center gap-2 mb-3 font-bold text-red-900">
                                <AlertTriangle size={20} />
                                <span>Cancelación sobre la hora (-72hs)</span>
                            </div>
                            <p className="text-red-800 text-sm">
                                Si cancelas con menos de 72hs de antelación, lamentablemente <strong>se pierde el turno y se genera una deuda</strong> por el valor total del servicio.
                            </p>
                        </div>

                        {/* Tolerancia */}
                        <div className="bg-orange-50 rounded-xl p-5 border-l-4 border-orange-500">
                            <div className="flex items-center gap-2 mb-3 font-bold text-orange-900">
                                <Clock size={20} />
                                <span>Tolerancia de espera (10 min)</span>
                            </div>
                            <p className="text-orange-900 text-sm mb-3">
                                Pasado los 10 minutos se cobrará <strong>$4.000 adicionales</strong>.
                            </p>
                            <div className="bg-white p-3 rounded-lg border border-orange-200 text-xs text-orange-800 font-medium">
                                Caso contrario: Se cancela el turno automáticamente y se deberá abonar el restante para volver a reservar.
                            </div>
                        </div>

                        {/* Duedas */}
                        <div className="bg-rose-50 rounded-xl p-5 border border-rose-200">
                            <div className="flex items-center gap-2 mb-2 font-bold text-rose-900">
                                <Ban size={20} />
                                <span>Política de Deudas</span>
                            </div>
                            <p className="text-rose-900 text-sm">
                                Si generas una deuda, <strong>tu cuenta quedará bloqueada</strong> para nuevas reservas hasta que abones el monto pendiente.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 bg-gray-50 inline-block px-4 py-2 rounded-full">
                            Al reservar, confirmas que has leído y aceptas estas condiciones. 💕
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
