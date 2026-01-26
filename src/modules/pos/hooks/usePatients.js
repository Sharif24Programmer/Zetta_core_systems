import { useState, useEffect } from 'react';
import { listenToPatients, searchPatients, getRecentPatients } from '../services/patientService';

/**
 * Hook to get all patients
 */
export const usePatients = (tenantId) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = listenToPatients(tenantId, (data) => {
            setPatients(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tenantId]);

    return { patients, loading };
};

/**
 * Hook for patient search
 */
export const usePatientSearch = (tenantId, searchTerm) => {
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
                const data = await searchPatients(tenantId, searchTerm);
                setResults(data);
            } catch (err) {
                console.error('Patient search error:', err);
                setResults([]);
            }
            setSearching(false);
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [tenantId, searchTerm]);

    return { results, searching };
};

/**
 * Hook for recent patients
 */
export const useRecentPatients = (tenantId) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        const fetch = async () => {
            setLoading(true);
            const data = await getRecentPatients(tenantId);
            setPatients(data);
            setLoading(false);
        };

        fetch();
    }, [tenantId]);

    return { patients, loading };
};
