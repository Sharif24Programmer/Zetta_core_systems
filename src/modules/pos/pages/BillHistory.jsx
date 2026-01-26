import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useBills } from '../hooks/useBills';
import { formatCurrency, formatBillTime } from '../services/billService';
import { generateReceipt, printReceipt } from '../services/receiptService';
import Loader from '../../../shared/components/Loader';

const BillHistory = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { bills, loading, refresh } = useBills(tenantId, 100);

    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month

    // Filter bills
    const filteredBills = bills.filter(bill => {
        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            if (!bill.billNumber?.toLowerCase().includes(term)) {
                return false;
            }
        }

        // Date filter
        if (dateFilter !== 'all') {
            const billDate = bill.createdAt?.toDate?.() || new Date(bill.createdAt);
            const now = new Date();

            if (dateFilter === 'today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (billDate < today) return false;
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                if (billDate < weekAgo) return false;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                if (billDate < monthAgo) return false;
            }
        }

        return true;
    });

    const handlePrint = (bill) => {
        const receipt = generateReceipt(bill);
        printReceipt(receipt);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => navigate('/app/pos')}
                        className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="page-title">Bill History</h1>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search bill number..."
                        className="input-field pl-10"
                    />
                    <svg
                        className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Date Filter */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'today', label: 'Today' },
                        { id: 'week', label: 'This Week' },
                        { id: 'month', label: 'This Month' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setDateFilter(filter.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${dateFilter === filter.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bills List */}
            <div className="page-content">
                {loading ? (
                    <Loader text="Loading bills..." />
                ) : filteredBills.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No bills found
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500">{filteredBills.length} bills</p>
                        {filteredBills.map(bill => (
                            <div
                                key={bill.id}
                                className="card hover:border-primary-200 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-800">{bill.billNumber}</p>
                                        <p className="text-sm text-slate-500">
                                            {formatDate(bill.createdAt)} • {formatBillTime(bill.createdAt)}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {bill.items?.length || 0} items • {bill.paymentMode?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary-600">
                                            {formatCurrency(bill.total)}
                                        </p>
                                        <button
                                            onClick={() => handlePrint(bill)}
                                            className="text-sm text-primary-500 font-medium mt-1"
                                        >
                                            Reprint
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

export default BillHistory;
