import React, { useState } from 'react';
import { AdminIcons as Icons } from '../components/AdminIcons';

const Modules = () => {
    const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, access
    const [modules, setModules] = useState([
        {
            id: 'mod_lab',
            title: 'Advanced Lab System',
            desc: 'Complete pathology lab with report generation and email capability.',
            status: 'Stable',
            version: 'v2.1',
            activeTenants: 42,
            price: '₹999/mo',
            enabled: true
        },
        {
            id: 'mod_pharmacy',
            title: 'Pharmacy & Inventory',
            desc: 'Batch tracking, expiry alerts, and supplier management.',
            status: 'Stable',
            version: 'v1.4',
            activeTenants: 85,
            price: '₹1499/mo',
            enabled: true
        },
        {
            id: 'mod_telehealth',
            title: 'Telehealth Integration',
            desc: 'Video consultations via Zoom/Jitsi integration.',
            status: 'Beta',
            version: 'v0.9',
            activeTenants: 12,
            price: 'Free',
            enabled: false
        },
        {
            id: 'mod_insurance',
            title: 'Insurance Claims',
            desc: 'Direct claim processing integration.',
            status: 'Coming Soon',
            version: 'v0.1',
            activeTenants: 0,
            price: 'TBD',
            enabled: false
        }
    ]);

    const [tenantAccess, setTenantAccess] = useState([
        { id: 't1', name: 'City Care Clinic', lab: true, pharmacy: true, telehealth: false },
        { id: 't2', name: 'MediMart Pharmacy', lab: false, pharmacy: true, telehealth: false },
        { id: 't4', name: 'Apollo Medical', lab: true, pharmacy: true, telehealth: true },
    ]);

    const toggleModule = (id) => {
        setModules(modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    };

    const toggleTenantAccess = (tenantId, modKey) => {
        setTenantAccess(tenantAccess.map(t =>
            t.id === tenantId ? { ...t, [modKey]: !t[modKey] } : t
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Modules & Features</h1>
                    <p className="text-slate-500 mt-1">Control system-wide capabilities</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'marketplace' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        Module Store
                    </button>
                    <button
                        onClick={() => setActiveTab('access')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'access' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        Tenant Access
                    </button>
                </div>
            </div>

            {activeTab === 'marketplace' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {modules.map(module => (
                        <div key={module.id} className={`bg-white rounded-xl border p-6 transition-all ${module.enabled ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-slate-200 grayscale opacity-80'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${module.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {Icons.modules}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{module.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${module.status === 'Stable' ? 'bg-emerald-100 text-emerald-700' :
                                                module.status === 'Beta' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {module.status}
                                            </span>
                                            <span className="text-xs text-slate-500">{module.version}</span>
                                        </div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={module.enabled} onChange={() => toggleModule(module.id)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <p className="mt-4 text-sm text-slate-600">{module.desc}</p>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-sm">
                                    <span className="text-slate-500">Active Tenants:</span>
                                    <span className="font-semibold text-slate-900 ml-1">{module.activeTenants}</span>
                                </div>
                                <div className="font-medium text-slate-900">{module.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Tenant</th>
                                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Lab System</th>
                                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Pharmacy</th>
                                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Telehealth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tenantAccess.map(tenant => (
                                <tr key={tenant.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{tenant.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleTenantAccess(tenant.id, 'lab')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tenant.lab ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tenant.lab ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleTenantAccess(tenant.id, 'pharmacy')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tenant.pharmacy ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tenant.pharmacy ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleTenantAccess(tenant.id, 'telehealth')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tenant.telehealth ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tenant.telehealth ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Modules;
