import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getAllStaff, markAttendance, getAttendanceByDate, ATTENDANCE_STATUS } from '../services/staffService';
import Loader from '../../../shared/components/Loader';
import SubscriptionGuard from '../../subscription/components/SubscriptionGuard';

// Icons
const UserAddIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

const StaffDashboard = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [staff, setStaff] = useState([]);
    const [attendanceToday, setAttendanceToday] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [tenantId]);

    const loadData = () => {
        if (!tenantId) return;
        const allStaff = getAllStaff(tenantId);
        const todayAttendance = getAttendanceByDate(tenantId, new Date());

        setStaff(allStaff);
        setAttendanceToday(todayAttendance);
        setLoading(false);
    };

    const handleQuickAttendance = (staffId, status) => {
        markAttendance({
            tenantId,
            staffId,
            date: new Date(),
            status
        });
        loadData(); // Refresh to show updated status
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case ATTENDANCE_STATUS.PRESENT: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case ATTENDANCE_STATUS.ABSENT: return 'bg-red-100 text-red-700 border-red-200';
            case ATTENDANCE_STATUS.HALF_DAY: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case ATTENDANCE_STATUS.LEAVE: return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (loading) return <Loader />;

    const presentCount = attendanceToday.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/app')} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900">Staff Management</h1>
                    </div>
                    <SubscriptionGuard feature="staff" limitKey="staff" currentCount={staff.length} showLockIcon={true}>
                        <button
                            onClick={() => navigate('/app/staff/add')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <UserAddIcon />
                            Add Staff
                        </button>
                    </SubscriptionGuard>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Total Staff</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{staff.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Present Today</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{presentCount} <span className="text-slate-400 text-lg font-normal">/ {staff.length}</span></p>
                    </div>
                </div>

                {/* Staff List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Staff Members</h2>

                    {staff.map(member => {
                        const todayStatus = attendanceToday.find(a => a.staffId === member.id);
                        const isPresent = todayStatus?.status === ATTENDANCE_STATUS.PRESENT;

                        return (
                            <div key={member.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 flex items-start gap-4" onClick={() => navigate(`/app/staff/${member.id}`)}>
                                    <img
                                        src={member.photo || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                                        alt={member.name}
                                        className="w-12 h-12 rounded-full object-cover border border-slate-100"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-slate-900 truncate">{member.name}</h3>
                                            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                                                {member.role}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-0.5">{member.phone}</p>
                                    </div>
                                </div>

                                {/* Quick Attendance Actions */}
                                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-medium">Mark Attendance (Today)</span>
                                    <div className="flex gap-2">
                                        {todayStatus ? (
                                            <span className={`text-xs font-medium px-3 py-1.5 rounded-lg border capitalized ${getStatusVariant(todayStatus.status)}`}>
                                                {todayStatus.status.replace('_', ' ')}
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleQuickAttendance(member.id, ATTENDANCE_STATUS.PRESENT)}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-emerald-600 text-xs font-medium rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => handleQuickAttendance(member.id, ATTENDANCE_STATUS.ABSENT)}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                                                >
                                                    Absent
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
