import React from 'react';
import { AdminIcons as Icons } from '../components/AdminIcons';
import StatCard from '../components/StatCard';

const Payments = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
                <p className="text-slate-500 mt-1">Review and approve payment requests</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Pending" value="8" icon={Icons.clock} color="yellow" />
                <StatCard title="Approved Today" value="12" icon={Icons.check} color="green" />
                <StatCard title="Total Collected" value="₹4.2L" icon={Icons.revenue} color="purple" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Pending Approvals</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { id: 'PAY-001', tenant: 'City Care Clinic', plan: 'Growth', amount: '₹2,499', date: 'Jan 26, 2026' },
                        { id: 'PAY-002', tenant: 'MediMart Pharmacy', plan: 'Enterprise', amount: '₹9,999', date: 'Jan 25, 2026' },
                    ].map(payment => (
                        <div key={payment.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                    {Icons.payments}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{payment.tenant}</p>
                                    <p className="text-sm text-slate-500">{payment.id} • {payment.plan}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="font-semibold text-slate-900">{payment.amount}</p>
                                    <p className="text-sm text-slate-500">{payment.date}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                                        Approve
                                    </button>
                                    <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Payments;
