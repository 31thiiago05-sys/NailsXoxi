import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Token inválido o faltante');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Error al restablecer contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                    <div className="flex flex-col items-center mb-6">
                        <img src="/logo.png" alt="Nails Xoxi Logo" className="h-20 w-auto object-contain mb-4" />
                        <h1 className="text-2xl font-bold text-center mb-2 font-serif text-text">¡Contraseña Actualizada!</h1>
                    </div>

                    <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm text-center">
                        Tu contraseña se actualizó correctamente. Serás redirigido al login en unos segundos...
                    </div>

                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-primary hover:underline"
                    >
                        <ArrowLeft size={16} />
                        Ir al login ahora
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="Nails Xoxi Logo" className="h-20 w-auto object-contain mb-4" />
                    <h1 className="text-2xl font-bold text-center mb-2 font-serif text-text">Nueva Contraseña</h1>
                    <p className="text-center text-gray-500 text-sm">
                        Ingresá tu nueva contraseña
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Mínimo 6 caracteres"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-10"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                placeholder="Repetí tu contraseña"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-10"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:opacity-90 transition-opacity flex justify-center items-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Restablecer Contraseña'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary">
                        <ArrowLeft size={16} />
                        Volver al login
                    </Link>
                </div>
            </div>
        </div>
    );
}
