// Simple time formatter since messageService is deprecated
const formatMessageTime = (date) => {
    if (!date) return '';
    try {
        // Handle Firestore Timestamp
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
};

const MessageBubble = ({ message, isOwnMessage }) => {
    const isAdmin = message.senderRole === 'admin';

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[80%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                {/* Sender name */}
                {!isOwnMessage && (
                    <div className="text-xs text-slate-500 mb-1 px-1">
                        {isAdmin ? '🛡️ Support' : message.senderName || 'User'}
                    </div>
                )}

                {/* Message bubble */}
                <div
                    className={`px-4 py-2.5 rounded-2xl ${isOwnMessage
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : isAdmin
                            ? 'bg-slate-700 text-white rounded-bl-md'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                        }`}
                >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {message.attachments.map((url, index) => (
                                <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <img
                                        src={url}
                                        alt={`Attachment ${index + 1}`}
                                        className="max-w-full rounded-lg max-h-48 object-cover"
                                    />
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                <div className={`text-xs text-slate-400 mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {formatMessageTime(message.createdAt)}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
