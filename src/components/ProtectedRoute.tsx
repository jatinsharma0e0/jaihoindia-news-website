import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show nothing while session is loading (avoids flash redirect)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-news-red border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Verifying session…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login, preserving the attempted URL for post-login redirect
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
