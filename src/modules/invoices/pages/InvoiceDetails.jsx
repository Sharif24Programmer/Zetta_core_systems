import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getInvoice, updateInvoice, INVOICE_STATUS } from '../services/invoiceService';
import { formatCurrency } from '../../reports/services/reportsService';
import Loader from '../../../shared/components/Loader';

// Icons
const ChevronLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const HomeIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const InvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tenantId && id) {
            const data = getInvoice(id);
            setInvoice(data);
            setLoading(false);
        }
    }, [tenantId, id]);

    const handleMarkPaid = async () => {
        if (!invoice) return;
        const updated = await updateInvoice(invoice.id, {
            status: INVOICE_STATUS.PAID,
            paidAmount: invoice.amount
        });
        setInvoice(updated);
    };

    const handleMarkUnpaid = async () => {
        if (!invoice) return;
        const updated = await updateInvoice(invoice.id, {
            status: INVOICE_STATUS.UNPAID,
            paidAmount: 0
        });
        setInvoice(updated);
    };

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
    if (!invoice) return <div className="p-4 text-center">Invoice not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/app/invoices')} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-500">
                            <ChevronLeftIcon />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900">Invoice Details</h1>
                    </div>
                    <button onClick={() => navigate('/app')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        <HomeIcon />
                    </button>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6 space-y-6">

                {/* Status Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                            <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(invoice.amount)}</h2>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                        </span>
                    </div>

                    <div className="mt-6 flex gap-3">
                        {invoice.status !== INVOICE_STATUS.PAID ? (
                            <button
                                onClick={handleMarkPaid}
                                className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Mark as Paid
                            </button>
                        ) : (
                            <button
                                onClick={handleMarkUnpaid}
                                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Mark as Unpaid
                            </button>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Invoice Info</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Invoice Number</p>
                            <p className="text-sm font-medium">{invoice.number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Date</p>
                            <p className="text-sm font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Supplier</p>
                            <p className="text-sm font-medium">{invoice.supplierName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Due Date</p>
                            <p className={`text-sm font-medium ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? 'text-red-600' : ''}`}>
                                {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="pt-2">
                            <p className="text-xs text-slate-500 uppercase mb-1">Notes</p>
                            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {invoice.notes}
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default InvoiceDetails;
