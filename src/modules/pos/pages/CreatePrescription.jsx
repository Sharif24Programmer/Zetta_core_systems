import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { printPrescription, sharePrescriptionWhatsApp, createPrescriptionData } from '../services/prescriptionService';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Thrice daily', 'Before meals', 'After meals', 'At bedtime'];
const DURATIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month'];

const CreatePrescription = () => {
    const navigate = useNavigate();
    const { visitId, patientId } = useParams();
    const { tenant } = useAuth();

    const [patient, setPatient] = useState({ name: 'Patient Name', age: '', gender: '', phone: '' });
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medicines, setMedicines] = useState([
        { name: '', dosage: '', frequency: '', duration: '' }
    ]);
    const [loading, setLoading] = useState(false);

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removeMedicine = (index) => {
        if (medicines.length === 1) return;
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const updateMedicine = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const handlePrint = () => {
        const prescription = createPrescriptionData(visitId, patientId, medicines, { diagnosis, notes });
        printPrescription(prescription, patient, tenant);
    };

    const handleShare = () => {
        const prescription = createPrescriptionData(visitId, patientId, medicines, { diagnosis, notes });
        sharePrescriptionWhatsApp(prescription, patient, tenant);
    };

    const handleSave = async () => {
        setLoading(true);
        // TODO: Save to Firestore via visitService
        setTimeout(() => {
            setLoading(false);
            navigate(-1);
        }, 500);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header bg-gradient-to-r from-purple-600 to-purple-700">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-purple-500/30 rounded-lg"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="page-title text-white">Create Prescription</h1>
                        <p className="text-purple-200 text-sm">{patient.name}</p>
                    </div>
                </div>
            </div>

            <div className="page-content">
                {/* Patient Info */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-3">Patient</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={patient.name}
                            onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                            placeholder="Patient name"
                            className="input-field"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={patient.age}
                                onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                                placeholder="Age"
                                className="input-field w-20"
                            />
                            <select
                                value={patient.gender}
                                onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                                className="input-field flex-1"
                            >
                                <option value="">Gender</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Diagnosis */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-3">Diagnosis</h3>
                    <textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis..."
                        className="input-field min-h-[60px]"
                    />
                </div>

                {/* Medicines */}
                <div className="card">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-800">Medicines</h3>
                        <button
                            onClick={addMedicine}
                            className="text-primary-600 text-sm font-medium"
                        >
                            + Add Medicine
                        </button>
                    </div>

                    <div className="space-y-3">
                        {medicines.map((med, index) => (
                            <div key={index} className="p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-slate-500">Medicine {index + 1}</span>
                                    {medicines.length > 1 && (
                                        <button
                                            onClick={() => removeMedicine(index)}
                                            className="text-red-500 text-xs"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={med.name}
                                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                    placeholder="Medicine name"
                                    className="input-field mb-2"
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        value={med.dosage}
                                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                        placeholder="Dosage"
                                        className="input-field text-sm"
                                    />
                                    <select
                                        value={med.frequency}
                                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                        className="input-field text-sm"
                                    >
                                        <option value="">Frequency</option>
                                        {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <select
                                        value={med.duration}
                                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                        className="input-field text-sm"
                                    >
                                        <option value="">Duration</option>
                                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="card">
                    <h3 className="font-semibold text-slate-800 mb-3">Notes / Advice</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        className="input-field min-h-[60px]"
                    />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handlePrint}
                        className="btn-secondary py-3 flex items-center justify-center gap-2"
                    >
                        🖨️ Print
                    </button>
                    <button
                        onClick={handleShare}
                        className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center gap-2"
                    >
                        📱 WhatsApp
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full btn-primary py-3 text-lg font-semibold"
                >
                    {loading ? 'Saving...' : '✓ Save Prescription'}
                </button>
            </div>
        </div>
    );
};

export default CreatePrescription;
