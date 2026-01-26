import { db } from '../../../services/firebase';
import { doc, runTransaction } from 'firebase/firestore';

/**
 * CRITICAL: Transaction-safe stock reduction
 * 
 * This function uses Firestore transactions to ensure:
 * 1. Stock is checked at transaction time (not stale data)
 * 2. All stock updates succeed or all fail (atomic)
 * 3. No overselling possible
 */

/**
 * Check if we're in demo mode
 */
const isDemoMode = () => {
    try {
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
            const parsed = JSON.parse(demoUser);
            return parsed.tenantId === 'demo_shop';
        }
    } catch (e) { }
    return false;
};

/**
 * Reduce stock for multiple items (after successful bill)
 * @param {Array} items - Cart items with { productId, qty }
 * @throws {Error} if any item has insufficient stock
 */
export const reduceStock = async (items) => {
    // Skip Firestore transaction in demo mode
    if (isDemoMode()) {
        console.log('[Demo Mode] Stock reduction simulated for:', items.map(i => i.name).join(', '));
        return;
    }

    await runTransaction(db, async (transaction) => {
        // First, read all products and validate stock
        const productRefs = [];
        const productData = [];

        for (const item of items) {
            const ref = doc(db, "products", item.productId);
            const snap = await transaction.get(ref);

            if (!snap.exists()) {
                throw new Error(`Product ${item.productId} not found`);
            }

            const data = snap.data();

            // Only check stock for trackStock items
            if (data.trackStock && data.stock < item.qty) {
                throw new Error(`Insufficient stock for ${data.name}. Available: ${data.stock}, Requested: ${item.qty}`);
            }

            productRefs.push(ref);
            productData.push({ ...data, trackStock: data.trackStock });
        }

        // All validations passed, now update stock
        for (let i = 0; i < items.length; i++) {
            if (productData[i].trackStock) {
                const newStock = productData[i].stock - items[i].qty;
                transaction.update(productRefs[i], { stock: newStock });
            }
        }
    });
};

/**
 * Increase stock (for returns/refunds)
 */
export const increaseStock = async (items) => {
    // Skip in demo mode
    if (isDemoMode()) {
        console.log('[Demo Mode] Stock increase simulated for:', items.map(i => i.name).join(', '));
        return;
    }

    await runTransaction(db, async (transaction) => {
        for (const item of items) {
            const ref = doc(db, "products", item.productId);
            const snap = await transaction.get(ref);

            if (snap.exists()) {
                const data = snap.data();
                if (data.trackStock) {
                    const newStock = (data.stock || 0) + item.qty;
                    transaction.update(ref, { stock: newStock });
                }
            }
        }
    });
};

/**
 * Update single product stock
 */
export const updateStock = async (productId, newStock) => {
    // Skip in demo mode
    if (isDemoMode() && (productId?.startsWith('p') || productId?.startsWith('demo'))) {
        console.log('[Demo Mode] Stock update simulated for:', productId);
        return;
    }

    await runTransaction(db, async (transaction) => {
        const ref = doc(db, "products", productId);
        const snap = await transaction.get(ref);

        if (!snap.exists()) {
            throw new Error('Product not found');
        }

        transaction.update(ref, { stock: newStock });
    });
};

/**
 * Validate cart stock before checkout
 * Returns { valid: boolean, errors: string[] }
 */
export const validateCartStock = async (items) => {
    // In demo mode, always return valid
    if (isDemoMode()) {
        console.log('[Demo Mode] Stock validation passed for:', items.map(i => i.name).join(', '));
        return { valid: true, errors: [] };
    }

    const errors = [];

    await runTransaction(db, async (transaction) => {
        for (const item of items) {
            const ref = doc(db, "products", item.productId);
            const snap = await transaction.get(ref);

            if (!snap.exists()) {
                errors.push(`${item.name} is no longer available`);
                continue;
            }

            const data = snap.data();

            if (data.trackStock && data.stock < item.qty) {
                errors.push(`${item.name}: Only ${data.stock} in stock, you have ${item.qty} in cart`);
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};
