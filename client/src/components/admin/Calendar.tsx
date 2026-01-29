import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
    id: string;
    date: string;
    status: string;
    user: {
        name: string;
    };
    service: {
        name: string;
    };
}

interface CalendarProps {
    appointments: Appointment[];
}

export default function Calendar({ appointments }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = getDay(monthStart);

    // Filter confirmed appointments for current month
    const confirmedAppointments = appointments.filter(apt => {
        if (apt.status !== 'CONFIRMED') return false;
        const aptDate = new Date(apt.date);
        return aptDate.getMonth() === currentDate.getMonth() &&
            aptDate.getFullYear() === currentDate.getFullYear();
    });

    // Get appointments for a specific day
    const getAppointmentsForDay = (day: Date) => {
        return confirmedAppointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return isSameDay(aptDate, day);
        });
    };

    // Calculate stats
    const totalBookings = confirmedAppointments.length;
    const totalRevenue = 0; // Revenue calculation would need price data

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
        setSelectedDate(null);
    };

    const dayAppointments = selectedDate ? getAppointmentsForDay(selectedDate) : [];

    return (
        <div className="space-y-6">
            {/* Header with navigation */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Mes anterior"
                        aria-label="Mes anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Mes siguiente"
                        aria-label="Mes siguiente"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500">Turnos del Mes</div>
                    <div className="text-2xl font-bold text-primary">{totalBookings}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500">Ingresos</div>
                    <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Actual days */}
                    {daysInMonth.map(day => {
                        const dayAppointments = getAppointmentsForDay(day);
                        const hasAppointments = dayAppointments.length > 0;

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={`aspect-square p-2 rounded-lg border-2 transition-all relative ${selectedDate && isSameDay(selectedDate, day)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="text-sm font-medium">{format(day, 'd')}</div>
                                {hasAppointments && (
                                    <>
                                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary rounded-full" />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {dayAppointments.length}
                                        </div>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected day details */}
            {selectedDate && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">
                            {format(selectedDate, "d 'de' MMMM", { locale: es })}
                        </h3>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    {dayAppointments.length > 0 ? (
                        <ul className="space-y-2">
                            {dayAppointments
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map(apt => (
                                    <li key={apt.id} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="font-medium">
                                            {format(new Date(apt.date), 'HH:mm')} - {apt.user.name}
                                        </div>
                                        <div className="text-sm text-gray-600">{apt.service.name}</div>
                                    </li>
                                ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No hay turnos para este día</p>
                    )}
                </div>
            )}
        </div>
    );
}
