import { useState, useEffect, useCallback } from 'react';
import {
    listenToProducts,
    getProducts,
    getInventoryStats,
    searchProducts,
    getLowStockProducts,
    getCategories
} from '../services/inventoryService';

/**
 * Hook to get all products with real-time updates
 */
export const useInventory = (tenantId) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = listenToProducts(tenantId, (data) => {
            setProducts(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tenantId]);

    // Load stats
    const loadStats = useCallback(async () => {
        if (!tenantId) return;
        const data = await getInventoryStats(tenantId);
        setStats(data);
    }, [tenantId]);

    useEffect(() => {
        loadStats();
    }, [products, loadStats]);

    return { products, stats, loading, refresh: loadStats };
};

/**
 * Hook for product search
 */
export const useProductSearch = (tenantId, searchTerm) => {
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!tenantId || !searchTerm || searchTerm.length < 2) {
            setResults([]);
            return;
        }

        const search = async () => {
            setSearching(true);
            const data = await searchProducts(tenantId, searchTerm);
            setResults(data);
            setSearching(false);
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [tenantId, searchTerm]);

    return { results, searching };
};

/**
 * Hook for low stock products
 */
export const useLowStock = (tenantId, threshold = 10) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        const fetch = async () => {
            setLoading(true);
            const data = await getLowStockProducts(tenantId, threshold);
            setProducts(data);
            setLoading(false);
        };

        fetch();
    }, [tenantId, threshold]);

    return { products, loading };
};

/**
 * Hook for categories
 */
export const useCategories = (tenantId) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        const fetch = async () => {
            setLoading(true);
            const data = await getCategories(tenantId);
            setCategories(data);
            setLoading(false);
        };

        fetch();
    }, [tenantId]);

    return { categories, loading };
};
