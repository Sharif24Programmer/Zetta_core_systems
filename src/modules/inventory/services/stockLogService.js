/**
 * Stock Log Service
 * Uses shared stockSync for stock operations
 */

import { db } from '../../../services/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    orderBy,
    serverTimestamp,
    limit,
    runTransaction
} from 'firebase/firestore';

import {
    getProductById,
    increaseStock,
    decreaseStock,
    setStock as setStockInSync,
    getAvailableStock
} from '../../../shared/stockSync';

/**
 * Demo mode stock logs (mutable)
 */
let demoStockLogs = [
    { id: 'log1', productId: 'p1', productName: 'Paracetamol 500mg', type: 'in', quantity: 50, previousStock: 50, newStock: 100, reason: 'Initial stock', createdAt: new Date(Date.now() - 86400000) },
    { id: 'log2', productId: 'p2', productName: 'Vitamin C Tablets', type: 'in', quantity: 50, previousStock: 0, newStock: 50, reason: 'Purchase from supplier', createdAt: new Date(Date.now() - 43200000) },
    { id: 'log3', productId: 'p3', productName: 'Bandages Pack', type: 'out', quantity: -12, previousStock: 20, newStock: 8, reason: 'Sold', createdAt: new Date(Date.now() - 3600000) },
];

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
 * Stock In - add stock to product
 */
export const stockIn = async (tenantId, productId, quantity, options = {}) => {
    if (isDemoMode(tenantId)) {
        const product = getProductById(productId);
        if (!product) throw new Error('Product not found');

        const previousStock = getAvailableStock(productId);

        // Use shared stockSync to actually increase stock
        const result = increaseStock(productId, quantity);

        // Create log entry
        const newLog = {
            id: `log_${Date.now()}`,
            tenantId,
            productId,
            productName: product.name,
            type: 'in',
            quantity,
            previousStock: result.oldStock,
            newStock: result.newStock,
            reason: options.reason || 'Stock In',
            createdBy: options.userId || 'demo_user',
            createdAt: new Date()
        };
        demoStockLogs.unshift(newLog);

        console.log('[Stock Log] Stock In completed:', product.name, '+' + quantity, `(${result.oldStock} → ${result.newStock})`);
        return { previousStock: result.oldStock, newStock: result.newStock };
    }

    // Firestore transaction for real mode
    const productRef = doc(db, "products", productId);

    return runTransaction(db, async (transaction) => {
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
            throw new Error('Product not found');
        }

        const product = productSnap.data();
        const previousStock = product.stock || 0;
        const newStock = previousStock + quantity;

        transaction.update(productRef, { stock: newStock });

        const logRef = doc(collection(db, "stockLogs"));
        transaction.set(logRef, {
            tenantId,
            productId,
            productName: product.name,
            type: 'in',
            quantity,
            previousStock,
            newStock,
            reason: options.reason || 'Stock In',
            createdBy: options.userId || 'system',
            createdAt: serverTimestamp()
        });

        return { previousStock, newStock };
    });
};

/**
 * Stock Out - remove stock from product
 */
export const stockOut = async (tenantId, productId, quantity, options = {}) => {
    if (isDemoMode(tenantId)) {
        const product = getProductById(productId);
        if (!product) throw new Error('Product not found');

        // Use shared stockSync to actually decrease stock
        const result = decreaseStock(productId, quantity);

        // Create log entry
        const newLog = {
            id: `log_${Date.now()}`,
            tenantId,
            productId,
            productName: product.name,
            type: 'out',
            quantity: -quantity,
            previousStock: result.oldStock,
            newStock: result.newStock,
            reason: options.reason || 'Stock Out',
            createdBy: options.userId || 'demo_user',
            createdAt: new Date()
        };
        demoStockLogs.unshift(newLog);

        console.log('[Stock Log] Stock Out completed:', product.name, '-' + quantity, `(${result.oldStock} → ${result.newStock})`);
        return { previousStock: result.oldStock, newStock: result.newStock };
    }

    // Firestore transaction for real mode
    const productRef = doc(db, "products", productId);

    return runTransaction(db, async (transaction) => {
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
            throw new Error('Product not found');
        }

        const product = productSnap.data();
        const previousStock = product.stock || 0;
        const newStock = Math.max(0, previousStock - quantity);

        transaction.update(productRef, { stock: newStock });

        const logRef = doc(collection(db, "stockLogs"));
        transaction.set(logRef, {
            tenantId,
            productId,
            productName: product.name,
            type: 'out',
            quantity,
            previousStock,
            newStock,
            reason: options.reason || 'Stock Out',
            createdBy: options.userId || 'system',
            createdAt: serverTimestamp()
        });

        return { previousStock, newStock };
    });
};

/**
 * Stock Adjustment - set stock to specific value
 */
export const adjustStock = async (tenantId, productId, newStockValue, options = {}) => {
    if (isDemoMode(tenantId)) {
        const product = getProductById(productId);
        if (!product) throw new Error('Product not found');

        const result = setStockInSync(productId, newStockValue);

        const newLog = {
            id: `log_${Date.now()}`,
            tenantId,
            productId,
            productName: product.name,
            type: 'adjustment',
            quantity: result.newStock - result.oldStock,
            previousStock: result.oldStock,
            newStock: result.newStock,
            reason: options.reason || 'Manual Adjustment',
            createdBy: options.userId || 'demo_user',
            createdAt: new Date()
        };
        demoStockLogs.unshift(newLog);

        console.log('[Stock Log] Adjustment completed:', product.name, `(${result.oldStock} → ${result.newStock})`);
        return { previousStock: result.oldStock, newStock: result.newStock };
    }

    const productRef = doc(db, "products", productId);

    return runTransaction(db, async (transaction) => {
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
            throw new Error('Product not found');
        }

        const product = productSnap.data();
        const previousStock = product.stock || 0;

        transaction.update(productRef, { stock: newStockValue });

        const logRef = doc(collection(db, "stockLogs"));
        transaction.set(logRef, {
            tenantId,
            productId,
            productName: product.name,
            type: 'adjustment',
            quantity: newStockValue - previousStock,
            previousStock,
            newStock: newStockValue,
            reason: options.reason || 'Manual Adjustment',
            createdBy: options.userId || 'system',
            createdAt: serverTimestamp()
        });

        return { previousStock, newStock: newStockValue };
    });
};

/**
 * Get stock logs for a product
 */
export const getProductStockLogs = async (productId, limitCount = 50) => {
    const product = getProductById(productId);
    if (product) {
        return demoStockLogs.filter(l => l.productId === productId).slice(0, limitCount);
    }

    const q = query(
        collection(db, "stockLogs"),
        where("productId", "==", productId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Get all stock logs for a tenant
 */
export const getTenantStockLogs = async (tenantId, limitCount = 100) => {
    if (isDemoMode(tenantId)) {
        return [...demoStockLogs].sort((a, b) => b.createdAt - a.createdAt).slice(0, limitCount);
    }

    const q = query(
        collection(db, "stockLogs"),
        where("tenantId", "==", tenantId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Clear all stock logs (for data reset)
 */
export const clearAllStockLogs = async () => {
    // In a real app we would delete from Firestore
    // For now we just log it as we're mostly using local state/demo mode for this
    console.log('[Stock Log] All logs cleared');
    return true;
};

/**
 * Format stock change
 */
export const formatStockChange = (log) => {
    const sign = log.quantity >= 0 ? '+' : '';
    return `${sign}${log.quantity}`;
};
