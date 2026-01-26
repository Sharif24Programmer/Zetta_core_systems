import { isFeatureEnabled as checkFeature } from '../subscription/subscriptionService';
import { DEFAULT_PLANS } from '../subscription/planService';

/**
 * Feature flags are derived from the subscription plan
 * This service provides a simple interface to check features
 */

// Module feature keys
export const FEATURES = {
    POS: 'pos',
    INVENTORY: 'inventory',
    BILLING: 'billing',
    SUPPORT: 'support',
    REPORTS: 'reports',
    ANALYTICS: 'analytics'
};

// For demo mode - store in memory
let demoFeatures = null;

// (Removed duplicate isFeatureEnabled function)

/**
 * Get all enabled features for a tenant
 */
/**
 * Get all enabled features for a tenant
 */
export const getEnabledFeatures = async (tenantId, planId = null, tenantType = 'medical') => {
    // Demo mode
    if (demoFeatures) {
        return Object.keys(demoFeatures).filter(f => demoFeatures[f]);
    }

    let enabled = [];

    // 1. Get Plan Features first (The "Paid For" set)
    if (planId && DEFAULT_PLANS[planId]) {
        const planFeatures = DEFAULT_PLANS[planId].features;
        enabled = Object.keys(planFeatures).filter(f => planFeatures[f]);
    } else {
        // Fallback or legacy handling
        const allFeatures = Object.values(FEATURES);
        for (const feature of allFeatures) {
            if (await checkFeature(tenantId, feature)) enabled.push(feature);
        }
    }

    // 2. Filter by Business Type (The "Type" set)
    // Even if Plan allows 'Lab', a 'Shop' shouldn't see it.
    if (tenantType === 'shop') {
        enabled = enabled.filter(f => !['prescriptions', 'patients', 'appointments', 'lab_module'].includes(f));
    } else if (tenantType === 'clinic') {
        // Clinics don't usually need heavy inventory features if not a pharmacy
        // but let's keep it flexible. 
    }

    return enabled;
};

/**
 * Check if a specific feature is enabled (Plan && Type)
 */
export const isFeatureEnabled = async (tenantId, feature, tenantType = 'medical', planId = 'free') => {
    // 1. Check Plan
    if (DEFAULT_PLANS[planId]) {
        if (!DEFAULT_PLANS[planId].features[feature]) return false;
    }

    // 2. Check Type
    if (tenantType === 'shop') {
        if (['prescriptions', 'patients', 'appointments', 'lab_module'].includes(feature)) return false;
    }

    return true;
};

/**
 * Set demo features (for testing without Firebase)
 */
export const setDemoFeatures = (features) => {
    demoFeatures = features;
};

/**
 * Clear demo features
 */
export const clearDemoFeatures = () => {
    demoFeatures = null;
};

/**
 * Get feature label for display
 */
export const getFeatureLabel = (feature) => {
    const labels = {
        [FEATURES.POS]: 'Point of Sale',
        [FEATURES.INVENTORY]: 'Inventory Management',
        [FEATURES.BILLING]: 'Billing & Invoices',
        [FEATURES.SUPPORT]: 'Support System',
        [FEATURES.REPORTS]: 'Reports',
        [FEATURES.ANALYTICS]: 'Analytics Dashboard'
    };
    return labels[feature] || feature;
};
