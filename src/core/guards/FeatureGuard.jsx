import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FEATURES, getFeatureLabel } from '../featureFlags/featureFlagService';

/**
 * FeatureGuard - Ensures feature is enabled in subscription plan
 * Shows upgrade prompt if feature not available
 */
const FeatureGuard = ({ children, feature }) => {
    const { hasFeature, plan, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return null; // Let parent guard handle loading
    }

    // No feature specified, allow access
    if (!feature) {
        return children;
    }

    // Check if feature is enabled
    if (!hasFeature(feature)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-2">Feature Locked</h2>
                    <p className="text-slate-500 mb-4">
                        <strong>{getFeatureLabel(feature)}</strong> is not available in your current plan.
                    </p>

                    {/* Current Plan */}
                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-slate-400">Current Plan</p>
                        <p className="font-semibold text-slate-700">{plan?.name || 'Free'}</p>
                    </div>

                    {/* What's included */}
                    <div className="text-left mb-6">
                        <p className="text-sm font-medium text-slate-700 mb-2">Your plan includes:</p>
                        <ul className="space-y-1">
                            {Object.entries(plan?.features || {}).map(([key, enabled]) => (
                                <li key={key} className="flex items-center gap-2 text-sm">
                                    {enabled ? (
                                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                    <span className={enabled ? 'text-slate-700' : 'text-slate-400'}>
                                        {getFeatureLabel(key)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Upgrade Button */}
                    <button
                        onClick={() => navigate('/app/upgrade')}
                        className="w-full btn-primary py-3 mb-3"
                    >
                        Upgrade to Unlock
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-500 hover:text-slate-700 text-sm"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default FeatureGuard;
