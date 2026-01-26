import QtyControl from './QtyControl';
import ExpiryBadge from './ExpiryBadge';
import { formatCurrency } from '../services/billService';

/**
 * Medical Cart Item - shows batch info and expiry
 */
const MedicalCartItem = ({ item, onIncrement, onDecrement, onRemove }) => {
    return (
        <div className="py-3 border-b border-slate-100 last:border-0">
            {/* Item Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                            Batch: {item.batchNo}
                        </span>
                        <ExpiryBadge expiryDate={item.expiryDate} />
                    </div>
                </div>

                <button
                    onClick={() => onRemove(item.productId, item.batchId)}
                    className="p-1 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Qty and Price */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <QtyControl
                        qty={item.qty}
                        onIncrement={() => onIncrement(item.productId, item.batchId)}
                        onDecrement={() => onDecrement(item.productId, item.batchId)}
                        size="small"
                    />
                    <span className="text-sm text-slate-500">
                        × {formatCurrency(item.price)}
                    </span>
                </div>

                <span className="font-semibold text-slate-800">
                    {formatCurrency(item.total)}
                </span>
            </div>

            {/* Max stock warning */}
            {item.qty >= item.maxQty && (
                <p className="text-xs text-orange-500 mt-1">
                    Max batch quantity reached
                </p>
            )}
        </div>
    );
};

export default MedicalCartItem;
