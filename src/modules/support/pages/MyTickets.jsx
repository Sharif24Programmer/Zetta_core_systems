import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useTickets } from '../hooks/useTickets';
import TicketCard from '../components/TicketCard';
import Loader from '../../../shared/components/Loader';

const MyTickets = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { tickets, loading } = useTickets(tenantId);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <h1 className="page-title">My Support Tickets</h1>
                    <button
                        onClick={() => navigate('/app/support/new')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="page-content">
                {loading ? (
                    <Loader text="Loading tickets..." />
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No tickets yet</h3>
                        <p className="text-slate-500 mb-6">Create your first support ticket to get help</p>
                        <button
                            onClick={() => navigate('/app/support/new')}
                            className="btn-primary"
                        >
                            Create Ticket
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map(ticket => (
                            <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTickets;
