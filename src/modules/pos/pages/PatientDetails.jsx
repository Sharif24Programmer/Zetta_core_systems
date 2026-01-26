import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getPatientById, getVitalsHistory, addVitals } from '../services/patientService';
import { getLabTests, createLabReport, getPatientReports, generateReportHTML } from '../../lab/services/labService';
import Loader from '../../../shared/components/Loader';

const PatientDetails = () => {
    const { id: patientId } = useParams();
    const navigate = useNavigate();
    const { hasFeature } = useAuth();

    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Vitals State
    const [vitals, setVitals] = useState([]);
    const [showAddVital, setShowAddVital] = useState(false);
    const [newVital, setNewVital] = useState({ bp: '', temp: '', weight: '', pulse: '' });

    // Lab State
    const [labReports, setLabReports] = useState([]);
    const [availableTests, setAvailableTests] = useState([]);
    const [showAddLab, setShowAddLab] = useState(false);
    const [selectedTest, setSelectedTest] = useState('');
    const [testResults, setTestResults] = useState({}); // { parameterName: value }

    useEffect(() => {
        loadData();
    }, [patientId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const p = await getPatientById(patientId);
            setPatient(p);

            const v = await getVitalsHistory(patientId);
            setVitals(v);

            const reports = await getPatientReports(patientId);
            setLabReports(reports);

            const tests = await getLabTests(p.tenantId);
            setAvailableTests(tests);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVital = async () => {
        await addVitals(patientId, newVital);
        setShowAddVital(false);
        setNewVital({ bp: '', temp: '', weight: '', pulse: '' });
        loadData(); // Refresh
    };

    const handleCreateReport = async () => {
        const testDef = availableTests.find(t => t.id === selectedTest);
        if (!testDef) return;

        const results = [{
            testName: testDef.name,
            testId: testDef.id,
            parameters: testDef.parameters.map(p => ({
                name: p.name,
                unit: p.unit,
                range: p.range,
                value: testResults[p.name] || ''
            }))
        }];

        await createLabReport({
            tenantId: patient.tenantId,
            patientId: patient.id,
            patientName: patient.name,
            results
        });

        setShowAddLab(false);
        setSelectedTest('');
        setTestResults({});
        loadData();
    };

    const handlePrintReport = (report) => {
        const html = generateReportHTML(report, patient, "Medical Center");
        const win = window.open('', '_blank');
        win.document.write(html);
        win.print();
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader text="Loading patient..." /></div>;
    if (!patient) return <div className="p-8 text-center text-slate-500">Patient not found</div>;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header flex justify-between items-start">
                <div>
                    <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-800 mb-2">← Back</button>
                    <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
                    <p className="text-slate-500">{patient.phone} • {patient.gender} • {patient.age ? `${patient.age} yrs` : 'Age N/A'}</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary">Edit Profile</button>
                    <button className="btn-primary" onClick={() => navigate(`/app/pos/new?patientId=${patient.id}`)}>New Bill</button>
                </div>
            </div>

            {/* Quick Vitals Banner */}
            {vitals.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-8">
                    <div>
                        <span className="text-xs text-blue-400 block uppercase font-bold">BP</span>
                        <span className="text-lg font-semibold text-blue-900">{vitals[0].bp || '--'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-blue-400 block uppercase font-bold">Weight</span>
                        <span className="text-lg font-semibold text-blue-900">{vitals[0].weight ? `${vitals[0].weight} kg` : '--'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-blue-400 block uppercase font-bold">Temp</span>
                        <span className="text-lg font-semibold text-blue-900">{vitals[0].temp ? `${vitals[0].temp}°F` : '--'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-blue-400 block uppercase font-bold">Last Check</span>
                        <span className="text-xs text-blue-700">{new Date(vitals[0].date).toLocaleDateString()}</span>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
                {['overview', 'vitals', 'lab_reports', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.replace('_', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="page-content">
                {activeTab === 'vitals' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">Vitals History</h3>
                            <button onClick={() => setShowAddVital(true)} className="btn-secondary text-sm">+ Add Vitals</button>
                        </div>

                        {showAddVital && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fadeIn">
                                <div className="grid grid-cols-4 gap-3 mb-3">
                                    <input placeholder="BP (120/80)" value={newVital.bp} onChange={e => setNewVital({ ...newVital, bp: e.target.value })} className="input-field" />
                                    <input placeholder="Weight (kg)" value={newVital.weight} onChange={e => setNewVital({ ...newVital, weight: e.target.value })} className="input-field" />
                                    <input placeholder="Temp (°F)" value={newVital.temp} onChange={e => setNewVital({ ...newVital, temp: e.target.value })} className="input-field" />
                                    <input placeholder="Pulse (bpm)" value={newVital.pulse} onChange={e => setNewVital({ ...newVital, pulse: e.target.value })} className="input-field" />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => setShowAddVital(false)} className="text-sm text-slate-500">Cancel</button>
                                    <button onClick={handleAddVital} className="btn-primary text-sm">Save Entry</button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="p-3 text-left">Date</th>
                                        <th className="p-3 text-left">BP</th>
                                        <th className="p-3 text-left">Weight</th>
                                        <th className="p-3 text-left">Temp</th>
                                        <th className="p-3 text-left">Pulse</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vitals.map(v => (
                                        <tr key={v.id} className="border-t hover:bg-slate-50">
                                            <td className="p-3">{new Date(v.date).toLocaleString()}</td>
                                            <td className="p-3 font-medium">{v.bp || '-'}</td>
                                            <td className="p-3">{v.weight || '-'}</td>
                                            <td className="p-3">{v.temp || '-'}</td>
                                            <td className="p-3">{v.pulse || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'lab_reports' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">Lab Reports</h3>
                            <button onClick={() => setShowAddLab(true)} className="btn-secondary text-sm">+ New Report</button>
                        </div>

                        {showAddLab && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fadeIn">
                                <h4 className="font-medium text-slate-700 mb-3">Create New Report</h4>
                                <select
                                    value={selectedTest}
                                    onChange={e => setSelectedTest(e.target.value)}
                                    className="input-field mb-4 w-full"
                                >
                                    <option value="">Select Test Type...</option>
                                    {availableTests.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                                    ))}
                                </select>

                                {selectedTest && (
                                    <div className="space-y-3 mb-4">
                                        {availableTests.find(t => t.id === selectedTest).parameters.map(param => (
                                            <div key={param.name} className="flex items-center gap-3">
                                                <label className="w-1/3 text-sm text-slate-600">{param.name} ({param.unit})</label>
                                                <input
                                                    className="input-field flex-1"
                                                    placeholder={`Range: ${param.range}`}
                                                    onChange={e => setTestResults({ ...testResults, [param.name]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => { setShowAddLab(false); setSelectedTest(''); }} className="text-sm text-slate-500">Cancel</button>
                                    <button onClick={handleCreateReport} disabled={!selectedTest} className="btn-primary text-sm disabled:opacity-50">Generate Report</button>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-3">
                            {labReports.map(report => (
                                <div key={report.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center hover:shadow-sm transition-shadow">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{report.results[0].testName}</h4>
                                        <p className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleString()} • ID: {report.id}</p>
                                    </div>
                                    <button onClick={() => handlePrintReport(report)} className="text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded text-sm font-medium">
                                        View / Print
                                    </button>
                                </div>
                            ))}
                            {labReports.length === 0 && <p className="text-slate-400 text-center py-8">No reports found.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="text-center py-12 text-slate-500">Overview content coming soon...</div>
                )}
            </div>
        </div>
    );
};

export default PatientDetails;
