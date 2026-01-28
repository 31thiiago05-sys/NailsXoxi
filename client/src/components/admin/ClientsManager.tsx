import { useState, useEffect } from 'react';
import api from '../../api';
import { Loader2, Search, Phone, Mail, Calendar, Trash2, Shield, ShieldOff, Ban, Unlock, DollarSign, MessageCircle } from 'lucide-react';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: 'ADMIN' | 'CLIENT';
    isBlocked: boolean;
    debt: string;
    creditAmount: string;
    createdAt: string;
    appointments: {
        id: string;
        date: string;
        status: string;
    }[];
}

export default function ClientsManager() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'DEBT' | 'CREDIT'>('ALL');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients');
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'DELETE' | 'BLOCK' | 'ADMIN' | 'CLEAR_DEBT', clientId: string, clientName: string) => {
        const confirmMsg =
            action === 'DELETE' ? `¿Eliminar a ${clientName}? Esta acción es irreversible.` :
                action === 'BLOCK' ? `¿Cambiar estado de bloqueo para ${clientName}?` :
                    action === 'ADMIN' ? `¿Cambiar permisos de administrador para ${clientName}?` :
                        `¿Limpiar la deuda de ${clientName}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            if (action === 'DELETE') await api.delete(`/clients/${clientId}`);
            if (action === 'BLOCK') await api.post(`/clients/${clientId}/toggle-block`);
            if (action === 'ADMIN') await api.post(`/clients/${clientId}/toggle-admin`);
            if (action === 'CLEAR_DEBT') await api.post(`/clients/${clientId}/clear-debt`);

            fetchClients(); // Refresh list
        } catch {
            alert('Error al realizar la acción');
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'DEBT') return parseFloat(client.debt) > 0;
        if (filter === 'CREDIT') return parseFloat(client.creditAmount) > 0;
        return true;
    });

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold font-serif text-text">Gestión de Clientas</h2>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('DEBT')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'DEBT' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                        Con Deuda
                    </button>
                    <button
                        onClick={() => setFilter('CREDIT')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'CREDIT' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                        Con Crédito
                    </button>
                </div>

                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-primary font-bold text-lg">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{client.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${client.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {client.role}
                                        </span>
                                        {client.isBlocked && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 flex items-center gap-1">
                                                <Ban size={10} /> BLOQUEADA
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" /> {client.email}
                            </div>
                            {client.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" /> {client.phone}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Reg: {new Date(client.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-3 rounded-lg">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Deuda</p>
                                <p className={`font-bold ${parseFloat(client.debt) > 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                    ${client.debt}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Crédito</p>
                                <p className={`font-bold ${parseFloat(client.creditAmount) > 0 ? 'text-green-500' : 'text-gray-700'}`}>
                                    ${client.creditAmount}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {client.phone && (
                                <a
                                    href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="col-span-2 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
                                >
                                    <MessageCircle size={16} /> WhatsApp
                                </a>
                            )}

                            <button
                                onClick={() => handleAction('ADMIN', client.id, client.name)}
                                className={`flex items-center justify-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors
                                    ${client.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}
                                `}
                            >
                                {client.role === 'ADMIN' ? <ShieldOff size={14} /> : <Shield size={14} />}
                                {client.role === 'ADMIN' ? 'Quitar Admin' : 'Hacer Admin'}
                            </button>

                            <button
                                onClick={() => handleAction('BLOCK', client.id, client.name)}
                                className={`flex items-center justify-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors
                                    ${client.isBlocked ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'}
                                `}
                            >
                                {client.isBlocked ? <Unlock size={14} /> : <Ban size={14} />}
                                {client.isBlocked ? 'Desbloquear' : 'Bloquear'}
                            </button>

                            {parseFloat(client.debt) > 0 && (
                                <button
                                    onClick={() => handleAction('CLEAR_DEBT', client.id, client.name)}
                                    className="col-span-2 flex items-center justify-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                                >
                                    <DollarSign size={14} /> Limpiar Deuda
                                </button>
                            )}

                            <button
                                onClick={() => handleAction('DELETE', client.id, client.name)}
                                className="col-span-2 flex items-center justify-center gap-1 bg-red-50 text-red-700 border border-red-200 py-2 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                            >
                                <Trash2 size={14} /> Eliminar Cuenta
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    No se encontraron clientas con los filtros actuales.
                </div>
            )}
        </div>
    );
}
