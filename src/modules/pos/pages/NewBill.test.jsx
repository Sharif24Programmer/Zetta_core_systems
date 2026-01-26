import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewBill from './NewBill';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../../core/auth/AuthContext', () => ({
    useAuth: () => ({ tenantId: 'tenant123' })
}));

// Mock useProducts but keep useFilteredProducts functionality or mock it simply
vi.mock('../hooks/useProducts', () => ({
    useProducts: () => ({
        products: [
            { id: '1', name: 'Paracetamol', price: 10, category: 'Personal Care', stock: 100 },
            { id: '2', name: 'Bandage', price: 50, category: 'Grocery', stock: 20 },
        ],
        loading: false
    }),
    useFilteredProducts: (products, category, search) => {
        // Simple mock implementation of filtering
        return products.filter(p => {
            const matchesCategory = category === 'All' || p.category === category;
            const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }
}));

describe('NewBill Integration Page', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render page with products', () => {
        render(
            <MemoryRouter>
                <NewBill />
            </MemoryRouter>
        );

        expect(screen.getByText('New Bill')).toBeInTheDocument();
        expect(screen.getByText('Paracetamol')).toBeInTheDocument();
        expect(screen.getByText('Bandage')).toBeInTheDocument();

        // Price formatting might add symbol, checking for existence multiple times is fine
        const prices = screen.getAllByText(/10/);
        expect(prices.length).toBeGreaterThan(0);
    });

    it('should filter products by search', async () => {
        render(
            <MemoryRouter>
                <NewBill />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText('Search products...');
        fireEvent.change(searchInput, { target: { value: 'Bandage' } });

        // Paracetamol should disappear
        await waitFor(() => {
            expect(screen.queryByText('Paracetamol')).not.toBeInTheDocument();
        });
        expect(screen.getByText('Bandage')).toBeInTheDocument();
    });

    it('should filter products by category', async () => {
        render(
            <MemoryRouter>
                <NewBill />
            </MemoryRouter>
        );

        const groceryChip = screen.getByText('Grocery');
        fireEvent.click(groceryChip);

        await waitFor(() => {
            expect(screen.queryByText('Paracetamol')).not.toBeInTheDocument();
        });
        expect(screen.getByText('Bandage')).toBeInTheDocument();
    });

    it('should add item to cart and update bottom bar', () => {
        render(
            <MemoryRouter>
                <NewBill />
            </MemoryRouter>
        );

        // Click the first product
        const productCard = screen.getByText('Paracetamol').closest('div');
        fireEvent.click(productCard);

        // BottomCartBar should update
        expect(screen.getByText(/1 items/i)).toBeInTheDocument();

        // Check for total price, handling potential duplicates
        const prices = screen.getAllByText(/10/);
        // Expect at least 2 occurrences (one in card, one in total)
        expect(prices.length).toBeGreaterThanOrEqual(2);
    });
});
