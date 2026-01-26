/**
 * Invoice & Supplier Service
 * Manage suppliers, invoices, and payments
 */

const SUPPLIERS_KEY = 'zetta_suppliers';
const INVOICES_KEY = 'zetta_invoices';

// Invoice Status
export const INVOICE_STATUS = {
    PAID: 'paid',
    PARTIAL: 'partial',
    UNPAID: 'unpaid',
    OVERDUE: 'overdue'
};

// --- Suppliers ---

export const getAllSuppliers = (tenantId) => {
    try {
        const data = localStorage.getItem(SUPPLIERS_KEY);
        let suppliers = data ? JSON.parse(data) : [];

        suppliers = suppliers.filter(s => s.tenantId === tenantId);

        if (suppliers.length === 0 && tenantId === 'demo_shop') {
            suppliers = initDemoSuppliers();
        }

        return suppliers;
    } catch { return []; }
};

export const addSupplier = (supplierData) => {
    const all = getAllSuppliersFromStorage();
    const newSupplier = {
        id: `sup_${Date.now()}`,
        ...supplierData,
        createdAt: new Date().toISOString()
    };
    all.push(newSupplier);
    saveSuppliers(all);
    return newSupplier;
};

// --- Invoices ---

export const getAllInvoices = (tenantId) => {
    try {
        const data = localStorage.getItem(INVOICES_KEY);
        let invoices = data ? JSON.parse(data) : [];

        invoices = invoices.filter(i => i.tenantId === tenantId);

        if (invoices.length === 0 && tenantId === 'demo_shop') {
            invoices = initDemoInvoices(getAllSuppliers(tenantId));
        }

        return invoices;
    } catch { return []; }
};

export const getInvoice = (invoiceId) => {
    const all = getAllInvoicesFromStorage();
    return all.find(i => i.id === invoiceId) || null;
};

export const addInvoice = (invoiceData) => {
    const all = getAllInvoicesFromStorage();
    const newInvoice = {
        id: `inv_${Date.now()}`,
        ...invoiceData,
        status: calculateStatus(invoiceData),
        createdAt: new Date().toISOString()
    };
    all.push(newInvoice);
    saveInvoices(all);
    return newInvoice;
};

export const updateInvoice = (invoiceId, updates) => {
    const all = getAllInvoicesFromStorage();
    const index = all.findIndex(i => i.id === invoiceId);

    if (index !== -1) {
        const updated = { ...all[index], ...updates };
        updated.status = calculateStatus(updated);
        all[index] = updated;
        saveInvoices(all);
        return updated;
    }
    return null;
};

// --- Helpers ---

const calculateStatus = (invoice) => {
    const total = parseFloat(invoice.amount || 0);
    const paid = parseFloat(invoice.paidAmount || 0);
    const dueDate = new Date(invoice.dueDate);
    const isOverdue = dueDate < new Date() && paid < total;

    if (isOverdue) return INVOICE_STATUS.OVERDUE;
    if (paid >= total) return INVOICE_STATUS.PAID;
    if (paid > 0) return INVOICE_STATUS.PARTIAL;
    return INVOICE_STATUS.UNPAID;
};

// Storage Helpers
const getAllSuppliersFromStorage = () => {
    try { return JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || '[]'); } catch { return []; }
};
const saveSuppliers = (data) => localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(data));

const getAllInvoicesFromStorage = () => {
    try { return JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]'); } catch { return []; }
};
const saveInvoices = (data) => localStorage.setItem(INVOICES_KEY, JSON.stringify(data));

// --- Demo Data ---

const initDemoSuppliers = () => {
    const suppliers = [
        { id: 'sup_1', tenantId: 'demo_shop', name: 'Medico Pharma Distributors', phone: '9876543200', gstin: '29ABCDE1234F1Z5', email: 'orders@medico.com' },
        { id: 'sup_2', tenantId: 'demo_shop', name: 'City Health Supplies', phone: '9876543201', gstin: '29FGHIJ5678K1Z9', email: 'sales@cityhealth.com' },
        { id: 'sup_3', tenantId: 'demo_shop', name: 'Global Surgical Co.', phone: '9876543202', gstin: '29KLMNO9012P1Z3', email: 'contact@globalsurgical.com' }
    ];
    saveSuppliers(suppliers);
    return suppliers;
};

const initDemoInvoices = (suppliers) => {
    const invoices = [];
    const now = new Date();

    // Generate 10 random invoices
    for (let i = 0; i < 10; i++) {
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const amount = Math.floor(Math.random() * 20000) + 5000;
        const paidAmount = Math.random() > 0.5 ? amount : Math.random() > 0.5 ? amount / 2 : 0;
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + 30); // 30 days credit

        const inv = {
            id: `inv_demo_${i}`,
            tenantId: 'demo_shop',
            supplierId: supplier.id,
            supplierName: supplier.name,
            number: `INV-${2025001 + i}`,
            date: date.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            amount,
            paidAmount,
            notes: 'Demo invoice'
        };
        inv.status = calculateStatus(inv);
        invoices.push(inv);
    }

    saveInvoices(invoices);
    return invoices;
};
