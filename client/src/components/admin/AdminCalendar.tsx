import { ChevronLeft, ChevronRight, Loader2, DollarSign, Calendar as CalendarIcon, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import api from '../../api';

interface CalendarAppointment {
    id: string;
    date: string; // ISO string from API
    status: string;
    client: {
        name: string;
    };
    service: {
        name?: string;
        // title?: string; // Removed as it is now 'name'
        price: number;
    };
}

export default function AdminCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/appointments');
            // Filter out clearly cancelled early on or just keep all and filter in render
            setAppointments(data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        } finally {
            setLoading(false);
        }
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = getDay(monthStart);

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => delta > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
        setSelectedDate(null);
    };

    const getAppointmentsForDay = (day: Date) => {
        return appointments.filter(apt => {
            const status = apt.status?.toUpperCase();
            if (status === 'CANCELLED' || status === 'CANCELADO') return false;
            return isSameDay(parseISO(apt.date), day);
        });
    };

    // Monthly stats
    const monthlyAppointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.date);
        const status = apt.status?.toUpperCase();
        return aptDate.getMonth() === currentDate.getMonth() &&
            aptDate.getFullYear() === currentDate.getFullYear() &&
            (status === 'CONFIRMED' || status === 'CONFIRMADO' || status === 'COMPLETED');
    });

    const totalRevenue = monthlyAppointments.reduce((sum, apt) => sum + Number(apt.service?.price || 0), 0);
    const totalCount = monthlyAppointments.length;

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Calendario Mensual</h2>
                <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 border-r border-gray-200" title="Mes anterior"><ChevronLeft size={20} /></button>
                    <span className="px-6 font-bold text-gray-700 min-w-[180px] text-center capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 border-l border-gray-200" title="Mes siguiente"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><CalendarIcon size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Turnos Confirmados</p>
                        <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-xl text-green-600"><DollarSign size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Ingresos Estimados</p>
                        <p className="text-2xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="grid grid-cols-7 gap-1 md:gap-4 mb-4">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                        <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-2">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-4">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square md:aspect-auto md:h-32 bg-gray-50/50 rounded-xl" />
                    ))}

                    {daysInMonth.map(day => {
                        const dayApts = getAppointmentsForDay(day);
                        const isToday = isSameDay(day, new Date());
                        const isSelected = selectedDate && isSameDay(day, selectedDate);

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    relative aspect-square md:aspect-auto md:h-32 p-2 rounded-xl border-2 transition-all flex flex-col items-start
                                    ${isSelected ? 'border-primary bg-primary/5 shadow-inner' : 'border-transparent hover:border-primary/20 hover:bg-gray-50 bg-white shadow-sm'}
                                    ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                                `}
                            >
                                <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-700'}`}>
                                    {format(day, 'd')}
                                </span>

                                {dayApts.length > 0 && (
                                    <div className="mt-auto w-full">
                                        <div className="hidden md:block">
                                            <div className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block">
                                                {dayApts.length} turnos
                                            </div>
                                        </div>
                                        <div className="md:hidden flex justify-center mt-1">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Details Sidebar/Modal (simplified for now as inline) */}
            {selectedDate && (
                <div className="bg-white rounded-2xl shadow-lg border border-primary/20 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 capitalize">
                                {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                            </h3>
                            <p className="text-sm text-gray-500">{getAppointmentsForDay(selectedDate).length} turnos programados</p>
                        </div>
                        <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Cerrar detalles">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {getAppointmentsForDay(selectedDate).length > 0 ? (
                            getAppointmentsForDay(selectedDate)
                                .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                                .map(apt => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white p-2 rounded-lg shadow-sm font-bold text-primary text-sm">
                                                {format(parseISO(apt.date), 'HH:mm')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{apt.client?.name || 'Cliente'}</p>
                                                <p className="text-xs text-gray-500">{apt.service?.name || 'Servicio'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">${Number(apt.service?.price || 0).toLocaleString()}</p>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${apt.status === 'CONFIRMED' || apt.status === 'CONFIRMADO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {apt.status === 'CONFIRMED' || apt.status === 'CONFIRMADO' ? 'Confirmado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="text-center py-10">
                                <CalendarIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500">No hay turnos para este día.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
