import { useState, useEffect } from 'react';
import api from '../../api';
import { Loader2, Calendar as CalIcon, Ban, CheckCircle, Clock, Save, ChevronLeft } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface Availability {
    id: string;
    date: string;
    isBlocked: boolean;
    slots: string[] | string; // Can be JSON string or array
}

export default function SettingsManager() {
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [slots, setSlots] = useState<string[]>([]);

    // Default config
    // Configuration Constants
    const GRID_SLOTS = [
        "06:00", "07:00", "08:00", "09:00", "10:00",
        "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ];

    const WEEKDAY_DEFAULTS = ["08:00", "11:00", "16:00"];

    const getDefaultsForDay = (date: Date) => {
        const day = date.getDay(); // 0 = Sunday, 6 = Saturday
        if (day === 0) {
            // Sunday: Blocked
            return { isBlocked: true, slots: [] };
        }
        if (day === 6) {
            // Saturday: Only 08:00 enabled
            return { isBlocked: false, slots: ["08:00"] };
        }
        // Weekdays: Only 8, 11, 16 enabled by default
        return { isBlocked: false, slots: WEEKDAY_DEFAULTS };
    };

    // Generate next 30 days
    const next30Days = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const { data } = await api.get('/availability');
            // Data comes with 'date' as string ISO
            setAvailabilities(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (date: Date) => {
        setSelectedDate(date);

        // Find existing config
        // Fix: Compare YYYY-MM-DD string parts to avoid timezone shifts
        // a.date is ISO string (e.g. 2026-01-29T00:00:00.000Z)
        // date is local Date object
        const selectedDateStr = format(date, 'yyyy-MM-dd');

        const found = availabilities.find(a => {
            const apiDateStr = a.date.split('T')[0];
            return apiDateStr === selectedDateStr;
        });

        if (found) {
            setIsBlocked(found.isBlocked);
            const parsedSlots = typeof found.slots === 'string' ? JSON.parse(found.slots) : found.slots;
            setSlots(Array.isArray(parsedSlots) ? parsedSlots : []);
        } else {
            // New date default based on day of week
            const defaults = getDefaultsForDay(date);
            setIsBlocked(defaults.isBlocked);
            setSlots(defaults.slots);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate) return;

        try {
            await api.post('/availability', {
                date: format(selectedDate, 'yyyy-MM-dd'),
                isBlocked: isBlocked,
                slots: isBlocked ? [] : slots
            });
            await fetchAvailability();
            setSelectedDate(null); // Close editor
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
        }
    };

    const getStatusForDay = (date: Date) => {
        const selectedDateStr = format(date, 'yyyy-MM-dd');
        const found = availabilities.find(a => a.date.split('T')[0] === selectedDateStr);

        let isBlocked = false;
        let daySlots: string[] = [];

        if (found) {
            isBlocked = found.isBlocked;
            const parsed = typeof found.slots === 'string' ? JSON.parse(found.slots) : found.slots;
            daySlots = Array.isArray(parsed) ? parsed : [];
        } else {
            const defaults = getDefaultsForDay(date);
            isBlocked = defaults.isBlocked;
            daySlots = defaults.slots;
        }

        if (isBlocked) return { type: 'blocked', label: 'Bloqueado' };
        return { type: 'open', label: `${daySlots.length} Turnos` };
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row p-4 md:p-0">
            {/* Header only for Mobile/Desktop differentiation if needed, but here we integrate it */}

            {/* Container for Split View */}
            <div className="flex flex-col md:flex-row gap-0 md:gap-0 flex-1 overflow-hidden bg-white md:rounded-2xl md:shadow-lg border border-gray-100 w-full">

                {/* LEFT PANEL: Day List */}
                <div className={`
                    flex-1 flex flex-col overflow-hidden bg-white
                    ${selectedDate ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <CalIcon className="w-5 h-5 text-primary" />
                            Disponibilidad
                        </h2>
                        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border">
                            30 Días
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {next30Days.map(date => {
                            const status = getStatusForDay(date);
                            const isSelected = selectedDate && isSameDay(selectedDate, date);

                            return (
                                <div
                                    key={date.toString()}
                                    onClick={() => handleEdit(date)}
                                    className={`
                                        p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center group
                                        ${isSelected
                                            ? 'border-primary bg-primary/5 shadow-inner'
                                            : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold text-xs uppercase shadow-sm
                                            ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary'}
                                        `}>
                                            <span>{format(date, 'MMM', { locale: es })}</span>
                                            <span className="text-sm">{format(date, 'd')}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 capitalize text-sm">
                                                {format(date, 'EEEE', { locale: es })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {format(date, 'yyyy')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`
                                        px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1
                                        ${status.type === 'blocked' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            status.type === 'open' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}
                                    `}>
                                        {status.type === 'blocked' ? <Ban className="w-3 h-3" /> :
                                            status.type === 'open' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {status.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT PANEL: Editor */}
                <div className={`
                    w-full md:w-[400px] flex flex-col bg-gray-50/50 md:border-l border-gray-100
                    ${!selectedDate ? 'hidden md:flex' : 'flex animate-in slide-in-from-right duration-200'}
                `}>
                    {selectedDate ? (
                        <form onSubmit={handleSave} className="flex-1 flex flex-col h-full overflow-hidden">
                            {/* Header */}
                            <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-2 shadow-sm z-10">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDate(null)}
                                    className="md:hidden p-2 -ml-2 text-gray-500 hover:text-primary transition-colors"
                                    aria-label="Volver"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 capitalize leading-tight">
                                        {format(selectedDate, 'EEEE d', { locale: es })}
                                    </h3>
                                    <p className="text-xs text-gray-500 capitalize">{format(selectedDate, 'MMMM yyyy', { locale: es })}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={isBlocked}
                                            onChange={(e) => {
                                                const blocked = e.target.checked;
                                                setIsBlocked(blocked);
                                                if (!blocked && slots.length === 0 && selectedDate) {
                                                    const defs = getDefaultsForDay(selectedDate);
                                                    setSlots(defs.slots.length > 0 ? defs.slots : WEEKDAY_DEFAULTS);
                                                }
                                            }}
                                            className="accent-primary w-4 h-4"
                                        />
                                        <span className="text-xs font-bold text-gray-700 select-none">BLOQUEAR</span>
                                    </label>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                {isBlocked ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                                        <Ban className="w-16 h-16 mb-4 text-red-200" />
                                        <p className="font-medium text-gray-500">Día Bloqueado</p>
                                        <p className="text-xs max-w-[200px]">No se recibirán turnos para esta fecha.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" /> Turnos Disponibles
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => selectedDate && setSlots(getDefaultsForDay(selectedDate).slots.length > 0 ? getDefaultsForDay(selectedDate).slots : WEEKDAY_DEFAULTS)}
                                                className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                                            >
                                                RESTAURAR
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {GRID_SLOTS.concat(slots.filter(s => !GRID_SLOTS.includes(s))).sort().map(slot => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => {
                                                        if (slots.includes(slot)) setSlots(slots.filter(s => s !== slot));
                                                        else setSlots([...slots, slot].sort());
                                                    }}
                                                    className={`
                                                        py-2 rounded-lg text-sm font-medium transition-all border-2
                                                        ${slots.includes(slot)
                                                            ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                                                            : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30 hover:text-primary'}
                                                    `}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-white border-t border-gray-100">
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    GUARDAR CAMBIOS
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <CalIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-bold text-lg mb-2">Selecciona una Fecha</h3>
                            <p className="text-sm text-gray-500 max-w-[200px]">Elige un día de la lista para editar su horario o bloquearlo.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
