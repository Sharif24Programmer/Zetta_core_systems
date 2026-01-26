import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * SubscriptionGuard - Ensures subscription is active
 * Shows upgrade screen if expired
 */
const SubscriptionGuard = ({ children }) => {
    const { subscription, plan, isSubscribed, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return null; // Let parent guard handle loading
    }

    // Check if subscription is active
    if (!isSubscribed()) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Subscription Expired</h2>
                    <p className="text-slate-500 mb-6">
                        Your subscription has expired. Upgrade now to continue using Zetta.
                    </p>

                    {/* Current Plan Info */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-slate-500">Current Plan</p>
                        <p className="text-lg font-semibold text-slate-800">{plan?.name || 'Free'}</p>
                    </div>

                    {/* Upgrade Button */}
                    <button
                        onClick={() => navigate('/app/upgrade')}
                        className="w-full btn-primary py-3 mb-3"
                    >
                        Upgrade Now
                    </button>

                    <button
                        onClick={() => navigate('/app')}
                        className="text-slate-500 hover:text-slate-700 text-sm"
                    >
                        Continue with limitations
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default SubscriptionGuard;
