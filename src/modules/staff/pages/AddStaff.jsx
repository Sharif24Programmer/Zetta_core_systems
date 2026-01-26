import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { addStaff, ROLES } from '../services/staffService';
import { SPECIALIZATIONS } from '../constants/specializations';

const AddStaff = () => {
    const navigate = useNavigate();
    const { tenantId, tenant } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: ROLES.HELPER,
        phone: '',
        salary: '',
        joinDate: new Date().toISOString().split('T')[0],
        address: '',

        // Doctor-specific fields
        specialization: '',
        qualifications: '',
        consultationFee: '',
        registrationNumber: ''
    });

    const isDoctor = formData.role === ROLES.DOCTOR;
    const isClinicOrPharmacy = tenant?.type === 'clinic' || tenant?.type === 'pharmacy';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const staffData = {
                ...formData,
                tenantId,
                salary: Number(formData.salary)
            };

            // Add doctor-specific fields if Doctor role
            if (isDoctor) {
                staffData.consultationFee = Number(formData.consultationFee) || 0;
            }

            await addStaff(staffData);
            navigate('/app/staff');
        } catch (error) {
            console.error('Error adding staff:', error);
            alert('Failed to add staff');
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-lg font-semibold text-slate-900">Add New Staff</h1>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Dr. Rahul Kumar"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Object.values(ROLES).map(role => {
                                    // Show Doctor role only for clinic/pharmacy
                                    if (role === ROLES.DOCTOR && !isClinicOrPharmacy) return null;
                                    return <option key={role} value={role}>{role}</option>;
                                })}
                            </select>
                        </div>

                        {/* Doctor-specific fields */}
                        {isDoctor && (
                            <>
                                <div className="pt-4 border-t border-slate-200">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">👨‍⚕️ Doctor Details</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                                            <select
                                                name="specialization"
                                                value={formData.specialization}
                                                onChange={handleChange}
                                                required={isDoctor}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Specialization</option>
                                                {SPECIALIZATIONS.map(spec => (
                                                    <option key={spec} value={spec}>{spec}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Qualifications</label>
                                            <input
                                                type="text"
                                                name="qualifications"
                                                value={formData.qualifications}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g. MBBS, MD (Medicine)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                                            <input
                                                type="text"
                                                name="registrationNumber"
                                                value={formData.registrationNumber}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g. MCI123456"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee (₹)</label>
                                            <input
                                                type="number"
                                                name="consultationFee"
                                                value={formData.consultationFee}
                                                onChange={handleChange}
                                                required={isDoctor}
                                                min="0"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g. 500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. 9876543210"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {isDoctor ? 'Monthly Retainer (₹)' : 'Monthly Salary (₹)'}
                            </label>
                            <input
                                type="number"
                                name="salary"
                                required
                                min="0"
                                value={formData.salary}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={isDoctor ? "e.g. 75000" : "e.g. 15000"}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
                            <input
                                type="date"
                                name="joinDate"
                                required
                                value={formData.joinDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address (Optional)</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Staff address..."
                            ></textarea>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : `Add ${isDoctor ? 'Doctor' : 'Staff Member'}`}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AddStaff;
