import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getAllProducts, getInventoryStats, clearAllProducts } from '../../../shared/stockSync';
import { exportProductsToExcel, exportStockLogsToExcel, createBackupZip, downloadProductTemplate } from '../../../shared/services/exportService';
import { parseExcelFile, validateProductImport, importProducts } from '../../../shared/services/importService';
import { getTenantStockLogs, clearAllStockLogs } from '../../inventory/services/stockLogService';
import { clearAllExpenses } from '../../../shared/services/expenseService';

// Icon Components
const ChevronLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const UploadIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const ArchiveIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const BarcodeIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
    </svg>
);

const PrinterIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SettingsPage = () => {
    const navigate = useNavigate();
    const { tenantId } = useAuth();

    const [loading, setLoading] = useState(null);
    const [message, setMessage] = useState(null);
    const [importPreview, setImportPreview] = useState(null);
    const [importErrors, setImportErrors] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    // --- Export Functions ---
    const handleExportProducts = async () => {
        setLoading('export-products');
        try {
            const products = getAllProducts();
            exportProductsToExcel(products);
            showMessage('Products exported successfully');
        } catch (error) {
            showMessage('Failed to export products: ' + error.message, 'error');
        }
        setLoading(null);
    };

    const handleExportStockLogs = async () => {
        setLoading('export-logs');
        try {
            const logs = await getTenantStockLogs(tenantId, 500);
            exportStockLogsToExcel(logs);
            showMessage('Stock history exported successfully');
        } catch (error) {
            showMessage('Failed to export stock history: ' + error.message, 'error');
        }
        setLoading(null);
    };

    const handleFullBackup = async () => {
        setLoading('backup');
        try {
            const products = getAllProducts();
            const logs = await getTenantStockLogs(tenantId, 1000);
            await createBackupZip({
                products,
                stockLogs: logs
            });
            showMessage('Backup created successfully');
        } catch (error) {
            showMessage('Failed to create backup: ' + error.message, 'error');
        }
        setLoading(null);
    };

    // --- Import Functions ---
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading('parse');
        setImportErrors([]);

        try {
            const data = await parseExcelFile(file);
            const { valid, errors } = validateProductImport(data);
            setImportPreview(valid);
            setImportErrors(errors);

            if (errors.length > 0) {
                showMessage(`Found ${errors.length} validation errors`, 'error');
            } else {
                showMessage(`Ready to import ${valid.length} products`);
            }
        } catch (error) {
            showMessage('Failed to parse file: ' + error.message, 'error');
        }

        setLoading(null);
        e.target.value = '';
    };

    const handleConfirmImport = async () => {
        if (!importPreview || importPreview.length === 0) return;

        setLoading('import');
        try {
            const result = await importProducts(importPreview, tenantId);
            showMessage(`Imported ${result.success.length} products`);
            setImportPreview(null);
        } catch (error) {
            showMessage('Failed to import: ' + error.message, 'error');
        }
        setLoading(null);
    };

    // --- Delete All Data ---
    const handleDeleteAllData = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setLoading('delete');
        try {
            // Step 1: Create backup first
            const products = getAllProducts();
            const logs = await getTenantStockLogs(tenantId, 1000);
            await createBackupZip({
                products,
                stockLogs: logs,
                deletedAt: new Date().toISOString()
            });

            // Step 2: Clear all data
            clearAllProducts();
            clearAllStockLogs();
            clearAllExpenses();

            // Clear demo bills from localStorage
            localStorage.removeItem('zetta_demo_bills');

            setShowDeleteModal(false);
            setDeleteConfirmText('');
            showMessage('All data deleted. Backup was downloaded.');

            // Refresh the page to reset stats
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            showMessage('Failed to delete data: ' + error.message, 'error');
        }
        setLoading(null);
    };

    const stats = getInventoryStats();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronLeftIcon />
                    </button>
                    <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Toast Message */}
                {message && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${message.type === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                        {message.type === 'success' ? <CheckIcon /> : <InfoIcon />}
                        {message.text}
                    </div>
                )}

                {/* Data Overview */}
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Data Overview</h2>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-100">
                        <div className="p-5 text-center">
                            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Products</div>
                        </div>
                        <div className="p-5 text-center">
                            <div className="text-3xl font-bold text-emerald-600">₹{stats.totalValue.toLocaleString()}</div>
                            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Stock Value</div>
                        </div>
                    </div>
                </section>

                {/* Export Data */}
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Export Data</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        <button
                            onClick={handleExportProducts}
                            disabled={loading}
                            className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                    <DownloadIcon />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-slate-900">Export Products</div>
                                    <div className="text-xs text-slate-500">Download as Excel file</div>
                                </div>
                            </div>
                            {loading === 'export-products' ? (
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <ChevronRightIcon />
                            )}
                        </button>

                        <button
                            onClick={handleExportStockLogs}
                            disabled={loading}
                            className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                    <DownloadIcon />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-slate-900">Export Stock History</div>
                                    <div className="text-xs text-slate-500">All stock movements</div>
                                </div>
                            </div>
                            {loading === 'export-logs' ? (
                                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <ChevronRightIcon />
                            )}
                        </button>

                        <button
                            onClick={handleFullBackup}
                            disabled={loading}
                            className="w-full flex items-center justify-between p-3 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
                                    <ArchiveIcon />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-white">Full Backup</div>
                                    <div className="text-xs text-slate-400">Download all data as ZIP</div>
                                </div>
                            </div>
                            {loading === 'backup' ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <ChevronRightIcon className="text-white" />
                            )}
                        </button>
                    </div>
                </section>

                {/* Import Products */}
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Import Products</h2>
                        <button
                            onClick={downloadProductTemplate}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                            Download Template
                        </button>
                    </div>
                    <div className="p-4">
                        <label className="block cursor-pointer">
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-300 transition-colors">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    {loading === 'parse' ? (
                                        <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <UploadIcon />
                                    )}
                                </div>
                                <div className="text-sm font-medium text-slate-700">
                                    {loading === 'parse' ? 'Processing...' : 'Upload Excel File'}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Click or drag and drop</div>
                            </div>
                        </label>

                        {/* Import Preview */}
                        {importPreview && importPreview.length > 0 && (
                            <div className="mt-4">
                                <div className="text-sm text-slate-600 mb-2">
                                    {importPreview.length} products ready to import
                                </div>
                                <div className="max-h-32 overflow-y-auto bg-slate-50 rounded-lg p-3 text-xs space-y-1">
                                    {importPreview.slice(0, 5).map((p, i) => (
                                        <div key={i} className="flex justify-between text-slate-600">
                                            <span>{p.name}</span>
                                            <span>₹{p.price}</span>
                                        </div>
                                    ))}
                                    {importPreview.length > 5 && (
                                        <div className="text-slate-400 pt-1">+{importPreview.length - 5} more</div>
                                    )}
                                </div>
                                <button
                                    onClick={handleConfirmImport}
                                    disabled={loading}
                                    className="w-full mt-3 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading === 'import' ? 'Importing...' : 'Confirm Import'}
                                </button>
                            </div>
                        )}

                        {/* Import Errors */}
                        {importErrors.length > 0 && (
                            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                                <div className="text-sm font-medium text-red-700 mb-2">Validation Errors</div>
                                <div className="text-xs text-red-600 space-y-1 max-h-24 overflow-y-auto">
                                    {importErrors.map((err, i) => (
                                        <div key={i}>Row {err.row}: {err.errors.join(', ')}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Hardware */}
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Hardware</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        <div className="p-4 flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 flex-shrink-0">
                                <BarcodeIcon />
                            </div>
                            <div>
                                <div className="font-medium text-slate-900">Barcode Scanner</div>
                                <div className="text-sm text-slate-500 mt-0.5">
                                    USB scanners are auto-detected. Scan directly in the POS screen.
                                </div>
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Ready
                                </div>
                            </div>
                        </div>

                        <div className="p-4 flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 flex-shrink-0">
                                <PrinterIcon />
                            </div>
                            <div>
                                <div className="font-medium text-slate-900">Receipt Printer</div>
                                <div className="text-sm text-slate-500 mt-0.5">
                                    Receipts are optimized for 80mm thermal printers.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-white rounded-xl border border-red-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-red-100 bg-red-50">
                        <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide">Danger Zone</h2>
                    </div>
                    <div className="p-4">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                    <TrashIcon />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-red-700">Delete All Data</div>
                                    <div className="text-xs text-red-500">Remove all products, bills, and logs</div>
                                </div>
                            </div>
                            <ChevronRightIcon className="text-red-400" />
                        </button>
                        <p className="mt-3 text-xs text-slate-500">
                            A backup will be automatically downloaded before deletion.
                        </p>
                    </div>
                </section>

                {/* Spacer for bottom nav */}
                <div className="h-20"></div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrashIcon />
                        </div>
                        <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">
                            Delete All Data?
                        </h3>
                        <p className="text-sm text-slate-500 text-center mb-4">
                            This will permanently delete all products, stock logs, bills, and expenses.
                            A backup will be downloaded automatically before deletion.
                        </p>

                        <div className="mb-4">
                            <label className="text-xs text-slate-500 block mb-1">
                                Type DELETE to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center font-mono tracking-widest"
                                placeholder="DELETE"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAllData}
                                disabled={deleteConfirmText !== 'DELETE' || loading === 'delete'}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading === 'delete' ? 'Deleting...' : 'Delete & Backup'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Additional icon
const ChevronRightIcon = ({ className = '' }) => (
    <svg className={`w-5 h-5 text-slate-400 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

export default SettingsPage;
