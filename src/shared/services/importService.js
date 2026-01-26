/**
 * Import Service
 * Handles Excel import for products and data restoration
 */

import * as XLSX from 'xlsx';
import { addProduct } from '../../shared/stockSync';

/**
 * Parse Excel file to JSON array
 */
export const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
            } catch (error) {
                reject(new Error('Failed to parse Excel file: ' + error.message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Validate product import data
 * Returns { valid: [], errors: [] }
 */
export const validateProductImport = (data) => {
    const valid = [];
    const errors = [];

    data.forEach((row, index) => {
        const rowNum = index + 2; // Excel row (header is row 1)
        const rowErrors = [];

        // Required: Name
        const name = row['Name'] || row['name'] || row['Product Name'];
        if (!name || !String(name).trim()) {
            rowErrors.push('Name is required');
        }

        // Required: Selling Price
        const price = parseFloat(row['Selling Price'] || row['price'] || row['Price'] || 0);
        if (!price || price <= 0) {
            rowErrors.push('Valid selling price is required');
        }

        // Optional fields with defaults
        const costPrice = parseFloat(row['Cost Price'] || row['costPrice'] || 0) || null;
        const stock = parseInt(row['Stock'] || row['stock'] || 0) || 0;
        const category = row['Category'] || row['category'] || '';
        const barcode = row['Barcode'] || row['barcode'] || '';

        if (rowErrors.length > 0) {
            errors.push({
                row: rowNum,
                data: row,
                errors: rowErrors
            });
        } else {
            valid.push({
                name: String(name).trim(),
                price: price,
                costPrice: costPrice,
                stock: stock,
                category: String(category).trim(),
                barcode: String(barcode).trim(),
                trackStock: true,
                isActive: true
            });
        }
    });

    return { valid, errors };
};

/**
 * Import products to inventory
 */
export const importProducts = async (products, tenantId, onProgress = null) => {
    const results = {
        success: [],
        failed: []
    };

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        try {
            const newProduct = addProduct({
                ...product,
                tenantId
            });
            results.success.push(newProduct);
        } catch (error) {
            results.failed.push({
                product,
                error: error.message
            });
        }

        // Report progress
        if (onProgress) {
            onProgress(i + 1, products.length);
        }
    }

    return results;
};

/**
 * Parse JSON backup file
 */
export const parseBackupFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);

                if (!backup.version || !backup.data) {
                    reject(new Error('Invalid backup file format'));
                    return;
                }

                resolve(backup);
            } catch (error) {
                reject(new Error('Failed to parse backup file: ' + error.message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};

/**
 * Restore products from backup
 */
export const restoreProducts = async (products, tenantId, onProgress = null) => {
    return importProducts(products, tenantId, onProgress);
};

export default {
    parseExcelFile,
    validateProductImport,
    importProducts,
    parseBackupFile,
    restoreProducts
};
