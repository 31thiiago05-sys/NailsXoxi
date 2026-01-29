import { useEffect, useState } from 'react';
import { DollarSign, CalendarCheck, Users, Loader2, Filter } from 'lucide-react';
import api from '../../api';
import { Link } from 'react-router-dom';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
    id: string;
    date: string;
    status: string;
    service: {
        name?: string;
        title?: string;
        price: number;
    };
    user?: {
        name: string;
    };
}

type FilterType = 'TODAY' | '7D' | 'MONTH' | 'CUSTOM';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    const [totalClients, setTotalClients] = useState(0);

    // Filter State
    const [filterType, setFilterType] = useState<FilterType>('MONTH');
    const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
        start: format(new Date(), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [usersRes, aptRes] = await Promise.all([
                api.get('/clients'),
                api.get('/appointments')
            ]);

            setTotalClients(usersRes.data.length);
            // Filter out PENDING and CANCELLED globally for dashboard
            const validAppointments = aptRes.data.filter((a: Appointment) => a.status !== 'PENDING' && a.status !== 'CANCELLED');
            setAllAppointments(validAppointments);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate derived stats based on filter
    const getFilteredAppointments = () => {
        const now = new Date();
        let start: Date, end: Date;

        if (filterType === 'TODAY') {
            start = startOfDay(now);
            end = endOfDay(now);
        } else if (filterType === '7D') {
            start = subDays(now, 7);
            end = endOfDay(now);
        } else if (filterType === 'MONTH') {
            start = startOfMonth(now);
            end = endOfMonth(now);
        } else {
            // CUSTOM
            start = startOfDay(parseISO(customRange.start));
            end = endOfDay(parseISO(customRange.end));
        }

        return allAppointments.filter(apt => {
            if (!apt.date) return false;
            try {
                const aptDate = parseISO(apt.date);
                return isWithinInterval(aptDate, { start, end });
            } catch {
                console.error('Invalid date in appointment:', apt.date);
                return false;
            }
        });
    };

    const filteredAppointments = getFilteredAppointments();

    const stats = {
        revenue: filteredAppointments
            .filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED' || a.status === 'Confirmado')
            .reduce((sum, a) => sum + Number(a.service?.price || 0), 0),
        count: filteredAppointments.length,
    };

    const getFilterLabel = () => {
        if (filterType === 'TODAY') return 'Hoy';
        if (filterType === '7D') return 'Últimos 7 Días';
        if (filterType === 'MONTH') return 'Este Mes';
        return 'Personalizado';
    };

    const statCards = [
        {
            label: `Ingresos (${getFilterLabel()})`,
            value: `$${stats.revenue}`,
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            label: `Turnos (${getFilterLabel()})`,
            value: stats.count,
            icon: CalendarCheck,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            label: 'Total Clientas (Histórico)',
            value: totalClients,
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
    ];

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <Filter size={16} className="text-gray-400 ml-2 mr-1" />

                    {(['TODAY', '7D', 'MONTH'] as const).map(ft => (
                        <button
                            key={ft}
                            onClick={() => setFilterType(ft)}
                            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${filterType === ft
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {ft === 'TODAY' ? 'Hoy' : ft === '7D' ? '7 Días' : 'Este Mes'}
                        </button>
                    ))}

                    <div className="h-6 w-px bg-gray-200 mx-1"></div>

                    <button
                        onClick={() => setFilterType('CUSTOM')}
                        className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${filterType === 'CUSTOM'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Fecha
                    </button>

                    {filterType === 'CUSTOM' && (
                        <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-left-2">
                            <input
                                type="date"
                                aria-label="Fecha inicio"
                                value={customRange.start}
                                onChange={e => setCustomRange({ ...customRange, start: e.target.value })}
                                className="text-sm border rounded p-1 outline-none focus:border-primary"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="date"
                                aria-label="Fecha fin"
                                value={customRange.end}
                                onChange={e => setCustomRange({ ...customRange, end: e.target.value })}
                                className="text-sm border rounded p-1 outline-none focus:border-primary"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 flex justify-between items-center">
                        Turnos del Periodo
                        <Link to="/admin/calendar" className="text-sm text-primary hover:underline">Ver Calendario</Link>
                    </h3>

                    {filteredAppointments.length === 0 ? (
                        <p className="text-gray-500 py-4 text-center">No hay turnos en este periodo.</p>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {filteredAppointments.slice(0, 10).map((apt) => (
                                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1 h-12 rounded-full ${apt.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {format(parseISO(apt.date), "dd/MM HH:mm", { locale: es })} - {apt.service?.name || apt.service?.title || 'Servicio'}
                                            </p>
                                            <p className="text-sm text-gray-500">{apt.user?.name || 'Cliente'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${apt.status === 'CONFIRMED' || apt.status === 'Confirmado' || apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {apt.status === 'CONFIRMED' || apt.status === 'Confirmado' ? 'Confirmado' :
                                            apt.status === 'PENDING' || apt.status === 'Pendiente' ? 'Pendiente' :
                                                apt.status === 'CANCELLED' || apt.status === 'Cancelado' ? 'Cancelado' :
                                                    apt.status === 'COMPLETED' ? 'Completado' : apt.status}
                                    </span>
                                </div>
                            ))}
                            {filteredAppointments.length > 10 && (
                                <p className="text-center text-sm text-gray-500 pt-2">Mostrando los últimos 10</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Acciones Rápidas</h3>
                    <div className="space-y-3">
                        <Link to="/admin/calendar" className="block w-full py-2 px-4 bg-primary text-white text-center rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold">
                            Ver Calendario
                        </Link>
                        <Link to="/admin/settings" className="block w-full py-2 px-4 bg-white border border-gray-200 text-gray-600 text-center rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                            Bloquear Horario
                        </Link>
                        <Link to="/admin/services" className="block w-full py-2 px-4 bg-white border border-gray-200 text-gray-600 text-center rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                            Gestionar Servicios
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

