// eslint-disable-next-line no-unused-vars
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { Navigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { useAuth } from '../context/AuthContext';
// eslint-disable-next-line no-unused-vars
import { Loader2 } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="full-screen-loader">
                <Loader2 size={40} className="spinning" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};
