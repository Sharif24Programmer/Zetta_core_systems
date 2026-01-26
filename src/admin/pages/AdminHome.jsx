import { useNavigate } from 'react-router-dom';
import { useTenantStats, useRevenueStats } from '../hooks/useAdmin';
import { formatCurrency } from '../services/adminService';
import Loader from '../../shared/components/Loader';

const AdminHome = () => {
    const navigate = useNavigate();
    const { stats: tenantStats, loading: loadingTenants } = useTenantStats();
    const { stats: revenueStats, loading: loadingRevenue } = useRevenueStats();

    const loading = loadingTenants || loadingRevenue;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header bg-gradient-to-r from-slate-800 to-slate-900">
                <h1 className="page-title text-white">Admin Dashboard</h1>
                <p className="text-slate-300 text-sm mt-1">Super Admin Control Center</p>
            </div>

            <div className="page-content">
                {loading ? (
                    <Loader text="Loading stats..." />
                ) : (
                    <>
                        {/* Revenue Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <p className="text-green-100 text-sm">Monthly Revenue</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(revenueStats?.mrr || 0)}</p>
                            </div>
                            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <p className="text-blue-100 text-sm">Annual Revenue</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(revenueStats?.arr || 0)}</p>
                            </div>
                        </div>

                        {/* Tenant Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="card text-center">
                                <p className="text-3xl font-bold text-slate-800">{tenantStats?.total || 0}</p>
                                <p className="text-xs text-slate-500">Total Tenants</p>
                            </div>
                            <div className="card text-center">
                                <p className="text-3xl font-bold text-green-600">{tenantStats?.active || 0}</p>
                                <p className="text-xs text-slate-500">Active</p>
                            </div>
                            <div className="card text-center">
                                <p className="text-3xl font-bold text-primary-600">{tenantStats?.newThisMonth || 0}</p>
                                <p className="text-xs text-slate-500">New This Month</p>
                            </div>
                        </div>

                        {/* By Type */}
                        {tenantStats?.byType && (
                            <div className="card">
                                <h3 className="font-semibold text-slate-800 mb-3">By Type</h3>
                                <div className="space-y-2">
                                    {Object.entries(tenantStats.byType).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center">
                                            <span className="capitalize text-slate-600">{type}</span>
                                            <span className="font-semibold text-slate-800">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* By Plan */}
                        {tenantStats?.byPlan && (
                            <div className="card">
                                <h3 className="font-semibold text-slate-800 mb-3">By Plan</h3>
                                <div className="space-y-2">
                                    {Object.entries(tenantStats.byPlan).map(([plan, count]) => (
                                        <div key={plan} className="flex justify-between items-center">
                                            <span className="capitalize text-slate-600">{plan}</span>
                                            <span className="font-semibold text-slate-800">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="space-y-2">
                            <button
                                onClick={() => navigate('/app/admin/tenants')}
                                className="w-full card flex items-center justify-between hover:border-primary-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <span className="text-xl">🏢</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-800">Manage Tenants</p>
                                        <p className="text-xs text-slate-500">View and manage all businesses</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button
                                onClick={() => navigate('/app/admin/users')}
                                className="w-full card flex items-center justify-between hover:border-primary-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <span className="text-xl">👥</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-800">Manage Users</p>
                                        <p className="text-xs text-slate-500">View all platform users</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button
                                onClick={() => navigate('/app/admin/revenue')}
                                className="w-full card flex items-center justify-between hover:border-primary-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                        <span className="text-xl">💰</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-800">Revenue Dashboard</p>
                                        <p className="text-xs text-slate-500">Track MRR, ARR, and subscriptions</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button
                                onClick={() => navigate('/app/admin/support')}
                                className="w-full card flex items-center justify-between hover:border-primary-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <span className="text-xl">🎧</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-800">Support Tickets</p>
                                        <p className="text-xs text-slate-500">Manage customer support</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminHome;
