import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getAllStaff, getMonthlyAttendance, calculatePayroll, ATTENDANCE_STATUS } from '../services/staffService';
import { formatCurrency } from '../../reports/services/reportsService';
import { addExpense, getExpenses, deleteExpense, EXPENSE_CATEGORIES } from '../../../shared/services/expenseService';
import Loader from '../../../shared/components/Loader';

// Icons
const ChevronLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const HomeIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const PhoneIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const StaffDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tenantId, isAdmin, isOwner } = useAuth(); // isAdmin/isOwner check if needed

    const [staff, setStaff] = useState(null);
    const [payroll, setPayroll] = useState(null);
    const [history, setHistory] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState({ paid: false, expenseId: null });
    const [loading, setLoading] = useState(true);

    const canManageSalary = isAdmin() || isOwner();

    useEffect(() => {
        if (tenantId && id) {
            loadData();
        }
    }, [tenantId, id]);

    const loadData = () => {
        const allStaff = getAllStaff(tenantId);
        const member = allStaff.find(s => s.id === id);

        if (member) {
            setStaff(member);
            const now = new Date();

            // Calculate Payroll
            const payrollData = calculatePayroll(id, now.getMonth(), now.getFullYear());
            setPayroll(payrollData);

            // Get History
            const attHistory = getMonthlyAttendance(id, now.getMonth(), now.getFullYear());
            setHistory(attHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));

            // Check Payment Status
            const expenses = getExpenses(tenantId);
            const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
            const salaryExpense = expenses.find(e =>
                e.category === EXPENSE_CATEGORIES.STAFF &&
                e.staffId === id &&
                e.monthKey === currentMonthKey
            );

            if (salaryExpense) {
                setPaymentStatus({ paid: true, expenseId: salaryExpense.id });
            } else {
                setPaymentStatus({ paid: false, expenseId: null });
            }
        }
        setLoading(false);
    };

    const handleTogglePayment = () => {
        if (!canManageSalary) return;

        if (paymentStatus.paid) {
            if (window.confirm('Mark salary as unpaid? This will remove the expense record.')) {
                deleteExpense(paymentStatus.expenseId);
                setPaymentStatus({ paid: false, expenseId: null });
            }
        } else {
            if (!payroll) return;
            const now = new Date();
            const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
            const description = `Salary for ${staff.name} - ${now.toLocaleString('default', { month: 'short', year: 'numeric' })}`;

            const expense = addExpense({
                tenantId,
                category: EXPENSE_CATEGORIES.STAFF,
                description: description,
                amount: payroll.estimatedSalary,
                staffId: id,
                monthKey: currentMonthKey,
                date: now.toISOString()
            });
            setPaymentStatus({ paid: true, expenseId: expense.id });
        }
    };

    if (loading) return <Loader />;
    if (!staff) return <div className="p-4 text-center">Staff member not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-500">
                            <ChevronLeftIcon />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900">Staff Profile</h1>
                    </div>
                    {/* Home Button */}
                    <button onClick={() => navigate('/app')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        <HomeIcon />
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-4">
                    <img
                        src={staff.photo || `https://ui-avatars.com/api/?name=${staff.name}&background=random`}
                        alt={staff.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-slate-50"
                    />
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900">{staff.name}</h2>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mt-1">
                            {staff.role}
                        </span>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                <PhoneIcon />
                                <span>{staff.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                <CalendarIcon />
                                <span>Joined {new Date(staff.joinDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Month Payroll Estimate */}
                {payroll && (
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wide">Estimated Salary</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(payroll.estimatedSalary)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-indigo-200 text-xs">For {new Date().toLocaleString('default', { month: 'long' })}</p>
                                <p className="font-medium mt-1">Base: {formatCurrency(payroll.baseSalary)}</p>
                            </div>
                        </div>

                        {/* Status / Action Button */}
                        <div className="mb-6 relative z-10">
                            {canManageSalary && (
                                <div className="flex items-center justify-between bg-indigo-800/40 p-3 rounded-lg border border-indigo-500/30">
                                    <span className="text-sm font-medium text-indigo-100">
                                        Payment Status: {paymentStatus.paid ? 'PAID ✅' : 'PENDING ⏳'}
                                    </span>
                                    <button
                                        onClick={handleTogglePayment}
                                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${paymentStatus.paid
                                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                : 'bg-white text-indigo-700 hover:bg-indigo-50'
                                            }`}
                                    >
                                        {paymentStatus.paid ? 'Mark Unpaid' : 'Mark Paid'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-indigo-500/30 pt-4 relative z-10">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{payroll.presentDays}</p>
                                <p className="text-xs text-indigo-200 uppercase">Present</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{payroll.halfDays}</p>
                                <p className="text-xs text-indigo-200 uppercase">Half Days</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{payroll.leaves}</p>
                                <p className="text-xs text-indigo-200 uppercase">Leaves</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance History */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Attendance History</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No attendance records yet</div>
                        ) : (
                            history.map(record => (
                                <div key={record.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex flex-col items-center justify-center text-slate-600">
                                            <span className="text-xs font-bold uppercase">{new Date(record.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-lg font-bold leading-none">{new Date(record.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 capitalize">{record.status.replace('_', ' ')}</p>
                                            <p className="text-xs text-slate-500">{record.checkIn} - {record.checkOut}</p>
                                        </div>
                                    </div>
                                    {record.status === ATTENDANCE_STATUS.PRESENT && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    )}
                                    {record.status === ATTENDANCE_STATUS.ABSENT && (
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    )}
                                    {record.status === ATTENDANCE_STATUS.HALF_DAY && (
                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDetails;
