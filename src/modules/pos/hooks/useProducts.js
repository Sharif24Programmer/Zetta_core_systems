import { useState, useEffect } from 'react';
import { listenToProducts, getProducts, searchProducts } from '../services/productService';

/**
 * Hook to get and listen to products
 */
export const useProducts = (tenantId) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return { products, loading, error };
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
            try {
                const data = await searchProducts(tenantId, searchTerm);
                setResults(data);
            } catch (err) {
                console.error('Search error:', err);
                setResults([]);
            }
            setSearching(false);
        };

        // Debounce search
        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [tenantId, searchTerm]);

    return { results, searching };
};

/**
 * Hook to filter products by category
 */
export const useFilteredProducts = (products, category, searchTerm) => {
    const [filtered, setFiltered] = useState(products);

    useEffect(() => {
        let result = [...products];

        // Filter by category
        if (category && category !== 'All') {
            result = result.filter(p => p.category === category);
        }

        // Filter by search term
        if (searchTerm && searchTerm.length >= 2) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.barcode?.toLowerCase().includes(term)
            );
        }

        setFiltered(result);
    }, [products, category, searchTerm]);

    return filtered;
};
