import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TICKET_STATUS, PRIORITY, getTypeLabel } from '../services/ticketService';

const TicketItem = ({ ticket }) => {
    const navigate = useNavigate();

    const getStatusColor = (status) => {
        switch (status) {
            case TICKET_STATUS.OPEN: return 'bg-blue-50 text-blue-700';
            case TICKET_STATUS.IN_PROGRESS: return 'bg-amber-50 text-amber-700';
            case TICKET_STATUS.WAITING: return 'bg-purple-50 text-purple-700';
            case TICKET_STATUS.RESOLVED: return 'bg-emerald-50 text-emerald-700';
            case TICKET_STATUS.CLOSED: return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case PRIORITY.HIGH: return 'text-red-600 bg-red-50';
            case PRIORITY.MEDIUM: return 'text-amber-600 bg-amber-50';
            case PRIORITY.LOW: return 'text-slate-600 bg-slate-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    return (
        <div
            onClick={() => navigate(`/app/support/${ticket.id}`)}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2 ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                    </span>
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {ticket.subject}
                    </h3>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                </span>
            </div>

            <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                {ticket.lastMessagePreview || ticket.description}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                <span className="bg-slate-50 px-2 py-1 rounded">
                    {getTypeLabel(ticket.type)}
                </span>
                <span>
                    {ticket.lastMessageAt ? new Date(ticket.lastMessageAt).toLocaleDateString() : 'New'}
                </span>
            </div>
        </div>
    );
};

export default TicketItem;
