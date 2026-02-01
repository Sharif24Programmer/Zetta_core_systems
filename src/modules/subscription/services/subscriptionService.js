import { db } from '../../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const PLANS = {
    BASIC: {
        id: 'basic',
        name: 'Basic',
        price: 599,
        limits: {
            staff: 2,
            products: 100,
            invoices: 500
        },
        features: ['pos', 'inventory', 'reports']
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        price: 999,
        limits: {
            staff: 5,
            products: 1000,
            invoices: -1 // Unlimited
        },
        features: ['pos', 'inventory', 'reports', 'support', 'sms']
    },
    ENTERPRISE: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 9999,
        limits: {
            staff: -1,
            products: -1,
            invoices: -1
        },
        features: ['pos', 'inventory', 'reports', 'support', 'sms', 'api_access', 'dedicated_support']
    }
};

export const getSubscriptionStatus = (tenant) => {
    if (!tenant?.subscription) return { status: 'free', plan: PLANS.BASIC, daysLeft: 0 };

    // Logic to check expiry -> mocked for now
    return {
        status: 'active',
        plan: PLANS[tenant.subscription.planId?.toUpperCase()] || PLANS.BASIC,
        daysLeft: 30 // Mock
    };
};

export const checkSubscriptionStatus = (tenant) => {
    return getSubscriptionStatus(tenant);
};
