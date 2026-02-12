import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { config } from '../../config';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-400">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    // DEV MODE BYPASS via config
    // Also if useAuth returns a mock user (which it does in dev mode), 'user' will be truthy anyway.
    // But explicit check helps if useAuth logic changes.
    if (config.isDev && !location.pathname.startsWith('/root')) {
        return <>{children}</>;
    }

    if (!user) {
        // Redirect to auth page, but save the current location to redirect back after login
        return <Navigate to={`/auth?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return <>{children}</>;
};
