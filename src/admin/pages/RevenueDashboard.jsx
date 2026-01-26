import { useNavigate } from 'react-router-dom';
import { useRevenueStats, useTenantStats } from '../hooks/useAdmin';
import { formatCurrency } from '../services/adminService';
import Loader from '../../shared/components/Loader';

const RevenueDashboard = () => {
    const navigate = useNavigate();
    const { stats: revenueStats, loading: loadingRevenue } = useRevenueStats();
    const { stats: tenantStats, loading: loadingTenants } = useTenantStats();

    const loading = loadingRevenue || loadingTenants;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header bg-gradient-to-r from-green-600 to-green-700">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/app/admin')}
                        className="p-2 hover:bg-green-500/30 rounded-lg"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="page-title text-white">Revenue</h1>
                </div>
            </div>

            <div className="page-content">
                {loading ? (
                    <Loader text="Loading revenue data..." />
                ) : (
                    <>
                        {/* Main Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <p className="text-green-100 text-sm">Monthly Revenue (MRR)</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(revenueStats?.mrr || 0)}</p>
                            </div>
                            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <p className="text-blue-100 text-sm">Annual Revenue (ARR)</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(revenueStats?.arr || 0)}</p>
                            </div>
                        </div>

                        {/* Subscriber Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="card text-center">
                                <p className="text-3xl font-bold text-green-600">{revenueStats?.paidTenants || 0}</p>
                                <p className="text-sm text-slate-500">Paid Subscribers</p>
                            </div>
                            <div className="card text-center">
                                <p className="text-3xl font-bold text-slate-600">{revenueStats?.trialTenants || 0}</p>
                                <p className="text-sm text-slate-500">Trial Users</p>
                            </div>
                        </div>

                        {/* Plan Breakdown */}
                        {tenantStats?.byPlan && (
                            <div className="card">
                                <h3 className="font-semibold text-slate-800 mb-4">Subscribers by Plan</h3>
                                <div className="space-y-3">
                                    {Object.entries(tenantStats.byPlan).map(([plan, count]) => {
                                        const prices = { trial: 0, basic: 499, pro: 999, enterprise: 2999 };
                                        const revenue = count * (prices[plan] || 0);
                                        const total = Object.values(tenantStats.byPlan).reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? (count / total) * 100 : 0;

                                        return (
                                            <div key={plan}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="capitalize font-medium text-slate-700">{plan}</span>
                                                    <span className="text-sm text-slate-500">
                                                        {count} users • {formatCurrency(revenue)}/mo
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div
                                                        className={`h-full rounded-full ${plan === 'pro' ? 'bg-orange-500' :
                                                                plan === 'basic' ? 'bg-blue-500' :
                                                                    plan === 'enterprise' ? 'bg-purple-500' :
                                                                        'bg-slate-400'
                                                            }`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Growth Card */}
                        <div className="card">
                            <h3 className="font-semibold text-slate-800 mb-3">Growth</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-green-50 rounded-xl">
                                    <p className="text-2xl font-bold text-green-600">+{tenantStats?.newThisMonth || 0}</p>
                                    <p className="text-xs text-green-700">New This Month</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                    <p className="text-2xl font-bold text-slate-600">{revenueStats?.churnEstimate || 0}%</p>
                                    <p className="text-xs text-slate-700">Churn Rate</p>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Projection */}
                        <div className="card bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                            <h3 className="font-semibold mb-3">Projected Revenue</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <p className="text-xs text-slate-400">3 Months</p>
                                    <p className="font-bold">{formatCurrency((revenueStats?.mrr || 0) * 3)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">6 Months</p>
                                    <p className="font-bold">{formatCurrency((revenueStats?.mrr || 0) * 6)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">12 Months</p>
                                    <p className="font-bold">{formatCurrency((revenueStats?.mrr || 0) * 12)}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RevenueDashboard;
