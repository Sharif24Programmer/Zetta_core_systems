/**
 * Export Service
 * Handles Excel and backup exports for bills, products, and stock logs
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

/**
 * Convert data array to Excel workbook and download
 */
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.min(maxWidth, Math.max(key.length, ...data.map(row => String(row[key] || '').length)))
    }));
    worksheet['!cols'] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
};

/**
 * Export bills to Excel
 */
export const exportBillsToExcel = (bills) => {
    const formattedBills = bills.map(bill => ({
        'Bill Number': bill.billNumber || bill.id,
        'Date': formatDate(bill.createdAt),
        'Customer': bill.patientName || bill.customerName || 'Walk-in',
        'Items': bill.items?.length || 0,
        'Subtotal': bill.subtotal || 0,
        'Discount': bill.discount || 0,
        'Tax': bill.tax || 0,
        'Total': bill.total || 0,
        'Payment Mode': bill.paymentMode || 'Cash',
        'Status': bill.status || 'completed'
    }));

    exportToExcel(formattedBills, `bills_export_${getDateStamp()}`, 'Bills');
};

/**
 * Export bill items detail
 */
export const exportBillItemsToExcel = (bills) => {
    const items = [];
    bills.forEach(bill => {
        (bill.items || []).forEach(item => {
            items.push({
                'Bill Number': bill.billNumber || bill.id,
                'Date': formatDate(bill.createdAt),
                'Product': item.name,
                'Quantity': item.qty,
                'Unit Price': item.price,
                'Total': item.total || (item.qty * item.price)
            });
        });
    });

    exportToExcel(items, `bill_items_export_${getDateStamp()}`, 'Bill Items');
};

/**
 * Export products to Excel
 */
export const exportProductsToExcel = (products) => {
    const formattedProducts = products.map(p => ({
        'ID': p.id,
        'Name': p.name,
        'Category': p.category || '',
        'Selling Price': p.price,
        'Cost Price': p.costPrice || '',
        'Stock': p.stock || 0,
        'Track Stock': p.trackStock ? 'Yes' : 'No',
        'Barcode': p.barcode || '',
        'Active': p.isActive !== false ? 'Yes' : 'No'
    }));

    exportToExcel(formattedProducts, `products_export_${getDateStamp()}`, 'Products');
};

/**
 * Export stock logs to Excel
 */
export const exportStockLogsToExcel = (logs) => {
    const formattedLogs = logs.map(log => ({
        'Date': formatDate(log.createdAt),
        'Product': log.productName,
        'Type': log.type === 'in' ? 'Stock In' : log.type === 'out' ? 'Stock Out' : 'Adjustment',
        'Quantity': log.quantity,
        'Previous Stock': log.previousStock,
        'New Stock': log.newStock,
        'Reason': log.reason || ''
    }));

    exportToExcel(formattedLogs, `stock_logs_export_${getDateStamp()}`, 'Stock Logs');
};

/**
 * Create full backup as JSON
 */
export const createBackupJson = (data) => {
    const backup = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        data: data
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    saveAs(blob, `backup_${getDateStamp()}.json`);
};

/**
 * Create full backup as ZIP with multiple files
 */
export const createBackupZip = async (data) => {
    const zip = new JSZip();

    // Add each collection as separate JSON file
    if (data.products) {
        zip.file('products.json', JSON.stringify(data.products, null, 2));
    }
    if (data.bills) {
        zip.file('bills.json', JSON.stringify(data.bills, null, 2));
    }
    if (data.stockLogs) {
        zip.file('stock_logs.json', JSON.stringify(data.stockLogs, null, 2));
    }
    if (data.patients) {
        zip.file('patients.json', JSON.stringify(data.patients, null, 2));
    }

    // Add manifest
    zip.file('manifest.json', JSON.stringify({
        version: '1.0',
        createdAt: new Date().toISOString(),
        contents: Object.keys(data)
    }, null, 2));

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `full_backup_${getDateStamp()}.zip`);
};

/**
 * Download sample import template
 */
export const downloadProductTemplate = () => {
    const template = [
        {
            'Name': 'Example Product',
            'Category': 'Medicine',
            'Selling Price': 100,
            'Cost Price': 60,
            'Stock': 50,
            'Barcode': '1234567890'
        },
        {
            'Name': 'Another Product',
            'Category': 'Personal Care',
            'Selling Price': 50,
            'Cost Price': 30,
            'Stock': 100,
            'Barcode': '0987654321'
        }
    ];

    exportToExcel(template, 'product_import_template', 'Products');
};

// --- Helper Functions ---

const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getDateStamp = () => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
};

export default {
    exportToExcel,
    exportBillsToExcel,
    exportBillItemsToExcel,
    exportProductsToExcel,
    exportStockLogsToExcel,
    createBackupJson,
    createBackupZip,
    downloadProductTemplate
};
