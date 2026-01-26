import { useState, useEffect } from 'react';
import { listenToTodaysVisits, getPatientVisits } from '../services/visitService';

/**
 * Hook to get today's visits
 */
export const useTodaysVisits = (tenantId) => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = listenToTodaysVisits(tenantId, (data) => {
            setVisits(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tenantId]);

    // Calculate stats
    const stats = {
        total: visits.length,
        waiting: visits.filter(v => v.status === 'waiting').length,
        inProgress: visits.filter(v => v.status === 'in-progress').length,
        completed: visits.filter(v => v.status === 'completed').length
    };

    return { visits, stats, loading };
};

/**
 * Hook to get patient's visit history
 */
export const usePatientVisits = (patientId) => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!patientId) {
            setVisits([]);
            setLoading(false);
            return;
        }

        const fetch = async () => {
            setLoading(true);
            const data = await getPatientVisits(patientId);
            setVisits(data);
            setLoading(false);
        };

        fetch();
    }, [patientId]);

    return { visits, loading };
};
