import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useMessages } from '../hooks/useMessages';
import { useTicket } from '../hooks/useTickets';
import { sendMessage } from '../services/messageService';
import { uploadImage } from '../services/uploadService';
import MessageBubble from '../components/MessageBubble';
import StatusBadge from '../components/StatusBadge';
import Loader from '../../../shared/components/Loader';

const TicketChat = () => {
    const { id: ticketId } = useParams();
    const navigate = useNavigate();
    const { userId, userName, tenantId } = useAuth();

    const { ticket, loading: ticketLoading } = useTicket(ticketId);
    const { messages, loading: messagesLoading } = useMessages(ticketId);

    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [attachment, setAttachment] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() && !attachment) return;

        setSending(true);

        try {
            let attachments = [];

            // Upload attachment if exists
            if (attachment) {
                const url = await uploadImage(attachment, tenantId, ticketId);
                attachments = [url];
            }

            await sendMessage({
                ticketId,
                tenantId,
                senderId: userId,
                senderRole: 'user',
                senderName: userName,
                message: newMessage.trim(),
                attachments
            });

            setNewMessage('');
            setAttachment(null);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (ticketLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader text="Loading ticket..." />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <p className="text-slate-500 mb-4">Ticket not found</p>
                <button onClick={() => navigate('/app/support')} className="btn-primary">
                    Back to Tickets
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 safe-area-top">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/app/support')}
                        className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold text-slate-800 truncate">{ticket.title}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge status={ticket.status} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Initial ticket description */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-400 mb-2">Original Issue</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {messagesLoading ? (
                    <Loader size="small" text="Loading messages..." />
                ) : (
                    messages.map(msg => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwnMessage={msg.senderId === userId}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4 safe-area-bottom">
                {/* Attachment Preview */}
                {attachment && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-slate-100 rounded-lg">
                        <img
                            src={URL.createObjectURL(attachment)}
                            alt="Attachment"
                            className="w-12 h-12 object-cover rounded"
                        />
                        <span className="flex-1 text-sm text-slate-600 truncate">{attachment.name}</span>
                        <button
                            onClick={() => setAttachment(null)}
                            className="p-1 hover:bg-slate-200 rounded"
                        >
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    {/* Attach Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Message Input */}
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32"
                        rows={1}
                    />

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={sending || (!newMessage.trim() && !attachment)}
                        className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketChat;
