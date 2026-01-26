/**
 * Shared Stock Sync Module
 * Single source of truth for product stock across POS and Inventory modules
 */

// Central mock products store - shared between POS and Inventory
let centralProducts = [
    { id: 'p1', name: 'Paracetamol 500mg', price: 20, costPrice: 12, category: 'Personal Care', stock: 100, trackStock: true, isActive: true, barcode: '123456' },
    { id: 'p2', name: 'Vitamin C Tablets', price: 150, costPrice: 90, category: 'Medicine', stock: 50, trackStock: true, isActive: true, barcode: '789012' },
    { id: 'p3', name: 'Bandages Pack', price: 50, costPrice: 30, category: 'First Aid', stock: 8, trackStock: true, isActive: true, barcode: '345678' },
    { id: 'p4', name: 'Cough Syrup 100ml', price: 85, costPrice: 55, category: 'Medicine', stock: 30, trackStock: true, isActive: true, barcode: '901234' },
    { id: 'p5', name: 'Face Mask N95', price: 25, costPrice: 12, category: 'Personal Care', stock: 500, trackStock: true, isActive: true, barcode: '567890' },
    { id: 'p6', name: 'Hand Sanitizer 250ml', price: 120, costPrice: 70, category: 'Personal Care', stock: 0, trackStock: true, isActive: true, barcode: '112233' },
    { id: 'p7', name: 'Protein Bar', price: 60, costPrice: 40, category: 'Nutrition', stock: 45, trackStock: true, isActive: true, barcode: '445566' },
    { id: 'p8', name: 'Digital Thermometer', price: 350, costPrice: 200, category: 'Equipment', stock: 15, trackStock: true, isActive: true, barcode: '778899' },
];

// Subscribers for stock changes
let stockSubscribers = [];

/**
 * Notify all subscribers of stock change
 */
const notifySubscribers = () => {
    const products = getAllProducts();
    stockSubscribers.forEach(callback => {
        try {
            callback(products);
        } catch (e) {
            console.error('Stock subscriber error:', e);
        }
    });
};

/**
 * Subscribe to stock changes
 * @param {Function} callback - Called with updated products array
 * @returns {Function} Unsubscribe function
 */
export const subscribeToStock = (callback) => {
    stockSubscribers.push(callback);
    // Immediately call with current state
    callback(getAllProducts());
    return () => {
        stockSubscribers = stockSubscribers.filter(cb => cb !== callback);
    };
};

/**
 * Get all products with stock info
 */
export const getAllProducts = () => {
    return centralProducts.map(p => ({
        ...p,
        isOutOfStock: p.trackStock && p.stock <= 0,
        isLowStock: p.trackStock && p.stock > 0 && p.stock <= 10
    }));
};

/**
 * Get single product by ID
 */
export const getProductById = (productId) => {
    const product = centralProducts.find(p => p.id === productId);
    if (!product) return null;
    return {
        ...product,
        isOutOfStock: product.trackStock && product.stock <= 0,
        isLowStock: product.trackStock && product.stock > 0 && product.stock <= 10
    };
};

/**
 * Get available stock for a product
 */
export const getAvailableStock = (productId) => {
    const product = centralProducts.find(p => p.id === productId);
    if (!product || !product.trackStock) return Infinity;
    return product.stock;
};

/**
 * Check if can add quantity to cart
 * @returns {{ canAdd: boolean, availableQty: number, message?: string }}
 */
export const checkStockAvailability = (productId, requestedQty, currentCartQty = 0) => {
    const product = centralProducts.find(p => p.id === productId);

    if (!product) {
        return { canAdd: false, availableQty: 0, message: 'Product not found' };
    }

    if (!product.trackStock) {
        return { canAdd: true, availableQty: Infinity };
    }

    const availableStock = product.stock - currentCartQty;

    if (availableStock <= 0) {
        return { canAdd: false, availableQty: 0, message: `${product.name} is out of stock` };
    }

    if (requestedQty > availableStock) {
        return {
            canAdd: false,
            availableQty: availableStock,
            message: `Only ${availableStock} ${product.name} available`
        };
    }

    return { canAdd: true, availableQty: availableStock };
};

/**
 * Reduce stock after successful sale
 * @param {Array} items - Cart items with { productId, qty }
 */
export const reduceStockAfterSale = (items) => {
    let changes = [];

    items.forEach(item => {
        const productIndex = centralProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1 && centralProducts[productIndex].trackStock) {
            const oldStock = centralProducts[productIndex].stock;
            const newStock = Math.max(0, oldStock - item.qty);
            centralProducts[productIndex].stock = newStock;
            changes.push({
                productId: item.productId,
                productName: centralProducts[productIndex].name,
                oldStock,
                newStock,
                reduced: item.qty
            });
        }
    });

    if (changes.length > 0) {
        console.log('[Stock Sync] Stock reduced after sale:', changes);
        notifySubscribers();
    }

    return changes;
};

/**
 * Increase stock (for Stock In)
 */
export const increaseStock = (productId, quantity) => {
    const productIndex = centralProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) throw new Error('Product not found');

    const oldStock = centralProducts[productIndex].stock;
    centralProducts[productIndex].stock = oldStock + quantity;

    console.log('[Stock Sync] Stock increased:', {
        product: centralProducts[productIndex].name,
        oldStock,
        newStock: centralProducts[productIndex].stock
    });

    notifySubscribers();
    return { oldStock, newStock: centralProducts[productIndex].stock };
};

/**
 * Decrease stock (for Stock Out)
 */
export const decreaseStock = (productId, quantity) => {
    const productIndex = centralProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) throw new Error('Product not found');

    const oldStock = centralProducts[productIndex].stock;
    centralProducts[productIndex].stock = Math.max(0, oldStock - quantity);

    console.log('[Stock Sync] Stock decreased:', {
        product: centralProducts[productIndex].name,
        oldStock,
        newStock: centralProducts[productIndex].stock
    });

    notifySubscribers();
    return { oldStock, newStock: centralProducts[productIndex].stock };
};

/**
 * Set stock to specific value (for adjustments)
 */
export const setStock = (productId, newStock) => {
    const productIndex = centralProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) throw new Error('Product not found');

    const oldStock = centralProducts[productIndex].stock;
    centralProducts[productIndex].stock = Math.max(0, newStock);

    notifySubscribers();
    return { oldStock, newStock: centralProducts[productIndex].stock };
};

/**
 * Add new product
 */
export const addProduct = (productData) => {
    const newProduct = {
        id: `p${Date.now()}`,
        ...productData,
        stock: productData.stock || 0,
        trackStock: productData.trackStock !== false,
        isActive: true
    };
    centralProducts.push(newProduct);
    notifySubscribers();
    return newProduct;
};

/**
 * Update product
 */
export const updateProduct = (productId, updates) => {
    const productIndex = centralProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) throw new Error('Product not found');

    centralProducts[productIndex] = { ...centralProducts[productIndex], ...updates };
    notifySubscribers();
    return centralProducts[productIndex];
};

/**
 * Delete product (soft delete)
 */
export const deleteProduct = (productId) => {
    centralProducts = centralProducts.filter(p => p.id !== productId);
    notifySubscribers();
};

/**
 * Clear all products (for data reset)
 */
export const clearAllProducts = () => {
    centralProducts = [];
    notifySubscribers();
    console.log('[Stock Sync] All products cleared');
};

/**
 * Get inventory stats
 */
export const getInventoryStats = () => {
    const products = getAllProducts();
    const tracked = products.filter(p => p.trackStock);

    return {
        total: products.length,
        tracked: tracked.length,
        lowStock: tracked.filter(p => p.isLowStock).length,
        outOfStock: tracked.filter(p => p.isOutOfStock).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0),
        totalCostValue: products.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.stock || 0)), 0)
    };
};

export default {
    subscribeToStock,
    getAllProducts,
    getProductById,
    getAvailableStock,
    checkStockAvailability,
    reduceStockAfterSale,
    increaseStock,
    decreaseStock,
    setStock,
    addProduct,
    updateProduct,
    deleteProduct,
    clearAllProducts,
    getInventoryStats
};
