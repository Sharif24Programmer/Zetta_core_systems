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
 * Visit Schema:
 * {
 *   tenantId: string,
 *   patientId: string,
 *   patientName: string,
 *   doctorId?: string,
 *   doctorName?: string,
 *   chiefComplaint: string,
 *   diagnosis?: string,
 *   notes?: string,
 *   vitals?: {
 *     bp?: string,
 *     pulse?: number,
 *     temp?: number,
 *     weight?: number
 *   },
 *   prescription?: {
 *     medicines: array,
 *     advice: string
 *   },
 *   billId?: string,
 *   followUpDate?: Date,
 *   status: 'waiting' | 'in-progress' | 'completed',
 *   createdAt: timestamp
 * }
 */

/**
 * Create new visit
 */
export const createVisit = async (visitData) => {
    const data = {
        ...visitData,
        status: 'waiting',
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "visits"), data);
    return { id: docRef.id, ...data };
};

/**
 * Get today's visits
 */
export const getTodaysVisits = async (tenantId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, "visits"),
        where("tenantId", "==", tenantId),
        where("createdAt", ">=", today),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Listen to today's visits
 */
export const listenToTodaysVisits = (tenantId, callback) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, "visits"),
        where("tenantId", "==", tenantId),
        where("createdAt", ">=", today),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const visits = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(visits);
    });
};

/**
 * Get visit by ID
 */
export const getVisitById = async (visitId) => {
    const docRef = doc(db, "visits", visitId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
    }
    return null;
};

/**
 * Update visit status
 */
export const updateVisitStatus = async (visitId, status) => {
    const docRef = doc(db, "visits", visitId);
    await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
    });
};

/**
 * Complete visit with bill
 */
export const completeVisit = async (visitId, billId, prescription) => {
    const docRef = doc(db, "visits", visitId);
    await updateDoc(docRef, {
        billId,
        prescription,
        status: 'completed',
        completedAt: serverTimestamp()
    });
};

/**
 * Get patient's visit history
 */
export const getPatientVisits = async (patientId, limitCount = 20) => {
    const q = query(
        collection(db, "visits"),
        where("patientId", "==", patientId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Visit status labels
 */
export const VISIT_STATUS = {
    waiting: { label: 'Waiting', color: 'yellow' },
    'in-progress': { label: 'In Progress', color: 'blue' },
    completed: { label: 'Completed', color: 'green' }
};
