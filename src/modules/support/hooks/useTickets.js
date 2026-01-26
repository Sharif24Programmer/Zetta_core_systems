import { useEffect, useState } from "react";
import { listenToTicketsByTenant, listenToAllTickets, getTicketById } from "../services/ticketService";

/**
 * Hook to fetch and listen to tickets for a specific tenant
 */
export const useTickets = (tenantId) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = listenToTicketsByTenant(tenantId, (data) => {
            setTickets(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tenantId]);

    return { tickets, loading, error };
};

/**
 * Hook to fetch and listen to all tickets (admin)
 */
export const useAllTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = listenToAllTickets((data) => {
            setTickets(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { tickets, loading, error };
};

/**
 * Hook to fetch a single ticket
 */
export const useTicket = (ticketId) => {
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ticketId) {
            setLoading(false);
            return;
        }

        const fetchTicket = async () => {
            try {
                setLoading(true);
                const data = await getTicketById(ticketId);
                setTicket(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [ticketId]);

    return { ticket, loading, error };
};
