import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { createAppointment, APPOINTMENT_TYPES } from '../services/appointmentService';
import { getAllPatients, searchPatients } from '../../patients/services/patientService';
import { getAllStaff } from '../../staff/services/staffService';

const BookAppointment = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPatientSearch, setShowPatientSearch] = useState(false);

    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        patientPhone: '',
        doctorId: '',
        doctorName: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00',
        type: APPOINTMENT_TYPES.NEW_CONSULTATION,
        chiefComplaint: '',
        consultationFee: 500
    });

    useEffect(() => {
        loadPatients();
        loadDoctors();
    }, [tenantId]);

    const loadPatients = () => {
        const data = getAllPatients(tenantId);
        setPatients(data);
    };

    const loadDoctors = () => {
        const staff = getAllStaff(tenantId);
        const doctorsList = staff.filter(s => s.role === 'Doctor' && s.status === 'active');
        setDoctors(doctorsList);

        // Auto-select first doctor if available
        if (doctorsList.length > 0 && !formData.doctorId) {
            setFormData(prev => ({
                ...prev,
                doctorId: doctorsList[0].id,
                doctorName: doctorsList[0].name,
                consultationFee: doctorsList[0].consultationFee || 500
            }));
        }
    };

    const handlePatientSelect = (patient) => {
        setFormData(prev => ({
            ...prev,
            patientId: patient.id,
            patientName: patient.name,
            patientPhone: patient.phone
        }));
        setShowPatientSearch(false);
        setSearchQuery('');
    };

    const handleDoctorChange = (e) => {
        const doctorId = e.target.value;
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
            setFormData(prev => ({
                ...prev,
                doctorId: doctor.id,
                doctorName: doctor.name,
                consultationFee: doctor.consultationFee || 500
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const appointmentData = {
                tenantId,
                ...formData,
                appointmentDateTime: `${formData.appointmentDate}T${formData.appointmentTime}:00`,
                slotDuration: 15
            };

            // Remove time and date fields as we combined them
            delete appointmentData.appointmentDate;
            delete appointmentData.appointmentTime;

            await createAppointment(appointmentData);
            navigate('/app/appointments');
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = searchQuery
        ? searchPatients(tenantId, searchQuery)
        : patients;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-semibold text-slate-900">Book Appointment</h1>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Selection */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                        <p className="font-semibold text-slate-800">Patient Information</p>

                        {formData.patientId ? (
                            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-primary-900">{formData.patientName}</p>
                                    <p className="text-sm text-primary-600">{formData.patientPhone}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, patientId: '', patientName: '', patientPhone: '' }))}
                                    className="text-primary-600 text-sm font-medium"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowPatientSearch(true);
                                    }}
                                    onFocus={() => setShowPatientSearch(true)}
                                    placeholder="Search patient by name or phone..."
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />

                                {/* Patient Search Dropdown */}
                                {showPatientSearch && filteredPatients.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredPatients.map(patient => (
                                            <button
                                                key={patient.id}
                                                type="button"
                                                onClick={() => handlePatientSelect(patient)}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                                            >
                                                <p className="font-medium text-slate-800">{patient.name}</p>
                                                <p className="text-sm text-slate-500">{patient.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!formData.patientId && patients.length === 0 && (
                            <p className="text-sm text-slate-500">
                                No patients found. <Link to="/app/patients/new" className="text-primary-600 font-medium">Register a patient first</Link>
                            </p>
                        )}
                    </div>

                    {/* Doctor & Appointment Details */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                        <p className="font-semibold text-slate-800">Appointment Details</p>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Doctor *</label>
                            <select
                                name="doctorId"
                                value={formData.doctorId}
                                onChange={handleDoctorChange}
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.name} - {doctor.specialization}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                                <input
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                                <input
                                    type="time"
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Appointment Type *</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {Object.values(APPOINTMENT_TYPES).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Chief Complaint *</label>
                            <textarea
                                name="chiefComplaint"
                                value={formData.chiefComplaint}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. Fever and headache since 3 days"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee (₹)</label>
                            <input
                                type="number"
                                name="consultationFee"
                                value={formData.consultationFee}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.patientId}
                        className="w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;
