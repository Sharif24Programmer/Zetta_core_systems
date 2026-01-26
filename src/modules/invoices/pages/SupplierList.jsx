import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getAllSuppliers } from '../services/invoiceService';
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

const SupplierList = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tenantId) {
            const data = getAllSuppliers(tenantId);
            setSuppliers(data);
            setLoading(false);
        }
    }, [tenantId]);

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/app/invoices')} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-500">
                            <ChevronLeftIcon />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900">All Suppliers</h1>
                    </div>
                    <button onClick={() => navigate('/app')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        <HomeIcon />
                    </button>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <div className="space-y-3">
                    {suppliers.length === 0 ? (
                        <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-slate-200">
                            No suppliers found. Create an invoice to add one.
                        </div>
                    ) : (
                        suppliers.map(sup => (
                            <div key={sup.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                                    {sup.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 truncate">{sup.name}</h3>
                                    <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                        <span>{sup.phone || 'No Phone'}</span>
                                        {sup.gstin && <span>GST: {sup.gstin}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierList;
