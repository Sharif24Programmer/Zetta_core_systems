import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { createProduct } from '../services/inventoryService';
import { useCategories } from '../hooks/useInventory';
import { MEDICINE_FORMS, STRENGTH_UNITS, PACKAGING_TYPES } from '../constants/medicineConstants';

const AddProduct = () => {
    const navigate = useNavigate();
    const { tenantId, user, tenant } = useAuth();
    const { categories } = useCategories(tenantId);

    const isMedicineStore = tenant?.type === 'clinic' || tenant?.type === 'pharmacy';

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        costPrice: '',
        stock: '',
        barcode: '',
        trackStock: true,

        // Medicine-specific fields
        genericName: '',
        strength: '',
        strengthUnit: 'mg',
        form: '',
        packagingType: 'Strip',
        unitsPerPackage: '',
        rackLocation: '',
        batchNumber: '',
        expiryDate: '',
        prescriptionRequired: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('Product name is required');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Valid price is required');
            return;
        }

        setLoading(true);
        try {
            const productData = {
                tenantId,
                name: formData.name.trim(),
                category: formData.category.trim() || null,
                price: parseFloat(formData.price),
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
                stock: formData.trackStock ? parseInt(formData.stock) || 0 : 0,
                barcode: formData.barcode.trim() || null,
                trackStock: formData.trackStock,
                createdBy: user?.uid
            };

            // Add medicine-specific fields if applicable
            if (isMedicineStore) {
                productData.genericName = formData.genericName.trim() || null;
                productData.strength = formData.strength ? parseFloat(formData.strength) : null;
                productData.strengthUnit = formData.strengthUnit;
                productData.form = formData.form || null;
                productData.packagingType = formData.packagingType;
                productData.unitsPerPackage = formData.unitsPerPackage ? parseInt(formData.unitsPerPackage) : null;
                productData.rackLocation = formData.rackLocation.trim() || null;
                productData.batchNumber = formData.batchNumber.trim() || null;
                productData.expiryDate = formData.expiryDate || null;
                productData.prescriptionRequired = formData.prescriptionRequired;
            }

            await createProduct(productData);
            navigate('/app/inventory');
        } catch (err) {
            console.error('Error creating product:', err);
            setError(err.message || 'Failed to create product');
        }
        setLoading(false);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="page-title">{isMedicineStore ? 'Add Medicine' : 'Add Product'}</h1>
                </div>
            </div>

            <div className="page-content">
                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="card space-y-4">
                        <p className="font-semibold text-slate-800">Basic Information</p>

                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {isMedicineStore ? 'Medicine Name' : 'Product Name'} *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={isMedicineStore ? "e.g. Dolo 650mg" : "Enter product name"}
                                required
                                className="input-field"
                            />
                        </div>

                        {/* Generic Name (Medicine only) */}
                        {isMedicineStore && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Generic Name
                                </label>
                                <input
                                    type="text"
                                    name="genericName"
                                    value={formData.genericName}
                                    onChange={handleChange}
                                    placeholder="e.g. Paracetamol"
                                    className="input-field"
                                />
                                <p className="text-xs text-slate-400 mt-1">Active ingredient/salt name</p>
                            </div>
                        )}

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Category
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder={isMedicineStore ? "e.g. Analgesics, Antibiotics" : "e.g. Electronics, Groceries"}
                                list="categories"
                                className="input-field"
                            />
                            <datalist id="categories">
                                {categories.map(cat => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                        </div>

                        {/* Medicine-specific: Strength, Form */}
                        {isMedicineStore && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Strength
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                name="strength"
                                                value={formData.strength}
                                                onChange={handleChange}
                                                placeholder="650"
                                                min="0"
                                                step="0.01"
                                                className="input-field flex-1"
                                            />
                                            <select
                                                name="strengthUnit"
                                                value={formData.strengthUnit}
                                                onChange={handleChange}
                                                className="input-field w-24"
                                            >
                                                {STRENGTH_UNITS.map(unit => (
                                                    <option key={unit} value={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Form
                                        </label>
                                        <select
                                            name="form"
                                            value={formData.form}
                                            onChange={handleChange}
                                            className="input-field"
                                        >
                                            <option value="">Select Form</option>
                                            {MEDICINE_FORMS.map(form => (
                                                <option key={form} value={form}>{form}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Packaging Type
                                        </label>
                                        <select
                                            name="packagingType"
                                            value={formData.packagingType}
                                            onChange={handleChange}
                                            className="input-field"
                                        >
                                            {PACKAGING_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Units per Package
                                        </label>
                                        <input
                                            type="number"
                                            name="unitsPerPackage"
                                            value={formData.unitsPerPackage}
                                            onChange={handleChange}
                                            placeholder="10"
                                            min="1"
                                            className="input-field"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">e.g. 10 tablets per strip</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pricing */}
                    <div className="card space-y-4">
                        <p className="font-semibold text-slate-800">Pricing</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {isMedicineStore ? 'MRP (per package)' : 'Selling Price'} *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {isMedicineStore ? 'Purchase Price' : 'Cost Price'}
                                </label>
                                <input
                                    type="number"
                                    name="costPrice"
                                    value={formData.costPrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Inventory & Storage */}
                    <div className="card space-y-4">
                        <p className="font-semibold text-slate-800">Inventory & Storage</p>

                        {/* Stock Tracking */}
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg">
                            <input
                                type="checkbox"
                                name="trackStock"
                                checked={formData.trackStock}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                            />
                            <div>
                                <p className="font-medium text-slate-800">Track Stock</p>
                                <p className="text-sm text-slate-500">Automatically track inventory levels</p>
                            </div>
                        </label>

                        {/* Initial Stock */}
                        {formData.trackStock && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Initial Stock {isMedicineStore && '(in packages)'}
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className="input-field"
                                />
                            </div>
                        )}

                        {/* Medicine-specific: Batch, Expiry, Rack */}
                        {isMedicineStore && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Batch Number
                                        </label>
                                        <input
                                            type="text"
                                            name="batchNumber"
                                            value={formData.batchNumber}
                                            onChange={handleChange}
                                            placeholder="BATCH123"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Rack Location
                                    </label>
                                    <input
                                        type="text"
                                        name="rackLocation"
                                        value={formData.rackLocation}
                                        onChange={handleChange}
                                        placeholder="e.g. A-12, B-05"
                                        className="input-field"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Where this medicine is stored</p>
                                </div>

                                {/* Prescription Required */}
                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-amber-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        name="prescriptionRequired"
                                        checked={formData.prescriptionRequired}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <div>
                                        <p className="font-medium text-amber-900">Prescription Required</p>
                                        <p className="text-sm text-amber-700">Mark if this is a Schedule H/H1/X drug</p>
                                    </div>
                                </label>
                            </>
                        )}

                        {/* Barcode */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Barcode (Optional)
                            </label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                placeholder="Scan or enter barcode"
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : `Create ${isMedicineStore ? 'Medicine' : 'Product'}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
