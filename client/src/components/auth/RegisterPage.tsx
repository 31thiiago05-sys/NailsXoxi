import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/register', { name, email, password, phone });
            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="Nails Xoxi Logo" className="h-20 w-auto object-contain mb-4" />
                    <h1 className="text-3xl font-bold text-center mb-2 font-serif text-text">Crear Cuenta</h1>
                    <p className="text-center text-gray-500">Unite a Nails Xoxi</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            placeholder="Tu Nombre"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="tu@email.com"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (Opcional)</label>
                        <input
                            type="tel"
                            placeholder="11 1234 5678"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            placeholder="******"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:opacity-90 transition-opacity flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Registrarse'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">¿Ya tenés cuenta? </span>
                    <Link to="/login" className="text-secondary-dark font-semibold hover:underline">Ingresá acá</Link>
                </div>
            </div>
        </div>
    );
}
