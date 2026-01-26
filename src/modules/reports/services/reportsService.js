/**
 * Reports Service
 * Provides sales analytics with demo mode support
 */

import { db } from '../../../services/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp
} from 'firebase/firestore';

/**
 * Check if in demo mode
 */
const isDemoMode = (tenantId) => {
    if (tenantId === 'demo_shop') return true;
    try {
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) return JSON.parse(demoUser).tenantId === 'demo_shop';
    } catch (e) { }
    return false;
};

/**
 * Generate demo bills with realistic data
 */
const generateDemoBills = (period) => {
    const now = new Date();
    const bills = [];

    // Products for variety
    const products = [
        { productId: 'p1', name: 'Paracetamol 500mg', price: 20 },
        { productId: 'p2', name: 'Vitamin C Tablets', price: 150 },
        { productId: 'p3', name: 'Bandages Pack', price: 80 },
        { productId: 'p4', name: 'Antiseptic Lotion', price: 120 },
        { productId: 'p5', name: 'Cough Syrup', price: 95 }
    ];

    const paymentModes = ['cash', 'upi', 'card'];

    // Determine date range
    let days = 1;
    if (period === 'week') days = 7;
    if (period === 'month') days = 30;

    // Generate bills for each day
    for (let d = 0; d < days; d++) {
        const billDate = new Date(now);
        billDate.setDate(billDate.getDate() - d);

        // Random number of bills per day (2-8)
        const billCount = Math.floor(Math.random() * 7) + 2;

        for (let b = 0; b < billCount; b++) {
            // Random items (1-4)
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const items = [];

            for (let i = 0; i < itemCount; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 5) + 1;
                items.push({
                    ...product,
                    qty,
                    total: product.price * qty
                });
            }

            const total = items.reduce((sum, item) => sum + item.total, 0);

            bills.push({
                id: `demo_bill_${d}_${b}`,
                billNumber: `BILL-${String(bills.length + 1).padStart(4, '0')}`,
                tenantId: 'demo_shop',
                status: 'paid',
                items,
                subtotal: total,
                discount: 0,
                tax: 0,
                total,
                paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
                createdAt: billDate
            });
        }
    }

    return bills;
};

/**
 * Get sales for a date range (Firebase)
 */
export const getSalesForRange = async (tenantId, startDate, endDate) => {
    if (isDemoMode(tenantId)) {
        // Demo mode - return mock data
        const allBills = generateDemoBills('month');
        return allBills.filter(b => {
            const billDate = b.createdAt;
            return billDate >= startDate && billDate <= endDate;
        });
    }

    const q = query(
        collection(db, "bills"),
        where("tenantId", "==", tenantId),
        where("status", "==", "paid"),
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        where("createdAt", "<=", Timestamp.fromDate(endDate)),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Get today's sales
 */
export const getTodaySales = async (tenantId) => {
    if (isDemoMode(tenantId)) {
        return generateDemoBills('today');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return getSalesForRange(tenantId, today, tomorrow);
};

/**
 * Get this week's sales
 */
export const getWeekSales = async (tenantId) => {
    if (isDemoMode(tenantId)) {
        return generateDemoBills('week');
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return getSalesForRange(tenantId, weekStart, now);
};

/**
 * Get this month's sales
 */
export const getMonthSales = async (tenantId) => {
    if (isDemoMode(tenantId)) {
        return generateDemoBills('month');
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return getSalesForRange(tenantId, monthStart, now);
};

/**
 * Calculate sales stats from bills
 */
export const calculateStats = (bills) => {
    if (!bills || bills.length === 0) {
        return {
            totalRevenue: 0,
            totalBills: 0,
            avgBillValue: 0,
            byPaymentMode: {},
            dailyData: []
        };
    }

    const totalRevenue = bills.reduce((sum, b) => sum + (b.total || 0), 0);
    const totalBills = bills.length;
    const avgBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;

    // Payment mode breakdown
    const byPaymentMode = bills.reduce((acc, b) => {
        const mode = b.paymentMode || 'cash';
        acc[mode] = (acc[mode] || 0) + (b.total || 0);
        return acc;
    }, {});

    // Daily breakdown
    const byDay = bills.reduce((acc, b) => {
        const date = b.createdAt?.toDate?.() || new Date(b.createdAt);
        const key = date.toISOString().split('T')[0];
        if (!acc[key]) {
            acc[key] = { date: key, revenue: 0, count: 0 };
        }
        acc[key].revenue += b.total || 0;
        acc[key].count += 1;
        return acc;
    }, {});

    return {
        totalRevenue,
        totalBills,
        avgBillValue,
        byPaymentMode,
        dailyData: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date))
    };
};

/**
 * Get top selling products
 */
export const getTopProducts = async (tenantId, period = 'month', limitCount = 10) => {
    let bills;

    switch (period) {
        case 'today':
            bills = await getTodaySales(tenantId);
            break;
        case 'week':
            bills = await getWeekSales(tenantId);
            break;
        default:
            bills = await getMonthSales(tenantId);
    }

    // Aggregate product sales
    const productMap = {};

    bills.forEach(bill => {
        (bill.items || []).forEach(item => {
            const key = item.productId || item.name;
            if (!productMap[key]) {
                productMap[key] = {
                    productId: item.productId,
                    name: item.name,
                    totalQty: 0,
                    totalRevenue: 0
                };
            }
            productMap[key].totalQty += item.qty || 0;
            productMap[key].totalRevenue += item.total || 0;
        });
    });

    return Object.values(productMap)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limitCount);
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, total) => {
    if (!total) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
};
