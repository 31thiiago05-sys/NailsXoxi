import { useState, useEffect } from 'react';
import api from '../../api';
import { Loader2, Search, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    client: {
        id: string;
        name: string;
        phone: string | null;
    };
    service: {
        title: string;
        price: number;
    };
}

export default function BookingsManager() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');
            // Show recent first
            setAppointments(data.sort((a: Appointment, b: Appointment) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch {
            // Ignore error
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'CANCEL' | 'DELETE' | 'NOSHOW', id: string) => {
        const confirmMsg = action === 'DELETE' ? '¿Eliminar turno permanentemente?' :
            action === 'CANCEL' ? '¿Cancelar turno? Generará deuda si es < 72hs.' :
                '¿Marcar como ausente?';

        if (!window.confirm(confirmMsg)) return;

        try {
            if (action === 'DELETE') {
                // Not standard endpoint yet, maybe should add?
                // For now reusing cancel if delete doesn't exist, but legacy had delete.
                // Assuming cancel for now as safer.
                await api.post(`/appointments/${id}/cancel`);
            } else if (action === 'CANCEL') {
                await api.post(`/appointments/${id}/cancel`);
            }
            fetchAppointments();
        } catch {
            alert('Error al procesar acción');
        }
    };

    const filtered = appointments.filter(apt =>
        apt.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.date.includes(searchTerm)
    );

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold font-serif text-text">Gestión de Turnos</h2>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, fecha o servicio..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-full md:w-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-500">Fecha</th>
                            <th className="text-left p-4 font-medium text-gray-500">Hora</th>
                            <th className="text-left p-4 font-medium text-gray-500">Clienta</th>
                            <th className="text-left p-4 font-medium text-gray-500">Servicio</th>
                            <th className="text-left p-4 font-medium text-gray-500">Estado</th>
                            <th className="text-left p-4 font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(apt => (
                            <tr key={apt.id} className="hover:bg-gray-50/50">
                                <td className="p-4 text-sm font-medium text-gray-900">
                                    {format(new Date(apt.date), 'dd/MM/yyyy')}
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    {apt.time}
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{apt.client.name}</div>
                                    <div className="text-xs text-gray-500">{apt.client.phone || '-'}</div>
                                </td>
                                <td className="p-4 text-sm text-gray-700">
                                    {apt.service.title}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                                        ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'}
                                    `}>
                                        {apt.status === 'CONFIRMED' ? 'Confirmado' : apt.status === 'PENDING' ? 'Pendiente' : 'Cancelado'}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    {apt.status !== 'CANCELLED' && (
                                        <button
                                            onClick={() => handleAction('CANCEL', apt.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Cancelar Turno"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
