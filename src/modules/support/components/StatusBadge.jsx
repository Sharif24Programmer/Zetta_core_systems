import { TICKET_STATUS } from '../services/ticketService';

const statusConfig = {
    [TICKET_STATUS.OPEN]: {
        label: 'Open',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        dotColor: 'bg-blue-500'
    },
    [TICKET_STATUS.IN_PROGRESS]: {
        label: 'In Progress',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        dotColor: 'bg-yellow-500'
    },
    [TICKET_STATUS.WAITING]: {
        label: 'Waiting',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        dotColor: 'bg-purple-500'
    },
    [TICKET_STATUS.RESOLVED]: {
        label: 'Resolved',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        dotColor: 'bg-green-500'
    },
    [TICKET_STATUS.CLOSED]: {
        label: 'Closed',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-600',
        dotColor: 'bg-slate-400'
    }
};

const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig[TICKET_STATUS.OPEN];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
            {config.label}
        </span>
    );
};

export default StatusBadge;
