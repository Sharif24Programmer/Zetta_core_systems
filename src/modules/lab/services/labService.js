/**
 * Lab Service (Firestore Version)
 * Manage Lab Tests, Results, and Patient Reports
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../core/firebase/config';

const LAB_REPORTS_COLLECTION = 'lab_reports';

export const LAB_STATUS = {
    REGISTERED: 'registered',
    COLLECTED: 'collected',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    DELIVERED: 'delivered'
};

// Default test catalog (can be stored in Firestore later)
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

/**
 * Get available tests catalog
 */
export const getLabTests = async (tenantId) => {
    // For now, return default tests
    // Future: fetch from Firestore collection 'lab_test_templates'
    return DEFAULT_TESTS;
};

/**
 * Create a new Patient Lab Report
 */
export const createLabReport = async (reportData) => {
    try {
        const newReport = {
            ...reportData,
            status: reportData.status || LAB_STATUS.REGISTERED,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, LAB_REPORTS_COLLECTION), newReport);

        return {
            id: docRef.id,
            ...reportData,
            createdAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error creating lab report:', error);
        throw error;
    }
};

/**
 * Get reports for a specific patient
 */
export const getPatientReports = async (patientId) => {
    try {
        const q = query(
            collection(db, LAB_REPORTS_COLLECTION),
            where('patientId', '==', patientId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
        }));
    } catch (error) {
        console.error('Error getting patient reports:', error);
        throw error;
    }
};

/**
 * Get all reports for a tenant (Dashboard)
 */
export const getAllLabReports = async (tenantId) => {
    try {
        const q = query(
            collection(db, LAB_REPORTS_COLLECTION),
            where('tenantId', '==', tenantId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
        }));
    } catch (error) {
        console.error('Error getting lab reports:', error);
        throw error;
    }
};

/**
 * Get single report by ID
 */
export const getLabReportById = async (id) => {
    try {
        const docRef = doc(db, LAB_REPORTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting lab report:', error);
        throw error;
    }
};

/**
 * Update a report (status, results, etc)
 */
export const updateLabReport = async (id, updates) => {
    try {
        const docRef = doc(db, LAB_REPORTS_COLLECTION, id);

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        // Return updated report
        return await getLabReportById(id);
    } catch (error) {
        console.error('Error updating lab report:', error);
        throw error;
    }
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
                .patient-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 8px; }
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
