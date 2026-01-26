import { useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { usePatientSearch, useRecentPatients } from '../hooks/usePatients';
import { createPatient } from '../services/patientService';
import Loader from '../../../shared/components/Loader';

/**
 * Patient Selector - for clinic POS
 * Shows recent patients, search, and quick add
 */
const PatientSelector = ({ onSelect, onClose }) => {
    const { tenantId } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const { results, searching } = usePatientSearch(tenantId, searchTerm);
    const { patients: recentPatients, loading: loadingRecent } = useRecentPatients(tenantId);

    const displayPatients = searchTerm.length >= 2 ? results : recentPatients;

    const handleWalkIn = () => {
        onSelect(null); // null = walk-in patient
    };

    const handleAddPatient = async () => {
        if (!newPatient.name) return;

        setLoading(true);
        try {
            const patient = await createPatient({
                tenantId,
                name: newPatient.name,
                phone: newPatient.phone
            });
            onSelect(patient);
        } catch (err) {
            console.error('Error creating patient:', err);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-auto animate-slideUp"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 text-lg">Select Patient</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="input-field pl-10"
                    />
                    <svg
                        className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        onClick={handleWalkIn}
                        className="p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-600 hover:bg-slate-50 text-sm flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Walk-in
                    </button>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="p-3 rounded-xl border-2 border-primary-200 text-primary-600 hover:bg-primary-50 text-sm flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Patient
                    </button>
                </div>

                {/* Add New Patient Form */}
                {showAddForm && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                        <h4 className="font-medium text-slate-800 mb-3">New Patient</h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newPatient.name}
                                onChange={(e) => setNewPatient(p => ({ ...p, name: e.target.value }))}
                                placeholder="Patient name *"
                                className="input-field"
                            />
                            <input
                                type="tel"
                                value={newPatient.phone}
                                onChange={(e) => setNewPatient(p => ({ ...p, phone: e.target.value }))}
                                placeholder="Phone (optional)"
                                className="input-field"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddPatient}
                                    disabled={!newPatient.name || loading}
                                    className="flex-1 btn-primary disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add & Select'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Patient List */}
                <div className="space-y-2">
                    {searching || loadingRecent ? (
                        <Loader text="Loading..." />
                    ) : displayPatients.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            {searchTerm ? 'No patients found' : 'No recent patients'}
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                                {searchTerm ? 'Search Results' : 'Recent Patients'}
                            </p>
                            {displayPatients.map(patient => (
                                <div
                                    key={patient.id}
                                    onClick={() => onSelect(patient)}
                                    className="p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            <span className="text-primary-600 font-semibold">
                                                {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{patient.name}</p>
                                            {patient.phone && (
                                                <p className="text-sm text-slate-500">{patient.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientSelector;
