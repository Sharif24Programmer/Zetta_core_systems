import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getTenantStockLogs, formatStockChange } from '../services/stockLogService';
import Loader from '../../../shared/components/Loader';

const StockHistory = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'in', 'out'

    useEffect(() => {
        const loadLogs = async () => {
            if (!tenantId) return;
            setLoading(true);
            try {
                const data = await getTenantStockLogs(tenantId, 100);
                setLogs(data);
            } catch (err) {
                console.error('Error loading stock logs:', err);
            }
            setLoading(false);
        };

        loadLogs();
    }, [tenantId]);

    const filteredLogs = filter === 'all'
        ? logs
        : logs.filter(l => l.type === filter);

    const formatDate = (date) => {
        if (!date) return '-';
        const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="page-title">Stock History</h1>
                </div>
            </div>

            <div className="page-content">
                {/* Filter */}
                <div className="flex gap-2 mb-4">
                    {['all', 'in', 'out'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? f === 'in' ? 'bg-green-500 text-white'
                                        : f === 'out' ? 'bg-red-500 text-white'
                                            : 'bg-primary-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {f === 'all' ? 'All' : f === 'in' ? 'Stock In' : 'Stock Out'}
                        </button>
                    ))}
                </div>

                {/* Logs */}
                {loading ? (
                    <Loader text="Loading history..." />
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No stock history yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="card">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-800">{log.productName}</p>
                                        <p className="text-sm text-slate-500">{log.reason}</p>
                                        <p className="text-xs text-slate-400 mt-1">{formatDate(log.createdAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-lg font-bold ${log.type === 'in' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {formatStockChange(log)}
                                        </span>
                                        <p className="text-xs text-slate-500">
                                            {log.previousStock} → {log.newStock}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockHistory;
