import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useInventory } from '../hooks/useInventory';
import { stockIn, stockOut } from '../services/stockLogService';
import Loader from '../../../shared/components/Loader';

/**
 * Stock Adjustment page - supports both Stock In and Stock Out
 */
const StockAdjust = ({ type = 'in' }) => {
    const navigate = useNavigate();
    const { tenantId, user } = useAuth();
    const { products, loading: loadingProducts } = useInventory(tenantId);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const isStockIn = type === 'in';
    const title = isStockIn ? 'Stock In' : 'Stock Out';
    const buttonText = isStockIn ? 'Add Stock' : 'Remove Stock';
    const color = isStockIn ? 'green' : 'red';

    const filteredProducts = products.filter(p =>
        p.trackStock &&
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!selectedProduct) {
            setError('Please select a product');
            return;
        }

        const qty = parseInt(quantity);
        if (!qty || qty <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        setLoading(true);
        try {
            if (isStockIn) {
                await stockIn(tenantId, selectedProduct.id, qty, {
                    reason: reason || 'Stock In',
                    userId: user?.uid
                });
            } else {
                await stockOut(tenantId, selectedProduct.id, qty, {
                    reason: reason || 'Stock Out',
                    userId: user?.uid
                });
            }

            setSuccess(`Successfully ${isStockIn ? 'added' : 'removed'} ${qty} units`);
            setSelectedProduct(null);
            setQuantity('');
            setReason('');
            setSearchTerm('');
        } catch (err) {
            console.error('Stock adjustment error:', err);
            setError(err.message || 'Failed to adjust stock');
        }
        setLoading(false);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="page-title">{title}</h1>
                </div>
            </div>

            <div className="page-content">
                {/* Success */}
                {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        {success}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product Selection */}
                    {!selectedProduct ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Select Product
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search products..."
                                className="input-field mb-3"
                            />

                            {loadingProducts ? (
                                <Loader text="Loading..." />
                            ) : (
                                <div className="max-h-60 overflow-auto space-y-2">
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => setSelectedProduct(product)}
                                            className="p-3 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer"
                                        >
                                            <p className="font-medium text-slate-800">{product.name}</p>
                                            <p className="text-sm text-slate-500">
                                                Current Stock: <span className="font-semibold">{product.stock}</span>
                                            </p>
                                        </div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <p className="text-center text-slate-500 py-4">No products found</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`p-4 rounded-xl border-2 border-${color}-200 bg-${color}-50`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-800">{selectedProduct.name}</p>
                                    <p className="text-sm text-slate-600">
                                        Current Stock: <span className="font-bold">{selectedProduct.stock}</span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    {selectedProduct && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Quantity to {isStockIn ? 'Add' : 'Remove'}
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="Enter quantity"
                                    min="1"
                                    required
                                    className="input-field text-lg"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Reason (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={isStockIn ? 'e.g., Purchase from supplier' : 'e.g., Damaged goods'}
                                    className="input-field"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 text-lg font-semibold rounded-xl transition-all disabled:opacity-50 ${isStockIn
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                            >
                                {loading ? 'Processing...' : buttonText}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export const StockInPage = () => <StockAdjust type="in" />;
export const StockOutPage = () => <StockAdjust type="out" />;

export default StockAdjust;
