import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, Instagram, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLogoOpen, setIsLogoOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/20">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        {/* Logo */}
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsLogoOpen(true)}>
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 group-hover:opacity-40 blur transition duration-200"></div>
                                <img src="/logo.png" alt="Nails Xoxi Logo" className="relative h-10 md:h-12 w-auto object-cover rounded-full" />
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {isAuthenticated && user ? (
                                <>
                                    <span className="text-sm font-medium text-gray-600 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <User className="w-4 h-4 text-primary" />
                                        Hola, {user.name.split(' ')[0]}
                                    </span>

                                    <Link to="/my-appointments" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">
                                        Mis Turnos
                                    </Link>

                                    {user.role === 'ADMIN' && (
                                        <Link to="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                            Panel Admin
                                        </Link>
                                    )}

                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors border-l pl-6"
                                        title="Cerrar Sesión"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Salir</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-4 text-sm font-medium items-center">
                                    <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">Ingresar</Link>
                                    <Link to="/register" className="px-5 py-2.5 rounded-full bg-glossy text-white hover:opacity-90 transition-all shadow-lg shadow-accent/20">Registrarse</Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-20 shadow-xl animate-in slide-in-from-top-4 duration-200">
                        <div className="p-4 space-y-4 flex flex-col items-center">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="w-full text-center py-2 border-b border-gray-50 mb-2">
                                        <div className="font-bold text-gray-900">Hola, {user.name.split(' ')[0]}</div>
                                        <div className="text-xs text-gray-400">{user.email}</div>
                                    </div>
                                    <Link to="/my-appointments" onClick={() => setIsMenuOpen(false)} className="w-full py-3 text-center text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors">
                                        Mis Turnos
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="w-full py-3 text-center text-primary font-bold bg-primary/5 rounded-xl transition-colors">
                                            Panel Admin
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => { logout(); setIsMenuOpen(false); }}
                                        className="w-full py-3 text-center text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors flex justify-center items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-3 text-center text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors">
                                        Ingresar
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full py-3 text-center bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-colors">
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="pt-28 pb-16 md:pt-40 md:pb-32 px-6 text-center max-w-5xl mx-auto relative overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

                <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-bold tracking-widest text-xs md:text-sm uppercase mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    Estudio Profesional de Manicuría
                </span>

                <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-6 md:mb-8 text-brand-dark leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    Tus manos merecen <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_auto] animate-gradient filter drop-shadow-sm">brillar hoy.</span>
                </h1>

                <p className="text-base md:text-2xl text-gray-500 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    Un espacio diseñado exclusivamente para tu relax y belleza.
                </p>

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <Link
                        to={isAuthenticated ? "/booking" : "/login"}
                        className="group relative inline-flex items-center gap-3 bg-glossy text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold shadow-xl shadow-accent/20 overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-accent/30"
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Calendar className="relative z-10 group-hover:rotate-12 transition-transform duration-300" size={24} />
                        <span className="relative z-10">Reservar Turno Online</span>
                    </Link>
                    <p className="mt-4 text-xs md:text-sm text-gray-400 font-medium">Reserva en segundos • Sin esperas</p>
                </div>
            </header>

            {/* Features / Info Grid */}
            <section className="px-6 py-24 bg-white relative">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 justify-center">
                    {/* Calidad Premium */}
                    <div className="group p-8 md:p-10 rounded-3xl bg-white hover:bg-white border text-center transition-all duration-300 border-transparent hover:border-secondary/20 hover:shadow-xl">
                        <div className="w-16 h-16 bg-background text-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:text-brand-dark transition-all duration-300 border border-secondary/20">
                            <Star size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-brand-dark">Calidad Premium</h3>
                        <p className="text-gray-500 leading-relaxed">Usamos solo productos importados de primera línea para cuidar la salud de tus uñas.</p>
                    </div>

                    {/* Diseños Únicos - Instagram Link */}
                    <a
                        href="https://www.instagram.com/nails.xoxi/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-8 md:p-10 rounded-3xl bg-white hover:bg-white border text-center transition-all duration-300 border-transparent hover:border-secondary/20 hover:shadow-xl block"
                    >
                        <div className="w-16 h-16 bg-background text-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:text-brand-dark transition-all duration-300 border border-secondary/20">
                            <Instagram size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-brand-dark flex items-center justify-center gap-2">
                            Diseños Únicos
                            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">Ver más</span>
                        </h3>
                        <p className="text-gray-500 leading-relaxed">Traé tu idea o dejate asesorar. Hacemos realidad el diseño que imaginás.</p>
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center border-t border-gray-100 bg-gray-50/50">
                <p className="text-sm font-medium text-gray-400">© {new Date().getFullYear()} Nails Xoxi.</p>
                <div className="flex justify-center gap-6 mt-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="/logo.png" alt="" className="h-6 opacity-50" />
                </div>
            </footer>
            {/* Logo Modal */}
            {isLogoOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setIsLogoOpen(false)}
                >
                    <div className="relative max-w-md w-full animate-in zoom-in-95 duration-200 bg-white p-2 rounded-full shadow-2xl">
                        <button
                            className="absolute top-0 right-0 -m-12 text-white/80 hover:text-white transition-colors"
                            onClick={() => setIsLogoOpen(false)}
                            aria-label="Cerrar vista previa"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src="/logo.png"
                            alt="Nails Xoxi Logo Large"
                            className="w-full h-auto rounded-full object-cover aspect-square"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
