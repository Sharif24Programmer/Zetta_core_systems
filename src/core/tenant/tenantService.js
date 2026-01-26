import { db } from '../../services/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

/**
 * Get tenant by ID
 */
export const getTenant = async (tenantId) => {
    if (!tenantId) return null;

    const docRef = doc(db, 'tenants', tenantId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

/**
 * Create a new tenant
 */
export const createTenant = async (tenantData) => {
    const tenantId = tenantData.id || `tenant_${Date.now()}`;

    const data = {
        name: tenantData.name,
        email: tenantData.email,
        phone: tenantData.phone || '',
        address: tenantData.address || '',
        status: 'active', // active, suspended, deleted
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'tenants', tenantId), data);
    return { id: tenantId, ...data };
};

/**
 * Update tenant
 */
export const updateTenant = async (tenantId, updates) => {
    const docRef = doc(db, 'tenants', tenantId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
};

/**
 * Suspend tenant
 */
export const suspendTenant = async (tenantId) => {
    return updateTenant(tenantId, { status: 'suspended' });
};

/**
 * Activate tenant
 */
export const activateTenant = async (tenantId) => {
    return updateTenant(tenantId, { status: 'active' });
};

/**
 * Check if tenant is active
 */
export const isTenantActive = async (tenantId) => {
    const tenant = await getTenant(tenantId);
    return tenant?.status === 'active';
};
