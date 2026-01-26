/**
 * Expense Service
 * Tracks invoices, staff expenses, and other business costs
 */

// Expense categories
export const EXPENSE_CATEGORIES = {
    INVOICE: 'invoice',      // Supplier/purchase invoices
    STAFF: 'staff',          // Salaries, bonuses
    RENT: 'rent',            // Rent/lease
    UTILITIES: 'utilities',  // Electricity, water, internet
    OTHER: 'other'           // Miscellaneous
};

// Local storage key
const EXPENSES_KEY = 'zetta_expenses';

/**
 * Get all expenses from localStorage
 */
const getStoredExpenses = () => {
    try {
        const data = localStorage.getItem(EXPENSES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading expenses:', e);
        return [];
    }
};

/**
 * Save expenses to localStorage
 */
const saveExpenses = (expenses) => {
    try {
        localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (e) {
        console.error('Error saving expenses:', e);
    }
};

/**
 * Initialize demo expenses if none exist
 */
export const initDemoExpenses = () => {
    const existing = getStoredExpenses();
    if (existing.length > 0) return existing;

    const now = new Date();
    const demoExpenses = [];

    // Generate 30 days of demo expenses
    for (let d = 0; d < 30; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);

        // Daily expenses vary
        if (d % 2 === 0) {
            demoExpenses.push({
                id: `exp_inv_${d}`,
                category: EXPENSE_CATEGORIES.INVOICE,
                description: `Supplier Invoice #${1000 + d}`,
                amount: Math.floor(Math.random() * 5000) + 1000,
                date: date.toISOString(),
                tenantId: 'demo_shop'
            });
        }

        if (d % 7 === 0) {
            demoExpenses.push({
                id: `exp_staff_${d}`,
                category: EXPENSE_CATEGORIES.STAFF,
                description: 'Staff Salary',
                amount: 15000,
                date: date.toISOString(),
                tenantId: 'demo_shop'
            });
        }

        if (d % 30 === 0) {
            demoExpenses.push({
                id: `exp_rent_${d}`,
                category: EXPENSE_CATEGORIES.RENT,
                description: 'Monthly Rent',
                amount: 25000,
                date: date.toISOString(),
                tenantId: 'demo_shop'
            });
        }

        if (d % 10 === 0) {
            demoExpenses.push({
                id: `exp_util_${d}`,
                category: EXPENSE_CATEGORIES.UTILITIES,
                description: 'Electricity Bill',
                amount: Math.floor(Math.random() * 2000) + 500,
                date: date.toISOString(),
                tenantId: 'demo_shop'
            });
        }
    }

    saveExpenses(demoExpenses);
    return demoExpenses;
};

/**
 * Add a new expense
 */
export const addExpense = (expense) => {
    const expenses = getStoredExpenses();
    const newExpense = {
        id: `exp_${Date.now()}`,
        ...expense,
        date: expense.date || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    expenses.unshift(newExpense);
    saveExpenses(expenses);
    return newExpense;
};

/**
 * Get expenses for a period
 */
export const getExpenses = (tenantId, period = 'month') => {
    let expenses = getStoredExpenses();

    // Initialize demo if empty
    if (expenses.length === 0 && tenantId === 'demo_shop') {
        expenses = initDemoExpenses();
    }

    // Filter by tenant
    expenses = expenses.filter(e => e.tenantId === tenantId);

    // Filter by period
    const now = new Date();
    let startDate;

    switch (period) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - startDate.getDay());
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'month':
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return expenses.filter(e => new Date(e.date) >= startDate);
};

/**
 * Get expense summary
 */
export const getExpenseSummary = (tenantId, period = 'month') => {
    const expenses = getExpenses(tenantId, period);

    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const byCategory = expenses.reduce((acc, e) => {
        const cat = e.category || 'other';
        acc[cat] = (acc[cat] || 0) + (e.amount || 0);
        return acc;
    }, {});

    // Top expenses
    const sorted = [...expenses].sort((a, b) => b.amount - a.amount);
    const topExpenses = sorted.slice(0, 5);

    // Daily breakdown
    const byDay = expenses.reduce((acc, e) => {
        const date = e.date.split('T')[0];
        acc[date] = (acc[date] || 0) + (e.amount || 0);
        return acc;
    }, {});

    return {
        total,
        count: expenses.length,
        byCategory,
        topExpenses,
        dailyData: Object.entries(byDay).map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date))
    };
};

/**
 * Delete an expense
 */
export const deleteExpense = (expenseId) => {
    const expenses = getStoredExpenses();
    const filtered = expenses.filter(e => e.id !== expenseId);
    saveExpenses(filtered);
    return true;
};

/**
 * Clear all expenses
 */
export const clearAllExpenses = () => {
    localStorage.removeItem(EXPENSES_KEY);
};

/**
 * Get category label
 */
export const getCategoryLabel = (category) => {
    const labels = {
        [EXPENSE_CATEGORIES.INVOICE]: 'Invoices',
        [EXPENSE_CATEGORIES.STAFF]: 'Staff',
        [EXPENSE_CATEGORIES.RENT]: 'Rent',
        [EXPENSE_CATEGORIES.UTILITIES]: 'Utilities',
        [EXPENSE_CATEGORIES.OTHER]: 'Other'
    };
    return labels[category] || 'Other';
};

export default {
    EXPENSE_CATEGORIES,
    addExpense,
    getExpenses,
    getExpenseSummary,
    deleteExpense,
    clearAllExpenses,
    getCategoryLabel,
    initDemoExpenses
};
