import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../services/firebase'; // Corrected import

const TICKETS_COLLECTION = 'support_tickets';

// ... (Keep existing Enums)
export const TICKET_TYPES = {
    LOGIN: 'LOGIN',
    BILLING: 'BILLING',
    INVENTORY: 'INVENTORY',
    SUBSCRIPTION: 'SUBSCRIPTION',
    BUG: 'BUG',
    FEATURE_REQUEST: 'FEATURE_REQUEST',
    GENERAL: 'GENERAL'
};

export const TICKET_STATUS = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
};

export const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

// ... (Keep existing createTicket, getTicketsByTenant, getAllTickets, getTicketById)

/**
 * Create a new support ticket
 */
export const createTicket = async (ticketData) => {
    try {
        const newTicket = {
            ...ticketData,
            status: TICKET_STATUS.OPEN,
            priority: ticketData.priority || PRIORITY.MEDIUM,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessageAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, TICKETS_COLLECTION), newTicket);

        // Add initial message if provided
        if (ticketData.description) {
            await addMessage(docRef.id, {
                text: ticketData.description,
                sender: 'user', // or 'system'
                userId: ticketData.userId,
                userName: ticketData.userName
            });
        }

        return {
            id: docRef.id,
            ...ticketData
        };
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
    }
};

export const getTicketsByTenant = async (tenantId) => {
    try {
        const q = query(
            collection(db, TICKETS_COLLECTION),
            where('tenantId', '==', tenantId),
            orderBy('lastMessageAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting tickets by tenant:', error);
        throw error;
    }
};

export const getAllTickets = async () => {
    try {
        const q = query(
            collection(db, TICKETS_COLLECTION),
            orderBy('lastMessageAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting all tickets:', error);
        throw error;
    }
};

export const getTicketById = async (ticketId) => {
    try {
        const docRef = doc(db, TICKETS_COLLECTION, ticketId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error('Error getting ticket:', error);
        throw error;
    }
};

/**
 * Add a message to a ticket
 */
export const addMessage = async (ticketId, messageData) => {
    try {
        // 1. Add to sub-collection
        const messagesRef = collection(db, TICKETS_COLLECTION, ticketId, 'messages');
        await addDoc(messagesRef, {
            ...messageData,
            createdAt: serverTimestamp()
        });

        // 2. Update parent ticket
        const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
        await updateDoc(ticketRef, {
            updatedAt: serverTimestamp(),
            lastMessageAt: serverTimestamp(),
            lastMessagePreview: messageData.text.substring(0, 50) + (messageData.text.length > 50 ? '...' : ''),
            // If admin replies, set to waiting. If user replies, set to open/in_progress? 
            // For now let's handle status updates separately or let the UI decide.
        });
    } catch (error) {
        console.error('Error adding message:', error);
        throw error;
    }
};

/**
 * Subscribe to messages for a ticket
 */
export const subscribeToMessages = (ticketId, callback) => {
    const q = query(
        collection(db, TICKETS_COLLECTION, ticketId, 'messages'),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt // Keep as Timestamp for now, convert in UI
        }));
        callback(messages);
    });
};

// ... (Keep updateTicketStatus, updateTicketPriority, listenToTickets items)

export const updateTicketStatus = async (ticketId, status) => {
    try {
        const docRef = doc(db, TICKETS_COLLECTION, ticketId);
        await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
    }
};

export const updateTicketPriority = async (ticketId, priority) => {
    try {
        const docRef = doc(db, TICKETS_COLLECTION, ticketId);
        await updateDoc(docRef, { priority, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error('Error updating priority:', error);
        throw error;
    }
};

export const closeTicket = async (ticketId) => {
    try {
        await updateTicketStatus(ticketId, TICKET_STATUS.CLOSED);
    } catch (error) {
        console.error('Error closing ticket:', error);
        throw error;
    }
};

export const listenToTicketsByTenant = (tenantId, callback) => {
    const q = query(
        collection(db, TICKETS_COLLECTION),
        where('tenantId', '==', tenantId),
        orderBy('lastMessageAt', 'desc')
    );
    return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};

export const listenToAllTickets = (callback) => {
    const q = query(
        collection(db, TICKETS_COLLECTION),
        orderBy('lastMessageAt', 'desc')
    );
    return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};
