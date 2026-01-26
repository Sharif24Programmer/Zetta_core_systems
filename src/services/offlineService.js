/**
 * Offline Service
 * Handles offline storage and sync for POS operations
 */

const DB_NAME = 'zetta_offline';
const DB_VERSION = 1;

let db = null;

/**
 * Initialize IndexedDB
 */
export const initOfflineDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('✅ Offline DB initialized');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Pending bills store (for offline checkout)
            if (!database.objectStoreNames.contains('pendingBills')) {
                const billStore = database.createObjectStore('pendingBills', { keyPath: 'localId' });
                billStore.createIndex('tenantId', 'tenantId', { unique: false });
                billStore.createIndex('createdAt', 'createdAt', { unique: false });
            }

            // Cart backup store
            if (!database.objectStoreNames.contains('cartBackup')) {
                database.createObjectStore('cartBackup', { keyPath: 'tenantId' });
            }

            // Products cache
            if (!database.objectStoreNames.contains('productsCache')) {
                const productStore = database.createObjectStore('productsCache', { keyPath: 'id' });
                productStore.createIndex('tenantId', 'tenantId', { unique: false });
            }
        };
    });
};

/**
 * Get database instance
 */
const getDB = async () => {
    if (!db) {
        await initOfflineDB();
    }
    return db;
};

/**
 * Save pending bill (for offline checkout)
 */
export const savePendingBill = async (billData) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['pendingBills'], 'readwrite');
        const store = transaction.objectStore('pendingBills');

        const localId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const bill = {
            ...billData,
            localId,
            status: 'pending_sync',
            createdAt: new Date().toISOString()
        };

        const request = store.add(bill);
        request.onsuccess = () => resolve({ localId, ...bill });
        request.onerror = () => reject(request.error);
    });
};

/**
 * Get all pending bills
 */
export const getPendingBills = async (tenantId) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['pendingBills'], 'readonly');
        const store = transaction.objectStore('pendingBills');
        const index = store.index('tenantId');
        const request = index.getAll(tenantId);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Remove synced bill
 */
export const removePendingBill = async (localId) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['pendingBills'], 'readwrite');
        const store = transaction.objectStore('pendingBills');
        const request = store.delete(localId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Save cart backup
 */
export const saveCartBackup = async (tenantId, cartData) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['cartBackup'], 'readwrite');
        const store = transaction.objectStore('cartBackup');

        const backup = {
            tenantId,
            cart: cartData,
            savedAt: new Date().toISOString()
        };

        const request = store.put(backup);
        request.onsuccess = () => resolve(backup);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Get cart backup
 */
export const getCartBackup = async (tenantId) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['cartBackup'], 'readonly');
        const store = transaction.objectStore('cartBackup');
        const request = store.get(tenantId);

        request.onsuccess = () => resolve(request.result?.cart || null);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Clear cart backup
 */
export const clearCartBackup = async (tenantId) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['cartBackup'], 'readwrite');
        const store = transaction.objectStore('cartBackup');
        const request = store.delete(tenantId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Cache products for offline access
 */
export const cacheProducts = async (tenantId, products) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['productsCache'], 'readwrite');
        const store = transaction.objectStore('productsCache');

        products.forEach(product => {
            store.put({ ...product, tenantId });
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

/**
 * Get cached products
 */
export const getCachedProducts = async (tenantId) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['productsCache'], 'readonly');
        const store = transaction.objectStore('productsCache');
        const index = store.index('tenantId');
        const request = index.getAll(tenantId);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Check if online
 */
export const isOnline = () => navigator.onLine;

/**
 * Listen to online/offline events
 */
export const onConnectionChange = (callback) => {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));

    // Return cleanup function
    return () => {
        window.removeEventListener('online', () => callback(true));
        window.removeEventListener('offline', () => callback(false));
    };
};
