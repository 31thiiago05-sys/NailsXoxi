import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email: email.toLowerCase() });
            setSuccess(true);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Error al enviar el correo');
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
                        <h1 className="text-2xl font-bold text-center mb-2 font-serif text-text">Correo Enviado</h1>
                    </div>

                    <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm">
                        Te enviamos un correo con las instrucciones para restablecer tu contraseña.
                        Revisá tu bandeja de entrada y seguí los pasos.
                    </div>

                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-primary hover:underline"
                    >
                        <ArrowLeft size={16} />
                        Volver al login
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
                    <h1 className="text-2xl font-bold text-center mb-2 font-serif text-text">¿Olvidaste tu contraseña?</h1>
                    <p className="text-center text-gray-500 text-sm">
                        Ingresá tu email y te enviaremos un enlace para restablecerla
                    </p>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:opacity-90 transition-opacity flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Enviar enlace'}
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
