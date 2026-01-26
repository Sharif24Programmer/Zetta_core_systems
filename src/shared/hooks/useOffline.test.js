import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useOffline from './useOffline';
import * as offlineService from '../../services/offlineService';

// Mock the offline service
vi.mock('../../services/offlineService', () => ({
    initOfflineDB: vi.fn(),
    isOnline: vi.fn(),
    onConnectionChange: vi.fn(),
    savePendingBill: vi.fn(),
    getPendingBills: vi.fn(),
    saveCartBackup: vi.fn(),
    getCartBackup: vi.fn(),
    clearCartBackup: vi.fn()
}));

describe('useOffline Hook', () => {
    const tenantId = 'tenant123';

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementations
        offlineService.initOfflineDB.mockResolvedValue(true);
        offlineService.isOnline.mockReturnValue(true);
        offlineService.onConnectionChange.mockImplementation((cb) => {
            return () => { }; // Cleanup function
        });
        offlineService.getPendingBills.mockResolvedValue([]);
    });

    it('should initialize correctly', async () => {
        const { result } = renderHook(() => useOffline(tenantId));

        expect(result.current.online).toBe(true);
        expect(result.current.initialized).toBe(false);

        await waitFor(() => {
            expect(result.current.initialized).toBe(true);
        });

        expect(offlineService.initOfflineDB).toHaveBeenCalled();
    });

    it('should handle connection changes', () => {
        let changeCallback;
        offlineService.onConnectionChange.mockImplementation((cb) => {
            changeCallback = cb;
            return () => { };
        });

        const { result } = renderHook(() => useOffline(tenantId));

        act(() => {
            changeCallback(false); // Go offline
        });

        expect(result.current.online).toBe(false);

        act(() => {
            changeCallback(true); // Go online
        });

        expect(result.current.online).toBe(true);
    });

    it('should save bill offline', async () => {
        offlineService.savePendingBill.mockResolvedValue({ id: 'local_1' });

        const { result } = renderHook(() => useOffline(tenantId));
        const billData = { total: 100 };

        await waitFor(() => expect(result.current.initialized).toBe(true));

        await act(async () => {
            await result.current.saveBillOffline(billData);
        });

        expect(offlineService.savePendingBill).toHaveBeenCalledWith({
            ...billData,
            tenantId
        });
        expect(result.current.pendingCount).toBe(1);
    });

    it('should cart backup operations call service methods', async () => {
        const { result } = renderHook(() => useOffline(tenantId));
        const cartData = { items: [] };

        await act(async () => {
            await result.current.backupCart(cartData);
        });
        expect(offlineService.saveCartBackup).toHaveBeenCalledWith(tenantId, cartData);

        await act(async () => {
            await result.current.restoreCart();
        });
        expect(offlineService.getCartBackup).toHaveBeenCalledWith(tenantId);

        await act(async () => {
            await result.current.clearCart();
        });
        expect(offlineService.clearCartBackup).toHaveBeenCalledWith(tenantId);
    });
});
