import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { isDemoMode } from '../demo/demoManager';
import Loader from '../../shared/components/Loader';

/**
 * AuthGuard - Ensures user is authenticated (Firebase or Demo Mode)
 * Redirects to login if not authenticated
 */
const AuthGuard = ({ children }) => {
    const { user, userData, loading } = useAuth();
    const location = useLocation();
    const inDemoMode = isDemoMode();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader text="Loading..." />
            </div>
        );
    }

    // Allow access if user is authenticated OR in demo mode
    if (!user && !inDemoMode) {
        // Redirect to login, save intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check for Pending Approval (only for real users)
    if (userData?.subscriptionStatus === 'pending' && !inDemoMode) {
        return <Navigate to="/pending-approval" replace />;
    }

    return children;
};

export default AuthGuard;
