import { formatCurrency } from '../services/billService';

const CartSummary = ({
    totals,
    discount,
    discountType,
    onDiscountChange,
    onDiscountTypeChange,
    showDiscountInput = true
}) => {
    return (
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>

            {/* Discount Input */}
            {showDiscountInput && (
                <div className="flex items-center gap-2">
                    <span className="text-slate-600">Discount</span>
                    <div className="flex-1 flex gap-1">
                        <input
                            type="number"
                            value={discount || ''}
                            onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-right text-sm"
                        />
                        <select
                            value={discountType}
                            onChange={(e) => onDiscountTypeChange(e.target.value)}
                            className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
                        >
                            <option value="fixed">₹</option>
                            <option value="percent">%</option>
                        </select>
                    </div>
                    <span className="text-red-500 font-medium w-20 text-right">
                        -{formatCurrency(totals.discount)}
                    </span>
                </div>
            )}

            {/* Tax */}
            {totals.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span className="font-medium">{formatCurrency(totals.tax)}</span>
                </div>
            )}

            {/* Divider */}
            <div className="border-t border-slate-200 pt-3"></div>

            {/* Total */}
            <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-800">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(totals.total)}
                </span>
            </div>
        </div>
    );
};

export default CartSummary;
