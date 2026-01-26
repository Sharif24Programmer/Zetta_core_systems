import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenants } from '../hooks/useAdmin';
import { suspendTenant, activateTenant } from '../services/adminService';
import Loader from '../../shared/components/Loader';

const TenantList = () => {
    const navigate = useNavigate();
    const { tenants, loading, refresh } = useTenants();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);

    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleToggleStatus = async (tenant) => {
        setActionLoading(tenant.id);
        try {
            if (tenant.isActive) {
                await suspendTenant(tenant.id);
            } else {
                await activateTenant(tenant.id);
            }
            refresh();
        } catch (err) {
            console.error('Error updating tenant:', err);
        }
        setActionLoading(null);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'shop': return 'bg-blue-100 text-blue-700';
            case 'clinic': return 'bg-purple-100 text-purple-700';
            case 'medical': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPlanColor = (plan) => {
        switch (plan) {
            case 'pro': return 'bg-orange-100 text-orange-700';
            case 'basic': return 'bg-blue-100 text-blue-700';
            case 'trial': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100 text-slate-600';
        }
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
                    <h1 className="page-title">Tenants</h1>
                </div>
                <p className="text-sm text-slate-500 ml-11">{filteredTenants.length} businesses</p>
            </div>

            <div className="page-content">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tenants..."
                        className="input-field pl-10"
                    />
                    <svg
                        className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'shop', 'clinic', 'medical'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filterType === type
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Tenant List */}
                {loading ? (
                    <Loader text="Loading tenants..." />
                ) : filteredTenants.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No tenants found
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredTenants.map(tenant => (
                            <div
                                key={tenant.id}
                                className="card"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-800 truncate">
                                                {tenant.name}
                                            </h3>
                                            {!tenant.isActive && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                                                    Suspended
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(tenant.type)}`}>
                                                {tenant.type}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getPlanColor(tenant.planId)}`}>
                                                {tenant.planId || 'trial'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">
                                            Created: {tenant.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/app/admin/tenant/${tenant.id}`)}
                                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(tenant)}
                                            disabled={actionLoading === tenant.id}
                                            className={`p-2 rounded-lg ${tenant.isActive
                                                    ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                                    : 'bg-green-100 hover:bg-green-200 text-green-600'
                                                }`}
                                        >
                                            {actionLoading === tenant.id ? (
                                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            ) : tenant.isActive ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantList;
