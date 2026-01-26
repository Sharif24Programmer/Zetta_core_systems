import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Loader from '../../shared/components/Loader';

/**
 * AuthGuard - Ensures user is authenticated
 * Redirects to login if not authenticated
 */
const AuthGuard = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader text="Loading..." />
            </div>
        );
    }

    if (!user) {
        // Redirect to login, save intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
