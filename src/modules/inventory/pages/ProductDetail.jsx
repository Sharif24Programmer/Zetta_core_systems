import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getProductById, updateProduct, deleteProduct, adjustStock } from '../services/inventoryService';
import { formatCurrency } from '../../pos/services/billService';
import Loader from '../../../shared/components/Loader';

const ProductDetail = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { tenantId } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        costPrice: '',
        category: '',
        stock: '',
        barcode: '',
        trackStock: true
    });

    // Stock adjustment
    const [adjustmentQty, setAdjustmentQty] = useState('');
    const [adjustmentType, setAdjustmentType] = useState('in');

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            try {
                const data = await getProductById(productId);
                if (data) {
                    setProduct(data);
                    setFormData({
                        name: data.name || '',
                        price: data.price || '',
                        costPrice: data.costPrice || '',
                        category: data.category || '',
                        stock: data.stock || 0,
                        barcode: data.barcode || '',
                        trackStock: data.trackStock !== false
                    });
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error('Error loading product:', err);
                setError('Failed to load product');
            }
            setLoading(false);
        };

        if (productId) {
            loadProduct();
        }
    }, [productId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProduct(productId, {
                name: formData.name,
                price: Number(formData.price),
                costPrice: Number(formData.costPrice),
                category: formData.category,
                barcode: formData.barcode,
                trackStock: formData.trackStock
            });
            setProduct({ ...product, ...formData });
            setEditing(false);
        } catch (err) {
            console.error('Error saving product:', err);
            setError('Failed to save product');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await deleteProduct(productId);
            navigate('/app/inventory');
        } catch (err) {
            console.error('Error deleting product:', err);
            setError('Failed to delete product');
        }
    };

    const handleStockAdjust = async () => {
        const qty = Number(adjustmentQty);
        if (!qty || qty <= 0) return;

        const adjustment = adjustmentType === 'in' ? qty : -qty;

        try {
            await adjustStock(productId, adjustment);
            const newStock = Math.max(0, (product.stock || 0) + adjustment);
            setProduct({ ...product, stock: newStock });
            setFormData({ ...formData, stock: newStock });
            setAdjustmentQty('');
        } catch (err) {
            console.error('Error adjusting stock:', err);
            setError('Failed to adjust stock');
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <Loader text="Loading product..." />
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/app/inventory')} className="p-2 -ml-2 rounded-lg hover:bg-slate-100">
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="page-title">Product Not Found</h1>
                    </div>
                </div>
                <div className="page-content text-center py-12">
                    <p className="text-slate-500 mb-4">{error}</p>
                    <button onClick={() => navigate('/app/inventory')} className="btn-primary">
                        Back to Inventory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/app/inventory')} className="p-2 -ml-2 rounded-lg hover:bg-slate-100">
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="page-title">{product?.name}</h1>
                    </div>
                    <div className="flex gap-2">
                        {!editing ? (
                            <button onClick={() => setEditing(true)} className="btn-secondary">
                                Edit
                            </button>
                        ) : (
                            <button onClick={() => setEditing(false)} className="btn-secondary">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="page-content space-y-6">
                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Product Info Card */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-4">Product Details</h3>

                    {editing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Barcode</label>
                                <input
                                    type="text"
                                    value={formData.barcode}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary w-full"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Price</span>
                                <span className="font-semibold text-slate-800">{formatCurrency(product?.price)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Cost Price</span>
                                <span className="text-slate-700">{formatCurrency(product?.costPrice || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Category</span>
                                <span className="text-slate-700">{product?.category || 'Uncategorized'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Barcode</span>
                                <span className="text-slate-700 font-mono">{product?.barcode || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Profit Margin</span>
                                <span className="text-green-600 font-semibold">
                                    {formatCurrency((product?.price || 0) - (product?.costPrice || 0))} per unit
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stock Card */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-4">Stock Management</h3>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4">
                        <span className="text-slate-600">Current Stock</span>
                        <span className={`text-2xl font-bold ${product?.stock <= 0 ? 'text-red-600' : product?.stock <= 10 ? 'text-orange-500' : 'text-green-600'}`}>
                            {product?.stock || 0}
                        </span>
                    </div>

                    {/* Quick Adjust */}
                    <div className="flex gap-2">
                        <select
                            value={adjustmentType}
                            onChange={(e) => setAdjustmentType(e.target.value)}
                            className="input-field flex-shrink-0 w-auto"
                        >
                            <option value="in">+ Stock In</option>
                            <option value="out">- Stock Out</option>
                        </select>
                        <input
                            type="number"
                            value={adjustmentQty}
                            onChange={(e) => setAdjustmentQty(e.target.value)}
                            placeholder="Qty"
                            className="input-field w-24"
                        />
                        <button
                            onClick={handleStockAdjust}
                            className={adjustmentType === 'in' ? 'btn-success' : 'btn-danger'}
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Delete Button */}
                <button
                    onClick={handleDelete}
                    className="w-full py-3 text-red-600 font-medium border border-red-200 rounded-xl hover:bg-red-50"
                >
                    Delete Product
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;
