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
    writeBatch
} from 'firebase/firestore';

/**
 * Batch Schema:
 * {
 *   productId: string,
 *   tenantId: string,
 *   batchNo: string,
 *   expiryDate: Date,
 *   manufactureDate?: Date,
 *   quantity: number,
 *   costPrice: number,
 *   supplierId?: string,
 *   supplierName?: string,
 *   isActive: boolean,
 *   createdAt: timestamp
 * }
 */

/**
 * Get all batches for a product
 */
export const getBatchesByProduct = async (productId) => {
    const q = query(
        collection(db, "batches"),
        where("productId", "==", productId),
        where("isActive", "==", true),
        where("quantity", ">", 0),
        orderBy("quantity", "desc"),
        orderBy("expiryDate", "asc") // FEFO - First Expiry First Out
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Get valid (non-expired) batches for a product
 */
export const getValidBatches = async (productId) => {
    const batches = await getBatchesByProduct(productId);
    const now = new Date();

    return batches.filter(batch => {
        const expiry = batch.expiryDate?.toDate?.() || new Date(batch.expiryDate);
        return expiry > now;
    });
};

/**
 * Check if batch is expired
 */
export const isExpired = (batch) => {
    if (!batch.expiryDate) return false;
    const expiry = batch.expiryDate?.toDate?.() || new Date(batch.expiryDate);
    return expiry <= new Date();
};

/**
 * Check if batch is expiring soon (within 30 days)
 */
export const isExpiringSoon = (batch, daysThreshold = 30) => {
    if (!batch.expiryDate) return false;
    const expiry = batch.expiryDate?.toDate?.() || new Date(batch.expiryDate);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);
    return expiry <= threshold && expiry > new Date();
};

/**
 * Get expiry status
 */
export const getExpiryStatus = (batch) => {
    if (isExpired(batch)) return 'expired';
    if (isExpiringSoon(batch, 7)) return 'critical'; // Within 7 days
    if (isExpiringSoon(batch, 30)) return 'warning'; // Within 30 days
    return 'ok';
};

/**
 * Format expiry date
 */
export const formatExpiryDate = (date) => {
    if (!date) return 'N/A';
    const d = date?.toDate?.() || new Date(date);
    return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
};

/**
 * Listen to batches for a product
 */
export const listenToBatches = (productId, callback) => {
    const q = query(
        collection(db, "batches"),
        where("productId", "==", productId),
        where("isActive", "==", true),
        orderBy("expiryDate", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const batches = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(batches);
    });
};

/**
 * Create a new batch
 */
export const createBatch = async (batchData) => {
    const data = {
        ...batchData,
        isActive: true,
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "batches"), data);
    return { id: docRef.id, ...data };
};

/**
 * Update batch quantity
 */
export const updateBatchQuantity = async (batchId, quantity) => {
    const docRef = doc(db, "batches", batchId);
    await updateDoc(docRef, { quantity });
};

/**
 * Reduce batch quantity (for sales)
 */
export const reduceBatchQuantity = async (batchId, qtyToReduce) => {
    const docRef = doc(db, "batches", batchId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
        throw new Error('Batch not found');
    }

    const currentQty = snap.data().quantity;
    if (currentQty < qtyToReduce) {
        throw new Error('Insufficient batch quantity');
    }

    await updateDoc(docRef, { quantity: currentQty - qtyToReduce });
};

/**
 * Validate cart items have valid batches
 */
export const validateMedicalCart = async (items) => {
    const errors = [];

    for (const item of items) {
        // Skip items without batch (non-medical products)
        if (!item.batchId) continue;

        const batch = await getDoc(doc(db, "batches", item.batchId));

        if (!batch.exists()) {
            errors.push(`Batch for ${item.name} not found`);
            continue;
        }

        const batchData = batch.data();

        // Check expiry
        if (isExpired(batchData)) {
            errors.push(`${item.name} (Batch: ${batchData.batchNo}) has expired`);
            continue;
        }

        // Check quantity
        if (batchData.quantity < item.qty) {
            errors.push(`${item.name} (Batch: ${batchData.batchNo}): Only ${batchData.quantity} available`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Get batch by ID
 */
export const getBatchById = async (batchId) => {
    const docRef = doc(db, "batches", batchId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
    }
    return null;
};
