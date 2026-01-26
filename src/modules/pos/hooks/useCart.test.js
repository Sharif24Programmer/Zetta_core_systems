import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useCart from './useCart';

describe('useCart Hook', () => {

    it('should initialize with empty cart', () => {
        const { result } = renderHook(() => useCart());
        expect(result.current.items).toEqual([]);
        expect(result.current.isEmpty).toBe(true);
    });

    it('should add item to cart', () => {
        const { result } = renderHook(() => useCart());
        const product = { id: 'p1', name: 'Product A', price: 100 };

        act(() => {
            result.current.addItem(product);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0]).toEqual({
            productId: 'p1',
            name: 'Product A',
            price: 100,
            qty: 1,
            total: 100
        });
    });

    it('should increment existing item quantity', () => {
        const { result } = renderHook(() => useCart());
        const product = { id: 'p1', name: 'Product A', price: 100 };

        act(() => {
            result.current.addItem(product);
            result.current.addItem(product);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].qty).toBe(2);
        expect(result.current.items[0].total).toBe(200);
    });

    it('should update quantity correctly', () => {
        const { result } = renderHook(() => useCart());
        const product = { id: 'p1', name: 'Product A', price: 100 };

        act(() => {
            result.current.addItem(product);
            result.current.updateQty('p1', 5);
        });

        expect(result.current.items[0].qty).toBe(5);
        expect(result.current.items[0].total).toBe(500);
    });

    it('should calculate totals correctly with tax', () => {
        const { result } = renderHook(() => useCart());
        const product = { id: 'p1', name: 'Product A', price: 100 };

        act(() => {
            result.current.addItem(product);
            result.current.setTaxRate(0.10); // 10% tax
        });

        expect(result.current.totals.subtotal).toBe(100);
        expect(result.current.totals.tax).toBe(10);
        expect(result.current.totals.total).toBe(110);
    });

    it('should calculate discount correctly', () => {
        const { result } = renderHook(() => useCart());
        const product = { id: 'p1', name: 'Product A', price: 100 };

        act(() => {
            result.current.addItem(product);
            result.current.setDiscount(10); // 10% or 10 flat
            result.current.setDiscountType('percent');
        });

        expect(result.current.totals.subtotal).toBe(100);
        expect(result.current.totals.discount).toBe(10);
        expect(result.current.totals.total).toBe(90); // 100 - 10
    });

    it('should clear cart', () => {
        const { result } = renderHook(() => useCart());
        const product = { id: 'p1', name: 'Product A', price: 100 };

        act(() => {
            result.current.addItem(product);
            result.current.clearCart();
        });

        expect(result.current.items).toEqual([]);
        expect(result.current.isEmpty).toBe(true);
        expect(result.current.discount).toBe(0);
    });
});
