import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useSalesReport, useTopProducts } from '../hooks/useReports';
import { formatCurrency, formatPercentage } from '../services/reportsService';
import { getExpenseSummary, getCategoryLabel, EXPENSE_CATEGORIES } from '../../../shared/services/expenseService';
import { exportBillsToExcel } from '../../../shared/services/exportService';
import Loader from '../../../shared/components/Loader';

const PERIODS = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
];

// Icon components
const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const TrendUpIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const TrendDownIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
);

const ReportsDashboard = () => {
    const { tenantId } = useAuth();
    const [period, setPeriod] = useState('month');
    const [expenseSummary, setExpenseSummary] = useState(null);

    const { stats, bills, loading } = useSalesReport(tenantId, period);
    const { products: topProducts, loading: loadingProducts } = useTopProducts(tenantId, period, 5);

    // Fetch expense summary
    useEffect(() => {
        if (tenantId) {
            const summary = getExpenseSummary(tenantId, period);
            setExpenseSummary(summary);
        }
    }, [tenantId, period]);

    // Calculate profit
    const revenue = stats?.totalRevenue || 0;
    const expenses = expenseSummary?.total || 0;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Handle export
    const handleExport = () => {
        if (bills && bills.length > 0) {
            exportBillsToExcel(bills);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-slate-900">Reports</h1>
                    <button
                        onClick={handleExport}
                        disabled={!bills || bills.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon />
                        Export
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Period Selector */}
                <div className="flex gap-2">
                    {PERIODS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${period === p.id
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <Loader text="Loading reports..." />
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Revenue */}
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                                <p className="text-xs text-emerald-100 uppercase tracking-wide">Revenue</p>
                                <p className="text-xl font-bold mt-1">{formatCurrency(revenue)}</p>
                                <div className="flex items-center gap-1 mt-2 text-emerald-100 text-xs">
                                    <TrendUpIcon />
                                    <span>{stats?.totalBills || 0} bills</span>
                                </div>
                            </div>

                            {/* Expenses */}
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                                <p className="text-xs text-red-100 uppercase tracking-wide">Expenses</p>
                                <p className="text-xl font-bold mt-1">{formatCurrency(expenses)}</p>
                                <div className="flex items-center gap-1 mt-2 text-red-100 text-xs">
                                    <TrendDownIcon />
                                    <span>{expenseSummary?.count || 0} entries</span>
                                </div>
                            </div>

                            {/* Profit */}
                            <div className={`rounded-xl p-4 text-white ${profit >= 0
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                    : 'bg-gradient-to-br from-orange-500 to-orange-600'
                                }`}>
                                <p className="text-xs opacity-80 uppercase tracking-wide">
                                    {profit >= 0 ? 'Profit' : 'Loss'}
                                </p>
                                <p className="text-xl font-bold mt-1">{formatCurrency(Math.abs(profit))}</p>
                                <div className="flex items-center gap-1 mt-2 opacity-80 text-xs">
                                    {profit >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
                                    <span>{profitMargin.toFixed(1)}% margin</span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Sales Chart */}
                        {stats?.dailyData && stats.dailyData.length > 0 && (
                            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Daily Sales</h2>
                                </div>
                                <div className="p-4 space-y-2">
                                    {stats.dailyData.slice(-7).map(day => {
                                        const maxRevenue = Math.max(...stats.dailyData.map(d => d.revenue));
                                        const width = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

                                        return (
                                            <div key={day.date} className="flex items-center gap-3">
                                                <span className="text-xs text-slate-500 w-14 flex-shrink-0">
                                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                                </span>
                                                <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full flex items-center justify-end px-2 transition-all duration-300"
                                                        style={{ width: `${Math.max(width, 10)}%` }}
                                                    >
                                                        <span className="text-xs text-white font-medium">
                                                            {formatCurrency(day.revenue)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Expense Breakdown */}
                        {expenseSummary && expenseSummary.total > 0 && (
                            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Expense Breakdown</h2>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3">
                                        {Object.entries(expenseSummary.byCategory).map(([category, amount]) => {
                                            const percentage = (amount / expenseSummary.total) * 100;
                                            const colors = {
                                                [EXPENSE_CATEGORIES.INVOICE]: 'bg-purple-500',
                                                [EXPENSE_CATEGORIES.STAFF]: 'bg-blue-500',
                                                [EXPENSE_CATEGORIES.RENT]: 'bg-orange-500',
                                                [EXPENSE_CATEGORIES.UTILITIES]: 'bg-yellow-500',
                                                [EXPENSE_CATEGORIES.OTHER]: 'bg-slate-500'
                                            };

                                            return (
                                                <div key={category} className="flex items-center gap-3">
                                                    <span className={`w-3 h-3 rounded-full ${colors[category] || 'bg-slate-400'}`}></span>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-medium text-slate-700">{getCategoryLabel(category)}</span>
                                                            <span className="text-slate-600">{formatCurrency(amount)}</span>
                                                        </div>
                                                        <div className="mt-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${colors[category] || 'bg-slate-400'}`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-slate-500 w-12 text-right">{percentage.toFixed(0)}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Payment Modes */}
                        {stats?.byPaymentMode && Object.keys(stats.byPaymentMode).length > 0 && (
                            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Payment Methods</h2>
                                </div>
                                <div className="p-4 grid grid-cols-3 gap-3">
                                    {Object.entries(stats.byPaymentMode).map(([mode, amount]) => (
                                        <div key={mode} className="text-center p-3 bg-slate-50 rounded-lg">
                                            <p className="text-lg font-bold text-slate-800">{formatPercentage(amount, revenue)}</p>
                                            <p className="text-xs text-slate-500 capitalize mt-1">{mode}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Top Products */}
                        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Top Selling Products</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {loadingProducts ? (
                                    <div className="p-4"><Loader size="small" /></div>
                                ) : topProducts.length === 0 ? (
                                    <p className="p-4 text-slate-500 text-sm">No products sold in this period</p>
                                ) : (
                                    topProducts.map((product, index) => (
                                        <div key={product.productId || index} className="p-4 flex items-center gap-3">
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-slate-200 text-slate-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-slate-100 text-slate-600'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 truncate">{product.name}</p>
                                                <p className="text-xs text-slate-500">{product.totalQty} sold</p>
                                            </div>
                                            <span className="font-semibold text-slate-800">
                                                {formatCurrency(product.totalRevenue)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Top Expenses */}
                        {expenseSummary?.topExpenses && expenseSummary.topExpenses.length > 0 && (
                            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Top Expenses</h2>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {expenseSummary.topExpenses.map((expense, index) => (
                                        <div key={expense.id} className="p-4 flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 truncate">{expense.description}</p>
                                                <p className="text-xs text-slate-500">{getCategoryLabel(expense.category)}</p>
                                            </div>
                                            <span className="font-semibold text-red-600">
                                                -{formatCurrency(expense.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Spacer for bottom nav */}
                        <div className="h-20"></div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsDashboard;
