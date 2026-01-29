import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import BookingWizard from './components/booking/BookingWizard';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './components/admin/Dashboard';
import AdminCalendar from './components/admin/AdminCalendar';
import ServicesManager from './components/admin/ServicesManager';
import ClientsManager from './components/admin/ClientsManager';
import SettingsManager from './components/admin/SettingsManager';
import BookingsManager from './components/admin/BookingsManager';
import EarningsManager from './components/admin/EarningsManager';
import MyAppointments from './components/client/MyAppointments';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import PoliciesPage from './pages/PoliciesPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';
import RequireAuth from './components/auth/RequireAuth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/booking" element={
            <div className="min-h-screen bg-gray-50 py-10">
              <BookingWizard />
            </div>
          } />

          {/* Rutas de Retorno de Pago */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/payment/pending" element={<PaymentPending />} />

          {/* Rutas Cliente Protegidas */}
          <Route element={<RequireAuth />}>
            <Route path="/my-appointments" element={<MyAppointments />} />
          </Route>

          {/* Rutas Admin Protegidas */}
          <Route element={<RequireAuth adminOnly />}>
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/bookings" element={<AdminLayout><BookingsManager /></AdminLayout>} />
            <Route path="/admin/earnings" element={<AdminLayout><EarningsManager /></AdminLayout>} />
            <Route path="/admin/calendar" element={<AdminLayout><AdminCalendar /></AdminLayout>} />
            <Route path="/admin/services" element={<AdminLayout><ServicesManager /></AdminLayout>} />
            <Route path="/admin/clients" element={<AdminLayout><ClientsManager /></AdminLayout>} />
            <Route path="/admin/settings" element={<AdminLayout><SettingsManager /></AdminLayout>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
