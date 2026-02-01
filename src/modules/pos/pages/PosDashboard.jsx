import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useTodaysBills, useTodaysStats } from '../hooks/useBills';
import { formatCurrency, formatBillTime } from '../services/billService';
import Loader from '../../../shared/components/Loader';
import Skeleton, { ListSkeleton } from '../../../shared/components/Skeleton';

const PosDashboard = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();

    const { bills, loading: billsLoading } = useTodaysBills(tenantId);
    const { stats, loading: statsLoading } = useTodaysStats(tenantId);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Point of Sale</h1>
            </div>

            <div className="page-content">
                {/* New Bill Button */}
                <button
                    onClick={() => navigate('/app/pos/new')}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <span className="text-xl font-bold">New Bill</span>
                            <p className="text-sm text-white/80">Start selling</p>
                        </div>
                    </div>
                </button>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="card text-center flex flex-col items-center justify-center h-24">
                        {statsLoading ? (
                            <div className="w-full flex flex-col items-center gap-2">
                                <Skeleton variant="text" width="60%" height={24} />
                                <Skeleton variant="text" width="40%" height={16} />
                            </div>
                        ) : (
                            <>
                                <p className="text-2xl font-bold text-primary-600">
                                    {formatCurrency(stats.totalSales)}
                                </p>
                                <p className="text-sm text-slate-500">Today's Sales</p>
                            </>
                        )}
                    </div>
                    <div className="card text-center flex flex-col items-center justify-center h-24">
                        {statsLoading ? (
                            <div className="w-full flex flex-col items-center gap-2">
                                <Skeleton variant="text" width="40%" height={24} />
                                <Skeleton variant="text" width="40%" height={16} />
                            </div>
                        ) : (
                            <>
                                <p className="text-2xl font-bold text-slate-800">{stats.billCount}</p>
                                <p className="text-sm text-slate-500">Bills Today</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Recent Bills */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-slate-800">Recent Bills</h2>
                        <button
                            onClick={() => navigate('/app/pos/history')}
                            className="text-sm text-primary-500 font-medium"
                        >
                            View All
                        </button>
                    </div>

                    {billsLoading ? (
                        <ListSkeleton rows={3} />
                    ) : bills.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No bills yet today
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {bills.slice(0, 5).map(bill => (
                                <div
                                    key={bill.id}
                                    onClick={() => navigate(`/app/pos/bill/${bill.id}`)}
                                    className="card flex items-center justify-between cursor-pointer hover:border-primary-200 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            {bill.billNumber}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {formatBillTime(bill.createdAt)}
                                        </p>
                                    </div>
                                    <p className="font-bold text-primary-600">
                                        {formatCurrency(bill.total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PosDashboard;
