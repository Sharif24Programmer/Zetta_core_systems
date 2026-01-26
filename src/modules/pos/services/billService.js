import { db } from '../../../services/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    orderBy,
    onSnapshot,
    serverTimestamp,
    limit
} from 'firebase/firestore';

/**
 * Bill Schema:
 * {
 *   tenantId: string,
 *   billNumber: string,
 *   customerId?: string,
 *   customerName?: string,
 *   items: BillItem[],
 *   subtotal: number,
 *   discount: number,
 *   discountType: 'fixed' | 'percent',
 *   tax: number,
 *   taxRate: number,
 *   total: number,
 *   paymentMode: 'cash' | 'upi' | 'card',
 *   amountReceived: number,
 *   change: number,
 *   status: 'paid' | 'pending' | 'refunded',
 *   createdAt: timestamp
 * }
 * 
 * BillItem:
 * {
 *   productId: string,
 *   name: string,
 *   price: number,
 *   qty: number,
 *   total: number
 * }
 */

/**
 * Generate bill number
 */
/**
 * Mock Data for Demo Mode (Mutable)
 */
const MOCK_BILLS = [
    { id: 'demo1', billNumber: 'INV202310270001', customerName: 'Walk-in', total: 150, status: 'paid', createdAt: new Date() },
    { id: 'demo2', billNumber: 'INV202310270002', customerName: 'John Doe', total: 450, status: 'paid', createdAt: new Date(Date.now() - 3600000) },
    { id: 'demo3', billNumber: 'INV202310270003', customerName: 'Jane Smith', total: 1200, status: 'paid', createdAt: new Date(Date.now() - 7200000) },
];

// Listener for demo bills
let demoBillListeners = [];

const notifyDemoListeners = () => {
    demoBillListeners.forEach(cb => cb([...MOCK_BILLS].sort((a, b) => b.createdAt - a.createdAt)));
};

/**
 * Generate bill number
 */
const generateBillNumber = async (tenantId) => {
    if (tenantId === 'demo_shop') {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = MOCK_BILLS.length + 1;
        return `INV${dateStr}${count.toString().padStart(4, '0')}`;
    }

    // Get today's bills count + 1
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, "bills"),
        where("tenantId", "==", tenantId),
        where("createdAt", ">=", today),
        orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    const count = snap.size + 1;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `INV${dateStr}${count.toString().padStart(4, '0')}`;
};

/**
 * Create a new bill
 */
export const createBill = async (billData) => {
    const billNumber = await generateBillNumber(billData.tenantId);

    const data = {
        ...billData,
        billNumber,
        status: 'paid',
        createdAt: serverTimestamp() // In real DB this is server timestamp
    };

    if (billData.tenantId === 'demo_shop') {
        const newBill = {
            id: `demo_new_${Date.now()}`,
            ...data,
            createdAt: new Date() // Use local date for mock
        };
        MOCK_BILLS.unshift(newBill); // Add to front
        notifyDemoListeners();
        return newBill;
    }

    const docRef = await addDoc(collection(db, "bills"), data);
    return { id: docRef.id, billNumber, ...data };
};

/**
 * Get bills for a tenant
 */
export const getBills = async (tenantId, limitCount = 50) => {
    if (tenantId === 'demo_shop') return [...MOCK_BILLS];

    const q = query(
        collection(db, "bills"),
        where("tenantId", "==", tenantId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Get today's bills
 */
export const getTodaysBills = async (tenantId) => {
    if (tenantId === 'demo_shop') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return MOCK_BILLS.filter(b => b.createdAt >= today);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, "bills"),
        where("tenantId", "==", tenantId),
        where("createdAt", ">=", today),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Listen to today's bills in real-time
 */
export const listenToTodaysBills = (tenantId, callback) => {
    if (tenantId === 'demo_shop') {
        // Return mock data immediately
        callback([...MOCK_BILLS]);
        demoBillListeners.push(callback);
        return () => {
            demoBillListeners = demoBillListeners.filter(cb => cb !== callback);
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, "bills"),
        where("tenantId", "==", tenantId),
        where("createdAt", ">=", today),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const bills = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(bills);
    }, (error) => {
        console.error("Error listening to bills:", error);
        // Important: If auth fails (demo mode persistence issue), don't break the UI
        callback([]);
    });
};

/**
 * Get bill by ID
 */
export const getBillById = async (billId) => {
    if (billId?.startsWith('demo')) {
        return MOCK_BILLS.find(b => b.id === billId) || MOCK_BILLS[0];
    }

    const docRef = doc(db, "bills", billId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

/**
 * Calculate today's stats
 */
export const getTodaysStats = async (tenantId) => {
    const bills = await getTodaysBills(tenantId);

    const totalSales = bills.reduce((sum, b) => sum + (b.total || 0), 0);
    const billCount = bills.length;

    return {
        totalSales,
        billCount,
        averageTicket: billCount > 0 ? totalSales / billCount : 0
    };
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format time
 */
export const formatBillTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};
