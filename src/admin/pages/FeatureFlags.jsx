import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = {
    pos: { name: 'POS Module', description: 'Point of Sale system', default: true },
    inventory: { name: 'Inventory Module', description: 'Stock management', default: true },
    reports: { name: 'Reports Module', description: 'Sales & analytics reports', default: false },
    support: { name: 'Support Module', description: 'Customer support tickets', default: true },
    medical: { name: 'Medical Tools', description: 'Batch tracking, expiry alerts', default: false },
    clinic: { name: 'Clinic Tools', description: 'Patient & visit management', default: false },
    export: { name: 'Data Export', description: 'Export reports to CSV/PDF', default: false },
    multistaff: { name: 'Multi-Staff', description: 'Multiple staff accounts', default: false }
};

const PLANS = ['trial', 'basic', 'pro', 'enterprise'];

const FeatureFlags = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const [flags, setFlags] = useState(() => {
        // Initialize with defaults
        return Object.entries(FEATURES).reduce((acc, [key, val]) => {
            acc[key] = val.default;
            return acc;
        }, {});
    });

    const toggleFlag = (key) => {
        setFlags(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/app/admin')}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="page-title">Feature Flags</h1>
                </div>
            </div>

            <div className="page-content">
                {/* Plan Selector */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-3">Select Plan to Configure</h3>
                    <div className="flex gap-2 flex-wrap">
                        {PLANS.map(plan => (
                            <button
                                key={plan}
                                onClick={() => setSelectedPlan(plan)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${selectedPlan === plan
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {plan}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feature Toggles */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-4">
                        Features for <span className="capitalize text-primary-600">{selectedPlan}</span> Plan
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(FEATURES).map(([key, feature]) => (
                            <div
                                key={key}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                            >
                                <div>
                                    <p className="font-medium text-slate-800">{feature.name}</p>
                                    <p className="text-xs text-slate-500">{feature.description}</p>
                                </div>
                                <button
                                    onClick={() => toggleFlag(key)}
                                    className={`w-12 h-6 rounded-full transition-all ${flags[key] ? 'bg-primary-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${flags[key] ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <button className="w-full btn-primary py-3">
                    Save Feature Configuration
                </button>

                {/* Info */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Feature flags control which modules are available for each subscription plan.
                        Changes will affect all tenants on the selected plan.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeatureFlags;
