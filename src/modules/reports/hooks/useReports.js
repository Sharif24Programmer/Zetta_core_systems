import { useState, useEffect, useCallback } from 'react';
import {
    getTodaySales,
    getWeekSales,
    getMonthSales,
    calculateStats,
    getTopProducts
} from '../services/reportsService';

/**
 * Hook for sales reports
 */
export const useSalesReport = (tenantId, period = 'month') => {
    const [bills, setBills] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let data;
            switch (period) {
                case 'today':
                    data = await getTodaySales(tenantId);
                    break;
                case 'week':
                    data = await getWeekSales(tenantId);
                    break;
                default:
                    data = await getMonthSales(tenantId);
            }

            setBills(data);
            setStats(calculateStats(data));
        } catch (err) {
            console.error('Error fetching sales report:', err);
        }
        setLoading(false);
    }, [tenantId, period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { bills, stats, loading, refresh: fetchData };
};

/**
 * Hook for top products
 */
export const useTopProducts = (tenantId, period = 'month', count = 10) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getTopProducts(tenantId, period, count);
                setProducts(data);
            } catch (err) {
                console.error('Error fetching top products:', err);
            }
            setLoading(false);
        };

        fetch();
    }, [tenantId, period, count]);

    return { products, loading };
};
