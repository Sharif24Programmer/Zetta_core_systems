import { useState, useEffect, useCallback } from 'react';
import {
    getAllTenants,
    getTenantStats,
    getAllUsers,
    getRevenueStats
} from '../services/adminService';

/**
 * Hook for tenant list
 */
export const useTenants = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllTenants();
            setTenants(data);
        } catch (err) {
            console.error('Error fetching tenants:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { tenants, loading, refresh: fetch };
};

/**
 * Hook for tenant stats
 */
export const useTenantStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getTenantStats();
                setStats(data);
            } catch (err) {
                console.error('Error fetching tenant stats:', err);
            }
            setLoading(false);
        };

        fetch();
    }, []);

    return { stats, loading };
};

/**
 * Hook for all users
 */
export const useAllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { users, loading, refresh: fetch };
};

/**
 * Hook for revenue stats
 */
export const useRevenueStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getRevenueStats();
                setStats(data);
            } catch (err) {
                console.error('Error fetching revenue stats:', err);
            }
            setLoading(false);
        };

        fetch();
    }, []);

    return { stats, loading };
};
