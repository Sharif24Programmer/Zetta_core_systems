import { describe, it, expect } from 'vitest';
import { calculateStats, formatCurrency, formatPercentage } from './reportsService';

describe('reportsService Utility Functions', () => {

    describe('formatCurrency', () => {
        it('should format numbers to Indian currency', () => {
            expect(formatCurrency(1000)).toBe('₹1,000');
            expect(formatCurrency(1234.56)).toBe('₹1,234.56');
            expect(formatCurrency(0)).toBe('₹0');
        });

        it('should handle invalid inputs gracefully', () => {
            expect(formatCurrency(null)).toBe('₹0');
            expect(formatCurrency(undefined)).toBe('₹0');
        });
    });

    describe('formatPercentage', () => {
        it('should calculate percentage correctly', () => {
            expect(formatPercentage(50, 100)).toBe('50.0%');
            expect(formatPercentage(1, 4)).toBe('25.0%');
        });

        it('should handle division by zero or null total', () => {
            expect(formatPercentage(100, 0)).toBe('0%');
            expect(formatPercentage(100, null)).toBe('0%');
        });
    });

    describe('calculateStats', () => {
        const mockBills = [
            { total: 500, paymentMode: 'cash', createdAt: new Date('2024-01-01').toISOString() },
            { total: 300, paymentMode: 'upi', createdAt: new Date('2024-01-01').toISOString() },
            { total: 200, paymentMode: 'card', createdAt: new Date('2024-01-02').toISOString() }, // Different day
        ];

        it('should calculate total revenue correctly', () => {
            const stats = calculateStats(mockBills);
            expect(stats.totalRevenue).toBe(1000);
        });

        it('should calculate total bills count', () => {
            const stats = calculateStats(mockBills);
            expect(stats.totalBills).toBe(3);
        });

        it('should calculate average bill value', () => {
            const stats = calculateStats(mockBills);
            // 1000 / 3 = 333.333
            expect(stats.avgBillValue).toBeCloseTo(333.33, 2);
        });

        it('should breakdown by payment mode', () => {
            const stats = calculateStats(mockBills);
            expect(stats.byPaymentMode.cash).toBe(500);
            expect(stats.byPaymentMode.upi).toBe(300);
            expect(stats.byPaymentMode.card).toBe(200);
        });
    });
});
