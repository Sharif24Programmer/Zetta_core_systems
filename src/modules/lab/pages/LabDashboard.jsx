import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';

const LabDashboard = () => {
    const navigate = useNavigate();
    const { tenant } = useAuth();
    const [activeTab, setActiveTab] = useState('pending');
    const [labReports, setLabReports] = useState([]);

    // Demo lab reports data
    const demoReports = [
        { id: 'LAB001', patientName: 'Ramesh Kumar', testType: 'Complete Blood Count', status: 'pending', createdAt: '2026-01-26T09:00:00', priority: 'normal' },
        { id: 'LAB002', patientName: 'Priya Sharma', testType: 'Blood Sugar (Fasting)', status: 'completed', createdAt: '2026-01-25T10:00:00', priority: 'normal' },
        { id: 'LAB003', patientName: 'Amit Patel', testType: 'Lipid Profile', status: 'pending', createdAt: '2026-01-26T11:00:00', priority: 'urgent' },
        { id: 'LAB004', patientName: 'Sunita Devi', testType: 'Thyroid Panel', status: 'completed', createdAt: '2026-01-24T14:00:00', priority: 'normal' },
        { id: 'LAB005', patientName: 'Rajesh Singh', testType: 'Liver Function Test', status: 'in_progress', createdAt: '2026-01-26T08:00:00', priority: 'stat' },
    ];

    useEffect(() => {
        // Load from localStorage, merge with demo data
        const storedReports = JSON.parse(localStorage.getItem('zetta_lab_reports') || '[]');

        // Combine stored reports with demo data (avoiding duplicates)
        const demoIds = demoReports.map(r => r.id);
        const uniqueStored = storedReports.filter(r => !demoIds.includes(r.id));

        setLabReports([...uniqueStored, ...demoReports]);
    }, []);

    const filteredReports = activeTab === 'all'
        ? labReports
        : labReports.filter(r => r.status === activeTab);

    const getStats = () => ({
        pending: labReports.filter(r => r.status === 'pending').length,
        in_progress: labReports.filter(r => r.status === 'in_progress').length,
        completed: labReports.filter(r => r.status === 'completed').length
    });

    const stats = getStats();

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            in_progress: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700'
        };
        const labels = {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        if (priority === 'normal') return null;
        const styles = {
            urgent: 'bg-orange-100 text-orange-700',
            stat: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}`}>
                {priority.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="page-title">Lab Reports</h1>
                        <p className="text-slate-500">Manage laboratory tests and reports</p>
                    </div>
                    <Link
                        to="/app/lab/new"
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Lab Report
                    </Link>
                </div>
            </div>

            <div className="page-content">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div
                        className={`card text-center cursor-pointer transition-all ${activeTab === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-sm text-slate-500">Pending</p>
                    </div>
                    <div
                        className={`card text-center cursor-pointer transition-all ${activeTab === 'in_progress' ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setActiveTab('in_progress')}
                    >
                        <p className="text-3xl font-bold text-blue-600">{stats.in_progress}</p>
                        <p className="text-sm text-slate-500">In Progress</p>
                    </div>
                    <div
                        className={`card text-center cursor-pointer transition-all ${activeTab === 'completed' ? 'ring-2 ring-green-500' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                        <p className="text-sm text-slate-500">Completed</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto">
                    {['pending', 'in_progress', 'completed', 'all'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Reports List */}
                <div className="card">
                    <div className="divide-y divide-slate-100">
                        {filteredReports.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p>No reports found</p>
                                <Link to="/app/lab/new" className="text-primary-600 text-sm font-medium mt-2 inline-block">
                                    Create your first lab report
                                </Link>
                            </div>
                        ) : (
                            filteredReports.map(report => (
                                <div
                                    key={report.id}
                                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/app/lab/${report.id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-sm text-slate-500">{report.id}</span>
                                                {getStatusBadge(report.status)}
                                                {getPriorityBadge(report.priority)}
                                            </div>
                                            <h3 className="font-medium text-slate-800">{report.patientName}</h3>
                                            <p className="text-sm text-slate-500">{report.testType}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <div>
                                                <p className="text-sm text-slate-400">
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
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

export default LabDashboard;
