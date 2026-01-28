import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import api from '../../api';

interface CalendarAppointment {
    id: string;
    date: string; // ISO string from API
    time: string;
    status: string;
    client: {
        name: string;
    };
    service: {
        title: string;
    };
}

export default function AdminCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Generar días de la semana actual
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Empezar lunes
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const { data } = await api.get('/appointments');
                setAppointments(data.filter((a: CalendarAppointment) => a.status !== 'cancelled'));
            } catch (error) {
                console.error('Failed to fetch appointments', error);
            }
        };
        fetchAppointments();
    }, []);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

    const hours = Array.from({ length: 13 }).map((_, i) => 6 + i); // 6 a 18hs

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Calendario</h2>
                <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm w-full md:w-auto justify-between md:justify-start">
                    <button aria-label="Semana anterior" onClick={handlePrevWeek} className="p-2 hover:bg-gray-50 border-r border-gray-200"><ChevronLeft size={20} /></button>
                    <span className="px-4 font-medium min-w-[150px] text-center capitalize flex-1 md:flex-none">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button aria-label="Semana siguiente" onClick={handleNextWeek} className="p-2 hover:bg-gray-50 border-l border-gray-200"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {/* Grilla con Header Sticky */}
                <div className="overflow-y-auto flex-1 relative overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Header Días - Ahora dentro del scroll pero sticky */}
                        <div className="grid grid-cols-[4rem_repeat(7,1fr)] bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                            <div className="border-r border-gray-200 bg-gray-50"></div> {/* Time Col */}
                            {weekDays.map(day => (
                                <div key={day.toString()} className="text-center py-3 border-r border-gray-200 last:border-0 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-400 uppercase">{format(day, 'EEE', { locale: es })}</p>
                                    <p className={`font-bold text-lg ${isSameDay(day, new Date()) ? 'text-primary' : 'text-gray-700'}`}>
                                        {format(day, 'd')}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {hours.map(hour => (
                            <div key={hour} className="grid grid-cols-[4rem_repeat(7,1fr)] min-h-[80px] border-b border-gray-100 last:border-0">
                                <div className="border-r border-gray-200 p-2 text-right">
                                    <span className="text-xs text-gray-400 font-medium">{hour}:00</span>
                                </div>
                                {weekDays.map(day => {
                                    // Buscar turno en este día y hora
                                    const appt = appointments.find(a => {
                                        const apptDate = parseISO(a.date);
                                        const apptHour = parseInt(a.time.split(':')[0]);
                                        return isSameDay(apptDate, day) && apptHour === hour;
                                    });

                                    return (
                                        <div key={day.toString()} className="border-r border-gray-200 relative p-1 transition-colors hover:bg-gray-50">
                                            {appt && (
                                                <div className="absolute inset-1 bg-primary/20 border-l-4 border-primary rounded text-xs p-1 overflow-hidden cursor-pointer hover:bg-primary/30 transition-colors">
                                                    <p className="font-bold text-primary-dark truncate">{appt.client?.name || 'Cliente'}</p>
                                                    <p className="text-gray-600 truncate">{appt.service?.title || 'Servicio'}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
