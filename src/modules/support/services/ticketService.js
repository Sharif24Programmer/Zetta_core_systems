/**
 * Ticket Service (Firestore Version - SHARED ACROSS APPS)
 * This service is used by zetta-core, zetta-admin-panel, and zetta-support-system
 * Provides real-time ticket management with cross-app synchronization
 */

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
import { db } from '../../../core/firebase/config';

const TICKETS_COLLECTION = 'support_tickets';

// Ticket Types Enum
export const TICKET_TYPES = {
    LOGIN: 'LOGIN',
    BILLING: 'BILLING',
    INVENTORY: 'INVENTORY',
    SUBSCRIPTION: 'SUBSCRIPTION',
    BUG: 'BUG',
    FEATURE_REQUEST: 'FEATURE_REQUEST',
    GENERAL: 'GENERAL'
};

// Ticket Status Enum
export const TICKET_STATUS = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
};

// Priority Enum
export const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

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

        return {
            id: docRef.id,
            ...ticketData,
            status: TICKET_STATUS.OPEN,
            priority: ticketData.priority || PRIORITY.MEDIUM,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
    }
};

/**
 * Get tickets by tenant ID (for users)
 */
export const getTicketsByTenant = async (tenantId) => {
    try {
        const q = query(
            collection(db, TICKETS_COLLECTION),
            where('tenantId', '==', tenantId),
            orderBy('lastMessageAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
            lastMessageAt: doc.data().lastMessageAt?.toDate?.()?.toISOString() || doc.data().lastMessageAt
        }));
    } catch (error) {
        console.error('Error getting tickets by tenant:', error);
        throw error;
    }
};

/**
 * Get all tickets (admin only)
 */
export const getAllTickets = async () => {
    try {
        const q = query(
            collection(db, TICKETS_COLLECTION),
            orderBy('lastMessageAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
            lastMessageAt: doc.data().lastMessageAt?.toDate?.()?.toISOString() || doc.data().lastMessageAt
        }));
    } catch (error) {
        console.error('Error getting all tickets:', error);
        throw error;
    }
};

/**
 * Get single ticket by ID
 */
export const getTicketById = async (ticketId) => {
    try {
        const docRef = doc(db, TICKETS_COLLECTION, ticketId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt,
                updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt,
                lastMessageAt: docSnap.data().lastMessageAt?.toDate?.()?.toISOString() || docSnap.data().lastMessageAt
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting ticket:', error);
        throw error;
    }
};

/**
 * Listen to tickets by tenant (Real-time)
 */
export const listenToTicketsByTenant = (tenantId, callback) => {
    const q = query(
        collection(db, TICKETS_COLLECTION),
        where('tenantId', '==', tenantId),
        orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const tickets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
            lastMessageAt: doc.data().lastMessageAt?.toDate?.()?.toISOString() || doc.data().lastMessageAt
        }));
        callback(tickets);
    }, (error) => {
        console.error('Error listening to tickets:', error);
        callback([]);
    });
};

/**
 * Listen to all tickets (admin - Real-time)
 */
export const listenToAllTickets = (callback) => {
    const q = query(
        collection(db, TICKETS_COLLECTION),
        orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const tickets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
            lastMessageAt: doc.data().lastMessageAt?.toDate?.()?.toISOString() || doc.data().lastMessageAt
        }));
        callback(tickets);
    }, (error) => {
        console.error('Error listening to all tickets:', error);
        callback([]);
    });
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (ticketId, status) => {
    try {
        const docRef = doc(db, TICKETS_COLLECTION, ticketId);

        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp()
        });

        return await getTicketById(ticketId);
    } catch (error) {
        console.error('Error updating ticket status:', error);
        throw error;
    }
};

/**
 * Update ticket priority (admin only)
 */
export const updateTicketPriority = async (ticketId, priority) => {
    try {
        const docRef = doc(db, TICKETS_COLLECTION, ticketId);

        await updateDoc(docRef, {
            priority,
            updatedAt: serverTimestamp()
        });

        return await getTicketById(ticketId);
    } catch (error) {
        console.error('Error updating ticket priority:', error);
        throw error;
    }
};

/**
 * Update last message timestamp
 */
export const updateLastMessageAt = async (ticketId) => {
    try {
        const docRef = doc(db, TICKETS_COLLECTION, ticketId);

        await updateDoc(docRef, {
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return await getTicketById(ticketId);
    } catch (error) {
        console.error('Error updating last message time:', error);
        throw error;
    }
};

/**
 * Close ticket
 */
export const closeTicket = async (ticketId) => {
    return updateTicketStatus(ticketId, TICKET_STATUS.CLOSED);
};

/**
 * Get type label
 */
export const getTypeLabel = (type) => {
    const labels = {
        [TICKET_TYPES.LOGIN]: 'Login Issue',
        [TICKET_TYPES.BILLING]: 'Billing',
        [TICKET_TYPES.INVENTORY]: 'Inventory',
        [TICKET_TYPES.SUBSCRIPTION]: 'Subscription',
        [TICKET_TYPES.BUG]: 'Bug Report',
        [TICKET_TYPES.FEATURE_REQUEST]: 'Feature Request',
        [TICKET_TYPES.GENERAL]: 'General'
    };
    return labels[type] || type;
};
