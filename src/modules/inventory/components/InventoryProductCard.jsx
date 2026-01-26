import { formatCurrency } from '../../pos/services/billService';

const InventoryProductCard = ({ product, onClick }) => {
    const getStockBadge = () => {
        if (!product.trackStock) {
            return <span className="text-xs text-slate-400">No tracking</span>;
        }

        if (product.stock <= 0) {
            return (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    Out of stock
                </span>
            );
        }

        if (product.stock <= 10) {
            return (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                    Low: {product.stock}
                </span>
            );
        }

        return (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                {product.stock} in stock
            </span>
        );
    };

    return (
        <div
            onClick={() => onClick?.(product)}
            className="card hover:border-primary-200 cursor-pointer transition-all active:scale-[0.98]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{product.name}</h3>
                    {product.category && (
                        <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>
                    )}
                </div>
                {getStockBadge()}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div>
                    <span className="text-sm text-slate-500">Price</span>
                    <p className="font-semibold text-slate-800">{formatCurrency(product.price)}</p>
                </div>
                {product.costPrice && (
                    <div className="text-right">
                        <span className="text-sm text-slate-500">Cost</span>
                        <p className="text-slate-600">{formatCurrency(product.costPrice)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryProductCard;
