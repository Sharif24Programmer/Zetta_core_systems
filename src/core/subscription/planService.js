import { db } from '../../services/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs
} from 'firebase/firestore';

/**
 * Plan structure:
 * {
 *   id: 'basic',
 *   name: 'Basic Plan',
 *   price: 999,
 *   billingCycle: 'monthly',
 *   limits: {
 *     staff: 5,
 *     products: 100,
 *     bills: 500
 *   },
 *   features: {
 *     pos: true,
 *     inventory: true,
 *     billing: true,
 *     support: true,
 *     reports: false,
 *     analytics: false
 *   }
 * }
 */

/**
 * Get all available plans
 */
export const getAllPlans = async () => {
    const querySnapshot = await getDocs(collection(db, 'plans'));
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

/**
 * Get plan by ID
 */
export const getPlan = async (planId) => {
    if (!planId) return null;

    const docRef = doc(db, 'plans', planId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

/**
 * Check if feature is enabled in plan
 */
export const isFeatureInPlan = async (planId, feature) => {
    const plan = await getPlan(planId);
    return plan?.features?.[feature] === true;
};

/**
 * Get plan limits
 */
export const getPlanLimits = async (planId) => {
    const plan = await getPlan(planId);
    return plan?.limits || {};
};

/**
 * Default plans for demo mode
 */
/**
 * Default plans for demo mode
 */
export const DEFAULT_PLANS = {
    // 1. Single User (Solopreneur)
    free: {
        id: 'free',
        name: 'Single User',
        price: 0,
        billingCycle: 'monthly',
        recommendedFor: 'Solo Pharmacists & Small Shops',
        limits: {
            staff: 1, // Solopreneur
            products: 50,
            bills: 100
        },
        features: {
            pos: true,
            inventory: true, // Basic
            billing: true,
            support: true, // Community
            reports: false,
            analytics: false,
            staff: false,
            invoices: false,
            lab_module: false, // No lab for free
            pharma_db: false
        }
    },
    // 2. Start-up (Small Team)
    startup: {
        id: 'startup',
        name: 'Start-up',
        price: 999,
        billingCycle: 'monthly',
        recommendedFor: 'Growing Clinics & Marts',
        limits: {
            staff: 3,
            products: 500,
            bills: 1000
        },
        features: {
            pos: true,
            inventory: true,
            billing: true,
            support: true, // Email
            reports: true, // Basic Reports
            analytics: false,
            staff: true,
            invoices: true,
            lab_module: false,
            pharma_db: true // Access to medicine database
        }
    },
    // 3. Growth (Professional)
    growth: {
        id: 'growth',
        name: 'Growth',
        price: 2499,
        billingCycle: 'monthly',
        recommendedFor: 'Busy Medical Centers & Supermarkets',
        limits: {
            staff: 10,
            products: 5000,
            bills: 10000
        },
        features: {
            pos: true,
            inventory: true, // Advanced
            billing: true,
            support: true, // Priority
            reports: true, // Advanced
            analytics: true,
            staff: true, // Payroll
            invoices: true,
            lab_module: true, // Unlocks for Clinics
            pharma_db: true,
            patients: true // Medical patient management
        }
    },
    // 4. Enterprise (Unlimited)
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 9999,
        billingCycle: 'yearly',
        recommendedFor: 'Hospital Chains & Retail Franchises',
        limits: {
            staff: 999,
            products: 999999,
            bills: 999999
        },
        features: {
            pos: true,
            inventory: true,
            billing: true,
            support: true, // Dedicated Agent
            reports: true,
            analytics: true,
            staff: true,
            invoices: true,
            lab_module: true,
            pharma_db: true,
            api_access: true,
            patients: true // Medical patient management
        }
    }
};
