import React from 'react';
import { Link } from 'react-router-dom';
import { AdminIcons as Icons } from '../components/AdminIcons';
import StatCard from '../components/StatCard';

const Dashboard = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back, here's your overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tenants"
                    value="156"
                    change="12%"
                    changeType="up"
                    icon={Icons.tenants}
                    color="blue"
                />
                <StatCard
                    title="Active Subscriptions"
                    value="142"
                    change="8%"
                    changeType="up"
                    icon={Icons.check}
                    color="green"
                />
                <StatCard
                    title="Pending Payments"
                    value="8"
                    change="2"
                    changeType="down"
                    icon={Icons.clock}
                    color="yellow"
                />
                <StatCard
                    title="Monthly Revenue"
                    value="₹2.4L"
                    change="23%"
                    changeType="up"
                    icon={Icons.chart}
                    color="purple"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Signups */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-900">Recent Signups</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[
                            { name: 'City Care Clinic', type: 'Clinic', date: 'Today' },
                            { name: 'MediMart Pharmacy', type: 'Pharmacy', date: 'Yesterday' },
                            { name: 'Green Health Hospital', type: 'Hospital', date: '2 days ago' },
                        ].map(item => (
                            <div key={item.name} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                        {Icons.tenants}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{item.name}</p>
                                        <p className="text-sm text-slate-500">{item.type}</p>
                                    </div>
                                </div>
                                <span className="text-sm text-slate-400">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-900">Pending Approvals</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[
                            { id: 'PAY-123', amount: '₹2,499', tenant: 'City Care Clinic' },
                            { id: 'PAY-124', amount: '₹9,999', tenant: 'MediMart' },
                        ].map(item => (
                            <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                                        {Icons.payments}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{item.id}</p>
                                        <p className="text-sm text-slate-500">{item.tenant}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-slate-900">{item.amount}</span>
                                    <Link to="/admin/approvals" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                                        Review
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">System Status</p>
                        <p className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Operational
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                        {Icons.check}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Database Latency</p>
                        <p className="text-lg font-bold text-slate-900">24ms</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        {Icons.database}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Error Rate</p>
                        <p className="text-lg font-bold text-slate-900">0.02%</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                        {Icons.chart}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Active Sessions</p>
                        <p className="text-lg font-bold text-slate-900">482</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                        {Icons.users}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
