import React from 'react';
import { LayoutDashboard, Calendar, Settings, Users, Scissors, LogOut, DollarSign, Home, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

// Este componente envolverá todas las páginas del admin
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        { icon: Calendar, label: 'Turnos', href: '/admin/bookings' },
        { icon: DollarSign, label: 'Ganancias', href: '/admin/earnings' },
        { icon: Calendar, label: 'Calendario', href: '/admin/calendar' },
        { icon: Scissors, label: 'Servicios', href: '/admin/services' },
        { icon: Users, label: 'Clientas', href: '/admin/clients' },
        { icon: Settings, label: 'Configuración', href: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex flex-col gap-1">
                        <img src="/logo.png" alt="Nails Xoxi Logo" className="h-10 w-auto object-contain self-start" />
                        <span className="text-xs text-gray-400 block tracking-widest font-normal uppercase mt-2">Admin Panel</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-gray-600 hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Home size={20} />
                        Volver al Sitio
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Nails Xoxi" className="h-8 w-auto object-contain" />
                    <span className="font-bold text-gray-800">Admin Panel</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    aria-label="Abrir menú"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute top-0 left-0 bottom-0 w-3/4 max-w-[300px] bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                        <div className="p-4 flex items-center justify-between border-b border-gray-100">
                            <span className="font-bold text-gray-800">Menú</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                                aria-label="Cerrar menú"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-gray-600 hover:bg-primary/10 hover:text-primary"
                                        )}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-gray-100 space-y-2">
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Home size={20} />
                                Volver al Sitio
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut size={20} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8 pt-24 md:pt-8 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
