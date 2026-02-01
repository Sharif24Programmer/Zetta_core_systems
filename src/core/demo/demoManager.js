/**
 * Demo Mode Manager
 * Handles switching between Demo (localStorage) and Production (Firebase) modes
 */

// Demo user data
export const DEMO_USER = {
    uid: 'demo_user_001',
    email: 'demo@zettapos.com',
    displayName: 'Demo User',
    demo: true
};

// Demo tenant data
export const DEMO_TENANT = {
    id: 'demo_tenant_001',
    name: 'Demo Medical Store',
    type: 'pharmacy',
    plan: 'pro',
    demo: true,
    locations: [
        { id: 'loc1', name: 'Main Clinic', address: '123 MG Road, Bangalore' },
        { id: 'loc2', name: 'Downtown Branch', address: '456 Park Street, Mumbai' }
    ]
};

/**
 * Check if user is in demo mode
 */
export const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('zetta_demo_mode') === 'true';
};

/**
 * Get demo business type
 */
export const getDemoBusinessType = () => {
    return localStorage.getItem('zetta_demo_business') || 'clinic';
};

/**
 * Enable demo mode
 */
export const enableDemoMode = (businessType = 'clinic') => {
    localStorage.setItem('zetta_demo_mode', 'true');
    localStorage.setItem('zetta_demo_business', businessType);

    // Set demo user data
    localStorage.setItem('zetta_demo_user', JSON.stringify(DEMO_USER));
    localStorage.setItem('zetta_demo_tenant', JSON.stringify({
        ...DEMO_TENANT,
        type: businessType,
        name: businessType === 'pharmacy' ? 'Demo Pharmacy' :
            businessType === 'clinic' ? 'Demo Clinic' : 'Demo Retail Store'
    }));

    // Initialize demo data
    initializeDemoData(businessType);
};

/**
 * Exit demo mode and redirect to login
 */
export const exitDemoMode = () => {
    localStorage.removeItem('zetta_demo_mode');
    localStorage.removeItem('zetta_demo_business');
    localStorage.removeItem('zetta_demo_user');
    localStorage.removeItem('zetta_demo_tenant');

    // Clear all demo data
    clearDemoData();

    // Redirect to login
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};

/**
 * Initialize demo data based on business type
 */
const initializeDemoData = (businessType) => {
    // Initialize patients
    const demoPatients = [
        {
            id: 'demo_patient_001',
            tenantId: 'demo_tenant_001',
            name: 'Rajesh Kumar',
            age: 45,
            gender: 'Male',
            phone: '+91 98765 43210',
            email: 'rajesh@example.com',
            address: '123 MG Road, Bangalore',
            registrationDate: new Date().toISOString(),
            totalVisits: 3,
            lastVisit: new Date().toISOString()
        },
        {
            id: 'demo_patient_002',
            tenantId: 'demo_tenant_001',
            name: 'Priya Sharma',
            age: 32,
            gender: 'Female',
            phone: '+91 98765 43211',
            email: 'priya@example.com',
            address: '456 Park Street, Mumbai',
            registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            totalVisits: 5,
            lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    localStorage.setItem('zetta_demo_patients', JSON.stringify(demoPatients));

    // Initialize products/inventory
    const demoProducts = businessType === 'pharmacy' ? [
        {
            id: 'demo_product_001',
            tenantId: 'demo_tenant_001',
            name: 'Paracetamol 500mg',
            category: 'Pain Relief',
            price: 50,
            costPrice: 30,
            stock: 500,
            barcode: '1234567890123',
            trackStock: true,
            isActive: true
        },
        {
            id: 'demo_product_002',
            tenantId: 'demo_tenant_001',
            name: 'Amoxicillin 250mg',
            category: 'Antibiotics',
            price: 120,
            costPrice: 80,
            stock: 200,
            barcode: '1234567890124',
            trackStock: true,
            isActive: true
        }
    ] : [
        {
            id: 'demo_product_001',
            tenantId: 'demo_tenant_001',
            name: 'Consultation Fee',
            category: 'Services',
            price: 500,
            costPrice: 0,
            stock: 0,
            trackStock: false,
            isActive: true
        }
    ];
    localStorage.setItem('zetta_demo_products', JSON.stringify(demoProducts));

    // Initialize lab reports (if clinic)
    if (businessType === 'clinic') {
        const demoLabReports = [];
        localStorage.setItem('zetta_demo_lab_reports', JSON.stringify(demoLabReports));
    }

    // Initialize appointments
    const demoAppointments = [];
    localStorage.setItem('zetta_demo_appointments', JSON.stringify(demoAppointments));
};

/**
 * Clear all demo data
 */
const clearDemoData = () => {
    const demoKeys = Object.keys(localStorage).filter(key => key.startsWith('zetta_demo_'));
    demoKeys.forEach(key => localStorage.removeItem(key));
};

/**
 * Get demo data from localStorage
 */
export const getDemoData = (collection) => {
    const key = `zetta_demo_${collection}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

/**
 * Save demo data to localStorage
 */
export const saveDemoData = (collection, data) => {
    const key = `zetta_demo_${collection}`;
    localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Generate demo ID
 */
export const generateDemoId = (prefix = 'demo') => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
};
