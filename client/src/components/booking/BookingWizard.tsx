import { useState, useEffect } from 'react';
import { getServices, getCategories, getAvailability, getAppointments, createAppointment, createAppointmentPreference } from '../../api';
import type { Service, Category, Availability, Appointment } from '../../types';
import { Check, ChevronRight, Clock, DollarSign, ChevronLeft, Calendar as CalendarIcon, Info, X, ZoomIn, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

interface TimeSlot {
    time: string;
    available: boolean;
}

export default function BookingWizard() {
    const { user } = useAuth();
    const [step, setStep] = useState(0); // Start at 0 for T&C
    const [loading, setLoading] = useState(true);

    // Data States
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

    // Selection States
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [removalOption, setRemovalOption] = useState<'none' | 'own' | 'foreign'>('none');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [servicesData, categoriesData, availData, apptsData] = await Promise.all([
                    getServices(),
                    getCategories(),
                    getAvailability(),
                    getAppointments()
                ]);
                setServices(servicesData);
                setCategories(categoriesData);
                setAvailabilities(availData);
                setExistingAppointments(apptsData);
            } catch (error) {
                console.error('Error loading booking data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredServices = services.filter(s => s.categoryId === selectedCategory);

    // Helper to calculate total
    const getRemovalPrice = () => {
        if (!selectedService) return 0;
        if (removalOption === 'own') return Number(selectedService.removalPriceOwn || 0);
        if (removalOption === 'foreign') return Number(selectedService.removalPriceForeign || 0);
        return 0;
    };

    const totalPrice = Number(selectedService?.price || 0) + getRemovalPrice();
    const depositAmount = Number(selectedService?.deposit) || (totalPrice / 2);

    // Calendar Generation
    const next30Days = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));

    const getSlotsForDate = (date: Date): TimeSlot[] => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // Fix: Match date strictly by YYYY-MM-DD string to avoid timezone shifts
        const dayConfig = availabilities.find(a => a.date.split('T')[0] === dateStr);

        let slots: string[] = [];

        // If config exists, use it
        if (dayConfig) {
            if (dayConfig.isBlocked) return [];
            const parsed = typeof dayConfig.slots === 'string' ? JSON.parse(dayConfig.slots) : dayConfig.slots;
            slots = Array.isArray(parsed) ? parsed : [];
        } else {
            // Default slots if not configured
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

            if (dayOfWeek === 0) {
                // Sunday default: Blocked
                return [];
            } else if (dayOfWeek === 6) {
                // Saturday default: Only 08:00
                slots = ["08:00"];
            } else {
                // Weekday default: Standard hours (Synced with SettingsManager)
                slots = ["08:00", "11:00", "16:00"];
            }
        }

        // Filter out past slots if today
        if (isSameDay(date, new Date())) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            slots = slots.filter(time => {
                const [slotHour, slotMinute] = time.split(':').map(Number);
                if (slotHour < currentHour) return false;
                if (slotHour === currentHour && slotMinute <= currentMinute) return false;
                return true;
            });
        }

        // Filter out taken slots
        return slots.map(time => {
            // Check if this specific time on this date is taken
            const isTaken = existingAppointments.some(appt => {
                const apptDate = new Date(appt.date);
                return isSameDay(apptDate, date) && format(apptDate, 'HH:mm') === time;
            });
            return { time, available: !isTaken };
        });
    };

    // Navigation handlers
    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    // State for T&C (Must be called unconditionally)
    const [hasReadTerms, setHasReadTerms] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        // Tolerance of 10px to account for rounding differences
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            setHasReadTerms(true);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-pulse text-primary font-medium">Cargando experiencia de reserva...</div>
            </div>
        );
    }

    // ... existing handleNext ...

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white md:rounded-2xl md:shadow-xl my-0 md:my-10 border-0 md:border border-secondary/20 min-h-screen md:min-h-[500px]">
            {/* Header / Progress Bar */}
            {step > 0 && (
                <div className="mb-6 md:mb-8">
                    <div className="flex justify-between items-center relative mb-4">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 ease-in-out -z-10 rounded-full" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>

                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={cn(
                                "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-300 border-2 bg-white",
                                step >= i ? "bg-primary border-primary text-white scale-110 shadow-lg" : "border-gray-300 text-gray-400"
                            )}>
                                {i}
                            </div>
                        ))}
                    </div>
                    <div className="text-center text-xs md:text-sm font-medium text-gray-500 h-5">
                        {step === 1 && "Categoría"}
                        {step === 2 && "Servicio"}
                        {step === 3 && "Adicionales"}
                        {step === 4 && "Fecha y Hora"}
                        {step === 5 && "Confirmación"}
                    </div>
                </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
                {/* STEP 0: Terms and Conditions */}
                {step === 0 && (
                    <div className="max-w-xl mx-auto">
                        <button onClick={() => window.history.back()} className="mb-4 flex items-center text-gray-500 hover:text-primary transition-colors">
                            <ChevronLeft size={20} />
                            <span className="ml-1">Volver</span>
                        </button>

                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center font-serif">Términos y Condiciones</h2>

                        <div
                            onScroll={handleScroll}
                            className="prose prose-sm text-gray-600 bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 mb-6 md:mb-8 max-h-[60vh] overflow-y-auto shadow-inner text-pretty leading-relaxed text-left relative"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Política de Cancelación</h3>
                            <p className="mb-4">Para mantener el orden y respeto por los turnos de todas, aplicamos las siguientes reglas automáticas:</p>

                            <h4 className="font-bold text-green-700 flex items-center gap-2 mt-4 text-sm md:text-base">✅ Cancelación con anticipación (+72hs)</h4>
                            <p className="mb-2">Si cancelas con más de 3 días de aviso, tu seña queda guardada como crédito a favor.</p>
                            <ul className="list-disc pl-5 mb-4 space-y-1">
                                <li><strong>Validez:</strong> El crédito dura 30 días para reagendar un nuevo turno. Pasado ese tiempo, se pierde.</li>
                                <li><strong>Límite:</strong> Solo se permite 1 reagendamiento cada 30 días. Si vuelves a cancelar dentro de este periodo, la seña se pierde automáticamente.</li>
                                <li><strong>Importante:</strong> Las señas NO TIENEN REEMBOLSO en dinero, solo quedan como saldo a favor en el sistema bajo las condiciones mencionadas.</li>
                            </ul>

                            <h4 className="font-bold text-yellow-700 flex items-center gap-2 mt-4 text-sm md:text-base">⚠️ Cancelación sobre la hora (-72hs)</h4>
                            <p className="mb-4">Si cancelas con menos de 72hs de antelación, lamentablemente se pierde el turno y se genera una deuda por el valor total del servicio.</p>

                            <h4 className="font-bold text-blue-700 flex items-center gap-2 mt-4 text-sm md:text-base">🕐 Tolerancia de espera (10 min)</h4>
                            <p className="mb-2">El tiempo de espera es de 10 minutos. Pasado esos minutos se cobrará $4.000 adicionales dependiendo la tardanza y si dispongo de tiempo con la siguiente clienta.</p>
                            <p className="mb-4"><strong>Caso contrario:</strong> Se cancela el turno automáticamente y se deberá abonar el restante del mismo (el valor total del servicio menos la seña ya abonada) para poder volver a reservar.</p>

                            <h4 className="font-bold text-red-700 flex items-center gap-2 mt-4 text-sm md:text-base">⛔ Política de Deudas:</h4>
                            <p className="mb-4">Si generas una deuda (por cancelación sobre la hora o por llegar tarde), tu cuenta quedará bloqueada para nuevas reservas hasta que abones el monto pendiente ingresando a tu perfil.</p>

                            <p className="text-sm font-medium text-gray-900 mt-6 pt-4 border-t border-gray-200">Al continuar, confirmas que has leído y aceptas estas condiciones. 💕</p>
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            disabled={!hasReadTerms}
                            className={`w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg transition-all transform duration-200 mb-10 md:mb-0
                                ${hasReadTerms
                                    ? "bg-glossy text-white shadow-primary/30 hover:opacity-90 hover:scale-[1.02]"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"}
                            `}
                        >
                            {hasReadTerms ? "ACEPTO Y QUIERO RESERVAR" : "Lee hasta el final para aceptar"}
                        </button>
                    </div>
                )}
                {/* STEP 1: Categories */}
                {step === 1 && (
                    <div>
                        {/* Back button for Step 1 - Goes back to T&C */}
                        <button onClick={() => setStep(0)} className="mb-4 flex items-center text-gray-500 hover:text-primary transition-colors">
                            <ChevronLeft size={20} />
                            <span className="ml-1">Volver</span>
                        </button>

                        <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-6 text-center">¿Qué te gustaría hacerte hoy?</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCategory(cat.id); handleNext(); }}
                                    className="group relative overflow-hidden p-6 rounded-2xl border-2 border-transparent bg-white hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center aspect-[3/2] sm:aspect-[4/3] shadow-sm"
                                >
                                    <span className="font-bold text-lg text-brand-dark group-hover:text-primary transition-colors">{cat.name}</span>
                                    <div className="w-8 h-1 bg-primary/20 rounded-full group-hover:w-16 group-hover:bg-primary transition-all duration-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: Services */}
                {step === 2 && (
                    <div>
                        <button onClick={handleBack} className="mb-4 flex items-center text-gray-500 hover:text-primary transition-colors">
                            <ChevronLeft size={20} /> Volver
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-6">Elegí el Servicio</h2>
                        <div className="space-y-4">
                            {filteredServices.map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={cn(
                                        "relative flex flex-row gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group overflow-hidden items-start",
                                        selectedService?.id === service.id ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 hover:border-primary/30 hover:bg-white"
                                    )}
                                >
                                    {/* Service Image Thumbnail */}
                                    <div
                                        className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative group/image cursor-zoom-in"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const imgs = service.images && service.images.length > 0 ? service.images : (service.imageUrl ? [service.imageUrl] : []);
                                            if (imgs.length > 0) {
                                                setLightboxImages(imgs);
                                                setLightboxIndex(0);
                                            }
                                        }}
                                    >
                                        {((service.images && service.images.length > 0) || service.imageUrl) ? (
                                            <div className="w-full h-full">
                                                <img
                                                    src={service.images && service.images.length > 0 ? service.images[0] : service.imageUrl!}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                                                    <ZoomIn className="text-white drop-shadow-md" size={20} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                                <div className="text-[10px] text-center px-1">Sin foto</div>
                                            </div>
                                        )}

                                        {service.images && service.images.length > 1 && (
                                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1 font-medium">
                                                +{service.images.length - 1}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-base text-gray-900 leading-tight">{service.name}</h3>
                                            {selectedService?.id === service.id && (
                                                <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                                                    <Check size={12} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {service.description && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{service.description}</p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                                <Clock size={12} /> {service.durationMin}m
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark bg-primary/10 px-2 py-0.5 rounded-md">
                                                <DollarSign size={12} /> {service.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex md:justify-end sticky bottom-4 md:static">
                            <button
                                onClick={handleNext}
                                disabled={!selectedService}
                                className="w-full md:w-auto bg-glossy text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none hover:opacity-90 hover:scale-105 transition-all text-sm md:text-base"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Removal */}
                {step === 3 && (
                    <div>
                        <button onClick={handleBack} className="mb-4 flex items-center text-gray-500 hover:text-primary transition-colors">
                            <ChevronLeft size={20} /> Volver
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">¿Necesitas Retiro?</h2>
                        <p className="text-gray-500 mb-6 text-sm md:text-base">Seleccioná si tenés material en tus uñas que debamos retirar antes del servicio.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setRemovalOption('none')}
                                className={cn(
                                    "p-4 md:p-6 rounded-xl border-2 text-left transition-all",
                                    removalOption === 'none' ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 hover:border-primary/30"
                                )}
                            >
                                <div className="font-bold text-base md:text-lg mb-1">No</div>
                                <div className="text-sm text-gray-500">Sin costo adicional</div>
                            </button>

                            <button
                                onClick={() => setRemovalOption('own')}
                                className={cn(
                                    "p-4 md:p-6 rounded-xl border-2 text-left transition-all",
                                    removalOption === 'own' ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 hover:border-primary/30"
                                )}
                            >
                                <div className="font-bold text-base md:text-lg mb-1">Sí, retiro de trabajo previo (Mío)</div>
                                <div className="text-sm text-primary font-bold">
                                    {Number(selectedService?.removalPriceOwn) > 0 ? `+ $${selectedService?.removalPriceOwn}` : 'Sin Cargo'}
                                </div>
                            </button>

                            <button
                                onClick={() => setRemovalOption('foreign')}
                                className={cn(
                                    "p-4 md:p-6 rounded-xl border-2 text-left transition-all",
                                    removalOption === 'foreign' ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 hover:border-primary/30"
                                )}
                            >
                                <div className="font-bold text-base md:text-lg mb-1">Sí, retiro de otro lugar (Ajeno)</div>
                                <div className="text-sm text-primary font-bold">
                                    {Number(selectedService?.removalPriceForeign) > 0 ? `+ $${selectedService?.removalPriceForeign}` : 'Sin Cargo'}
                                </div>
                            </button>
                        </div>

                        <div className="mt-8 flex md:justify-end sticky bottom-4 md:static">
                            <button
                                onClick={handleNext}
                                className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:opacity-90 hover:scale-105 transition-all"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Date & Time */}
                {step === 4 && (
                    <div>
                        <button onClick={handleBack} className="mb-4 flex items-center text-gray-500 hover:text-primary transition-colors">
                            <ChevronLeft size={20} /> Volver
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Eligí Fecha y Hora</h2>

                        <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[500px]">
                            {/* Date Selector */}
                            <div className="w-full md:w-1/3 mb-4 md:mb-0">
                                <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto gap-2 md:h-full pb-2 md:pb-0 md:pr-2 custom-scrollbar snap-x snap-mandatory">
                                    {next30Days.map(date => {
                                        const isSelected = selectedDate && isSameDay(selectedDate, date);
                                        const dateStr = format(date, 'yyyy-MM-dd');
                                        const dayConfig = availabilities.find(a => a.date.split('T')[0] === dateStr);
                                        const isBlocked = dayConfig?.isBlocked;

                                        return (
                                            <button
                                                key={date.toString()}
                                                disabled={!!isBlocked}
                                                onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                                                className={cn(
                                                    "shrink-0 w-24 md:w-full p-3 rounded-lg flex flex-col md:flex-row items-center md:justify-between border transition-all snap-start",
                                                    isSelected ? "border-primary bg-primary text-white shadow-md transform scale-105 md:scale-100" : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50",
                                                    isBlocked && "opacity-50 cursor-not-allowed bg-gray-50"
                                                )}
                                            >
                                                <div className="text-center md:text-left">
                                                    <div className="font-bold capitalize text-sm md:text-base">{format(date, 'EEE', { locale: es })}</div>
                                                    <div className="text-xs md:text-sm opacity-80">{format(date, 'd MMM', { locale: es })}</div>
                                                </div>
                                                <div className="hidden md:block">
                                                    {isSelected && <Check size={16} />}
                                                </div>
                                                {isBlocked && <span className="text-[10px] md:text-xs text-red-500 font-bold px-1.5 py-0.5 bg-red-100 rounded mt-1 md:mt-0">Cerrado</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div className="w-full md:w-2/3 bg-gray-50 rounded-xl p-4 md:p-6 min-h-[300px] md:h-full md:overflow-y-auto">
                                {!selectedDate ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10 md:py-0">
                                        <CalendarIcon size={48} className="mb-4 opacity-20" />
                                        <p className="text-center">Seleccioná una fecha par ver los horarios</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
                                        {getSlotsForDate(selectedDate).map(({ time, available }) => (
                                            <button
                                                key={time}
                                                disabled={!available}
                                                onClick={() => setSelectedTime(time)}
                                                className={cn(
                                                    "py-3 px-2 rounded-lg font-medium text-sm transition-all text-center",
                                                    selectedTime === time
                                                        ? "bg-primary text-white shadow-md transform scale-105"
                                                        : available
                                                            ? "bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                                                            : "bg-gray-100 text-gray-300 cursor-not-allowed decoration-slice"
                                                )}
                                            >
                                                {time} hs
                                            </button>
                                        ))}
                                        {getSlotsForDate(selectedDate).length === 0 && (
                                            <div className="col-span-full text-center py-10 text-gray-500">
                                                No hay horarios disponibles para este día.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex md:justify-end sticky bottom-4 md:static z-10">
                            <button
                                onClick={handleNext}
                                disabled={!selectedDate || !selectedTime}
                                className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none hover:opacity-90 hover:scale-105 transition-all"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: Summary */}
                {step === 5 && selectedService && selectedDate && selectedTime && (
                    <div className="max-w-md mx-auto">
                        <button onClick={handleBack} className="block mb-4 text-sm text-gray-500 text-left hover:text-text"> &larr; Volver </button>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">Confirmá tu Turno</h2>

                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 to-primary"></div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                    <div className="text-gray-500 text-sm">Servicio</div>
                                    <div className="font-bold text-right text-gray-900 text-sm md:text-base max-w-[60%]">{selectedService.name}</div>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                    <div className="text-gray-500 text-sm">Fecha y Hora</div>
                                    <div className="font-bold text-right text-gray-900 capitalize text-sm md:text-base">
                                        {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} - {selectedTime} hs
                                    </div>
                                </div>

                                {removalOption !== 'none' && (
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                        <div className="text-gray-500 text-sm">Adicional Retiro</div>
                                        <div className="font-medium text-right text-primary text-sm md:text-base">
                                            {removalOption === 'own' ? 'Propio' : 'Ajeno'} (+${getRemovalPrice()})
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-2">
                                    <div className="text-base md:text-lg text-gray-800 font-medium">Total Estimado</div>
                                    <div className="text-xl md:text-2xl font-bold text-gray-900">${totalPrice}</div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex gap-3">
                                <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                                <div className="text-xs md:text-sm text-blue-800">
                                    <p className="font-bold mb-1">Seña Requerida: ${depositAmount}</p>
                                    <p>Para confirmar tu turno es necesario abonar la seña. El resto (${totalPrice - depositAmount}) lo pagás en el local.</p>
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    if (!selectedService || !selectedDate || !selectedTime || !user) return;

                                    try {
                                        setIsBooking(true);

                                        // 1. Crear el turno (PENDING)
                                        // Calcular fecha completa
                                        const date = new Date(selectedDate);
                                        const [hours, minutes] = selectedTime.split(':');
                                        date.setHours(parseInt(hours), parseInt(minutes));

                                        const appointment = await createAppointment({
                                            userId: user.id,
                                            serviceId: selectedService.id,
                                            date: date
                                        });

                                        // 2. Crear preferencia de pago
                                        const preference = await createAppointmentPreference({
                                            appointmentId: appointment.id,
                                            title: selectedService.name,
                                            price: totalPrice
                                        });

                                        // 3. Redirigir a Mercado Pago
                                        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preference.id}`;

                                    } catch (error: unknown) {
                                        console.error('Booking Error:', error);
                                        setIsBooking(false);
                                        const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error al procesar la reserva. Por favor intentá nuevamente.';
                                        alert(errorMessage);
                                    }
                                }}
                                disabled={isBooking}
                                className="w-full bg-[#009EE3] hover:bg-[#008ED6] text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 group transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isBooking ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Pagar Seña con Mercado Pago</span>
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Lightbox Modal */}
            {/* Lightbox Modal */}
            {lightboxImages && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxImages(null)}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm z-50"
                        onClick={() => setLightboxImages(null)}
                        aria-label="Cerrar galería"
                    >
                        <X size={32} />
                    </button>

                    <div
                        className="flex-1 w-full flex items-center justify-center relative max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Prev Button */}
                        {lightboxImages.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex(prev => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
                                }}
                                className="absolute left-0 md:left-4 p-2 text-white/70 hover:text-white hover:bg-black/30 rounded-full transition-all"
                                aria-label="Imagen anterior"
                            >
                                <ChevronLeft size={48} />
                            </button>
                        )}

                        {/* Main Image */}
                        <img
                            src={lightboxImages[lightboxIndex]}
                            alt={`Vista previa ${lightboxIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg animate-in zoom-in-95 duration-200 shadow-2xl"
                        />

                        {/* Next Button */}
                        {lightboxImages.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex(prev => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
                                }}
                                className="absolute right-0 md:right-4 p-2 text-white/70 hover:text-white hover:bg-black/30 rounded-full transition-all"
                                aria-label="Siguiente imagen"
                            >
                                <ChevronRight size={48} />
                            </button>
                        )}
                    </div>

                    {/* Thumbnails Control */}
                    {lightboxImages.length > 1 && (
                        <div
                            className="h-20 w-full mt-4 flex items-center justify-center gap-2 overflow-x-auto py-2 px-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {lightboxImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={cn(
                                        "w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                                        lightboxIndex === idx ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                                    )}
                                >
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
