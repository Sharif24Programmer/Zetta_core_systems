/**
 * Lab Service (Local Storage Version)
 * Manage Lab Tests, Results, and Patient Reports
 */

const LAB_REPORTS_KEY = 'zetta_lab_reports';
const LAB_TESTS_KEY = 'zetta_lab_tests'; // Catalog of available tests

// --- Initial Data ---
const DEFAULT_TESTS = [
    {
        id: 'test_blood_cbc',
        name: 'Complete Blood Count (CBC)',
        category: 'Hematology',
        price: 350,
        parameters: [
            { name: 'Hemoglobin', unit: 'g/dL', range: '13.0-17.0' },
            { name: 'WBC Count', unit: '/cumm', range: '4000-11000' },
            { name: 'RBC Count', unit: 'mil/cumm', range: '4.5-5.5' },
            { name: 'Platelets', unit: 'lakh/cumm', range: '1.5-4.5' }
        ]
    },
    {
        id: 'test_lipid',
        name: 'Lipid Profile',
        category: 'Biochemistry',
        price: 550,
        parameters: [
            { name: 'Total Cholesterol', unit: 'mg/dL', range: '<200' },
            { name: 'HDL Cholesterol', unit: 'mg/dL', range: '>40' },
            { name: 'LDL Cholesterol', unit: 'mg/dL', range: '<100' },
            { name: 'Triglycerides', unit: 'mg/dL', range: '<150' }
        ]
    },
    {
        id: 'test_sugar_fasting',
        name: 'Blood Sugar (Fasting)',
        category: 'Biochemistry',
        price: 150,
        parameters: [
            { name: 'Glucose (Fasting)', unit: 'mg/dL', range: '70-100' }
        ]
    }
];

// --- Helpers ---
const getFromStorage = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
};

const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- Service Methods ---

/**
 * Get available tests catalog
 */
export const getLabTests = async (tenantId) => {
    // Return default + custom tests
    const customTests = getFromStorage(LAB_TESTS_KEY).filter(t => t.tenantId === tenantId);
    return [...DEFAULT_TESTS, ...customTests];
};

/**
 * Create a new Patient Lab Report
 */
export const createLabReport = async (reportData) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const reports = getFromStorage(LAB_REPORTS_KEY);
    const newReport = {
        id: `report_${Date.now()}`,
        ...reportData,
        status: 'completed', // or 'pending'
        createdAt: new Date().toISOString()
    };

    reports.push(newReport);
    saveToStorage(LAB_REPORTS_KEY, reports);
    return newReport;
};

/**
 * Get reports for a specific patient
 */
export const getPatientReports = async (patientId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const reports = getFromStorage(LAB_REPORTS_KEY);
    return reports
        .filter(r => r.patientId === patientId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Get all reports for a tenant (Dashboard)
 */
export const getAllLabReports = async (tenantId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const reports = getFromStorage(LAB_REPORTS_KEY);
    return reports
        .filter(r => r.tenantId === tenantId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Generate Report HTML for printing
 */
export const generateReportHTML = (report, patient, tenantName) => {
    return `
        <html>
        <head>
            <title>Lab Report - ${patient.name}</title>
            <style>
                body { font-family: 'Helvetica', sans-serif; padding: 40px; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #ccc; padding-bottom: 20px; }
                .patient-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9fafb; pading: 20px; border-radius: 8px; }
                .test-section { margin-bottom: 30px; }
                .test-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
                th { color: #555; font-size: 14px; }
                .footer { text-align: center; margin-top: 50px; color: #888; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${tenantName}</h1>
                <p>Medical Laboratory Report</p>
            </div>
            
            <div class="patient-info">
                <div>
                    <strong>Patient:</strong> ${patient.name}<br>
                    <strong>Age/Sex:</strong> ${patient.age || 'N/A'} / ${patient.gender || 'N/A'}<br>
                    <strong>ID:</strong> ${patient.id}
                </div>
                <div style="text-align: right;">
                    <strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}<br>
                    <strong>Report ID:</strong> ${report.id}
                </div>
            </div>

            <div class="results">
                ${report.results.map(test => `
                    <div class="test-section">
                        <div class="test-name">${test.testName}</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Result</th>
                                    <th>Unit</th>
                                    <th>Reference Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${test.parameters.map(param => `
                                    <tr>
                                        <td>${param.name}</td>
                                        <td><strong>${param.value}</strong></td>
                                        <td>${param.unit}</td>
                                        <td>${param.range}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
            </div>

            <div class="footer">
                <p>Electronically generated report. No signature required.</p>
            </div>
        </body>
        </html>
    `;
};
