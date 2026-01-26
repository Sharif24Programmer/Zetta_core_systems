import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTenantById, updateTenantPlan, suspendTenant, activateTenant, getUsersByTenant } from '../services/adminService';
import Loader from '../../shared/components/Loader';

const PLANS = ['trial', 'basic', 'pro', 'enterprise'];

const TenantDetail = () => {
    const { tenantId } = useParams();
    const navigate = useNavigate();

    const [tenant, setTenant] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const tenantData = await getTenantById(tenantId);
                const usersData = await getUsersByTenant(tenantId);
                setTenant(tenantData);
                setUsers(usersData);
                setSelectedPlan(tenantData?.planId || 'trial');
            } catch (err) {
                console.error('Error fetching tenant:', err);
            }
            setLoading(false);
        };

        fetch();
    }, [tenantId]);

    const handlePlanChange = async () => {
        if (selectedPlan === tenant.planId) return;

        setActionLoading(true);
        try {
            await updateTenantPlan(tenantId, selectedPlan);
            setTenant(prev => ({ ...prev, planId: selectedPlan }));
        } catch (err) {
            console.error('Error updating plan:', err);
        }
        setActionLoading(false);
    };

    const handleToggleStatus = async () => {
        setActionLoading(true);
        try {
            if (tenant.isActive) {
                await suspendTenant(tenantId);
            } else {
                await activateTenant(tenantId);
            }
            setTenant(prev => ({ ...prev, isActive: !prev.isActive }));
        } catch (err) {
            console.error('Error toggling status:', err);
        }
        setActionLoading(false);
    };

    if (loading) {
        return (
            <div className="page-container flex items-center justify-center">
                <Loader text="Loading tenant..." />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="page-container flex items-center justify-center">
                <p className="text-slate-500">Tenant not found</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/app/admin/tenants')}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="page-title">{tenant.name}</h1>
                        <p className="text-sm text-slate-500 capitalize">{tenant.type}</p>
                    </div>
                </div>
            </div>

            <div className="page-content">
                {/* Status */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Status</p>
                            <p className={`font-semibold ${tenant.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {tenant.isActive ? 'Active' : 'Suspended'}
                            </p>
                        </div>
                        <button
                            onClick={handleToggleStatus}
                            disabled={actionLoading}
                            className={`px-4 py-2 rounded-xl font-medium ${tenant.isActive
                                    ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                                }`}
                        >
                            {actionLoading ? '...' : tenant.isActive ? 'Suspend' : 'Activate'}
                        </button>
                    </div>
                </div>

                {/* Plan */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-3">Subscription Plan</h3>
                    <div className="flex gap-2 flex-wrap mb-4">
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
                    {selectedPlan !== tenant.planId && (
                        <button
                            onClick={handlePlanChange}
                            disabled={actionLoading}
                            className="btn-primary w-full"
                        >
                            {actionLoading ? 'Updating...' : `Change to ${selectedPlan}`}
                        </button>
                    )}
                </div>

                {/* Info */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-3">Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Created</span>
                            <span className="font-medium text-slate-800">
                                {tenant.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Type</span>
                            <span className="font-medium text-slate-800 capitalize">{tenant.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Owner</span>
                            <span className="font-medium text-slate-800">{tenant.ownerId || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Users */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-3">Users ({users.length})</h3>
                    {users.length === 0 ? (
                        <p className="text-slate-500 text-sm">No users found</p>
                    ) : (
                        <div className="space-y-2">
                            {users.map(user => (
                                <div key={user.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                        <span className="text-primary-600 font-semibold text-sm">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate">{user.name || user.email}</p>
                                        <p className="text-xs text-slate-500 capitalize">{user.role || 'user'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TenantDetail;
