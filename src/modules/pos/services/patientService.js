import { db } from '../../../services/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDoc,
    limit
} from 'firebase/firestore';

/**
 * Patient Schema:
 * {
 *   tenantId: string,
 *   name: string,
 *   phone: string,
 *   email?: string,
 *   dob?: Date,
 *   gender?: 'male' | 'female' | 'other',
 *   address?: string,
 *   bloodGroup?: string,
 *   allergies?: string[],
 *   medicalHistory?: string,
 *   isActive: boolean,
 *   createdAt: timestamp
 * }
 */

/**
 * Get all patients for a tenant
 */
export const getPatients = async (tenantId, limitCount = 100) => {
    const q = query(
        collection(db, "patients"),
        where("tenantId", "==", tenantId),
        where("isActive", "==", true),
        orderBy("name", "asc"),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Search patients by name or phone
 */
export const searchPatients = async (tenantId, searchTerm) => {
    const patients = await getPatients(tenantId);
    const term = searchTerm.toLowerCase();

    return patients.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.phone?.includes(term)
    );
};

/**
 * Listen to patients
 */
export const listenToPatients = (tenantId, callback) => {
    const q = query(
        collection(db, "patients"),
        where("tenantId", "==", tenantId),
        where("isActive", "==", true),
        orderBy("name", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const patients = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(patients);
    });
};

/**
 * Get patient by ID
 */
export const getPatientById = async (patientId) => {
    const docRef = doc(db, "patients", patientId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
    }
    return null;
};

/**
 * Create new patient
 */
export const createPatient = async (patientData) => {
    const data = {
        ...patientData,
        isActive: true,
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "patients"), data);
    return { id: docRef.id, ...data };
};

/**
 * Update patient
 */
export const updatePatient = async (patientId, updates) => {
    const docRef = doc(db, "patients", patientId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
};

/**
 * Get recent patients for quick selection
 */
export const getRecentPatients = async (tenantId, count = 5) => {
    const q = query(
        collection(db, "patients"),
        where("tenantId", "==", tenantId),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Format patient display name
 */
export const formatPatientName = (patient) => {
    if (!patient) return 'Walk-in Patient';
    return patient.name || 'Unknown';
};

/**
 * Add Vitals (BP, Temp, Weight, etc)
 */
export const addVitals = async (patientId, vitalsData) => {
    // Simulate network
    await new Promise(resolve => setTimeout(resolve, 300));

    // In a real app, this would be a sub-collection 'vitals'
    // Here we'll simulate it by updating a 'vitalsHistory' array on the patient doc
    const docRef = doc(db, "patients", patientId);
    const patient = await getPatientById(patientId);

    const newEntry = {
        id: `vital_${Date.now()}`,
        ...vitalsData,
        date: new Date().toISOString()
    };

    const history = patient.vitalsHistory || [];
    history.push(newEntry);

    await updateDoc(docRef, { vitalsHistory: history, updatedAt: serverTimestamp() });
    return newEntry;
};

/**
 * Get Vitals History
 */
export const getVitalsHistory = async (patientId) => {
    const patient = await getPatientById(patientId);
    return (patient?.vitalsHistory || []).sort((a, b) => new Date(b.date) - new Date(a.date));
};
