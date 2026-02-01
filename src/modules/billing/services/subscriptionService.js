import { db } from '../../../services/firebase'; // Adjust path if needed
import { doc, updateDoc, getDoc, setDoc, collection } from 'firebase/firestore';
import { isDemoMode, getDemoData, saveDemoData, DEMO_TENANT } from '../../../core/demo/demoManager';

// Plan Definitions
export const PLANS = {
    BASIC: {
        id: 'basic',
        name: 'Basic Plan',
        price: 599,
        duration: 'monthly',
        interval: 'month',
        description: 'Perfect for small shops getting started',
        features: ['pos', 'inventory', 'billing'],
        displayFeatures: [
            '1 User',
            'Up to 100 Products',
            'Basic POS',
            'Daily Sales Report'
        ],
        limits: {
            staff: 2,
            products: 100
        },
        color: 'slate',
        popular: false
    },
    PRO: {
        id: 'pro',
        name: 'Pro Plan',
        price: 999,
        duration: 'monthly',
        interval: 'month',
        description: 'For growing businesses needing more control',
        features: ['pos', 'inventory', 'billing', 'reports', 'support', 'sms'],
        displayFeatures: [
            '5 Users',
            'Unlimited Products',
            'Advanced POS & Inventory',
            'Support Ticket System',
            'Analytics Dashboard',
            'SMS Notifications'
        ],
        limits: {
            staff: 5,
            products: 1000
        },
        color: 'primary',
        popular: true
    },
    ENTERPRISE: {
        id: 'enterprise',
        name: 'Enterprise Plan',
        price: 9999,
        duration: 'monthly',
        interval: 'month',
        description: 'Full suite for large clinics and chains',
        features: ['all'],
        displayFeatures: [
            'Unlimited Users',
            'All Pro Features',
            'Multi-location Support',
            'Priority Phone Support',
            'Custom Reports',
            'API Access'
        ],
        limits: {
            staff: 999,
            products: 999999
        },
        color: 'indigo',
        popular: false
    }
};

/**
 * Upgrade Tenant Plan
 */
export const upgradePlan = async (tenantId, planId, paymentDetails = {}) => {
    const newPlan = Object.values(PLANS).find(p => p.id === planId);
    if (!newPlan) throw new Error('Invalid Plan ID');

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month validity

    const subscriptionData = {
        plan: planId,
        planName: newPlan.name,
        status: 'active',
        startDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        paymentId: paymentDetails.razorpay_payment_id || null,
        orderId: paymentDetails.razorpay_order_id || null,
        updatedAt: new Date().toISOString()
    };

    if (isDemoMode()) {
        // Update demo tenant
        const tenant = JSON.parse(localStorage.getItem('zetta_demo_tenant'));
        tenant.plan = planId;
        tenant.subscription = subscriptionData;
        localStorage.setItem('zetta_demo_tenant', JSON.stringify(tenant));

        // Save to invoice history (demo)
        const invoices = getDemoData('invoices_subscription');
        invoices.push({
            id: `inv_sub_${Date.now()}`,
            amount: newPlan.price,
            plan: newPlan.name,
            date: new Date().toISOString(),
            status: 'paid'
        });
        saveDemoData('invoices_subscription', invoices);

        return true;
    }

    try {
        // Update Tenant Document
        const tenantRef = doc(db, 'tenants', tenantId);
        await updateDoc(tenantRef, {
            plan: planId, // Helper for quick access
            subscription: subscriptionData
        });

        // Record Transaction
        const transactionRef = doc(collection(db, 'transactions'));
        await setDoc(transactionRef, {
            tenantId,
            type: 'subscription',
            amount: newPlan.price,
            planId,
            status: 'success',
            paymentDetails,
            createdAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Error upgrading plan:', error);
        throw error;
    }
};

/**
 * Get Subscription Status
 */
export const getSubscriptionStatus = async (tenantId) => {
    if (isDemoMode()) {
        const tenant = JSON.parse(localStorage.getItem('zetta_demo_tenant'));
        return tenant.subscription || { status: 'free', plan: 'free' };
    }

    try {
        const tenantRef = doc(db, 'tenants', tenantId);
        const snap = await getDoc(tenantRef);
        if (snap.exists()) {
            return snap.data().subscription || { status: 'free', plan: 'free' };
        }
        return null;
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
    }
};

/**
 * Check if feature is allowed for current plan
 */
export const isFeatureAllowed = (feature, currentPlanId) => {
    if (currentPlanId === 'enterprise') return true;

    // Define plan permissions if not in constant
    // This can be expanded based on complex rules
    const plan = Object.values(PLANS).find(p => p.id === currentPlanId);
    if (!plan) return false; // Unknown plan, maybe restrict

    if (plan.features.includes('all')) return true;
    return plan.features.includes(feature);
};
