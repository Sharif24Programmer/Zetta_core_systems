import { getExpiryStatus, formatExpiryDate } from '../services/batchService';

const ExpiryBadge = ({ expiryDate, showDate = true }) => {
    if (!expiryDate) return null;

    const batch = { expiryDate };
    const status = getExpiryStatus(batch);

    const statusConfig = {
        expired: {
            bgColor: 'bg-red-100',
            textColor: 'text-red-700',
            label: 'EXPIRED'
        },
        critical: {
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-700',
            label: 'Expires Soon'
        },
        warning: {
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-700',
            label: formatExpiryDate(expiryDate)
        },
        ok: {
            bgColor: 'bg-green-100',
            textColor: 'text-green-700',
            label: formatExpiryDate(expiryDate)
        }
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {status === 'expired' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            )}
            {config.label}
        </span>
    );
};

export default ExpiryBadge;
