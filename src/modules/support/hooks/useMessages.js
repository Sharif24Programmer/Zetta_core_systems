import { useEffect, useState } from "react";
import { listenToMessages } from "../services/messageService";

/**
 * Hook to listen to messages for a specific ticket
 */
export const useMessages = (ticketId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ticketId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = listenToMessages(ticketId, (data) => {
            setMessages(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [ticketId]);

    return { messages, loading, error };
};
