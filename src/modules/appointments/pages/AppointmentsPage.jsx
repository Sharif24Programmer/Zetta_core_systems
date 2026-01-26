import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getAllAppointments, getTodayAppointments, updateAppointmentStatus, APPOINTMENT_STATUS } from '../services/appointmentService';

const AppointmentsPage = () => {
    const { tenant, tenantId } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('today');
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);

    useEffect(() => {
        loadAppointments();
    }, [tenantId, activeTab]);

    const loadAppointments = () => {
        const data = activeTab === 'today'
            ? getTodayAppointments(tenantId)
            : getAllAppointments(tenantId);

        setAppointments(data);
        setFilteredAppointments(data);
    };

    const getStatusBadge = (status) => {
        const styles = {
            scheduled: 'bg-blue-100 text-blue-700',
            confirmed: 'bg-green-100 text-green-700',
            in_progress: 'bg-yellow-100 text-yellow-700',
            completed: 'bg-slate-100 text-slate-600',
            cancelled: 'bg-red-100 text-red-700',
            no_show: 'bg-red-50 text-red-600'
        };
        const labels = {
            scheduled: 'Scheduled',
            confirmed: 'Confirmed',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
            no_show: 'No Show'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const formatTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const handleStartConsultation = async (appointmentId) => {
        await updateAppointmentStatus(appointmentId, APPOINTMENT_STATUS.IN_PROGRESS);
        loadAppointments();
    };

    const handleCompleteAppointment = async (appointmentId) => {
        await updateAppointmentStatus(appointmentId, APPOINTMENT_STATUS.COMPLETED);
        loadAppointments();
    };

    const getStats = () => {
        const todayAppts = getTodayAppointments(tenantId);
        return {
            total: todayAppts.length,
            scheduled: todayAppts.filter(a => a.status === APPOINTMENT_STATUS.SCHEDULED).length,
            inProgress: todayAppts.filter(a => a.status === APPOINTMENT_STATUS.IN_PROGRESS).length,
            completed: todayAppts.filter(a => a.status === APPOINTMENT_STATUS.COMPLETED).length
        };
    };

    const stats = getStats();

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="page-title">Appointments</h1>
                        <p className="text-slate-500">Manage consultations and schedules</p>
                    </div>
                    <Link
                        to="/app/appointments/new"
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Book Appointment
                    </Link>
                </div>
            </div>

            <div className="page-content">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="card text-center">
                        <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
                        <p className="text-sm text-slate-500">Today's Total</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
                        <p className="text-sm text-slate-500">Scheduled</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                        <p className="text-sm text-slate-500">In Progress</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                        <p className="text-sm text-slate-500">Completed</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {['today', 'all'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {tab === 'today' ? "Today's Appointments" : 'All Appointments'}
                        </button>
                    ))}
                </div>

                {/* Appointments List */}
                <div className="card">
                    <div className="divide-y divide-slate-100">
                        {filteredAppointments.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p>No appointments found</p>
                                <Link to="/app/appointments/new" className="text-primary-600 text-sm font-medium mt-2 inline-block">
                                    Book your first appointment
                                </Link>
                            </div>
                        ) : (
                            filteredAppointments.map(appointment => (
                                <div
                                    key={appointment.id}
                                    className="p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="text-center bg-primary-50 rounded-lg p-3 min-w-[60px]">
                                                <p className="text-2xl font-bold text-primary-600">
                                                    {formatTime(appointment.appointmentDateTime).split(':')[0]}
                                                </p>
                                                <p className="text-xs text-primary-600">
                                                    {formatTime(appointment.appointmentDateTime).split(' ')[1]}
                                                </p>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-slate-800">{appointment.patientName}</h3>
                                                    {getStatusBadge(appointment.status)}
                                                </div>
                                                <p className="text-sm text-slate-500 mb-1">
                                                    👨‍⚕️ {appointment.doctorName}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {appointment.chiefComplaint}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs text-slate-400">
                                                        {appointment.type}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        ₹{appointment.consultationFee}
                                                    </span>
                                                    {appointment.paid && (
                                                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                                            Paid
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {appointment.status === APPOINTMENT_STATUS.SCHEDULED && (
                                                <button
                                                    onClick={() => handleStartConsultation(appointment.id)}
                                                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                                >
                                                    Start
                                                </button>
                                            )}
                                            {appointment.status === APPOINTMENT_STATUS.IN_PROGRESS && (
                                                <button
                                                    onClick={() => handleCompleteAppointment(appointment.id)}
                                                    className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate(`/app/appointments/${appointment.id}`)}
                                                className="p-2 hover:bg-slate-100 rounded-lg"
                                            >
                                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentsPage;
