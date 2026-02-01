import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
// import { getTypeLabel } from '../services/ticketService'; // Missing export
import { TICKET_TYPES } from '../services/ticketService';

const getTypeLabel = (type) => {
    switch (type) {
        case TICKET_TYPES.LOGIN: return 'Login Issue';
        case TICKET_TYPES.BILLING: return 'Billing';
        case TICKET_TYPES.INVENTORY: return 'Inventory';
        case TICKET_TYPES.BUG: return 'Bug Report';
        case TICKET_TYPES.FEATURE_REQUEST: return 'Feature Request';
        default: return type?.replace(/_/g, ' ') || 'General';
    }
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TicketCard = ({ ticket, isAdmin = false }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (isAdmin) {
            navigate(`/app/admin/tickets/${ticket.id}`);
        } else {
            navigate(`/app/support/tickets/${ticket.id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="card cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-200 animate-fadeIn"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{ticket.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>
                </div>
                <StatusBadge status={ticket.status} />
            </div>

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {getTypeLabel(ticket.type)}
                </span>
                <PriorityBadge priority={ticket.priority} />
                <span className="text-xs text-slate-400 ml-auto">
                    {formatDate(ticket.updatedAt || ticket.createdAt)}
                </span>
            </div>

            {isAdmin && ticket.tenantId && (
                <div className="mt-2 text-xs text-slate-400">
                    Tenant: {ticket.tenantId}
                </div>
            )}
        </div>
    );
};

export default TicketCard;
