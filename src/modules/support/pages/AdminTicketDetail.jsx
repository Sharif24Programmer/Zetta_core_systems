import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useMessages } from '../hooks/useMessages';
import { useTicket } from '../hooks/useTickets';
import { sendMessage } from '../services/messageService';
import { uploadImage } from '../services/uploadService';
import { updateTicketStatus, updateTicketPriority, closeTicket, TICKET_STATUS, PRIORITY } from '../services/ticketService';
import MessageBubble from '../components/MessageBubble';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Loader from '../../../shared/components/Loader';

const AdminTicketDetail = () => {
    const { id: ticketId } = useParams();
    const navigate = useNavigate();
    const { userId, userName } = useAuth();

    const { ticket, loading: ticketLoading } = useTicket(ticketId);
    const { messages, loading: messagesLoading } = useMessages(ticketId);

    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() && !attachment) return;

        setSending(true);
        try {
            let attachments = [];
            if (attachment) {
                const url = await uploadImage(attachment, ticket.tenantId, ticketId);
                attachments = [url];
            }

            await sendMessage({
                ticketId,
                tenantId: ticket.tenantId,
                senderId: userId,
                senderRole: 'admin',
                senderName: userName || 'Support Team',
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

    const handleStatusChange = async (status) => {
        await updateTicketStatus(ticketId, status);
        setShowStatusMenu(false);
    };

    const handlePriorityChange = async (priority) => {
        await updateTicketPriority(ticketId, priority);
        setShowPriorityMenu(false);
    };

    const handleCloseTicket = async () => {
        if (window.confirm('Close this ticket?')) {
            await closeTicket(ticketId);
        }
    };

    if (ticketLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader text="Loading..." />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <p className="text-slate-500 mb-4">Ticket not found</p>
                <button onClick={() => navigate('/app/admin/support')} className="btn-primary">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/app/admin/support')}
                        className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold text-slate-800 truncate">{ticket.title}</h1>
                        <p className="text-xs text-slate-500">Tenant: {ticket.tenantId}</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 flex-wrap">
                {/* Status */}
                <div className="relative">
                    <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="flex items-center gap-1">
                        <StatusBadge status={ticket.status} />
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showStatusMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-50 min-w-[140px]">
                            {Object.entries(TICKET_STATUS).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(value)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${ticket.status === value ? 'bg-primary-50 text-primary-600' : ''}`}
                                >
                                    {key.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Priority */}
                <div className="relative">
                    <button onClick={() => setShowPriorityMenu(!showPriorityMenu)} className="flex items-center gap-1">
                        <PriorityBadge priority={ticket.priority} />
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showPriorityMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-50 min-w-[100px]">
                            {Object.entries(PRIORITY).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => handlePriorityChange(value)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${ticket.priority === value ? 'bg-primary-50 text-primary-600' : ''}`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {ticket.status !== TICKET_STATUS.CLOSED && (
                    <button onClick={handleCloseTicket} className="ml-auto text-sm text-red-500 font-medium">
                        Close Ticket
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-400 mb-2">Original Issue ({ticket.type})</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {messagesLoading ? (
                    <Loader size="small" />
                ) : (
                    messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderRole === 'admin'} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-200 p-4 safe-area-bottom">
                {attachment && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-slate-100 rounded-lg">
                        <img src={URL.createObjectURL(attachment)} alt="" className="w-12 h-12 object-cover rounded" />
                        <span className="flex-1 text-sm truncate">{attachment.name}</span>
                        <button onClick={() => setAttachment(null)} className="p-1">×</button>
                    </div>
                )}
                <div className="flex items-end gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full hover:bg-slate-100 text-slate-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setAttachment(e.target.files[0])} className="hidden" />
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 resize-none max-h-32"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || (!newMessage.trim() && !attachment)}
                        className="p-3 rounded-full bg-primary-500 text-white disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>

            {(showStatusMenu || showPriorityMenu) && (
                <div className="fixed inset-0 z-40" onClick={() => { setShowStatusMenu(false); setShowPriorityMenu(false); }} />
            )}
        </div>
    );
};

export default AdminTicketDetail;
