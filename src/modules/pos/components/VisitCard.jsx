import { VISIT_STATUS } from '../services/visitService';

/**
 * Visit Card - displays visit summary for clinic queue
 */
const VisitCard = ({ visit, onClick }) => {
    const status = VISIT_STATUS[visit.status] || VISIT_STATUS.waiting;

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const statusColors = {
        yellow: 'bg-yellow-100 text-yellow-700',
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700'
    };

    return (
        <div
            onClick={onClick}
            className="card hover:border-primary-200 cursor-pointer transition-all"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Patient Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                            {visit.patientName?.charAt(0)?.toUpperCase() || 'P'}
                        </span>
                    </div>

                    {/* Patient Info */}
                    <div>
                        <p className="font-medium text-slate-800">
                            {visit.patientName || 'Walk-in Patient'}
                        </p>
                        <p className="text-sm text-slate-500">
                            {formatTime(visit.createdAt)}
                            {visit.chiefComplaint && (
                                <span className="ml-2 text-slate-400">• {visit.chiefComplaint}</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status.color]}`}>
                    {status.label}
                </span>
            </div>

            {/* Doctor (if assigned) */}
            {visit.doctorName && (
                <p className="text-xs text-slate-400 mt-2">
                    Dr. {visit.doctorName}
                </p>
            )}
        </div>
    );
};

export default VisitCard;
