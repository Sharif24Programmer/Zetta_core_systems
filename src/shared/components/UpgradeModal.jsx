import { useState } from 'react';

const PLANS = [
    {
        id: 'basic',
        name: 'Basic',
        price: 499,
        period: 'month',
        features: [
            'Unlimited POS',
            '100 Products',
            'Basic Reports',
            'Email Support'
        ],
        color: 'from-blue-500 to-blue-600'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 999,
        period: 'month',
        popular: true,
        features: [
            'Everything in Basic',
            'Unlimited Products',
            'Advanced Reports',
            'Inventory Module',
            'Multi-Staff Support',
            'Priority Support',
            'Data Export'
        ],
        color: 'from-orange-500 to-orange-600'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 2999,
        period: 'month',
        features: [
            'Everything in Pro',
            'Clinic Tools',
            'Medical Tools',
            'API Access',
            'White Label',
            'Dedicated Support',
            'Custom Integrations'
        ],
        color: 'from-purple-500 to-purple-600'
    }
];

/**
 * Upgrade Modal Component
 * Shows plan comparison and upgrade CTA when a feature is locked
 */
const UpgradeModal = ({ isOpen, onClose, feature, currentPlan = 'trial' }) => {
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setLoading(true);
        // TODO: Integrate with payment gateway
        setTimeout(() => {
            setLoading(false);
            onClose();
            // Show success message
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
            <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Upgrade Required</h2>
                        {feature && (
                            <p className="text-sm text-slate-500">
                                {feature} is available on higher plans
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Plans */}
                <div className="p-4 overflow-auto max-h-[60vh]">
                    <div className="space-y-3">
                        {PLANS.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedPlan === plan.id
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-800">{plan.name}</span>
                                        {plan.popular && (
                                            <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                                                Popular
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xl font-bold text-slate-800">₹{plan.price}</span>
                                        <span className="text-sm text-slate-500">/{plan.period}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {plan.features.slice(0, 3).map((feat, i) => (
                                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                            {feat}
                                        </span>
                                    ))}
                                    {plan.features.length > 3 && (
                                        <span className="text-xs text-slate-400">
                                            +{plan.features.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full btn-primary py-3 text-lg font-semibold"
                    >
                        {loading ? 'Processing...' : `Upgrade to ${PLANS.find(p => p.id === selectedPlan)?.name}`}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-2">
                        Cancel anytime. No questions asked.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
