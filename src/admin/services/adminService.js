/**
 * Admin Service (Local Storage Version)
 * Manages tenants, users, and platform stats locally
 */

const TENANTS_KEY = 'zetta_admin_tenants';
const USERS_KEY = 'zetta_admin_users';

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

// --- Demo Data Generator ---
const initDemoData = () => {
    const tenants = getFromStorage(TENANTS_KEY);
    if (tenants.length > 0) return;

    const demoTenants = [
        { id: 't1', name: 'City Hospital Pharmacy', type: 'Pharmacy', planId: 'pro', isActive: true, createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), ownerEmail: 'pharmacy@city.com' },
        { id: 't2', name: 'MediCare Clinic', type: 'Clinic', planId: 'basic', isActive: true, createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), ownerEmail: 'contact@medicare.com' },
        { id: 't3', name: 'Global Diagnostics', type: 'Lab', planId: 'enterprise', isActive: true, createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), ownerEmail: 'admin@global.com' },
        { id: 't4', name: 'Sunshine Apothecary', type: 'Pharmacy', planId: 'trial', isActive: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), ownerEmail: 'sunshine@demo.com' },
        { id: 'demo_shop', name: 'Zetta Demo Store', type: 'Pharmacy', planId: 'pro', isActive: true, createdAt: new Date().toISOString(), ownerEmail: 'demo@zetta.com' }
    ];

    saveToStorage(TENANTS_KEY, demoTenants);
};

// Initialize on load
initDemoData();

// --- Service Methods ---

/**
 * Get all tenants (Super Admin only)
 */
export const getAllTenants = async (limitCount = 100) => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Sim delay
    return getFromStorage(TENANTS_KEY);
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (tenantId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const tenants = getFromStorage(TENANTS_KEY);
    return tenants.find(t => t.id === tenantId) || null;
};

/**
 * Get tenant stats
 */
export const getTenantStats = async () => {
    const tenants = await getAllTenants();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = tenants.filter(t => t.isActive);
    const suspended = tenants.filter(t => !t.isActive);
    const byType = tenants.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
    }, {});

    const byPlan = tenants.reduce((acc, t) => {
        acc[t.planId || 'trial'] = (acc[t.planId || 'trial'] || 0) + 1;
        return acc;
    }, {});

    // New this month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const newThisMonth = tenants.filter(t => {
        const created = new Date(t.createdAt);
        return created >= monthStart;
    }).length;

    return {
        total: tenants.length,
        active: active.length,
        suspended: suspended.length,
        byType,
        byPlan,
        newThisMonth
    };
};

/**
 * Suspend tenant
 */
export const suspendTenant = async (tenantId) => {
    const tenants = getFromStorage(TENANTS_KEY);
    const index = tenants.findIndex(t => t.id === tenantId);
    if (index !== -1) {
        tenants[index].isActive = false;
        saveToStorage(TENANTS_KEY, tenants);
    }
};

/**
 * Activate tenant
 */
export const activateTenant = async (tenantId) => {
    const tenants = getFromStorage(TENANTS_KEY);
    const index = tenants.findIndex(t => t.id === tenantId);
    if (index !== -1) {
        tenants[index].isActive = true;
        saveToStorage(TENANTS_KEY, tenants);
    }
};

/**
 * Update tenant plan
 */
export const updateTenantPlan = async (tenantId, planId) => {
    const tenants = getFromStorage(TENANTS_KEY);
    const index = tenants.findIndex(t => t.id === tenantId);
    if (index !== -1) {
        tenants[index].planId = planId;
        saveToStorage(TENANTS_KEY, tenants);
    }
};

/**
 * Get all users (Super Admin only)
 * Mock implementation as user auth is handled by AuthContext
 */
export const getAllUsers = async (limitCount = 100) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
        { id: 'u1', name: 'Admin User', email: 'admin@city.com', role: 'owner', tenantId: 't1' },
        { id: 'u2', name: 'Staff John', email: 'john@city.com', role: 'staff', tenantId: 't1' },
        { id: 'u3', name: 'Demo Admin', email: 'demo@zetta.com', role: 'owner', tenantId: 'demo_shop' }
    ];
};

/**
 * Get users by tenant
 */
export const getUsersByTenant = async (tenantId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const allUsers = await getAllUsers();
    return allUsers.filter(u => u.tenantId === tenantId);
};

/**
 * Get revenue stats (estimated)
 */
export const getRevenueStats = async () => {
    const tenants = await getAllTenants();

    // Plan pricing (example)
    const planPricing = {
        trial: 0,
        basic: 499,
        pro: 999,
        enterprise: 2999
    };

    let mrr = 0;
    tenants.forEach(t => {
        if (t.isActive && t.planId !== 'trial') {
            mrr += planPricing[t.planId] || 0;
        }
    });

    return {
        mrr,
        arr: mrr * 12,
        paidTenants: tenants.filter(t => t.planId && t.planId !== 'trial').length,
        trialTenants: tenants.filter(t => !t.planId || t.planId === 'trial').length,
        churnEstimate: 0
    };
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
};
