import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { createLabReport } from '../services/labService';
import { getAllPatients, searchPatients } from '../../patients/services/patientService';
import { getAllTemplates, searchTemplates, calculateTotalPrice } from '../services/labTemplateService';

const CreateLabReport = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [testSearchQuery, setTestSearchQuery] = useState('');
    const [showPatientSearch, setShowPatientSearch] = useState(false);
    const [showTestSearch, setShowTestSearch] = useState(false);

    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        patientAge: '',
        patientGender: '',
        referringDoctor: '',
        selectedTests: [], // Array of template IDs
        priority: 'routine',
        discount: 0
    });

    useEffect(() => {
        loadPatients();
        loadTemplates();
    }, [tenantId]);

    const loadPatients = () => {
        const data = getAllPatients(tenantId);
        setPatients(data);
    };

    const loadTemplates = () => {
        const data = getAllTemplates();
        setTemplates(data);
    };

    const handlePatientSelect = (patient) => {
        setFormData(prev => ({
            ...prev,
            patientId: patient.id,
            patientName: patient.name,
            patientAge: patient.age,
            patientGender: patient.gender
        }));
        setShowPatientSearch(false);
        setSearchQuery('');
    };

    const handleTestSelect = (template) => {
        if (!formData.selectedTests.includes(template.id)) {
            setFormData(prev => ({
                ...prev,
                selectedTests: [...prev.selectedTests, template.id]
            }));
        }
        setShowTestSearch(false);
        setTestSearchQuery('');
    };

    const handleRemoveTest = (templateId) => {
        setFormData(prev => ({
            ...prev,
            selectedTests: prev.selectedTests.filter(id => id !== templateId)
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredPatients = searchQuery
        ? searchPatients(tenantId, searchQuery)
        : patients;

    const filteredTests = testSearchQuery
        ? searchTemplates(testSearchQuery)
        : templates;

    const getSelectedTestsDetails = () => {
        return formData.selectedTests.map(id =>
            templates.find(t => t.id === id)
        ).filter(Boolean);
    };

    const calculateTotal = () => {
        const isUrgent = formData.priority === 'urgent';
        const subtotal = calculateTotalPrice(formData.selectedTests, isUrgent);
        const discount = parseFloat(formData.discount) || 0;
        return Math.max(0, subtotal - discount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const selectedTestsDetails = getSelectedTestsDetails();

            const reportData = {
                tenantId,
                patientId: formData.patientId,
                patientName: formData.patientName,
                patientAge: formData.patientAge,
                patientGender: formData.patientGender,
                referringDoctor: formData.referringDoctor,
                tests: selectedTestsDetails.map(template => ({
                    templateId: template.id,
                    testName: template.testName,
                    testCode: template.testCode,
                    category: template.category,
                    parameters: template.parameters.map(param => ({
                        id: param.id,
                        name: param.name,
                        shortName: param.shortName,
                        unit: param.unit,
                        value: null, // Will be filled during result entry
                        normalRange: param.normalRange,
                        criticalLow: param.criticalLow,
                        criticalHigh: param.criticalHigh
                    }))
                })),
                priority: formData.priority,
                totalAmount: calculateTotal(),
                discount: parseFloat(formData.discount) || 0
            };

            const newReport = await createLabReport(reportData);
            navigate(`/app/lab/${newReport.id}`);
        } catch (error) {
            console.error('Error creating lab report:', error);
            alert('Failed to create lab report');
        } finally {
            setLoading(false);
        }
    };

    const selectedTestsDetails = getSelectedTestsDetails();
    const total = calculateTotal();

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
                    <h1 className="text-lg font-semibold text-slate-900">Create Lab Report</h1>
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
                                    <p className="text-sm text-primary-600">
                                        {formData.patientAge}y • {formData.patientGender === 'male' ? 'Male' : 'Female'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        patientId: '',
                                        patientName: '',
                                        patientAge: '',
                                        patientGender: ''
                                    }))}
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
                                    required
                                />

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
                                                <p className="text-sm text-slate-500">
                                                    {patient.age}y • {patient.gender} • {patient.phone}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Test Selection */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                        <p className="font-semibold text-slate-800">Select Lab Tests</p>

                        {/* Selected Tests */}
                        {selectedTestsDetails.length > 0 && (
                            <div className="space-y-2">
                                {selectedTestsDetails.map(test => (
                                    <div key={test.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-blue-900">{test.testName}</p>
                                            <p className="text-sm text-blue-600">
                                                {test.testCode} • {test.parameters.length} parameters •
                                                ₹{formData.priority === 'urgent' ? test.urgentPrice : test.basePrice}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTest(test.id)}
                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Test */}
                        <div className="relative">
                            <input
                                type="text"
                                value={testSearchQuery}
                                onChange={(e) => {
                                    setTestSearchQuery(e.target.value);
                                    setShowTestSearch(true);
                                }}
                                onFocus={() => setShowTestSearch(true)}
                                placeholder="Search and add tests (e.g., CBC, Lipid Profile)..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />

                            {showTestSearch && filteredTests.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                                    {filteredTests.map(template => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => handleTestSelect(template)}
                                            disabled={formData.selectedTests.includes(template.id)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-800">{template.testName}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {template.category} • {template.parameters.length} parameters
                                                    </p>
                                                </div>
                                                <p className="text-sm font-medium text-primary-600">₹{template.basePrice}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                        <p className="font-semibold text-slate-800">Additional Details</p>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Referring Doctor</label>
                            <input
                                type="text"
                                name="referringDoctor"
                                value={formData.referringDoctor}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Doctor name (optional)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="routine">Routine</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Discount (₹)</label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Total */}
                    {selectedTestsDetails.length > 0 && (
                        <div className="bg-primary-50 rounded-xl p-4">
                            <div className="flex items-center justify-between text-lg font-semibold text-primary-900">
                                <span>Total Amount</span>
                                <span>₹{total}</span>
                            </div>
                            {formData.discount > 0 && (
                                <div className="flex items-center justify-between text-sm text-primary-600 mt-1">
                                    <span>Discount Applied</span>
                                    <span>- ₹{formData.discount}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !formData.patientId || formData.selectedTests.length === 0}
                        className="w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : `Create Lab Report (${selectedTestsDetails.length} test${selectedTestsDetails.length !== 1 ? 's' : ''})`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateLabReport;
