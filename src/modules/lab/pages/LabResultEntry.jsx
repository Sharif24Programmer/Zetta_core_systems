import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getLabReportById, updateLabReport, LAB_STATUS } from '../services/labService';
import { validateParameterValue, getNormalRangeText } from '../services/labTemplateService';

const LabResultEntry = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tenantId, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [report, setReport] = useState(null);
    const [results, setResults] = useState({}); // { [testIndex_paramId]: value }
    const [remarks, setRemarks] = useState({}); // { [testIndex]: remark }

    useEffect(() => {
        loadReport();
    }, [id]);

    const loadReport = async () => {
        try {
            const data = getLabReportById(id);
            if (data) {
                setReport(data);

                // Initialize results from existing data
                const initialResults = {};
                const initialRemarks = {};

                data.tests.forEach((test, testIndex) => {
                    initialRemarks[testIndex] = test.remarks || '';
                    test.parameters.forEach(param => {
                        const key = `${testIndex}_${param.id}`;
                        initialResults[key] = param.value || '';
                    });
                });

                setResults(initialResults);
                setRemarks(initialRemarks);
            } else {
                alert('Report not found');
                navigate('/app/lab');
            }
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResultChange = (testIndex, paramId, value) => {
        setResults(prev => ({
            ...prev,
            [`${testIndex}_${paramId}`]: value
        }));
    };

    const handleRemarkChange = (testIndex, value) => {
        setRemarks(prev => ({
            ...prev,
            [testIndex]: value
        }));
    };

    const saveResults = async (status = null) => {
        setSaving(true);
        try {
            // Reconstruct the tests array with new values and status
            const updatedTests = report.tests.map((test, testIndex) => ({
                ...test,
                remarks: remarks[testIndex],
                parameters: test.parameters.map(param => {
                    const value = results[`${testIndex}_${param.id}`];
                    // Validate value
                    const validation = validateParameterValue(
                        param,
                        value,
                        report.patientGender,
                        report.patientAge
                    );

                    return {
                        ...param,
                        value: value,
                        status: validation.status, // normal, low, high, critical
                        message: validation.message
                    };
                })
            }));

            const updates = {
                tests: updatedTests,
                status: status || LAB_STATUS.COMPLETED,
                completedAt: new Date().toISOString(),
                testedBy: user?.displayName || 'Lab Technician'
            };

            await updateLabReport(id, updates);
            navigate(`/app/lab/${id}`);
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Failed to save results');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!report) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Enter Lab Results</h1>
                            <p className="text-sm text-slate-500">#{report.id} • {report.patientName} ({report.patientAge}y/{report.patientGender})</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => saveResults(LAB_STATUS.IN_PROGRESS)}
                            disabled={saving}
                            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={() => saveResults(LAB_STATUS.COMPLETED)}
                            disabled={saving}
                            className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-sm font-medium"
                        >
                            Finalize & Complete
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {report.tests.map((test, testIndex) => (
                    <div key={testIndex} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-800">{test.testName}</h2>
                            <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-500">
                                {test.category}
                            </span>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-12 gap-4 mb-2 text-sm font-medium text-slate-500 px-2">
                                <div className="col-span-4">Parameter</div>
                                <div className="col-span-3">Result</div>
                                <div className="col-span-2">Unit</div>
                                <div className="col-span-3">Reference Range</div>
                            </div>

                            <div className="space-y-4">
                                {test.parameters.map(param => {
                                    const value = results[`${testIndex}_${param.id}`];
                                    const validation = validateParameterValue(
                                        param,
                                        value,
                                        report.patientGender,
                                        report.patientAge
                                    );

                                    return (
                                        <div key={param.id} className="grid grid-cols-12 gap-4 items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="col-span-4">
                                                <p className="font-medium text-slate-900">{param.name}</p>
                                                {/* <p className="text-xs text-slate-400">{param.shortName}</p> */}
                                            </div>

                                            <div className="col-span-3 relative">
                                                <input
                                                    type="text" // using text to allow < > etc if needed, but validation expects number
                                                    value={value}
                                                    onChange={(e) => handleResultChange(testIndex, param.id, e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validation.color === 'red' ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-700' :
                                                            validation.color === 'orange' ? 'border-orange-300 focus:ring-orange-200 bg-orange-50 text-orange-700' :
                                                                validation.color === 'green' ? 'border-green-300 focus:ring-green-200 bg-green-50 text-green-700' :
                                                                    'border-slate-300 focus:ring-blue-100'
                                                        }`}
                                                    placeholder="--"
                                                />
                                                {/* Validation Label */}
                                                {value && validation.status !== 'normal' && validation.status !== 'unknown' && validation.status !== 'invalid' && (
                                                    <div className={`absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full ml-2 text-xs font-bold px-2 py-1 rounded ${validation.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {validation.message}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-span-2 text-sm text-slate-600">
                                                {param.unit}
                                            </div>

                                            <div className="col-span-3 text-sm text-slate-500">
                                                {getNormalRangeText(param, report.patientGender, report.patientAge)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Remarks */}
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Remarks / Interpretation</label>
                                <textarea
                                    value={remarks[testIndex]}
                                    onChange={(e) => handleRemarkChange(testIndex, e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                    placeholder="Optional remarks for this test..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LabResultEntry;
