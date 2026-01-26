/**
 * Print Service
 * Handles receipt printing for thermal printers
 */

/**
 * Generate receipt HTML for thermal printing (80mm width)
 */
export const generateReceiptHtml = (bill, shopInfo = {}) => {
    const shopName = shopInfo.name || 'Zetta POS';
    const shopAddress = shopInfo.address || '';
    const shopPhone = shopInfo.phone || '';

    const formatCurrency = (amount) => `₹${(amount || 0).toFixed(2)}`;
    const formatDate = (date) => {
        const d = date instanceof Date ? date : date?.toDate?.() || new Date(date || Date.now());
        return d.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const itemsHtml = (bill.items || []).map(item => `
        <tr>
            <td style="text-align:left">${item.name}</td>
            <td style="text-align:center">${item.qty}</td>
            <td style="text-align:right">${formatCurrency(item.total || item.qty * item.price)}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            padding: 5mm;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 2px 0;
        }
        .total-row {
            font-size: 14px;
            font-weight: bold;
        }
        @media print {
            body { width: 80mm; }
            @page { size: 80mm auto; margin: 0; }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="center bold" style="font-size:16px">${shopName}</div>
    ${shopAddress ? `<div class="center">${shopAddress}</div>` : ''}
    ${shopPhone ? `<div class="center">Tel: ${shopPhone}</div>` : ''}
    
    <div class="divider"></div>
    
    <!-- Bill Info -->
    <div>
        <span>Bill #${bill.billNumber || bill.id}</span>
        <span class="right" style="float:right">${formatDate(bill.createdAt)}</span>
    </div>
    ${bill.patientName || bill.customerName ? `<div>Customer: ${bill.patientName || bill.customerName}</div>` : ''}
    
    <div class="divider"></div>
    
    <!-- Items -->
    <table>
        <thead>
            <tr>
                <th style="text-align:left">Item</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHtml}
        </tbody>
    </table>
    
    <div class="divider"></div>
    
    <!-- Totals -->
    <table>
        <tr>
            <td>Subtotal</td>
            <td class="right">${formatCurrency(bill.subtotal)}</td>
        </tr>
        ${bill.discount > 0 ? `
        <tr>
            <td>Discount</td>
            <td class="right">-${formatCurrency(bill.discount)}</td>
        </tr>
        ` : ''}
        ${bill.tax > 0 ? `
        <tr>
            <td>Tax</td>
            <td class="right">${formatCurrency(bill.tax)}</td>
        </tr>
        ` : ''}
        <tr class="total-row">
            <td>TOTAL</td>
            <td class="right">${formatCurrency(bill.total)}</td>
        </tr>
    </table>
    
    <div class="divider"></div>
    
    <!-- Payment -->
    <table>
        <tr>
            <td>Payment Mode</td>
            <td class="right">${(bill.paymentMode || 'Cash').toUpperCase()}</td>
        </tr>
        ${bill.paymentMode === 'cash' && bill.amountReceived ? `
        <tr>
            <td>Received</td>
            <td class="right">${formatCurrency(bill.amountReceived)}</td>
        </tr>
        <tr>
            <td>Change</td>
            <td class="right">${formatCurrency(bill.change)}</td>
        </tr>
        ` : ''}
    </table>
    
    <div class="divider"></div>
    
    <!-- Footer -->
    <div class="center" style="margin-top:10px">
        <div>Thank you for your visit!</div>
        <div style="font-size:10px;margin-top:5px">Powered by Zetta POS</div>
    </div>
</body>
</html>
    `;
};

/**
 * Open print dialog with receipt
 */
export const printReceipt = (bill, shopInfo = {}) => {
    const html = generateReceiptHtml(bill, shopInfo);

    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (!printWindow) {
        alert('Please allow popups to print receipts');
        return false;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Close after print dialog closes
        printWindow.onafterprint = () => printWindow.close();
    };

    return true;
};

/**
 * Generate receipt as blob for download
 */
export const downloadReceipt = (bill, shopInfo = {}) => {
    const html = generateReceiptHtml(bill, shopInfo);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${bill.billNumber || bill.id}.html`;
    a.click();

    URL.revokeObjectURL(url);
};

export default {
    generateReceiptHtml,
    printReceipt,
    downloadReceipt
};
