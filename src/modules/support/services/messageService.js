/**
 * Message Service (Local Storage Version)
 */

import { updateLastMessageAt } from './ticketService';

const MESSAGES_KEY = 'zetta_ticket_messages';
const MESSAGE_EVENT = 'zetta_message_update';

// --- Helpers ---
const getAllMessagesFromStorage = () => {
    try {
        const data = localStorage.getItem(MESSAGES_KEY);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
};

const saveMessages = (messages) => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    // Dispatch event for same-tab updates
    window.dispatchEvent(new Event(MESSAGE_EVENT));
};

/**
 * Send a message in a ticket
 */
export const sendMessage = async (messageData) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const messages = getAllMessagesFromStorage();

    const newMessage = {
        id: `msg_${Date.now()}`,
        ticketId: messageData.ticketId,
        tenantId: messageData.tenantId,
        senderId: messageData.senderId,
        senderRole: messageData.senderRole, // 'user' or 'admin'
        senderName: messageData.senderName || 'User',
        message: messageData.message,
        attachments: messageData.attachments || [],
        createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    saveMessages(messages);

    // Update the ticket's lastMessageAt
    await updateLastMessageAt(messageData.ticketId, messageData.senderRole);

    return newMessage;
};

/**
 * Listen to messages for a specific ticket in real-time
 */
export const listenToMessages = (ticketId, callback) => {
    const fetchAndReturn = () => {
        const messages = getAllMessagesFromStorage();
        const ticketMessages = messages
            .filter(m => m.ticketId === ticketId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        callback(ticketMessages);
    };

    // Initial fetch
    fetchAndReturn();

    // Listen for updates
    const handleUpdate = () => fetchAndReturn();
    window.addEventListener(MESSAGE_EVENT, handleUpdate);

    return () => {
        window.removeEventListener(MESSAGE_EVENT, handleUpdate);
    };
};

/**
 * Get formatted time from date
 */
export const formatMessageTime = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Invalid date

    const now = new Date();
    const diff = now - d;

    // Less than 1 minute
    if (diff < 60000) {
        return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return `${mins}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }

    // Same year
    if (d.getFullYear() === now.getFullYear()) {
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Different year
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
