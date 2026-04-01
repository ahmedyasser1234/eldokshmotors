import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        const isAdminRoute = roles?.includes('admin');
        const encodedRedirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={isAdminRoute ? "/admin/login" : `/login?redirect=${encodedRedirect}`} replace />;
    }

    if (roles && user && !roles.includes(user.role)) {
        // Specifically handle Admin trying to access Customer Dashboard
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        // Specifically handle Customer trying to access Admin Dashboard
        if (roles.includes('admin') && (user.role === 'customer' || user.role === 'driver')) {
            return <Navigate to={user.role === 'customer' ? "/dashboard" : "/driver/dashboard"} replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
