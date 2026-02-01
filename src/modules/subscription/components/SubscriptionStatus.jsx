import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { getSubscriptionStatus, PLANS } from '../services/subscriptionService'; // Adjust import path
import { useNavigate } from 'react-router-dom';

const SubscriptionStatus = () => {
    const { tenantId, tenant } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use tenant data from AuthContext first for speed
        if (tenant?.subscription) {
            setStatus(tenant.subscription);
            setLoading(false);
        } else {
            // Fallback fetch
            getSubscriptionStatus(tenantId).then(data => {
                setStatus(data);
                setLoading(false);
            });
        }
    }, [tenantId, tenant]);

    if (loading) return <div className="animate-pulse h-24 bg-slate-100 rounded-lg"></div>;

    const currentPlan = Object.values(PLANS).find(p => p.id === (status?.plan || 'basic')) || PLANS.BASIC;
    const daysLeft = status?.expiryDate
        ? Math.ceil((new Date(status.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Current Plan</p>
                    <h3 className={`text-2xl font-bold text-${currentPlan.color || 'slate'}-600`}>
                        {currentPlan.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                            ${daysLeft > 7 ? 'bg-green-100 text-green-700' : daysLeft > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                        `}>
                            {daysLeft > 0 ? 'Active' : 'Expired'}
                        </span>
                        {daysLeft > 0 && (
                            <span className="text-sm text-slate-500">
                                Expires in {daysLeft} days
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => navigate('/app/subscription/plans')}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors"
                >
                    Upgrade Plan
                </button>
            </div>

            {/* Usage Bars - Mock for now */}
            <div className="mt-6 space-y-3">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">Product Limit</span>
                        <span className="text-slate-400">
                            {currentPlan.limits.products === -1 ? 'Unlimited' : `${currentPlan.limits.products} max`}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-300 w-1/4 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionStatus;
