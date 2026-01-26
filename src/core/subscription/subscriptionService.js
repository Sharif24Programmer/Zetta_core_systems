import { db } from '../../services/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { getPlan, DEFAULT_PLANS } from './planService';

/**
 * Subscription structure:
 * {
 *   tenantId: 'tenant_123',
 *   planId: 'basic',
 *   status: 'active', // active, expired, cancelled, trial
 *   startDate: Timestamp,
 *   endDate: Timestamp,
 *   trialEndsAt: Timestamp | null,
 *   usage: {
 *     staff: 3,
 *     products: 45,
 *     bills: 120
 *   }
 * }
 */

/**
 * Get subscription for a tenant
 */
export const getSubscription = async (tenantId) => {
    if (!tenantId) return null;

    const docRef = doc(db, 'subscriptions', tenantId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

/**
 * Check if subscription is active
 */
export const isSubscriptionActive = async (tenantId) => {
    const subscription = await getSubscription(tenantId);

    if (!subscription) return false;

    // Check status
    if (subscription.status !== 'active' && subscription.status !== 'trial') {
        return false;
    }

    // Check end date
    const endDate = subscription.endDate?.toDate?.() || new Date(subscription.endDate);
    if (endDate < new Date()) {
        return false;
    }

    return true;
};

/**
 * Check if a feature is enabled for tenant's subscription
 */
export const isFeatureEnabled = async (tenantId, feature) => {
    const subscription = await getSubscription(tenantId);

    if (!subscription || !subscription.planId) {
        // Default to free plan
        return DEFAULT_PLANS.free.features[feature] === true;
    }

    const plan = await getPlan(subscription.planId);

    if (!plan) {
        // Fallback to default plans
        const defaultPlan = DEFAULT_PLANS[subscription.planId];
        return defaultPlan?.features?.[feature] === true;
    }

    return plan.features?.[feature] === true;
};

/**
 * Check if usage limit is exceeded
 */
export const isLimitExceeded = async (tenantId, limitType, currentCount) => {
    const subscription = await getSubscription(tenantId);

    if (!subscription || !subscription.planId) {
        // Default to free plan limits
        const limit = DEFAULT_PLANS.free.limits[limitType];
        return currentCount >= limit;
    }

    const plan = await getPlan(subscription.planId);

    if (!plan) {
        const defaultPlan = DEFAULT_PLANS[subscription.planId];
        const limit = defaultPlan?.limits?.[limitType] || 0;
        return currentCount >= limit;
    }

    const limit = plan.limits?.[limitType] || 0;
    return currentCount >= limit;
};

/**
 * Create a new subscription
 */
export const createSubscription = async (tenantId, planId, durationMonths = 1) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const subscription = {
        tenantId,
        planId,
        status: 'active',
        startDate: serverTimestamp(),
        endDate,
        trialEndsAt: null,
        usage: {
            staff: 0,
            products: 0,
            bills: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'subscriptions', tenantId), subscription);
    return subscription;
};

/**
 * Update subscription plan
 */
export const upgradePlan = async (tenantId, newPlanId) => {
    const docRef = doc(db, 'subscriptions', tenantId);
    await updateDoc(docRef, {
        planId: newPlanId,
        updatedAt: serverTimestamp()
    });
};

/**
 * Increment usage counter
 */
export const incrementUsage = async (tenantId, usageType) => {
    const subscription = await getSubscription(tenantId);
    if (!subscription) return;

    const currentUsage = subscription.usage || {};
    const newCount = (currentUsage[usageType] || 0) + 1;

    const docRef = doc(db, 'subscriptions', tenantId);
    await updateDoc(docRef, {
        [`usage.${usageType}`]: newCount,
        updatedAt: serverTimestamp()
    });
};

/**
 * Get remaining quota
 */
export const getRemainingQuota = async (tenantId, limitType) => {
    const subscription = await getSubscription(tenantId);

    if (!subscription) {
        return { used: 0, limit: DEFAULT_PLANS.free.limits[limitType] || 0 };
    }

    const used = subscription.usage?.[limitType] || 0;
    const plan = await getPlan(subscription.planId) || DEFAULT_PLANS[subscription.planId];
    const limit = plan?.limits?.[limitType] || 0;

    return { used, limit, remaining: Math.max(0, limit - used) };
};
