import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../../../core/auth/AuthContext';
import { getLabReportById, updateLabReport, LAB_STATUS } from '../services/labService';

const LabReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = getLabReportById(id);
        if (data) {
            setReport(data);
        } else {
            alert('Report not found');
            navigate('/app/lab');
        }
        setLoading(false);
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        await updateLabReport(id, { status: newStatus });
        const updated = getLabReportById(id);
        setReport(updated);
    };

    const getStatusBadge = (status) => {
        const styles = {
            registered: 'bg-blue-100 text-blue-700',
            collected: 'bg-yellow-100 text-yellow-700',
            processing: 'bg-purple-100 text-purple-700',
            completed: 'bg-green-100 text-green-700',
            delivered: 'bg-slate-100 text-slate-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const handleGeneratePDF = async () => {
        const input = document.getElementById('lab-report-content');
        if (!input) return;

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                logging: false,
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            // For simple long page handling, we might need more complex logic. 
            // For now, scaling to fit width is a basic professional approach for A4.
            // If it's too long, html2canvas renders the whole thing and we might scale it down.
            // A better approach for multipage is creating new pages.
            // But let's start with single page fit-to-width for standard reports.

            const imgComponentWidth = pdfWidth - 20; // 10mm margin each side
            const imgComponentHeight = (canvas.height * imgComponentWidth) / canvas.width;

            // If height exceeds A4, we might need multiple pages.
            // For MVP, we'll just add the image.

            pdf.addImage(imgData, 'PNG', 10, 10, imgComponentWidth, imgComponentHeight);
            pdf.save(`Lab_Report_${report.id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!report) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/app/lab')} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-semibold text-slate-900">Lab Report {report.id}</h1>
                                {getStatusBadge(report.status)}
                            </div>
                            <p className="text-sm text-slate-500">
                                Created {new Date(report.createdAt).toLocaleDateString()} • {report.priority.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Actions based on status */}
                        {report.status === LAB_STATUS.REGISTERED && (
                            <button
                                onClick={() => handleStatusUpdate(LAB_STATUS.COLLECTED)}
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium"
                            >
                                Mark Sample Collected
                            </button>
                        )}

                        {(report.status === LAB_STATUS.COLLECTED || report.status === LAB_STATUS.PROCESSING) && (
                            <Link
                                to={`/app/lab/${id}/results`}
                                className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                                Enter Results
                            </Link>
                        )}

                        {report.status === LAB_STATUS.COMPLETED && (
                            <>
                                <Link
                                    to={`/app/lab/${id}/results`}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium"
                                >
                                    Edit Results
                                </Link>
                                <button
                                    onClick={() => handleStatusUpdate(LAB_STATUS.DELIVERED)}
                                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium"
                                >
                                    Deliver Report
                                </button>
                                <button
                                    className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-sm font-medium flex items-center gap-2"
                                    onClick={handleGeneratePDF}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8" id="lab-report-content">
                {/* Clinic Header (Visible only in PDF usually, but good to show here too) */}
                <div className="bg-white border-b border-slate-200 p-6 mb-0 text-center rounded-t-xl">
                    <h1 className="text-2xl font-bold text-primary-700">ZETTA CLINIC & DIAGNOSTICS</h1>
                    <p className="text-slate-500">123, Healthcare Street, Medical District, City - 560001</p>
                    <p className="text-sm text-slate-400">Phone: +91 9876543210 • Email: report@zettagroup.com</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Patient Info Card */}
                    <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-6 mb-2">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Patient Details</h2>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{report.patientName}</p>
                                <p className="text-slate-500 mt-1">
                                    {report.patientAge} Years / {report.patientGender}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500">Referring Doctor</p>
                                <p className="font-medium text-slate-800">{report.referringDoctor || 'Self'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500">Report ID</p>
                                <p className="font-medium text-slate-800 tracking-wider">#{report.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="col-span-3 space-y-6">
                        {report.tests.map((test, index) => (
                            <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-800">{test.testName}</h3>
                                    <p className="text-xs text-slate-500">{test.category}</p>
                                </div>

                                {test.parameters && test.parameters[0].value !== null ? (
                                    <div className="p-0">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-medium text-slate-500">Parameter</th>
                                                    <th className="px-6 py-3 text-left font-medium text-slate-500">Result</th>
                                                    <th className="px-6 py-3 text-left font-medium text-slate-500">Unit</th>
                                                    <th className="px-6 py-3 text-left font-medium text-slate-500">Reference Range</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {test.parameters.map((param, pIndex) => (
                                                    <tr key={pIndex} className="hover:bg-slate-50">
                                                        <td className="px-6 py-3 font-medium text-slate-700">{param.name}</td>
                                                        <td className="px-6 py-3">
                                                            <span className={`font-semibold ${param.status === 'critical_high' || param.status === 'critical_low' ? 'text-red-600' :
                                                                param.status === 'high' || param.status === 'low' ? 'text-orange-600' :
                                                                    'text-slate-900'
                                                                }`}>
                                                                {param.value || '--'}
                                                            </span>
                                                            {/* Status Indicator */}
                                                            {param.value && (
                                                                <>
                                                                    {(param.status === 'high' || param.status === 'critical_high') && <span className="ml-2 text-xs font-bold text-orange-600">↑ High</span>}
                                                                    {(param.status === 'low' || param.status === 'critical_low') && <span className="ml-2 text-xs font-bold text-orange-600">↓ Low</span>}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3 text-slate-500">{param.unit}</td>
                                                        <td className="px-6 py-3 text-slate-500">
                                                            {/* We handle range display directly here or via helper */}
                                                            {param.normalRange ? (
                                                                // Simplified for display. Better to use helper in a real app with more context but this works for stored data
                                                                <span>Check context</span>
                                                            ) : '--'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {test.remarks && (
                                            <div className="px-6 py-4 bg-yellow-50 border-t border-slate-100">
                                                <p className="text-sm font-semibold text-yellow-800">Remarks:</p>
                                                <p className="text-sm text-yellow-700 mt-1">{test.remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <p>No results entered yet.</p>
                                        <Link
                                            to={`/app/lab/${id}/results`}
                                            className="text-primary-600 font-medium hover:underline mt-2 inline-block"
                                        >
                                            Enter Results Now
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabReportDetail;
