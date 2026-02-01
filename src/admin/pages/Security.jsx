import React, { useState } from 'react';
import { AdminIcons as Icons } from '../components/AdminIcons';

const Security = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [logs, setLogs] = useState([
        { id: 1, action: 'Tenant Suspended', user: 'Super Admin', details: 'Suspended WellLife Diagnostics', time: '10 mins ago', type: 'critical' },
        { id: 2, action: 'User Login', user: 'admin@apollo.com', details: 'Successful login from IP 192.168.1.1', time: '25 mins ago', type: 'info' },
        { id: 3, action: 'Module Enabled', user: 'Super Admin', details: 'Enabled Telehealth for Apollo', time: '1 hour ago', type: 'success' },
        { id: 4, action: 'Failed Login', user: 'unknown', details: '3 failed attempts from IP 10.0.0.5', time: '2 hours ago', type: 'warning' },
        { id: 5, action: 'Settings Updated', user: 'Super Admin', details: 'Updated global mail config', time: '5 hours ago', type: 'info' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Security & System Health</h1>
                    <p className="text-slate-500 mt-1">Monitor system status and audit trails</p>
                </div>
                <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`px-4 py-2 font-medium rounded-lg flex items-center gap-2 transition-colors ${maintenanceMode
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                >
                    {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Audit Log */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900">Audit Logs</h3>
                        <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {logs.map(log => (
                            <div key={log.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${log.type === 'critical' ? 'bg-red-500' :
                                        log.type === 'warning' ? 'bg-amber-500' :
                                            log.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`}></div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">
                                            {log.action} <span className="font-normal text-slate-500">by</span> {log.user}
                                        </p>
                                        <p className="text-sm text-slate-600 mt-0.5">{log.details}</p>
                                        <p className="text-xs text-slate-400 mt-1">{log.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Alerts */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                            <span className="text-amber-500">{Icons.alert}</span>
                            Security Alerts
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                <p className="text-sm font-bold text-red-800">Suspicious Login Activity</p>
                                <p className="text-xs text-red-600 mt-1">Multiple failed attempts from IP 45.2.1.22 detected 2h ago.</p>
                                <button className="mt-2 text-xs font-medium text-red-700 hover:underline">Block IP</button>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-sm font-bold text-amber-800">High Database Load</p>
                                <p className="text-xs text-amber-600 mt-1">CPU usage spiked to 85% during backup.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
                        <h3 className="font-semibold mb-2">Emergency Access</h3>
                        <p className="text-sm text-slate-400 mb-4">God mode actions require 2FA.</p>
                        <button
                            onClick={() => alert("Simulating Cache Clear...")}
                            className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors mb-2"
                        >
                            Clear System Cache
                        </button>
                        <button
                            onClick={() => alert("Simulating Service Restart...")}
                            className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                        >
                            Restart API Services
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
