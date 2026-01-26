import { PRIORITY } from '../services/ticketService';

const priorityConfig = {
    [PRIORITY.LOW]: {
        label: 'Low',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-600'
    },
    [PRIORITY.MEDIUM]: {
        label: 'Medium',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700'
    },
    [PRIORITY.HIGH]: {
        label: 'High',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700'
    }
};

const PriorityBadge = ({ priority }) => {
    const config = priorityConfig[priority] || priorityConfig[PRIORITY.MEDIUM];

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
        </span>
    );
};

export default PriorityBadge;
