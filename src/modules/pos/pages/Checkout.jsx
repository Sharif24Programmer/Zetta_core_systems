import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useCartContext } from '../context/CartContext';
import { createBill, formatCurrency } from '../services/billService';
import { reduceStock, validateCartStock } from '../services/stockService';
import PaymentSelector from '../components/PaymentSelector';
import Loader from '../../../shared/components/Loader';

const Checkout = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const cart = useCartContext();

    const [paymentMode, setPaymentMode] = useState('cash');
    const [amountReceived, setAmountReceived] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirmPayment = async () => {
        if (cart.isEmpty) {
            setError('Cart is empty');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Validate stock
            const stockCheck = await validateCartStock(cart.items);
            if (!stockCheck.valid) {
                setError(stockCheck.errors.join('\n'));
                setLoading(false);
                return;
            }

            // 2. Create bill
            const billData = {
                tenantId,
                items: cart.items,
                subtotal: cart.totals.subtotal,
                discount: cart.totals.discount,
                discountType: cart.discountType,
                tax: cart.totals.tax,
                taxRate: cart.taxRate,
                total: cart.totals.total,
                paymentMode,
                amountReceived: paymentMode === 'cash' ? Number(amountReceived) || cart.totals.total : cart.totals.total,
                change: paymentMode === 'cash' ? Math.max(0, (Number(amountReceived) || 0) - cart.totals.total) : 0
            };

            const newBill = await createBill(billData);

            // 3. Complete sale - reduces stock and clears cart
            cart.completeSale();

            navigate(`/app/pos/success/${newBill.id}`, {
                state: { bill: { ...billData, id: newBill.id, billNumber: newBill.billNumber } }
            });

        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.message || 'Failed to process payment');
        }

        setLoading(false);
    };

    // Calculate change
    const change = Math.max(0, (Number(amountReceived) || 0) - (cart?.totals?.total || 0));

    if (cart.isEmpty) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/app/pos/new')} className="p-2 -ml-2 rounded-lg hover:bg-slate-100">
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="page-title">Checkout</h1>
                    </div>
                </div>
                <div className="page-content text-center py-12">
                    <p className="text-slate-500">No items to checkout</p>
                    <button onClick={() => navigate('/app/pos/new')} className="btn-primary mt-4">
                        Add Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container pb-24">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/app/pos/cart')} className="p-2 -ml-2 rounded-lg hover:bg-slate-100">
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="page-title">Checkout</h1>
                </div>
            </div>

            <div className="page-content space-y-6">
                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Order Summary */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-3">Order Summary</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                        <div className="flex justify-between">
                            <span>{cart.totals.itemCount} items</span>
                            <span>{formatCurrency(cart.totals.subtotal)}</span>
                        </div>
                        {cart.totals.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-{formatCurrency(cart.totals.discount)}</span>
                            </div>
                        )}
                        {cart.totals.tax > 0 && (
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{formatCurrency(cart.totals.tax)}</span>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between">
                        <span className="font-semibold text-slate-800">Total</span>
                        <span className="text-xl font-bold text-primary-600">
                            {formatCurrency(cart.totals.total)}
                        </span>
                    </div>
                </div>

                {/* Payment Method */}
                <PaymentSelector selected={paymentMode} onChange={setPaymentMode} />

                {/* Cash Amount */}
                {paymentMode === 'cash' && (
                    <div className="card">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Amount Received
                        </label>
                        <input
                            type="number"
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            placeholder={formatCurrency(cart.totals.total)}
                            className="input-field text-xl font-semibold text-center"
                        />

                        {Number(amountReceived) > 0 && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg flex justify-between items-center">
                                <span className="text-green-700 font-medium">Change</span>
                                <span className="text-xl font-bold text-green-600">
                                    {formatCurrency(change)}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirm Button */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-slate-200">
                <button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="w-full btn-success py-4 text-lg font-bold disabled:opacity-50"
                >
                    {loading ? <Loader size="small" /> : 'Confirm Payment'}
                </button>
            </div>
        </div>
    );
};

export default Checkout;
