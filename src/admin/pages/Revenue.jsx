import React from 'react';
import { AdminIcons as Icons } from '../components/AdminIcons';
import StatCard from '../components/StatCard';

const Revenue = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
                <p className="text-slate-500 mt-1">Financial overview and analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                    <p className="text-indigo-100 text-sm font-medium">This Month</p>
                    <p className="text-4xl font-bold mt-2">₹2,45,000</p>
                    <p className="text-indigo-100 mt-2">↑ 23% from last month</p>
                </div>
                <StatCard title="Last Month" value="₹1,98,000" icon={Icons.chart} color="blue" />
                <StatCard title="Yearly Total" value="₹28.4L" icon={Icons.revenue} color="green" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Transaction ID</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Tenant</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Plan</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Date</th>
                            <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[
                            { id: 'TXN-001', tenant: 'City Care Clinic', plan: 'Growth', date: 'Jan 26', amount: '₹2,499' },
                            { id: 'TXN-002', tenant: 'MediMart', plan: 'Enterprise', date: 'Jan 25', amount: '₹9,999' },
                            { id: 'TXN-003', tenant: 'Apollo Medical', plan: 'Enterprise', date: 'Jan 24', amount: '₹9,999' },
                        ].map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-sm text-slate-600">{tx.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{tx.tenant}</td>
                                <td className="px-6 py-4 text-slate-600">{tx.plan}</td>
                                <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                                <td className="px-6 py-4 text-right font-semibold text-emerald-600">{tx.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Revenue;
