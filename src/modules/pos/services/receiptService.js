import { formatCurrency } from './billService';

/**
 * Receipt generation and printing service
 */

/**
 * Generate receipt data structure
 */
export const generateReceipt = (bill, shopInfo = {}) => {
    return {
        shopName: shopInfo.name || 'Zetta Store',
        shopAddress: shopInfo.address || '',
        shopPhone: shopInfo.phone || '',
        shopGST: shopInfo.gst || '',
        billNumber: bill.billNumber,
        billId: bill.id,
        date: bill.createdAt?.toDate?.() || new Date(),
        items: bill.items,
        subtotal: bill.subtotal,
        discount: bill.discount,
        tax: bill.tax,
        total: bill.total,
        paymentMode: bill.paymentMode,
        amountReceived: bill.amountReceived,
        change: bill.change
    };
};

/**
 * Generate printable HTML receipt
 */
export const generateReceiptHTML = (receipt) => {
    const dateStr = receipt.date.toLocaleDateString('en-IN');
    const timeStr = receipt.date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${receipt.billNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Courier New', monospace; 
          width: 80mm; 
          padding: 10px;
          font-size: 12px;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { 
          border-top: 1px dashed #000; 
          margin: 8px 0; 
        }
        .row { 
          display: flex; 
          justify-content: space-between; 
          margin: 2px 0;
        }
        .item { margin: 4px 0; }
        .total-row { font-size: 14px; font-weight: bold; }
        h1 { font-size: 16px; margin-bottom: 5px; }
        h2 { font-size: 14px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="center">
        <h1>${receipt.shopName}</h1>
        ${receipt.shopAddress ? `<p>${receipt.shopAddress}</p>` : ''}
        ${receipt.shopPhone ? `<p>Tel: ${receipt.shopPhone}</p>` : ''}
        ${receipt.shopGST ? `<p>GST: ${receipt.shopGST}</p>` : ''}
      </div>
      
      <div class="divider"></div>
      
      <div class="row">
        <span>Bill: ${receipt.billNumber}</span>
      </div>
      <div class="row">
        <span>${dateStr}</span>
        <span>${timeStr}</span>
      </div>
      
      <div class="divider"></div>
      
      ${receipt.items.map(item => `
        <div class="item">
          <div>${item.name}</div>
          <div class="row">
            <span>${item.qty} x ${formatCurrency(item.price)}</span>
            <span>${formatCurrency(item.total)}</span>
          </div>
        </div>
      `).join('')}
      
      <div class="divider"></div>
      
      <div class="row">
        <span>Subtotal</span>
        <span>${formatCurrency(receipt.subtotal)}</span>
      </div>
      
      ${receipt.discount > 0 ? `
        <div class="row">
          <span>Discount</span>
          <span>-${formatCurrency(receipt.discount)}</span>
        </div>
      ` : ''}
      
      ${receipt.tax > 0 ? `
        <div class="row">
          <span>Tax</span>
          <span>${formatCurrency(receipt.tax)}</span>
        </div>
      ` : ''}
      
      <div class="divider"></div>
      
      <div class="row total-row">
        <span>TOTAL</span>
        <span>${formatCurrency(receipt.total)}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="row">
        <span>Payment: ${receipt.paymentMode.toUpperCase()}</span>
      </div>
      
      ${receipt.paymentMode === 'cash' && receipt.amountReceived ? `
        <div class="row">
          <span>Received</span>
          <span>${formatCurrency(receipt.amountReceived)}</span>
        </div>
        <div class="row">
          <span>Change</span>
          <span>${formatCurrency(receipt.change)}</span>
        </div>
      ` : ''}
      
      <div class="divider"></div>
      
      <div class="center">
        <p>Thank you for shopping!</p>
        <p style="margin-top: 10px; font-size: 10px;">Powered by Zetta</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Print receipt
 */
export const printReceipt = (receipt) => {
    const html = generateReceiptHTML(receipt);
    const printWindow = window.open('', 'PRINT', 'width=320,height=600');

    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
};

/**
 * Generate WhatsApp share text
 */
export const generateWhatsAppText = (receipt) => {
    let text = `*${receipt.shopName}*\n`;
    text += `Bill: ${receipt.billNumber}\n`;
    text += `Date: ${receipt.date.toLocaleDateString('en-IN')}\n\n`;

    text += `*Items:*\n`;
    receipt.items.forEach(item => {
        text += `${item.name} x${item.qty} = ${formatCurrency(item.total)}\n`;
    });

    text += `\n*Total: ${formatCurrency(receipt.total)}*\n`;
    text += `Payment: ${receipt.paymentMode.toUpperCase()}\n\n`;
    text += `Thank you for shopping!`;

    return text;
};

/**
 * Share via WhatsApp
 */
export const shareViaWhatsApp = (receipt, phoneNumber = '') => {
    const text = encodeURIComponent(generateWhatsAppText(receipt));
    const url = phoneNumber
        ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${text}`
        : `https://api.whatsapp.com/send?text=${text}`;

    window.open(url, '_blank');
};
