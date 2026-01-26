import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getAllPatients, searchPatients } from '../services/patientService';

const PatientsPage = () => {
    const { tenant, tenantId } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        loadPatients();
    }, [tenantId]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const results = searchPatients(tenantId, searchQuery);
            setFilteredPatients(results);
        } else {
            setFilteredPatients(patients);
        }
    }, [searchQuery, patients, tenantId]);

    const loadPatients = () => {
        const data = getAllPatients(tenantId);
        setPatients(data);
        setFilteredPatients(data);
    };

    const getBloodGroupBadge = (bloodGroup) => {
        if (!bloodGroup) return null;
        const colors = {
            'A+': 'bg-red-100 text-red-700',
            'A-': 'bg-red-50 text-red-600',
            'B+': 'bg-blue-100 text-blue-700',
            'B-': 'bg-blue-50 text-blue-600',
            'O+': 'bg-green-100 text-green-700',
            'O-': 'bg-green-50 text-green-600',
            'AB+': 'bg-purple-100 text-purple-700',
            'AB-': 'bg-purple-50 text-purple-600'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[bloodGroup] || 'bg-slate-100 text-slate-600'}`}>
                {bloodGroup}
            </span>
        );
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="page-title">Patients</h1>
                        <p className="text-slate-500">Manage patient records and history</p>
                    </div>
                    <Link
                        to="/app/patients/new"
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Patient
                    </Link>
                </div>
            </div>

            <div className="page-content">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card text-center">
                        <p className="text-3xl font-bold text-primary-600">{patients.length}</p>
                        <p className="text-sm text-slate-500">Total Patients</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {patients.filter(p => {
                                const lastVisit = new Date(p.lastVisit);
                                const today = new Date();
                                return lastVisit.toDateString() === today.toDateString();
                            }).length}
                        </p>
                        <p className="text-sm text-slate-500">Today's Visits</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-3xl font-bold text-blue-600">
                            {patients.filter(p => p.chronicConditions?.length > 0).length}
                        </p>
                        <p className="text-sm text-slate-500">Chronic Cases</p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, ID or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Patients List */}
                <div className="card">
                    <div className="divide-y divide-slate-100">
                        {filteredPatients.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p>No patients found</p>
                                <Link to="/app/patients/new" className="text-primary-600 text-sm font-medium mt-2 inline-block">
                                    Register your first patient
                                </Link>
                            </div>
                        ) : (
                            filteredPatients.map(patient => (
                                <div
                                    key={patient.id}
                                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/app/patients/${patient.id}`)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                                                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-slate-800">{patient.name}</h3>
                                                    {getBloodGroupBadge(patient.bloodGroup)}
                                                </div>
                                                <p className="text-sm text-slate-500">
                                                    {patient.age}y • {patient.gender === 'male' ? 'Male' : patient.gender === 'female' ? 'Female' : 'Other'} • {patient.phone}
                                                </p>
                                                {patient.chronicConditions?.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {patient.chronicConditions.map((condition, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
                                                                {condition}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <div>
                                                <p className="text-xs text-slate-400">Last Visit</p>
                                                <p className="text-sm font-medium text-slate-700">
                                                    {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                                                </p>
                                                <p className="text-xs text-slate-400">{patient.totalVisits || 0} visits</p>
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

export default PatientsPage;
