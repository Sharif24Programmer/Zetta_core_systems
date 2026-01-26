import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getAllInvoices, getAllSuppliers, INVOICE_STATUS } from '../services/invoiceService';
import { formatCurrency } from '../../reports/services/reportsService';
import Loader from '../../../shared/components/Loader';

// Icons
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const InvoiceDashboard = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();

    const [invoices, setInvoices] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, overdue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tenantId) {
            const allInvoices = getAllInvoices(tenantId);
            const allSuppliers = getAllSuppliers(tenantId);

            setInvoices(allInvoices.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setSuppliers(allSuppliers);

            // Calculate Stats
            const totalPending = allInvoices.reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0);
            const totalOverdue = allInvoices
                .filter(inv => inv.status === INVOICE_STATUS.OVERDUE)
                .reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0);

            setStats({
                total: allInvoices.length,
                pending: totalPending,
                overdue: totalOverdue
            });

            setLoading(false);
        }
    }, [tenantId]);

    const getStatusColor = (status) => {
        switch (status) {
            case INVOICE_STATUS.PAID: return 'bg-emerald-100 text-emerald-700';
            case INVOICE_STATUS.PARTIAL: return 'bg-blue-100 text-blue-700';
            case INVOICE_STATUS.UNPAID: return 'bg-yellow-100 text-yellow-700';
            case INVOICE_STATUS.OVERDUE: return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/app')} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900">Invoices & Suppliers</h1>
                    </div>
                    <button
                        onClick={() => navigate('/app/invoices/new')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon />
                        New Invoice
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Total Payables</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.pending)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Overdue</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.overdue)}</p>
                    </div>
                </div>

                {/* Suppliers Quick View */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">My Suppliers</h2>
                        <button
                            onClick={() => navigate('/app/suppliers')}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                            View All
                        </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {suppliers.map(sup => (
                            <div key={sup.id} className="min-w-[140px] p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs mb-2">
                                    {sup.name.charAt(0)}
                                </div>
                                <p className="text-sm font-medium text-slate-900 truncate">{sup.name}</p>
                                <p className="text-xs text-slate-500 truncate">{sup.phone}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invoices List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Recent Invoices</h2>

                    {invoices.map(invoice => (
                        <div
                            key={invoice.id}
                            onClick={() => navigate(`/app/invoices/${invoice.id}`)}
                            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                        <DocumentIcon />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{invoice.supplierName}</h3>
                                        <p className="text-xs text-slate-500">#{invoice.number} • {new Date(invoice.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-md uppercase tracking-wide ${getStatusColor(invoice.status)}`}>
                                    {invoice.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Due Date</p>
                                    <p className="text-sm font-medium text-slate-700">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-slate-900">{formatCurrency(invoice.amount)}</p>
                                    {invoice.paidAmount < invoice.amount && (
                                        <p className="text-xs text-red-500">Due: {formatCurrency(invoice.amount - invoice.paidAmount)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InvoiceDashboard;
