/**
 * Inventory Service
 * Uses shared stockSync for real-time stock data
 * Supports Demo Mode (localStorage) and Production Mode (Firebase)
 */

import { db } from '../../../services/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDoc,
    limit
} from 'firebase/firestore';

import {
    getAllProducts,
    getProductById as getProductFromStock,
    subscribeToStock,
    getInventoryStats as getStatsFromStock,
    addProduct as addProductToStock,
    updateProduct as updateProductInStock,
    deleteProduct as deleteProductFromStock,
    increaseStock,
    decreaseStock,
    setStock
} from '../../../shared/stockSync';

import { isDemoMode, getDemoData, saveDemoData, generateDemoId } from '../../../core/demo/demoManager';

/**
 * Get all products for a tenant
 */
export const getProducts = async (tenantId, limitCount = 100) => {
    if (isDemoMode(tenantId)) {
        return getAllProducts();
    }

    const q = query(
        collection(db, "products"),
        where("tenantId", "==", tenantId),
        where("isActive", "==", true),
        orderBy("name", "asc"),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Listen to products with real-time updates
 */
export const listenToProducts = (tenantId, callback) => {
    if (isDemoMode(tenantId)) {
        // Use central stock store subscription
        return subscribeToStock(callback);
    }

    const q = query(
        collection(db, "products"),
        where("tenantId", "==", tenantId),
        where("isActive", "==", true),
        orderBy("name", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(products);
    }, (error) => {
        console.error("Error listening to products:", error);
        callback([]);
    });
};

/**
 * Get product by ID
 */
export const getProductById = async (productId) => {
    const demoProduct = getProductFromStock(productId);
    if (demoProduct) return demoProduct;

    const docRef = doc(db, "products", productId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
    }
    return null;
};

/**
 * Create product
 */
export const createProduct = async (productData) => {
    if (isDemoMode(productData.tenantId)) {
        return addProductToStock(productData);
    }

    const data = {
        ...productData,
        stock: productData.stock || 0,
        trackStock: productData.trackStock !== false,
        isActive: true,
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "products"), data);
    return { id: docRef.id, ...data };
};

/**
 * Update product
 */
export const updateProduct = async (productId, updates) => {
    const demoProduct = getProductFromStock(productId);
    if (demoProduct) {
        return updateProductInStock(productId, updates);
    }

    const docRef = doc(db, "products", productId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
};

/**
 * Delete product (soft delete)
 */
export const deleteProduct = async (productId) => {
    const demoProduct = getProductFromStock(productId);
    if (demoProduct) {
        return deleteProductFromStock(productId);
    }

    const docRef = doc(db, "products", productId);
    await updateDoc(docRef, { isActive: false });
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (tenantId, threshold = 10) => {
    if (isDemoMode(tenantId)) {
        return getAllProducts().filter(p => p.trackStock && p.stock > 0 && p.stock <= threshold);
    }

    const q = query(
        collection(db, "products"),
        where("tenantId", "==", tenantId),
        where("isActive", "==", true),
        where("trackStock", "==", true),
        where("stock", "<=", threshold),
        orderBy("stock", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Get out of stock products
 */
export const getOutOfStockProducts = async (tenantId) => {
    if (isDemoMode(tenantId)) {
        return getAllProducts().filter(p => p.trackStock && p.stock <= 0);
    }

    const q = query(
        collection(db, "products"),
        where("tenantId", "==", tenantId),
        where("isActive", "==", true),
        where("trackStock", "==", true),
        where("stock", "<=", 0)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Get inventory stats
 */
export const getInventoryStats = async (tenantId) => {
    if (isDemoMode(tenantId)) {
        return getStatsFromStock();
    }

    const products = await getProducts(tenantId);

    const tracked = products.filter(p => p.trackStock);
    const lowStock = tracked.filter(p => p.stock > 0 && p.stock <= 10);
    const outOfStock = tracked.filter(p => p.stock <= 0);

    return {
        total: products.length,
        tracked: tracked.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
        totalValue: products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0),
        totalCostValue: products.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.stock || 0)), 0)
    };
};

/**
 * Search products
 */
export const searchProducts = async (tenantId, term) => {
    const products = await getProducts(tenantId);
    const searchTerm = term.toLowerCase();

    return products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm) ||
        p.barcode?.includes(term) ||
        p.category?.toLowerCase().includes(searchTerm)
    );
};

/**
 * Get unique categories
 */
export const getCategories = async (tenantId) => {
    const products = await getProducts(tenantId);
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories.sort();
};

/**
 * Adjust stock (Stock In/Out)
 */
export const adjustStock = async (productId, adjustment, reason = '') => {
    const demoProduct = getProductFromStock(productId);
    if (demoProduct) {
        if (adjustment > 0) {
            return increaseStock(productId, adjustment);
        } else {
            return decreaseStock(productId, Math.abs(adjustment));
        }
    }

    const product = await getProductById(productId);
    if (!product) throw new Error('Product not found');

    const newStock = Math.max(0, (product.stock || 0) + adjustment);
    await updateProduct(productId, { stock: newStock });
};
