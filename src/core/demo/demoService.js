/**
 * Demo Service
 * Handles setting up the environment for offline/demo usage
 */

import { setDemoFeatures } from '../featureFlags/featureFlagService';

export const DEMO_TENANT_RETAIL = {
    id: 'demo_retail',
    name: 'Zetta Supermarket (Demo)',
    type: 'shop',
    planId: 'enterprise', // Show all features
    theme: 'blue',
    ownerId: 'demo_user',
    isActive: true,
    currency: 'USD',
    createdAt: new Date().toISOString()
};

export const DEMO_TENANT_CLINIC = {
    id: 'demo_clinic',
    name: 'City Care Clinic (Demo)',
    type: 'clinic',
    planId: 'enterprise', // Show all features
    theme: 'purple',
    ownerId: 'demo_user',
    isActive: true,
    currency: 'USD',
    createdAt: new Date().toISOString()
};

export const DEMO_TENANT_PHARMACY = {
    id: 'demo_pharmacy',
    name: 'MediCare Pharmacy (Demo)',
    type: 'pharmacy',
    planId: 'growth',
    theme: 'green',
    ownerId: 'demo_user',
    isActive: true,
    currency: 'INR',
    createdAt: new Date().toISOString()
};

export const DEMO_USER = {
    uid: 'demo_user',
    email: 'demo@zetta.com',
    displayName: 'Demo Admin',
    photoURL: null,
    role: 'owner',
    tenantId: 'demo_retail' // Default
};

/**
 * Activate Demo Mode
 */
export const startDemoMode = (type = 'shop') => {
    // 1. Set User
    localStorage.setItem('zetta_user', JSON.stringify(DEMO_USER));

    // 2. Set Tenant based on type
    let tenant;
    if (type === 'clinic') {
        tenant = DEMO_TENANT_CLINIC;
    } else if (type === 'pharmacy') {
        tenant = DEMO_TENANT_PHARMACY;
    } else {
        tenant = DEMO_TENANT_RETAIL;
    }

    localStorage.setItem('zetta_current_tenant', JSON.stringify(tenant));
    localStorage.setItem('zetta_tenant_id', tenant.id);

    // 3. Set Flag
    localStorage.setItem('zetta_is_demo', 'true');

    // 4. Force reload to pick up changes in AuthContext
    window.location.href = '/app';
};

/**
 * Exit Demo Mode
 */
export const exitDemoMode = () => {
    localStorage.removeItem('zetta_user');
    localStorage.removeItem('zetta_current_tenant');
    localStorage.removeItem('zetta_tenant_id');
    localStorage.removeItem('zetta_is_demo');
    window.location.href = '/login';
};

/**
 * Check if in Demo Mode
 */
export const isDemoMode = () => {
    return localStorage.getItem('zetta_is_demo') === 'true';
};
