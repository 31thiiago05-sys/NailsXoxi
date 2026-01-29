import { useState, useEffect } from 'react';
import api from '../../api';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmationModal from '../ConfirmationModal';
import '../../styles/responsive-tables.css';

interface EarningItem {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'BOOKING' | 'ADJUSTMENT';
    clientName?: string;
}

interface Service {
    name: string;
    price: number;
}

interface Client {
    name: string;
}

interface Appointment {
    id: string;
    status: string;
    date: string;
    service: Service;
    client: Client;
}

interface Adjustment {
    id: string;
    date: string;
    description: string;
    amount: string;
}

export default function EarningsManager() {
    const [earnings, setEarnings] = useState<EarningItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger' as 'danger' | 'info' | 'warning'
    });

    // Form
    const [adjDesc, setAdjDesc] = useState('');
    const [adjAmount, setAdjAmount] = useState('');
    const [adjDate, setAdjDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const [aptRes, adjRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/earnings')
            ]);

            const confirmedApts: EarningItem[] = aptRes.data
                .filter((a: Appointment) => a.status === 'CONFIRMED' || a.status === 'Confirmado' || a.status === 'COMPLETED')
                .map((a: Appointment) => ({
                    id: a.id,
                    date: a.date,
                    description: `Servicio: ${a.service?.name || a.service?.title || 'Sin nombre'}`,
                    amount: Number(a.service?.price || 0),
                    type: 'BOOKING',
                    clientName: a.client?.name || 'Cliente'
                }));

            const adjustments: EarningItem[] = adjRes.data.map((a: Adjustment) => ({
                id: a.id,
                date: a.date,
                description: `Ajuste: ${a.description}`,
                amount: parseFloat(a.amount),
                type: 'ADJUSTMENT'
            }));

            const all = [...confirmedApts, ...adjustments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setEarnings(all);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string, type: string) => {
        if (type !== 'ADJUSTMENT') {
            alert('No se puede eliminar un turno desde acá. Cancelalo desde Turnos.');
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: '¿Eliminar movimiento?',
            message: '¿Estás segura de eliminar este registro de caja?',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/earnings/${id}`);
                    fetchEarnings();
                } catch (e) {
                    console.error(e);
                    alert('Error al eliminar');
                }
            }
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/earnings', {
                description: adjDesc,
                amount: parseFloat(adjAmount),
                date: adjDate
            });
            setShowModal(false);
            setAdjDesc('');
            setAdjAmount('');
            fetchEarnings();
        } catch {
            alert('Error al crear ajuste');
        }
    };

    const totalRevenue = earnings.reduce((sum, e) => sum + e.amount, 0);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold font-serif text-text">Ganancias y Caja</h2>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full md:w-auto">
                    <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200 text-center sm:text-left">
                        <p className="text-xs text-green-600 font-bold uppercase">Total Percibido</p>
                        <p className="text-xl font-bold text-green-800">${totalRevenue.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <PlusCircle size={18} /> Nuevo Ajuste
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-500">Fecha</th>
                            <th className="text-left p-4 font-medium text-gray-500">Descripción</th>
                            <th className="text-left p-4 font-medium text-gray-500">Cliente / Origen</th>
                            <th className="text-left p-4 font-medium text-gray-500">Monto</th>
                            <th className="text-left p-4 font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {earnings.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                                <td data-label="Fecha" className="p-4 text-sm text-gray-900">
                                    {format(new Date(item.date), 'dd/MM/yyyy')}
                                </td>
                                <td data-label="Concepto" className="p-4 font-medium text-gray-800">
                                    {item.description}
                                </td>
                                <td data-label="Cliente" className="p-4 text-sm text-gray-600">
                                    {item.clientName || 'Manual'}
                                </td>
                                <td data-label="Monto" className={`p-4 font-bold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${item.amount.toLocaleString()}
                                </td>
                                <td data-label="Acciones" className="p-4">
                                    {item.type === 'ADJUSTMENT' && (
                                        <button
                                            onClick={() => handleDelete(item.id, item.type)}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                            title="Eliminar ajuste"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Ajuste */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4">Nuevo Movimiento de Caja</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Compra de insumos, Pago extra..."
                                    className="w-full p-2 border rounded-lg"
                                    value={adjDesc}
                                    onChange={e => setAdjDesc(e.target.value)}
                                    title="Concepto del ajuste"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto (Negativo para gastos)</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="0"
                                    className="w-full p-2 border rounded-lg"
                                    value={adjAmount}
                                    onChange={e => setAdjAmount(e.target.value)}
                                    title="Monto del ajuste"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={adjDate}
                                    onChange={e => setAdjDate(e.target.value)}
                                    title="Fecha del ajuste"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-2 rounded-lg font-bold"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
