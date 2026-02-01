import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { isDemoMode, getDemoData } from '../../../core/demo/demoManager';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import Loader from '../../../shared/components/Loader';
// import { formatCurrency, formatDate } from '../../../modules/pos/services/billService'; // Missing export

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
};

const PaymentHistory = () => {
    const { tenantId } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, [tenantId]);

    const fetchTransactions = async () => {
        if (isDemoMode()) {
            const demoInvoices = getDemoData('invoices_subscription');
            setTransactions(demoInvoices.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setLoading(false);
            return;
        }

        try {
            // Check if 'transactions' collection is set up with tenantId
            // Using a simple query for now. Requires index likely.
            const q = query(
                collection(db, 'transactions'),
                where('tenantId', '==', tenantId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt // Unify date field
            }));

            setTransactions(data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            // Fallback for missing index or other errors
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader size="small" />;

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                <p>No payment history available.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-100">
                        <th className="py-2 font-medium">Date</th>
                        <th className="py-2 font-medium">Description</th>
                        <th className="py-2 font-medium">Amount</th>
                        <th className="py-2 font-medium">Status</th>
                        <th className="py-2 font-medium text-right">Invoice</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 text-slate-600">{formatDate(tx.date)}</td>
                            <td className="py-3 text-slate-900 font-medium">
                                {tx.plan ? `Upgrade to ${tx.plan}` : 'Subscription Payment'}
                            </td>
                            <td className="py-3 text-slate-900">{formatCurrency(tx.amount)}</td>
                            <td className="py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                    ${tx.status === 'paid' || tx.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}
                                `}>
                                    {tx.status}
                                </span>
                            </td>
                            <td className="py-3 text-right">
                                <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                                    Download
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentHistory;
