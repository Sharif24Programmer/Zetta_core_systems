/**
 * Patient Service (Dual Mode: Demo + Firebase)
 * Manage patient records with medical history
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
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../../core/firebase/config';
import { isDemoMode, getDemoData, saveDemoData, generateDemoId } from '../../../core/demo/demoManager';

const PATIENTS_COLLECTION = 'patients';

/**
 * Get all patients for a tenant
 */
export const getAllPatients = async (tenantId) => {
    // DEMO MODE: Use localStorage
    if (isDemoMode()) {
        const patients = getDemoData('patients');
        return patients.filter(p => p.tenantId === tenantId);
    }

    // PRODUCTION MODE: Use Firebase
    try {
        const q = query(
            collection(db, PATIENTS_COLLECTION),
            where('tenantId', '==', tenantId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const patients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to ISO strings
            registrationDate: doc.data().registrationDate?.toDate?.()?.toISOString() || doc.data().registrationDate,
            lastVisit: doc.data().lastVisit?.toDate?.()?.toISOString() || doc.data().lastVisit,
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
        }));

        return patients;
    } catch (error) {
        console.error('Error getting patients:', error);
        throw error;
    }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (patientId) => {
    // DEMO MODE
    if (isDemoMode()) {
        const patients = getDemoData('patients');
        return patients.find(p => p.id === patientId) || null;
    }

    // PRODUCTION MODE
    try {
        const docRef = doc(db, PATIENTS_COLLECTION, patientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                registrationDate: docSnap.data().registrationDate?.toDate?.()?.toISOString() || docSnap.data().registrationDate,
                lastVisit: docSnap.data().lastVisit?.toDate?.()?.toISOString() || docSnap.data().lastVisit,
                createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting patient:', error);
        throw error;
    }
};

/**
 * Add new patient
 */
export const addPatient = async (patientData) => {
    // DEMO MODE
    if (isDemoMode()) {
        const patients = getDemoData('patients');
        const newPatient = {
            id: generateDemoId('demo_patient'),
            ...patientData,
            registrationDate: new Date().toISOString(),
            totalVisits: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        patients.push(newPatient);
        saveDemoData('patients', patients);
        return newPatient;
    }

    // PRODUCTION MODE
    try {
        const newPatient = {
            ...patientData,
            registrationDate: serverTimestamp(),
            totalVisits: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), newPatient);

        return {
            id: docRef.id,
            ...patientData,
            registrationDate: new Date().toISOString(),
            totalVisits: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error adding patient:', error);
        throw error;
    }
};

/**
 * Update patient
 */
export const updatePatient = async (patientId, updates) => {
    // DEMO MODE
    if (isDemoMode()) {
        const patients = getDemoData('patients');
        const index = patients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            patients[index] = {
                ...patients[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            saveDemoData('patients', patients);
            return patients[index];
        }
        return null;
    }

    // PRODUCTION MODE
    try {
        const docRef = doc(db, PATIENTS_COLLECTION, patientId);

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        // Fetch and return updated patient
        const updatedPatient = await getPatientById(patientId);
        return updatedPatient;
    } catch (error) {
        console.error('Error updating patient:', error);
        throw error;
    }
};

/**
 * Search patients
 */
export const searchPatients = async (tenantId, query) => {
    try {
        // Get all patients for the tenant
        const patients = await getAllPatients(tenantId);

        // Client-side search (Firestore doesn't support full-text search natively)
        const lowerQuery = query.toLowerCase();

        return patients.filter(p =>
            p.name?.toLowerCase().includes(lowerQuery) ||
            p.phone?.includes(query) ||
            p.id?.toLowerCase().includes(lowerQuery) ||
            p.email?.toLowerCase().includes(lowerQuery)
        );
    } catch (error) {
        console.error('Error searching patients:', error);
        throw error;
    }
};

/**
 * Record patient visit
 */
export const recordVisit = async (patientId, visitData) => {
    try {
        const patient = await getPatientById(patientId);
        if (!patient) return null;

        const docRef = doc(db, PATIENTS_COLLECTION, patientId);

        await updateDoc(docRef, {
            lastVisit: serverTimestamp(),
            totalVisits: (patient.totalVisits || 0) + 1,
            updatedAt: serverTimestamp()
        });

        return await getPatientById(patientId);
    } catch (error) {
        console.error('Error recording visit:', error);
        throw error;
    }
};

/**
 * Delete patient (soft delete by marking as inactive)
 */
export const deletePatient = async (patientId) => {
    try {
        const docRef = doc(db, PATIENTS_COLLECTION, patientId);

        await updateDoc(docRef, {
            isActive: false,
            deletedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error deleting patient:', error);
        throw error;
    }
};
