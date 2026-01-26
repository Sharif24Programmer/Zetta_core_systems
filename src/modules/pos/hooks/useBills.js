import { useState, useEffect } from 'react';
import { listenToTodaysBills, getBills, getBillById, getTodaysStats } from '../services/billService';

/**
 * Hook to get today's bills
 */
export const useTodaysBills = (tenantId) => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = listenToTodaysBills(tenantId, (data) => {
            setBills(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tenantId]);

    return { bills, loading, error };
};

/**
 * Hook to get all bills (paginated)
 */
export const useBills = (tenantId, limit = 50) => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        const fetchBills = async () => {
            setLoading(true);
            try {
                const data = await getBills(tenantId, limit);
                setBills(data);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };

        fetchBills();
    }, [tenantId, limit]);

    const refresh = async () => {
        const data = await getBills(tenantId, limit);
        setBills(data);
    };

    return { bills, loading, error, refresh };
};

/**
 * Hook to get a single bill
 */
export const useBill = (billId) => {
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!billId) {
            setLoading(false);
            return;
        }

        const fetchBill = async () => {
            setLoading(true);
            try {
                const data = await getBillById(billId);
                setBill(data);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };

        fetchBill();
    }, [billId]);

    return { bill, loading, error };
};

/**
 * Hook for today's stats
 */
export const useTodaysStats = (tenantId) => {
    const [stats, setStats] = useState({ totalSales: 0, billCount: 0, averageTicket: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await getTodaysStats(tenantId);
                setStats(data);
            } catch (err) {
                console.error('Stats error:', err);
            }
            setLoading(false);
        };

        fetchStats();

        // Refresh stats every minute
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [tenantId]);

    return { stats, loading };
};
