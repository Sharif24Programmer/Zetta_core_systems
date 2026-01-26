import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useTodaysVisits } from '../hooks/useVisits';
import { createVisit } from '../services/visitService';
import { formatPatientName } from '../services/patientService';
import VisitCard from '../components/VisitCard';
import PatientSelector from '../components/PatientSelector';
import Loader from '../../../shared/components/Loader';

/**
 * Clinic Dashboard - shows today's visits and allows creating new visits
 */
const ClinicDashboard = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { visits, stats, loading } = useTodaysVisits(tenantId);

    const [showPatientSelector, setShowPatientSelector] = useState(false);
    const [creating, setCreating] = useState(false);

    const handlePatientSelect = async (patient) => {
        setCreating(true);
        try {
            const visit = await createVisit({
                tenantId,
                patientId: patient?.id || null,
                patientName: formatPatientName(patient),
                status: 'waiting'
            });

            setShowPatientSelector(false);
            // Navigate to visit/billing
            navigate(`/app/pos/visit/${visit.id}`);
        } catch (err) {
            console.error('Error creating visit:', err);
        }
        setCreating(false);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Clinic</h1>
            </div>

            <div className="page-content">
                {/* New Visit Button */}
                <button
                    onClick={() => setShowPatientSelector(true)}
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <span className="text-xl font-bold">New Visit</span>
                            <p className="text-sm text-white/80">Start patient visit</p>
                        </div>
                    </div>
                </button>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                    <div className="card text-center py-3">
                        <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                        <p className="text-xs text-slate-500">Total</p>
                    </div>
                    <div className="card text-center py-3">
                        <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
                        <p className="text-xs text-slate-500">Waiting</p>
                    </div>
                    <div className="card text-center py-3">
                        <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                        <p className="text-xs text-slate-500">In Progress</p>
                    </div>
                    <div className="card text-center py-3">
                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        <p className="text-xs text-slate-500">Done</p>
                    </div>
                </div>

                {/* Today's Visits */}
                <div className="mt-6">
                    <h2 className="font-semibold text-slate-800 mb-3">Today's Queue</h2>

                    {loading ? (
                        <Loader text="Loading..." />
                    ) : visits.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No visits yet today
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {visits.map(visit => (
                                <VisitCard
                                    key={visit.id}
                                    visit={visit}
                                    onClick={() => navigate(`/app/pos/visit/${visit.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Patient Selector Modal */}
            {showPatientSelector && (
                <PatientSelector
                    onSelect={handlePatientSelect}
                    onClose={() => setShowPatientSelector(false)}
                />
            )}
        </div>
    );
};

export default ClinicDashboard;
