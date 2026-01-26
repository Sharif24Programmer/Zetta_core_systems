import { useState, useCallback, useMemo } from 'react';

/**
 * Medical Cart item structure:
 * {
 *   productId: string,
 *   name: string,
 *   price: number,
 *   qty: number,
 *   total: number,
 *   batchId: string,        // Medical specific
 *   batchNo: string,        // Medical specific
 *   expiryDate: Date        // Medical specific
 * }
 */

/**
 * Extended cart hook for medical stores - supports batch tracking
 */
export const useMedicalCart = () => {
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('fixed');
    const [taxRate, setTaxRate] = useState(0);

    /**
     * Add item with batch info (medical specific)
     */
    const addItemWithBatch = useCallback((product, batchInfo) => {
        setItems(prev => {
            // Check if same product + same batch already in cart
            const existing = prev.find(
                i => i.productId === product.id && i.batchId === batchInfo.batchId
            );

            if (existing) {
                // Increase qty (but don't exceed batch stock)
                const newQty = Math.min(existing.qty + batchInfo.qty, batchInfo.maxQty);
                return prev.map(i =>
                    i.productId === product.id && i.batchId === batchInfo.batchId
                        ? { ...i, qty: newQty, total: newQty * i.price }
                        : i
                );
            }

            // Add new item with batch info
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: product.price,
                qty: batchInfo.qty,
                total: product.price * batchInfo.qty,
                batchId: batchInfo.batchId,
                batchNo: batchInfo.batchNo,
                expiryDate: batchInfo.expiryDate,
                maxQty: batchInfo.maxQty
            }];
        });
    }, []);

    /**
     * Update item quantity (respects batch max)
     */
    const updateQty = useCallback((productId, batchId, qty) => {
        if (qty <= 0) {
            removeItem(productId, batchId);
            return;
        }

        setItems(prev =>
            prev.map(i =>
                i.productId === productId && i.batchId === batchId
                    ? { ...i, qty: Math.min(qty, i.maxQty), total: Math.min(qty, i.maxQty) * i.price }
                    : i
            )
        );
    }, []);

    /**
     * Increment qty
     */
    const incrementQty = useCallback((productId, batchId) => {
        setItems(prev =>
            prev.map(i =>
                i.productId === productId && i.batchId === batchId
                    ? { ...i, qty: Math.min(i.qty + 1, i.maxQty), total: Math.min(i.qty + 1, i.maxQty) * i.price }
                    : i
            )
        );
    }, []);

    /**
     * Decrement qty
     */
    const decrementQty = useCallback((productId, batchId) => {
        setItems(prev => {
            const item = prev.find(i => i.productId === productId && i.batchId === batchId);
            if (!item) return prev;

            if (item.qty <= 1) {
                return prev.filter(i => !(i.productId === productId && i.batchId === batchId));
            }

            return prev.map(i =>
                i.productId === productId && i.batchId === batchId
                    ? { ...i, qty: i.qty - 1, total: (i.qty - 1) * i.price }
                    : i
            );
        });
    }, []);

    /**
     * Remove item by productId and batchId
     */
    const removeItem = useCallback((productId, batchId) => {
        setItems(prev => prev.filter(i => !(i.productId === productId && i.batchId === batchId)));
    }, []);

    /**
     * Clear cart
     */
    const clearCart = useCallback(() => {
        setItems([]);
        setDiscount(0);
        setDiscountType('fixed');
    }, []);

    /**
     * Calculate totals
     */
    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, i) => sum + i.total, 0);

        let discountAmount = 0;
        if (discountType === 'percent') {
            discountAmount = subtotal * (discount / 100);
        } else {
            discountAmount = discount;
        }

        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * taxRate;
        const total = afterDiscount + taxAmount;

        return {
            subtotal,
            discount: discountAmount,
            tax: taxAmount,
            total: Math.max(0, total),
            itemCount: items.reduce((sum, i) => sum + i.qty, 0)
        };
    }, [items, discount, discountType, taxRate]);

    const isEmpty = items.length === 0;

    return {
        items,
        discount,
        discountType,
        taxRate,
        totals,
        isEmpty,
        addItemWithBatch,
        updateQty,
        incrementQty,
        decrementQty,
        removeItem,
        clearCart,
        setDiscount,
        setDiscountType,
        setTaxRate
    };
};

export default useMedicalCart;
