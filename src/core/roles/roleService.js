import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * User roles
 */
export const ROLES = {
    SUPER_ADMIN: 'super_admin',  // Platform admin (you)
    ADMIN: 'admin',              // Tenant admin
    OWNER: 'owner',              // Shop owner
    MANAGER: 'manager',          // Shop manager
    STAFF: 'staff'               // Regular staff
};

/**
 * Role hierarchy (higher number = more permissions)
 */
const ROLE_HIERARCHY = {
    [ROLES.SUPER_ADMIN]: 100,
    [ROLES.ADMIN]: 90,
    [ROLES.OWNER]: 80,
    [ROLES.MANAGER]: 50,
    [ROLES.STAFF]: 10
};

/**
 * Get user role
 */
export const getUserRole = async (userId) => {
    if (!userId) return null;

    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data().role || ROLES.STAFF;
    }
    return null;
};

/**
 * Check if user has required role
 */
export const hasRole = (userRole, requiredRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
    return userLevel >= requiredLevel;
};

/**
 * Check if user has any of the required roles
 */
export const hasAnyRole = (userRole, requiredRoles = []) => {
    return requiredRoles.some(role => hasRole(userRole, role));
};

/**
 * Check if user is super admin (platform level)
 */
export const isSuperAdmin = (role) => {
    return role === ROLES.SUPER_ADMIN;
};

/**
 * Check if user is admin (tenant level)
 */
export const isAdmin = (role) => {
    return hasRole(role, ROLES.ADMIN);
};

/**
 * Check if user is at least owner level
 */
export const isOwnerOrAbove = (role) => {
    return hasRole(role, ROLES.OWNER);
};

/**
 * Get role label for display
 */
export const getRoleLabel = (role) => {
    const labels = {
        [ROLES.SUPER_ADMIN]: 'Super Admin',
        [ROLES.ADMIN]: 'Admin',
        [ROLES.OWNER]: 'Owner',
        [ROLES.MANAGER]: 'Manager',
        [ROLES.STAFF]: 'Staff'
    };
    return labels[role] || role;
};

/**
 * Get all available roles (for dropdowns)
 */
export const getAvailableRoles = (excludeSuperAdmin = true) => {
    const roles = Object.entries(ROLES)
        .filter(([key]) => !excludeSuperAdmin || key !== 'SUPER_ADMIN')
        .map(([, value]) => ({
            value,
            label: getRoleLabel(value)
        }));
    return roles;
};
