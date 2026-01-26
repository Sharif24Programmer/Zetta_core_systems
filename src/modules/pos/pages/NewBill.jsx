import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useProducts, useFilteredProducts } from '../hooks/useProducts';
import { useCartContext } from '../context/CartContext';
import { CATEGORIES } from '../services/productService';
import { startUsbScanner } from '../../../shared/services/barcodeService';
import ProductGrid from '../components/ProductGrid';
import CategoryChips from '../components/CategoryChips';
import BottomCartBar from '../components/BottomCartBar';
import Loader from '../../../shared/components/Loader';

const NewBill = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();

    // Products
    const { products, loading } = useProducts(tenantId);
    const [category, setCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const filteredProducts = useFilteredProducts(products, category, searchTerm);

    // Cart from context (persists across navigation)
    const cart = useCartContext();

    // Barcode scan feedback
    const [scanFeedback, setScanFeedback] = useState(null);

    // USB Barcode Scanner Integration
    useEffect(() => {
        const handleBarcodeScan = (barcode) => {
            console.log('[Barcode] Scanned:', barcode);

            // Find product by barcode
            const product = products.find(p => p.barcode === barcode);

            if (product) {
                cart.addItem(product);
                setScanFeedback({ type: 'success', message: `Added: ${product.name}` });
            } else {
                setScanFeedback({ type: 'error', message: `Product not found: ${barcode}` });
            }

            // Clear feedback after 2 seconds
            setTimeout(() => setScanFeedback(null), 2000);
        };

        const stopScanner = startUsbScanner(handleBarcodeScan);

        return () => {
            if (stopScanner) stopScanner();
        };
    }, [products, cart]);

    return (
        <div className="page-container pb-32">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/app/pos')}
                            className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
                        >
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="page-title">New Bill</h1>
                    </div>

                    {/* Scanner indicator */}
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Scanner Ready
                    </div>
                </div>

                {/* Search */}
                <div className="mt-3 relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search or scan barcode..."
                        className="input-field pl-10"
                    />
                    <svg
                        className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Categories */}
                <CategoryChips
                    categories={CATEGORIES}
                    selected={category}
                    onSelect={setCategory}
                />
            </div>

            {/* Barcode Scan Feedback */}
            {scanFeedback && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${scanFeedback.type === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                    {scanFeedback.type === 'success' ? '✓' : '✗'} {scanFeedback.message}
                </div>
            )}

            {/* Products */}
            <div className="page-content">
                {loading ? (
                    <Loader text="Loading products..." />
                ) : (
                    <ProductGrid
                        products={filteredProducts}
                        getItemQty={cart.getItemQty}
                        onAddItem={cart.addItem}
                    />
                )}
            </div>

            {/* Stock Error Toast */}
            {cart.stockError && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg text-sm font-medium animate-pulse">
                    ⚠️ {cart.stockError}
                </div>
            )}

            {/* Bottom Cart Bar */}
            <BottomCartBar
                itemCount={cart.totals.itemCount}
                total={cart.totals.total}
            />
        </div>
    );
};

export default NewBill;
