import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';

const Cart = () => {
    const navigate = useNavigate();
    const cart = useCartContext();

    if (cart.isEmpty) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/app/pos/new')}
                            className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
                        >
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="page-title">Cart</h1>
                    </div>
                </div>

                <div className="page-content">
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Cart is empty</h3>
                        <p className="text-slate-500 mb-4">Add products to start billing</p>
                        <button
                            onClick={() => navigate('/app/pos/new')}
                            className="btn-primary"
                        >
                            Add Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container pb-24">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/app/pos/new')}
                            className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
                        >
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="page-title">Cart ({cart.totals.itemCount})</h1>
                    </div>
                    <button
                        onClick={cart.clearCart}
                        className="text-sm text-red-500 font-medium"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            <div className="page-content">
                {/* Cart Items */}
                <div className="card mb-4">
                    {cart.items.map(item => (
                        <CartItem
                            key={item.productId}
                            item={item}
                            onIncrement={cart.incrementQty}
                            onDecrement={cart.decrementQty}
                            onRemove={cart.removeItem}
                        />
                    ))}
                </div>

                {/* Summary */}
                <CartSummary
                    totals={cart.totals}
                    discount={cart.discount}
                    discountType={cart.discountType}
                    onDiscountChange={cart.setDiscount}
                    onDiscountTypeChange={cart.setDiscountType}
                />
            </div>

            {/* Checkout Button */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-slate-200">
                <button
                    onClick={() => navigate('/app/pos/checkout')}
                    className="w-full btn-primary py-4 text-lg font-bold"
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default Cart;
