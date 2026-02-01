import React from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { PLANS } from '../../billing/services/subscriptionService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * SubscriptionGuard Component
 * Wraps content that requires a specific feature or falls within a usage limit.
 * 
 * Props:
 * - feature: string (e.g., 'sms', 'support')
 * - limitKey: string (e.g., 'staff', 'products') - Key in plan.limits
 * - currentCount: number (current usage count to check against limit)
 * - children: React Node
 * - fallback: React Node (optional, what to show if restricted)
 */
const SubscriptionGuard = ({ feature, limitKey, currentCount, children, fallback = null, showLockIcon = false }) => {
    const { tenant, hasFeature } = useAuth();
    const navigate = useNavigate();

    const planId = tenant?.plan || 'basic';
    const plan = Object.values(PLANS).find(p => p.id === planId) || PLANS.BASIC;

    let isAllowed = true;
    let reason = '';

    // Check Feature Access
    if (feature && !hasFeature(feature)) {
        isAllowed = false;
        reason = `Upgrade to ${PLANS.PRO.name} to unlock this feature.`;
    }

    // Check Limits
    if (isAllowed && limitKey && plan.limits[limitKey] !== -1) {
        if (currentCount >= plan.limits[limitKey]) {
            isAllowed = false;
            reason = `You've reached the limit of ${plan.limits[limitKey]} ${limitKey} on the ${plan.name}.`;
        }
    }

    const handleUpgrade = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toast(reason, {
            icon: '🔒',
        });
        navigate('/app/subscription/plans');
    };

    // If blocked
    if (!isAllowed) {
        if (fallback) return fallback;

        if (showLockIcon) {
            return (
                <div onClick={handleUpgrade} className="relative group cursor-pointer opacity-75 hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-slate-100/50 flex items-center justify-center rounded z-10">
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div className="pointer-events-none filter blur-[1px]">
                        {children}
                    </div>
                </div>
            );
        }

        // Default behavior: Render wrapper that triggers upgrade toast on click
        // Or simply strict null if we want to hide it completely
        return (
            <div onClick={handleUpgrade} className="cursor-not-allowed opacity-50 grayscale" title={reason}>
                {children}
            </div>
        );
    }

    return <>{children}</>;
};

export const checkLimit = (tenant, limitKey, currentCount) => {
    const planId = tenant?.plan || 'basic';
    const plan = Object.values(PLANS).find(p => p.id === planId) || PLANS.BASIC;

    if (plan.limits[limitKey] === -1) return { allowed: true };

    if (currentCount >= plan.limits[limitKey]) {
        return {
            allowed: false,
            message: `Limit reached (${plan.limits[limitKey]}). Upgrade plan to add more.`
        };
    }

    return { allowed: true };
};

export default SubscriptionGuard;
