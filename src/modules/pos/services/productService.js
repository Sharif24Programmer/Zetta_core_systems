/**
 * POS Product Service
 * Uses shared stockSync for real-time stock data
 */

import {
    getAllProducts,
    getProductById as getProductFromStock,
    subscribeToStock,
    checkStockAvailability,
    getAvailableStock
} from '../../../shared/stockSync';

export const CATEGORIES = ['All', 'Medicine', 'Personal Care', 'First Aid', 'Nutrition', 'Equipment'];

/**
 * Check if in demo mode
 */
const isDemoMode = (tenantId) => {
    if (tenantId === 'demo_shop') return true;
    try {
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) return JSON.parse(demoUser).tenantId === 'demo_shop';
    } catch (e) { }
    return false;
};

/**
 * Get all products with stock info
 */
export const getProducts = async (tenantId) => {
    if (isDemoMode(tenantId)) {
        return getAllProducts();
    }
    // For real Firestore mode, implement actual query
    return getAllProducts();
};

/**
 * Subscribe to real-time product updates
 * @returns unsubscribe function
 */
export const listenToProducts = (tenantId, callback) => {
    if (isDemoMode(tenantId)) {
        return subscribeToStock(callback);
    }
    // Return the subscription
    return subscribeToStock(callback);
};

/**
 * Get single product with stock info
 */
export const getProductById = (productId) => {
    return getProductFromStock(productId);
};

/**
 * Check if product can be added to cart
 */
export const canAddToCart = (productId, requestedQty, currentCartQty = 0) => {
    return checkStockAvailability(productId, requestedQty, currentCartQty);
};

/**
 * Get current stock for product
 */
export const getProductStock = (productId) => {
    return getAvailableStock(productId);
};

/**
 * Filter products by category
 */
export const filterByCategory = (products, category) => {
    if (!category || category === 'All') return products;
    return products.filter(p => p.category === category);
};

/**
 * Search products
 */
export const searchProducts = (products, term) => {
    if (!term) return products;
    const lowerTerm = term.toLowerCase();
    return products.filter(p =>
        p.name?.toLowerCase().includes(lowerTerm) ||
        p.barcode?.includes(term) ||
        p.category?.toLowerCase().includes(lowerTerm)
    );
};
