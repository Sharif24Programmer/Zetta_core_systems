import { useState, useEffect, useCallback } from 'react';
import {
    initOfflineDB,
    isOnline,
    onConnectionChange,
    savePendingBill,
    getPendingBills,
    saveCartBackup,
    getCartBackup,
    clearCartBackup
} from '../../services/offlineService';

/**
 * Hook for offline support
 */
export const useOffline = (tenantId) => {
    const [online, setOnline] = useState(isOnline());
    const [pendingCount, setPendingCount] = useState(0);
    const [initialized, setInitialized] = useState(false);

    // Initialize IndexedDB
    useEffect(() => {
        initOfflineDB().then(() => {
            setInitialized(true);
        }).catch(console.error);
    }, []);

    // Listen to connection changes
    useEffect(() => {
        const cleanup = onConnectionChange((status) => {
            setOnline(status);
        });
        return cleanup;
    }, []);

    // Fetch pending count
    useEffect(() => {
        if (!initialized || !tenantId) return;

        getPendingBills(tenantId).then(bills => {
            setPendingCount(bills.length);
        }).catch(console.error);
    }, [initialized, tenantId, online]);

    // Save bill when offline
    const saveBillOffline = useCallback(async (billData) => {
        if (!tenantId) return null;
        const result = await savePendingBill({ ...billData, tenantId });
        setPendingCount(prev => prev + 1);
        return result;
    }, [tenantId]);

    // Backup cart
    const backupCart = useCallback(async (cartData) => {
        if (!tenantId) return;
        await saveCartBackup(tenantId, cartData);
    }, [tenantId]);

    // Restore cart
    const restoreCart = useCallback(async () => {
        if (!tenantId) return null;
        return await getCartBackup(tenantId);
    }, [tenantId]);

    // Clear cart backup
    const clearCart = useCallback(async () => {
        if (!tenantId) return;
        await clearCartBackup(tenantId);
    }, [tenantId]);

    return {
        online,
        initialized,
        pendingCount,
        saveBillOffline,
        backupCart,
        restoreCart,
        clearCart
    };
};

export default useOffline;
