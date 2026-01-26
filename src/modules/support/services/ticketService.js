/**
 * Ticket Service (Local Storage Version)
 * Fast, reliable, and secure local ticket management
 */

const TICKETS_KEY = 'zetta_support_tickets';
const TICKET_EVENT = 'zetta_ticket_update';

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

// --- Helpers ---
const getAllTicketsFromStorage = () => {
    try {
        const data = localStorage.getItem(TICKETS_KEY);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
};

const saveTickets = (tickets) => {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event(TICKET_EVENT));
};

// --- Service Methods ---

/**
 * Create a new support ticket
 */
export const createTicket = async (ticketData) => {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));

    const tickets = getAllTicketsFromStorage();
    const newTicket = {
        id: `ticket_${Date.now()}`,
        ...ticketData,
        status: TICKET_STATUS.OPEN,
        priority: ticketData.priority || PRIORITY.MEDIUM,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        messages: [] // Initialize messages array
    };

    tickets.unshift(newTicket);
    saveTickets(tickets);
    return newTicket;
};

/**
 * Get tickets by tenant ID (for users)
 */
export const getTicketsByTenant = async (tenantId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const tickets = getAllTicketsFromStorage();
    return tickets.filter(t => t.tenantId === tenantId);
};

/**
 * Get all tickets (admin only)
 */
export const getAllTickets = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getAllTicketsFromStorage();
};

/**
 * Get single ticket by ID
 */
export const getTicketById = async (ticketId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const tickets = getAllTicketsFromStorage();
    return tickets.find(t => t.id === ticketId) || null;
};

/**
 * Listen to tickets (Simulated for local storage)
 * In a real app this would use WebSocket/Firestore listener
 */
export const listenToTicketsByTenant = (tenantId, callback) => {
    const fetchAndReturn = () => {
        const tickets = getAllTicketsFromStorage().filter(t => t.tenantId === tenantId);
        callback(tickets);
    };

    fetchAndReturn();

    const handleUpdate = () => fetchAndReturn();
    window.addEventListener(TICKET_EVENT, handleUpdate);

    return () => {
        window.removeEventListener(TICKET_EVENT, handleUpdate);
    };
};

/**
 * Listen to all tickets (admin)
 */
export const listenToAllTickets = (callback) => {
    const fetchAndReturn = () => {
        const tickets = getAllTicketsFromStorage();
        callback(tickets);
    };

    fetchAndReturn();

    const handleUpdate = () => fetchAndReturn();
    window.addEventListener(TICKET_EVENT, handleUpdate);

    return () => {
        window.removeEventListener(TICKET_EVENT, handleUpdate);
    };
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (ticketId, status) => {
    const tickets = getAllTicketsFromStorage();
    const index = tickets.findIndex(t => t.id === ticketId);

    if (index !== -1) {
        tickets[index].status = status;
        tickets[index].updatedAt = new Date().toISOString();
        saveTickets(tickets);
        return tickets[index];
    }
    return null;
};

/**
 * Update request status (admin only)
 */
export const updateTicketPriority = async (ticketId, priority) => {
    const tickets = getAllTicketsFromStorage();
    const index = tickets.findIndex(t => t.id === ticketId);

    if (index !== -1) {
        tickets[index].priority = priority;
        tickets[index].updatedAt = new Date().toISOString();
        saveTickets(tickets);
        return tickets[index];
    }
    return null;
};

/**
 * Update last message timestamp
 */
export const updateLastMessageAt = async (ticketId) => {
    const tickets = getAllTicketsFromStorage();
    const index = tickets.findIndex(t => t.id === ticketId);

    if (index !== -1) {
        tickets[index].lastMessageAt = new Date().toISOString();
        tickets[index].updatedAt = new Date().toISOString();
        saveTickets(tickets);
        return tickets[index];
    }
    return null;
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
