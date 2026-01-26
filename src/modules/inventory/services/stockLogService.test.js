import { describe, it, expect } from 'vitest';
import { formatStockChange } from './stockLogService';

describe('stockLogService Utility Functions', () => {

    describe('formatStockChange', () => {
        it('should format positive change with + sign', () => {
            expect(formatStockChange({ quantity: 5 })).toBe('+5');
            expect(formatStockChange({ quantity: 100 })).toBe('+100');
        });

        it('should format negative change without extra sign (already negative)', () => {
            expect(formatStockChange({ quantity: -5 })).toBe('-5');
            expect(formatStockChange({ quantity: -50 })).toBe('-50');
        });

        it('should format zero correctly', () => {
            expect(formatStockChange({ quantity: 0 })).toBe('+0');
        });
    });
});
