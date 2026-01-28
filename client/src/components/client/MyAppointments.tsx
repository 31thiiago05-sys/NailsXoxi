import { useState, useEffect } from 'react';
import api from '../../api';
import { Loader2, Calendar, Clock, MapPin, XCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Appointment {
    id: string;
    date: string;
    status: string;
    service: {
        title: string;
        price: number;
        duration: number;
    };
}

export default function MyAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (id: string, date: string) => {
        const apptDate = new Date(date);
        const now = new Date();
        const hoursDiff = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        const isLate = hoursDiff < 72;
        const message = isLate
            ? 'Estás cancelando con menos de 72hs de anticipación. Esto generará una deuda por el valor restante del servicio. ¿Confirmar?'
            : 'Si cancelas ahora, tu seña quedará como saldo a favor por 30 días. ¿Confirmar?';

        if (!window.confirm(message)) return;

        try {
            const { data } = await api.post(`/appointments/${id}/cancel`);
            alert(data.message);
            fetchAppointments();
        } catch (error) {
            const err = error as { response?: { data?: { error?: string } } };
            alert(err.response?.data?.error || 'Error al cancelar');
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments/my-appointments');
            setAppointments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold font-serif text-gray-800">Mis Turnos</h1>
                    <Link to="/" className="text-primary hover:text-primary/80 font-medium">Volver al Inicio</Link>
                </div>

                {appointments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                        <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-6">No tienes turnos agendados aún.</p>
                        <Link to="/booking" className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all">
                            Reservar Nuevo Turno
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4 w-full md:w-auto">
                                    <div className="bg-secondary/20 p-4 rounded-xl text-primary font-bold text-center min-w-[80px]">
                                        <div className="text-xs uppercase tracking-wide opacity-80">
                                            {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                                        </div>
                                        <div className="text-2xl">
                                            {new Date(apt.date).getDate()}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{apt.service.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Centro
                                            </div>
                                            <div className="font-medium text-gray-700">
                                                ${apt.service.price}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex flex-col items-end gap-2">
                                    {apt.status === 'CONFIRMED' ? (
                                        <>
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                <CheckCircle className="w-4 h-4" /> Confirmado
                                            </span>
                                            <button
                                                onClick={() => handleCancel(apt.id, apt.date)}
                                                className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                                            >
                                                Cancelar Turno
                                            </button>
                                        </>
                                    ) : apt.status === 'PENDING' ? (
                                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                                            <Clock className="w-4 h-4" /> Pendiente Pago
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                                            <XCircle className="w-4 h-4" /> Cancelado
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
