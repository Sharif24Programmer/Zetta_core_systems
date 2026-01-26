import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Loader from '../../shared/components/Loader';

/**
 * TenantGuard - Ensures user belongs to a valid tenant
 * Redirects to error page if tenant is invalid or suspended
 */
const TenantGuard = ({ children }) => {
    const { tenant, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader text="Loading..." />
            </div>
        );
    }

    // No tenant found
    if (!tenant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Account Not Found</h2>
                    <p className="text-slate-500 mb-4">Your account is not associated with any shop.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="btn-primary"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // Tenant is suspended
    if (tenant.status === 'suspended') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Account Suspended</h2>
                    <p className="text-slate-500 mb-4">Your shop account has been suspended. Please contact support.</p>
                    <a href="mailto:support@zetta.com" className="btn-primary">
                        Contact Support
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default TenantGuard;
