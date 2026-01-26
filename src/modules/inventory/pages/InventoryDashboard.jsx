import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useInventory } from '../hooks/useInventory';
import { formatCurrency } from '../../pos/services/billService';
import InventoryProductCard from '../components/InventoryProductCard';
import StatsCard from '../components/StatsCard';
import Loader from '../../../shared/components/Loader';

const InventoryDashboard = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { products, stats, loading } = useInventory(tenantId);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = searchTerm
        ? products.filter(p =>
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : products;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <h1 className="page-title">Inventory</h1>
                    <button
                        onClick={() => navigate('/app/inventory/add')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </button>
                </div>
            </div>

            <div className="page-content">
                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatsCard
                            label="Total Products"
                            value={stats.total}
                            color="primary"
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            }
                        />
                        <StatsCard
                            label="Low Stock"
                            value={stats.lowStock}
                            color="orange"
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            }
                        />
                        <StatsCard
                            label="Out of Stock"
                            value={stats.outOfStock}
                            color="red"
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            }
                        />
                        <StatsCard
                            label="Total Value"
                            value={formatCurrency(stats.totalValue)}
                            color="green"
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                    </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => navigate('/app/inventory/stock-in')}
                        className="flex-shrink-0 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100"
                    >
                        + Stock In
                    </button>
                    <button
                        onClick={() => navigate('/app/inventory/stock-out')}
                        className="flex-shrink-0 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100"
                    >
                        - Stock Out
                    </button>
                    <button
                        onClick={() => navigate('/app/inventory/history')}
                        className="flex-shrink-0 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200"
                    >
                        📋 History
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products..."
                        className="input-field pl-10"
                    />
                    <svg
                        className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Product List */}
                {loading ? (
                    <Loader text="Loading products..." />
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 mb-4">
                            {searchTerm ? 'No products found' : 'No products yet'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => navigate('/app/inventory/add')}
                                className="btn-primary"
                            >
                                Add Your First Product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredProducts.map(product => (
                            <InventoryProductCard
                                key={product.id}
                                product={product}
                                onClick={() => navigate(`/app/inventory/product/${product.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryDashboard;
