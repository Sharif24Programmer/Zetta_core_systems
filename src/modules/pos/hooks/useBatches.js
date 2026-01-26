import { useState, useEffect } from 'react';
import { listenToBatches, getValidBatches } from '../services/batchService';

/**
 * Hook to get batches for a product
 */
export const useBatches = (productId) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) {
            setBatches([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = listenToBatches(productId, (data) => {
            setBatches(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [productId]);

    return { batches, loading };
};

/**
 * Hook to get valid (non-expired) batches
 */
export const useValidBatches = (productId) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) {
            setBatches([]);
            setLoading(false);
            return;
        }

        const fetch = async () => {
            setLoading(true);
            const data = await getValidBatches(productId);
            setBatches(data);
            setLoading(false);
        };

        fetch();
    }, [productId]);

    return { batches, loading };
};
