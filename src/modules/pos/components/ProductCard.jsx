import { formatCurrency } from '../services/billService';

const ProductCard = ({ product, qty = 0, onAdd }) => {
    const hasStock = !product.trackStock || product.stock > 0;
    const lowStock = product.trackStock && product.stock <= 5 && product.stock > 0;

    return (
        <div
            onClick={() => hasStock && onAdd(product)}
            className={`
        relative p-3 rounded-xl bg-white border-2 transition-all duration-150
        ${hasStock
                    ? 'border-slate-100 hover:border-primary-200 hover:shadow-md active:scale-95 cursor-pointer'
                    : 'border-slate-100 opacity-50 cursor-not-allowed'}
        ${qty > 0 ? 'border-primary-400 bg-primary-50' : ''}
      `}
        >
            {/* Qty Badge */}
            {qty > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {qty}
                </div>
            )}

            {/* Product Info */}
            <div className="mb-2">
                <h3 className="font-medium text-slate-800 text-sm leading-tight line-clamp-2">
                    {product.name}
                </h3>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
                <span className="font-bold text-primary-600">
                    {formatCurrency(product.price)}
                </span>

                {/* Stock indicator */}
                {product.trackStock && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${!hasStock
                            ? 'bg-red-100 text-red-600'
                            : lowStock
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-green-100 text-green-600'
                        }`}>
                        {!hasStock ? 'Out' : `${product.stock}`}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
