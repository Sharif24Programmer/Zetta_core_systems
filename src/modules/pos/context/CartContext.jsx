import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { checkStockAvailability, reduceStockAfterSale } from '../../../shared/stockSync';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'zetta_pos_cart';

export const useCartContext = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCartContext must be used within CartProvider');
    }
    return context;
};

/**
 * Load cart from localStorage
 */
const loadCartFromStorage = () => {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Validate expiry (cart expires after 4 hours of inactivity)
            if (parsed.timestamp && Date.now() - parsed.timestamp < 4 * 60 * 60 * 1000) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error loading cart from storage:', e);
    }
    return null;
};

/**
 * Save cart to localStorage
 */
const saveCartToStorage = (cart) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
            ...cart,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error('Error saving cart to storage:', e);
    }
};

/**
 * Cart Provider - Wraps POS routes to provide persistent cart state
 */
export const CartProvider = ({ children }) => {
    // Initialize from localStorage
    const storedCart = loadCartFromStorage();

    const [items, setItems] = useState(storedCart?.items || []);
    const [discount, setDiscount] = useState(storedCart?.discount || 0);
    const [discountType, setDiscountType] = useState(storedCart?.discountType || 'fixed');
    const [taxRate, setTaxRate] = useState(storedCart?.taxRate || 0);
    const [stockError, setStockError] = useState(null);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        saveCartToStorage({ items, discount, discountType, taxRate });
    }, [items, discount, discountType, taxRate]);

    /**
     * Clear stock error after 3 seconds
     */
    useEffect(() => {
        if (stockError) {
            const timer = setTimeout(() => setStockError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [stockError]);

    /**
     * Add item to cart (or increase qty if exists)
     * Validates stock before adding
     */
    const addItem = useCallback((product) => {
        setStockError(null);

        setItems(prev => {
            const existing = prev.find(i => i.productId === product.id);
            const currentQty = existing?.qty || 0;
            const requestedQty = 1;

            // Check stock availability
            const stockCheck = checkStockAvailability(product.id, requestedQty, currentQty);

            if (!stockCheck.canAdd) {
                // Set error message to display
                setStockError(stockCheck.message);
                return prev; // Return unchanged
            }

            if (existing) {
                return prev.map(i =>
                    i.productId === product.id
                        ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
                        : i
                );
            }

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
     * Update item quantity with stock validation
     */
    const updateQty = useCallback((productId, qty) => {
        if (qty <= 0) {
            setItems(prev => prev.filter(i => i.productId !== productId));
            return;
        }

        // Check stock availability for the new quantity
        const stockCheck = checkStockAvailability(productId, qty, 0);
        if (!stockCheck.canAdd && qty > stockCheck.availableQty) {
            setStockError(`Only ${stockCheck.availableQty} available`);
            qty = stockCheck.availableQty; // Cap at available
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
     * Increment item qty with stock validation
     */
    const incrementQty = useCallback((productId) => {
        setStockError(null);

        setItems(prev => {
            const item = prev.find(i => i.productId === productId);
            if (!item) return prev;

            const stockCheck = checkStockAvailability(productId, 1, item.qty);
            if (!stockCheck.canAdd) {
                setStockError(stockCheck.message);
                return prev;
            }

            return prev.map(i =>
                i.productId === productId
                    ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
                    : i
            );
        });
    }, []);

    /**
     * Decrement item qty
     */
    const decrementQty = useCallback((productId) => {
        setItems(prev => {
            const item = prev.find(i => i.productId === productId);
            if (!item) return prev;

            if (item.qty <= 1) {
                return prev.filter(i => i.productId !== productId);
            }

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
        setStockError(null);
        localStorage.removeItem(CART_STORAGE_KEY);
    }, []);

    /**
     * Complete sale - reduce stock and clear cart
     */
    const completeSale = useCallback(() => {
        if (items.length > 0) {
            // Reduce stock in central store
            const changes = reduceStockAfterSale(items);
            console.log('[Cart] Sale completed, stock reduced:', changes);
        }
        clearCart();
    }, [items, clearCart]);

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

    const value = {
        items,
        discount,
        discountType,
        taxRate,
        totals,
        isEmpty,
        stockError,
        addItem,
        updateQty,
        incrementQty,
        decrementQty,
        removeItem,
        clearCart,
        completeSale,
        getItemQty,
        setDiscount,
        setDiscountType,
        setTaxRate
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
