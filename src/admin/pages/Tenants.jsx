import React, { useState } from 'react';
import { AdminIcons as Icons } from '../components/AdminIcons';

const Tenants = () => {
    const [tenants, setTenants] = useState([
        { id: 't1', name: 'City Care Clinic', type: 'Clinic', plan: 'Growth', status: 'Active', revenue: '₹45,000', admin: 'dr.sharma@citycare.com' },
        { id: 't2', name: 'MediMart Pharmacy', type: 'Pharmacy', plan: 'Enterprise', status: 'Active', revenue: '₹1,25,000', admin: 'manager@medimart.com' },
        { id: 't3', name: 'Green Mart', type: 'Retail', plan: 'Startup', status: 'Pending', revenue: '₹12,000', admin: 'john@greenmart.com' },
        { id: 't4', name: 'Apollo Medical', type: 'Hospital', plan: 'Enterprise', status: 'Active', revenue: '₹2,50,000', admin: 'admin@apollo.com' },
        { id: 't5', name: 'WellLife Diagnostics', type: 'Lab', plan: 'Growth', status: 'Suspended', revenue: '₹85,000', admin: 'lab@welllife.com' },
    ]);

    const handleImpersonate = (tenant) => {
        if (confirm(`Are you sure you want to log in as ${tenant.admin}? This action will be logged.`)) {
            // In a real app, this would get a one-time token and redirect
            // For demo, we'll open the core app
            window.open(`http://localhost:3000/login?impersonate=${tenant.id}`, '_blank');
            alert(`Impersonating ${tenant.name}... Check the new tab.`);
        }
    };

    const toggleStatus = (tenantId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        const action = currentStatus === 'Active' ? 'Suspend' : 'Activate';

        if (confirm(`Are you sure you want to ${action} this tenant?`)) {
            setTenants(tenants.map(t =>
                t.id === tenantId ? { ...t, status: newStatus } : t
            ));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
                    <p className="text-slate-500 mt-1">Manage all registered tenants (God Mode)</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Tenant
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Tenant</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Plan</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Revenue</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Details</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tenants.map(tenant => (
                                <tr key={tenant.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                                {tenant.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{tenant.name}</p>
                                                <p className="text-xs text-slate-500">{tenant.admin}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{tenant.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${tenant.plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            tenant.plan === 'Growth' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                                            }`}>
                                            {tenant.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold flex w-fit items-center gap-1 ${tenant.status === 'Active'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : tenant.status === 'Suspended'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'Active' ? 'bg-emerald-600' :
                                                tenant.status === 'Suspended' ? 'bg-red-600' : 'bg-amber-600'
                                                }`}></span>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-slate-700">{tenant.revenue}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">
                                            View Details
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleImpersonate(tenant)}
                                                title="Impersonate Tenant"
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                            >
                                                {Icons.impersonate}
                                            </button>
                                            {tenant.status === 'Suspended' ? (
                                                <button
                                                    onClick={() => toggleStatus(tenant.id, tenant.status)}
                                                    title="Activate Tenant"
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                >
                                                    {Icons.unlock}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => toggleStatus(tenant.id, tenant.status)}
                                                    title="Suspend Tenant"
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                >
                                                    {Icons.ban}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tenants;
