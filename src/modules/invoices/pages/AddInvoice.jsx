import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { addInvoice, getAllSuppliers, addSupplier } from '../services/invoiceService';

const AddInvoice = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        supplierId: '',
        number: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        amount: '',
        paidAmount: '0',
        notes: ''
    });

    // New Supplier State
    const [showNewSupplier, setShowNewSupplier] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', gstin: '' });

    useEffect(() => {
        if (tenantId) {
            setSuppliers(getAllSuppliers(tenantId));
        }
    }, [tenantId]);

    // Set default due date (30 days)
    useEffect(() => {
        if (formData.date && !formData.dueDate) {
            const d = new Date(formData.date);
            d.setDate(d.getDate() + 30);
            setFormData(prev => ({ ...prev, dueDate: d.toISOString().split('T')[0] }));
        }
    }, [formData.date]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupplierChange = (e) => {
        if (e.target.value === 'new') {
            setShowNewSupplier(true);
        } else {
            setFormData(prev => ({ ...prev, supplierId: e.target.value }));
        }
    };

    const handleCreateSupplier = async () => {
        if (!newSupplier.name) return;

        const created = await addSupplier({ ...newSupplier, tenantId });
        setSuppliers(prev => [...prev, created]);
        setFormData(prev => ({ ...prev, supplierId: created.id }));
        setShowNewSupplier(false);
        setNewSupplier({ name: '', phone: '', gstin: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supplier = suppliers.find(s => s.id === formData.supplierId);

            await addInvoice({
                ...formData,
                tenantId,
                supplierName: supplier?.name || 'Unknown',
                amount: Number(formData.amount),
                paidAmount: Number(formData.paidAmount)
            });
            navigate('/app/invoices');
        } catch (error) {
            console.error('Error adding invoice:', error);
            alert('Failed to add invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-semibold text-slate-900">New Invoice</h1>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">

                        {/* Supplier Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>

                            {!showNewSupplier ? (
                                <select
                                    name="supplierId"
                                    required
                                    value={formData.supplierId}
                                    onChange={handleSupplierChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                    <option value="new" className="font-semibold text-blue-600">+ Create New Supplier</option>
                                </select>
                            ) : (
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase">New Supplier Details</h3>
                                    <input
                                        type="text"
                                        placeholder="Supplier Name *"
                                        className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-sm"
                                        value={newSupplier.name}
                                        onChange={e => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-sm"
                                        value={newSupplier.phone}
                                        onChange={e => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewSupplier(false)}
                                            className="flex-1 py-1.5 text-slate-600 text-xs font-medium border border-slate-300 rounded hover:bg-slate-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCreateSupplier}
                                            disabled={!newSupplier.name}
                                            className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Save Supplier
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Invoice Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number</label>
                                <input
                                    type="text"
                                    name="number"
                                    required
                                    value={formData.number}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="#INV-001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Paid Amount (₹)</label>
                                <input
                                    type="number"
                                    name="paidAmount"
                                    min="0"
                                    value={formData.paidAmount}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                required
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Invoice'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AddInvoice;
