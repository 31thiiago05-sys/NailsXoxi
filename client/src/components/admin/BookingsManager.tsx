import { useState, useEffect } from 'react';
import api from '../../api';
import { Loader2, Search, XCircle, UserX, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmationModal from '../ConfirmationModal';
import '../../styles/responsive-tables.css';

interface Appointment {
    id: string;
    date: string;
    // time: string; // Removed as it is derived from date
    status: string;
    client: {
        id: string;
        name: string;
        phone: string | null;
    };
    service: {
        name?: string;
        // title?: string; // Removed as it is now 'name'
        price: number;
    };
}

export default function BookingsManager() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger' as 'danger' | 'info' | 'warning'
    });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');

            // Definir estructura para tipeado estricto
            // Definir estructura para tipeado estricto
            interface RawAppointment {
                id: string;
                date: string;
                status: string;
                client?: { name: string; phone: string | null; id: string };
                user?: { name: string; phone: string | null; id: string };
                service?: { name?: string; price: number };
            }

            // Map backend structure to frontend structure
            const mappedData: Appointment[] = (data as RawAppointment[])
                .filter((apt) => apt.status !== 'PENDING') // Explicitly exclude PENDING
                .map((apt) => ({
                    id: apt.id,
                    date: apt.date,
                    status: apt.status,
                    // time: new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Removed as it is derived from date
                    client: {
                        id: apt.client?.id || apt.user?.id || 'unknown',
                        name: apt.client?.name || apt.user?.name || 'Cliente Desconocido',
                        phone: apt.client?.phone || apt.user?.phone || '-'
                    },
                    service: {
                        name: apt.service?.name || 'Servicio Desconocido',
                        price: Number(apt.service?.price || 0)
                    }
                }));

            // Show recent first
            // Show recent first
            setAppointments(mappedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch {
            // Ignore error
        } finally {
            setLoading(false);
        }
    };



    const handleAction = (action: 'CANCEL' | 'DELETE' | 'NOSHOW', id: string, reason: string = 'Cancelación por administrador') => {
        const title = action === 'DELETE' ? '¿Eliminar turno permanentemente?' :
            action === 'CANCEL' ? '¿Cancelar turno?' : '¿Marcar como ausente?';

        const message = action === 'DELETE' ? 'Esta acción es irreversible y eliminará el turno del sistema.' :
            action === 'CANCEL' ? 'La clienta será notificada. Dependiendo de la política de 72hs, podría generarse deuda.' :
                'Esto marcará que la clienta no asistió y generará una deuda automática del 50% del valor del servicio.';

        setConfirmModal({
            isOpen: true,
            title,
            message,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    const endpoint = action === 'CANCEL' ? '/appointments/admin/cancel' :
                        action === 'NOSHOW' ? '/appointments/admin/mark-noshow' :
                            '/appointments/admin/delete';

                    await api.post(endpoint, { appointmentId: id, reason });
                    fetchAppointments();
                } catch {
                    alert('Error al procesar acción');
                }
            }
        });
    };

    const filtered = appointments.filter(apt =>
        apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt?.date?.includes(searchTerm)
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
                                <td data-label="Fecha" className="p-4 text-sm font-medium text-gray-900">
                                    {format(new Date(apt.date), 'dd/MM/yyyy')}
                                </td>
                                <td data-label="Hora" className="p-4 text-sm text-gray-600">
                                    {format(new Date(apt.date), 'HH:mm')}
                                </td>
                                <td data-label="Clienta" className="p-4">
                                    <div className="font-medium text-gray-900">{apt.client?.name || 'Cliente Desconocido'}</div>
                                    <div className="text-xs text-gray-500">{apt.client?.phone || '-'}</div>
                                </td>
                                <td data-label="Servicio" className="p-4 text-sm text-gray-700">
                                    {apt.service?.name || 'Servicio Desconocido'}
                                </td>
                                <td data-label="Estado" className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                                        ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'}
                                    `}>
                                        {apt.status === 'CONFIRMED' ? 'Confirmado' : apt.status === 'PENDING' ? 'Pendiente' : 'Cancelado'}
                                    </span>
                                </td>
                                <td data-label="Acciones" className="p-4 flex gap-2">
                                    {apt.status !== 'CANCELLED' && (
                                        <>
                                            <button
                                                onClick={() => handleAction('CANCEL', apt.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center"
                                                title="Cancelar Turno"
                                            >
                                                <XCircle size={18} />
                                                <span className="ml-1 text-[10px] font-bold hidden md:inline">Cancelar</span>
                                            </button>
                                            <button
                                                onClick={() => handleAction('NOSHOW', apt.id)}
                                                className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg flex items-center justify-center"
                                                title="Marcar Ausente"
                                            >
                                                <UserX size={18} />
                                                <span className="ml-1 text-[10px] font-bold hidden md:inline">Ausente</span>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleAction('DELETE', apt.id)}
                                        className="p-1.5 text-red-700 hover:bg-red-100 rounded-lg flex items-center justify-center"
                                        title="Eliminar Turno"
                                    >
                                        <Trash2 size={18} />
                                        <span className="ml-1 text-[10px] font-bold hidden md:inline">Eliminar</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
            />
        </div>
    );
}
