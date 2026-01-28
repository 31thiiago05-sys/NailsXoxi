import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RequireAuthProps {
    adminOnly?: boolean;
    children?: ReactNode;
}

export default function RequireAuth({ adminOnly = false, children }: RequireAuthProps) {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
}
