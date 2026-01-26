import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { hasRole, hasAnyRole, ROLES } from '../roles/roleService';

/**
 * RoleGuard - Ensures user has required role
 * @param {string|string[]} roles - Required role(s)
 * @param {string} fallback - Path to redirect if unauthorized (default: /app)
 */
const RoleGuard = ({ children, roles, fallback = '/app' }) => {
    const { userRole, loading } = useAuth();

    if (loading) {
        return null; // Let parent guard handle loading
    }

    // No role specified, allow all authenticated users
    if (!roles) {
        return children;
    }

    // Check if user has required role(s)
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const hasAccess = hasAnyRole(userRole, requiredRoles);

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-500 mb-4">You don't have permission to access this page.</p>
                    <button
                        onClick={() => window.location.href = fallback}
                        className="btn-primary"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

/**
 * Convenience component for admin-only routes
 */
export const AdminOnly = ({ children, fallback }) => (
    <RoleGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} fallback={fallback}>
        {children}
    </RoleGuard>
);

/**
 * Convenience component for owner and above
 */
export const OwnerOnly = ({ children, fallback }) => (
    <RoleGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OWNER]} fallback={fallback}>
        {children}
    </RoleGuard>
);

/**
 * Convenience component for super admin only
 */
export const SuperAdminOnly = ({ children, fallback }) => (
    <RoleGuard roles={[ROLES.SUPER_ADMIN]} fallback={fallback}>
        {children}
    </RoleGuard>
);

export default RoleGuard;
