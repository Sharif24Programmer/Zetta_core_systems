import { useState, useMemo } from 'react';
import { useAllTickets } from '../hooks/useTickets';
import TicketCard from '../components/TicketCard';
import Loader from '../../../shared/components/Loader';
import { TICKET_STATUS, TICKET_TYPES, PRIORITY } from '../services/ticketService';

const statusTabs = [
    { key: 'all', label: 'All' },
    { key: TICKET_STATUS.OPEN, label: 'Open' },
    { key: TICKET_STATUS.IN_PROGRESS, label: 'In Progress' },
    { key: TICKET_STATUS.WAITING, label: 'Waiting' },
    { key: TICKET_STATUS.RESOLVED, label: 'Resolved' }
];

const AdminDashboard = () => {
    const { tickets, loading } = useAllTickets();

    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFilters] = useState({
        type: 'all',
        priority: 'all',
        search: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Filter tickets
    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            if (activeTab !== 'all' && ticket.status !== activeTab) return false;
            if (filters.type !== 'all' && ticket.type !== filters.type) return false;
            if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;

            if (filters.search) {
                const search = filters.search.toLowerCase();
                const matchesTitle = ticket.title?.toLowerCase().includes(search);
                const matchesTenant = ticket.tenantId?.toLowerCase().includes(search);
                if (!matchesTitle && !matchesTenant) return false;
            }

            return true;
        });
    }, [tickets, activeTab, filters]);

    // Stats
    const stats = useMemo(() => ({
        total: tickets.length,
        open: tickets.filter(t => t.status === TICKET_STATUS.OPEN).length,
        inProgress: tickets.filter(t => t.status === TICKET_STATUS.IN_PROGRESS).length,
        waiting: tickets.filter(t => t.status === TICKET_STATUS.WAITING).length
    }), [tickets]);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="page-title">Support Dashboard</h1>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-primary-100 text-primary-600' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-slate-100 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-slate-700">{stats.total}</p>
                        <p className="text-xs text-slate-500">Total</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-blue-700">{stats.open}</p>
                        <p className="text-xs text-blue-600">Open</p>
                    </div>
                    <div className="bg-yellow-100 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-yellow-700">{stats.inProgress}</p>
                        <p className="text-xs text-yellow-600">Progress</p>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-purple-700">{stats.waiting}</p>
                        <p className="text-xs text-purple-600">Waiting</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4">
                    {statusTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white border-b border-slate-200 p-4 space-y-3 animate-slideUp">
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="input-field"
                    />
                    <div className="flex gap-3">
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="input-field flex-1"
                        >
                            <option value="all">All Types</option>
                            {Object.entries(TICKET_TYPES).map(([key, value]) => (
                                <option key={key} value={value}>{key.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <select
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                            className="input-field flex-1"
                        >
                            <option value="all">All Priorities</option>
                            {Object.entries(PRIORITY).map(([key, value]) => (
                                <option key={key} value={value}>{key}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Tickets */}
            <div className="page-content">
                {loading ? (
                    <Loader text="Loading tickets..." />
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No tickets found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500">{filteredTickets.length} tickets</p>
                        {filteredTickets.map(ticket => (
                            <TicketCard key={ticket.id} ticket={ticket} isAdmin={true} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
