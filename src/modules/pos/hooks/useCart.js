import { useState, useCallback, useMemo } from 'react';

/**
 * Cart item structure:
 * {
 *   productId: string,
 *   name: string,
 *   price: number,
 *   qty: number,
 *   total: number
 * }
 */

/**
 * Core cart hook - manages cart state and operations
 */
export const useCart = () => {
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percent'
    const [taxRate, setTaxRate] = useState(0); // 0.18 = 18%

    /**
     * Add item to cart (or increase qty if exists)
     */
    const addItem = useCallback((product) => {
        setItems(prev => {
            const existing = prev.find(i => i.productId === product.id);

            if (existing) {
                // Increase qty
                return prev.map(i =>
                    i.productId === product.id
                        ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
                        : i
                );
            }

            // Add new item
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: product.price,
                qty: 1,
                total: product.price
            }];
        });
    }, []);

    /**
     * Update item quantity
     */
    const updateQty = useCallback((productId, qty) => {
        if (qty <= 0) {
            removeItem(productId);
            return;
        }

        setItems(prev =>
            prev.map(i =>
                i.productId === productId
                    ? { ...i, qty, total: qty * i.price }
                    : i
            )
        );
    }, []);

    /**
     * Increment item qty
     */
    const incrementQty = useCallback((productId) => {
        setItems(prev =>
            prev.map(i =>
                i.productId === productId
                    ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
                    : i
            )
        );
    }, []);

    /**
     * Decrement item qty
     */
    const decrementQty = useCallback((productId) => {
        setItems(prev => {
            const item = prev.find(i => i.productId === productId);
            if (!item) return prev;

            if (item.qty <= 1) {
                // Remove item
                return prev.filter(i => i.productId !== productId);
            }

            // Decrease qty
            return prev.map(i =>
                i.productId === productId
                    ? { ...i, qty: i.qty - 1, total: (i.qty - 1) * i.price }
                    : i
            );
        });
    }, []);

    /**
     * Remove item from cart
     */
    const removeItem = useCallback((productId) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
    }, []);

    /**
     * Clear entire cart
     */
    const clearCart = useCallback(() => {
        setItems([]);
        setDiscount(0);
        setDiscountType('fixed');
    }, []);

    /**
     * Get item qty (for display in product grid)
     */
    const getItemQty = useCallback((productId) => {
        const item = items.find(i => i.productId === productId);
        return item?.qty || 0;
    }, [items]);

    /**
     * Calculate totals
     */
    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, i) => sum + i.total, 0);

        // Calculate discount
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

    /**
     * Check if cart is empty
     */
    const isEmpty = items.length === 0;

    return {
        // State
        items,
        discount,
        discountType,
        taxRate,
        totals,
        isEmpty,

        // Actions
        addItem,
        updateQty,
        incrementQty,
        decrementQty,
        removeItem,
        clearCart,
        getItemQty,
        setDiscount,
        setDiscountType,
        setTaxRate
    };
};

export default useCart;
