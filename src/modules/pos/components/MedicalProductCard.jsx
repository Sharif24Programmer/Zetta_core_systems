import { useState } from 'react';
import { formatCurrency } from '../services/billService';
import BatchSelector from './BatchSelector';

/**
 * Medical Product Card - extends base ProductCard with batch selection
 * Used when tenant.type === 'medical'
 */
const MedicalProductCard = ({ product, onAddWithBatch }) => {
    const [showBatchSelector, setShowBatchSelector] = useState(false);

    const hasStock = product.totalStock > 0;

    const handleClick = () => {
        if (hasStock) {
            setShowBatchSelector(true);
        }
    };

    const handleBatchSelect = (batchInfo) => {
        onAddWithBatch(product, batchInfo);
        setShowBatchSelector(false);
    };

    return (
        <>
            <div
                onClick={handleClick}
                className={`
          relative p-3 rounded-xl bg-white border-2 transition-all duration-150
          ${hasStock
                        ? 'border-slate-100 hover:border-primary-200 hover:shadow-md active:scale-95 cursor-pointer'
                        : 'border-slate-100 opacity-50 cursor-not-allowed'}
        `}
            >
                {/* Medicine Icon */}
                <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 002 4.5v11A2.5 2.5 0 004.5 18h11a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0015.5 2h-11zM10 6a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 0110 6z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Product Info */}
                <div className="mb-2 pr-5">
                    <h3 className="font-medium text-slate-800 text-sm leading-tight line-clamp-2">
                        {product.name}
                    </h3>
                    {product.genericName && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {product.genericName}
                        </p>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-600">
                        {formatCurrency(product.price)}
                    </span>

                    {/* Stock indicator */}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${!hasStock
                            ? 'bg-red-100 text-red-600'
                            : product.totalStock <= 10
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-green-100 text-green-600'
                        }`}>
                        {!hasStock ? 'Out' : product.totalStock}
                    </span>
                </div>

                {/* Batch count */}
                {product.batchCount > 1 && (
                    <p className="text-xs text-slate-400 mt-1">
                        {product.batchCount} batches available
                    </p>
                )}
            </div>

            {/* Batch Selector Modal */}
            {showBatchSelector && (
                <BatchSelector
                    productId={product.id}
                    productName={product.name}
                    onSelect={handleBatchSelect}
                    onClose={() => setShowBatchSelector(false)}
                />
            )}
        </>
    );
};

export default MedicalProductCard;
