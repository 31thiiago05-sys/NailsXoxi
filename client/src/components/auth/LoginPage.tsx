import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token, data.user);
            navigate(data.user.role === 'ADMIN' ? '/admin' : '/');
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="Nails Xoxi Logo" className="h-20 w-auto object-contain mb-4" />
                    <h1 className="text-3xl font-bold text-center mb-2 font-serif text-text">Bienvenida</h1>
                    <p className="text-center text-gray-500">Ingresá a tu cuenta</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="tu@email.com"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="******"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:opacity-90 transition-opacity flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">¿No tenés cuenta? </span>
                    <Link to="/register" className="text-secondary-dark font-semibold hover:underline">Registrate acá</Link>
                </div>

            </div>
        </div>
    );
}
