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
    // 1. Basic (Small Practice)
    basic: {
        id: 'basic',
        name: 'Basic Plan',
        price: 599,
        billingCycle: 'monthly',
        recommendedFor: 'Solo Practitioners & Small Clinics',
        limits: {
            staff: 2,
            products: 200,
            bills: 500
        },
        features: {
            pos: true,
            inventory: true, // Basic
            billing: true,
            support: true, // Email
            reports: false,
            analytics: false,
            staff: false,
            invoices: true,
            lab_module: false,
            pharma_db: false,
            patients: true
        }
    },
    // 2. Pro (Growing Business)
    pro: {
        id: 'pro', // Renamed from startup for clarity
        name: 'Pro Plan',
        price: 999,
        billingCycle: 'monthly',
        recommendedFor: 'Growing Clinics & busy Pharmacies',
        limits: {
            staff: 5,
            products: 2000,
            bills: 2000
        },
        features: {
            pos: true,
            inventory: true, // Advanced
            billing: true,
            support: true, // Priority
            reports: true,
            analytics: true,
            staff: true,
            invoices: true,
            lab_module: true,
            pharma_db: true, // Access to medicine database
            patients: true
        }
    },
    // 3. Enterprise (Unlimited)
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise Plan',
        price: 9999,
        billingCycle: 'monthly', // Changed to monthly for consistency in this view
        recommendedFor: 'Hospital Chains & Integrators',
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
            patients: true
        }
    }
};
