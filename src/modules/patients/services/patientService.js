/**
 * Patient Service
 * Manage patient records with medical history
 */

const PATIENTS_KEY = 'zetta_patients';

/**
 * Get all patients for a tenant
 */
export const getAllPatients = (tenantId) => {
    try {
        const data = localStorage.getItem(PATIENTS_KEY);
        let patients = data ? JSON.parse(data) : [];

        // Filter by tenant
        patients = patients.filter(p => p.tenantId === tenantId);

        // Init demo patients if empty for clinic
        if (patients.length === 0 && (tenantId === 'demo_clinic' || tenantId === 'demo_pharmacy')) {
            patients = initDemoPatients(tenantId);
        }

        return patients;
    } catch (e) {
        console.error('Error getting patients:', e);
        return [];
    }
};

/**
 * Get patient by ID
 */
export const getPatientById = (patientId) => {
    const allPatients = getAllPatientsFromStorage();
    return allPatients.find(p => p.id === patientId);
};

/**
 * Add new patient
 */
export const addPatient = (patientData) => {
    const allPatients = getAllPatientsFromStorage();
    const newPatient = {
        id: `PAT${Date.now()}`,
        ...patientData,
        registrationDate: new Date().toISOString(),
        totalVisits: 0,
        createdAt: new Date().toISOString()
    };

    allPatients.push(newPatient);
    savePatients(allPatients);
    return newPatient;
};

/**
 * Update patient
 */
export const updatePatient = (patientId, updates) => {
    const allPatients = getAllPatientsFromStorage();
    const index = allPatients.findIndex(p => p.id === patientId);

    if (index !== -1) {
        allPatients[index] = { ...allPatients[index], ...updates, updatedAt: new Date().toISOString() };
        savePatients(allPatients);
        return allPatients[index];
    }
    return null;
};

/**
 * Search patients
 */
export const searchPatients = (tenantId, query) => {
    const patients = getAllPatients(tenantId);
    const lowerQuery = query.toLowerCase();

    return patients.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.phone.includes(query) ||
        p.id.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Record patient visit
 */
export const recordVisit = (patientId, visitData) => {
    const patient = getPatientById(patientId);
    if (!patient) return null;

    const updatedPatient = {
        ...patient,
        lastVisit: new Date().toISOString(),
        totalVisits: (patient.totalVisits || 0) + 1
    };

    return updatePatient(patientId, updatedPatient);
};

// --- Helpers ---

const getAllPatientsFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem(PATIENTS_KEY) || '[]');
    } catch { return []; }
};

const savePatients = (patients) => {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
};

// --- Demo Data ---

const initDemoPatients = (tenantId) => {
    const demoPatients = [
        {
            id: 'PAT001',
            tenantId,
            name: 'Ramesh Kumar',
            age: 45,
            gender: 'male',
            phone: '9876543210',
            email: 'ramesh.k@email.com',
            address: 'MG Road, Bangalore',
            bloodGroup: 'A+',
            height: 172,
            weight: 75,
            allergies: ['Penicillin'],
            chronicConditions: ['Diabetes Type 2', 'Hypertension'],
            emergencyContact: {
                name: 'Sunita Kumar',
                phone: '9876543211',
                relation: 'Wife'
            },
            insuranceProvider: 'Star Health',
            policyNumber: 'STR123456',
            registrationDate: '2025-06-15T10:00:00.000Z',
            lastVisit: '2026-01-26T09:00:00.000Z',
            totalVisits: 12
        },
        {
            id: 'PAT002',
            tenantId,
            name: 'Priya Sharma',
            age: 32,
            gender: 'female',
            phone: '9876543211',
            email: 'priya.sharma@email.com',
            address: 'Koramangala, Bangalore',
            bloodGroup: 'B+',
            height: 165,
            weight: 58,
            allergies: [],
            chronicConditions: [],
            emergencyContact: {
                name: 'Rajesh Sharma',
                phone: '9876543212',
                relation: 'Husband'
            },
            registrationDate: '2025-08-20T10:00:00.000Z',
            lastVisit: '2026-01-25T14:30:00.000Z',
            totalVisits: 5
        },
        {
            id: 'PAT003',
            tenantId,
            name: 'Amit Patel',
            age: 28,
            gender: 'male',
            phone: '9876543212',
            address: 'Whitefield, Bangalore',
            bloodGroup: 'O+',
            height: 178,
            weight: 82,
            allergies: ['Peanuts'],
            chronicConditions: [],
            registrationDate: '2025-11-10T10:00:00.000Z',
            lastVisit: '2026-01-24T11:00:00.000Z',
            totalVisits: 3
        },
        {
            id: 'PAT004',
            tenantId,
            name: 'Sunita Devi',
            age: 55,
            gender: 'female',
            phone: '9876543213',
            address: 'Jayanagar, Bangalore',
            bloodGroup: 'AB+',
            height: 160,
            weight: 68,
            allergies: [],
            chronicConditions: ['Thyroid (Hypothyroidism)'],
            emergencyContact: {
                name: 'Mohan Devi',
                phone: '9876543214',
                relation: 'Son'
            },
            registrationDate: '2025-05-05T10:00:00.000Z',
            lastVisit: '2026-01-23T16:00:00.000Z',
            totalVisits: 18
        },
        {
            id: 'PAT005',
            tenantId,
            name: 'Rajesh Singh',
            age: 38,
            gender: 'male',
            phone: '9876543214',
            address: 'Indiranagar, Bangalore',
            bloodGroup: 'O-',
            height: 175,
            weight: 70,
            allergies: ['Sulfa drugs'],
            chronicConditions: [],
            registrationDate: '2025-09-12T10:00:00.000Z',
            lastVisit: '2026-01-22T10:30:00.000Z',
            totalVisits: 7
        }
    ];

    savePatients(demoPatients);
    return demoPatients;
};
