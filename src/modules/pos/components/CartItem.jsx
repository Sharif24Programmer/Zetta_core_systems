import QtyControl from './QtyControl';
import { formatCurrency } from '../services/billService';

const CartItem = ({ item, onIncrement, onDecrement, onRemove }) => {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
            {/* Item Details */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-800 truncate">{item.name}</h4>
                <p className="text-sm text-slate-500">
                    {formatCurrency(item.price)} × {item.qty}
                </p>
            </div>

            {/* Qty Control */}
            <QtyControl
                qty={item.qty}
                onIncrement={() => onIncrement(item.productId)}
                onDecrement={() => onDecrement(item.productId)}
                size="small"
            />

            {/* Total */}
            <div className="w-20 text-right">
                <span className="font-semibold text-slate-800">
                    {formatCurrency(item.total)}
                </span>
            </div>

            {/* Remove */}
            <button
                onClick={() => onRemove(item.productId)}
                className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
};

export default CartItem;
