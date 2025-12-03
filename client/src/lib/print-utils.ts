import QRCode from "qrcode";

interface OrderItem {
  coffeeItem: {
    nameAr: string;
    nameEn?: string;
    price: string;
  };
  quantity: number;
  itemDiscount?: number;
}

interface TaxInvoiceData {
  orderNumber: string;
  invoiceNumber?: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: string;
  discount?: {
    code: string;
    percentage: number;
    amount: string;
  };
  invoiceDiscount?: number | string;
  total: string;
  paymentMethod: string;
  employeeName: string;
  tableNumber?: string;
  date: string;
  branchName?: string;
  branchAddress?: string;
}

const TAX_RATE = 0.15;
const VAT_NUMBER = "311234567890003";
const COMPANY_NAME = "قهوة كوب";
const COMPANY_NAME_EN = "Qahwa Cup";
const COMPANY_CR = "1010XXXXXX";
const DEFAULT_BRANCH = "الفرع الرئيسي";
const DEFAULT_ADDRESS = "الرياض، المملكة العربية السعودية";

function generateZATCAQRCode(data: {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalWithVat: string;
  vatAmount: string;
}): string {
  const tlv = (tag: number, value: string): Uint8Array => {
    const encoder = new TextEncoder();
    const valueBytes = encoder.encode(value);
    const result = new Uint8Array(2 + valueBytes.length);
    result[0] = tag;
    result[1] = valueBytes.length;
    result.set(valueBytes, 2);
    return result;
  };

  const sellerNameTLV = tlv(1, data.sellerName);
  const vatNumberTLV = tlv(2, data.vatNumber);
  const timestampTLV = tlv(3, data.timestamp);
  const totalWithVatTLV = tlv(4, data.totalWithVat);
  const vatAmountTLV = tlv(5, data.vatAmount);

  const combined = new Uint8Array(
    sellerNameTLV.length + vatNumberTLV.length + timestampTLV.length + 
    totalWithVatTLV.length + vatAmountTLV.length
  );

  let offset = 0;
  combined.set(sellerNameTLV, offset); offset += sellerNameTLV.length;
  combined.set(vatNumberTLV, offset); offset += vatNumberTLV.length;
  combined.set(timestampTLV, offset); offset += timestampTLV.length;
  combined.set(totalWithVatTLV, offset); offset += totalWithVatTLV.length;
  combined.set(vatAmountTLV, offset);

  let binary = '';
  combined.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function parseNumber(value: number | string | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function formatDate(dateStr: string): { date: string; time: string } {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { date: dateStr, time: '' };
    }
    return {
      date: d.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    };
  } catch {
    return { date: dateStr, time: '' };
  }
}

export async function printTaxInvoice(data: TaxInvoiceData): Promise<void> {
  const totalAmount = parseNumber(data.total);
  
  const codeDiscountAmount = data.discount ? parseNumber(data.discount.amount) : 0;
  const invDiscountAmount = parseNumber(data.invoiceDiscount);
  const itemDiscountsTotal = data.items.reduce((sum, item) => sum + parseNumber(item.itemDiscount), 0);
  
  const subtotalBeforeTax = totalAmount / (1 + TAX_RATE);
  const vatAmount = totalAmount - subtotalBeforeTax;
  
  const totalDiscounts = codeDiscountAmount + invDiscountAmount + itemDiscountsTotal;
  const subtotalBeforeAllDiscounts = subtotalBeforeTax + (totalDiscounts / (1 + TAX_RATE));
  
  const displayInvoiceNumber = data.invoiceNumber || `INV-${data.orderNumber}`;
  const { date: formattedDate, time: formattedTime } = formatDate(data.date);
  const displayBranchName = data.branchName || DEFAULT_BRANCH;
  const displayBranchAddress = data.branchAddress || DEFAULT_ADDRESS;

  const invoiceTimestamp = data.date ? new Date(data.date).toISOString() : new Date().toISOString();
  const zatcaData = generateZATCAQRCode({
    sellerName: COMPANY_NAME,
    vatNumber: VAT_NUMBER,
    timestamp: invoiceTimestamp,
    totalWithVat: totalAmount.toFixed(2),
    vatAmount: vatAmount.toFixed(2)
  });

  let qrCodeUrl = "";
  try {
    qrCodeUrl = await QRCode.toDataURL(zatcaData, {
      width: 180,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
  }

  const itemsHtml = data.items.map((item, index) => {
    const unitPrice = parseNumber(item.coffeeItem.price);
    const lineTotal = unitPrice * item.quantity;
    const itemDiscount = parseNumber(item.itemDiscount);
    const lineAfterDiscount = lineTotal - itemDiscount;
    return `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 8px 4px; text-align: right;">
          <div style="font-weight: 500; color: #1a1a1a;">${item.coffeeItem.nameAr}</div>
          ${item.coffeeItem.nameEn ? `<div style="font-size: 10px; color: #666;">${item.coffeeItem.nameEn}</div>` : ''}
          ${itemDiscount > 0 ? `<div style="font-size: 10px; color: #16a34a;">خصم: ${itemDiscount.toFixed(2)}-</div>` : ''}
        </td>
        <td style="padding: 8px 4px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 4px; text-align: center;">${unitPrice.toFixed(2)}</td>
        <td style="padding: 8px 4px; text-align: left; font-weight: 500;">${lineAfterDiscount.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const invoiceHtml = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاتورة ضريبية - ${displayInvoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      background: #ffffff;
      color: #000000;
      direction: rtl;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .invoice-container {
      max-width: 80mm;
      margin: 0 auto;
      padding: 12px;
      background: #ffffff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 2px dashed #333;
    }
    
    .logo-container {
      width: 64px;
      height: 64px;
      margin: 0 auto 8px;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      color: #92400e;
    }
    
    .company-name {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    
    .company-name-en {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .branch-name {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    
    .branch-address {
      font-size: 11px;
      color: #888;
    }
    
    .invoice-title {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
    }
    
    .invoice-title h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .invoice-title p {
      font-size: 11px;
      color: #666;
    }
    
    .section {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #ccc;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 12px;
    }
    
    .info-label {
      color: #666;
    }
    
    .info-value {
      font-weight: 500;
      color: #1a1a1a;
    }
    
    .vat-box {
      background: #f5f5f5;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    
    .vat-box .info-value {
      font-family: monospace;
      font-weight: 700;
      direction: ltr;
      text-align: left;
    }
    
    .invoice-number-box {
      background: #fef3c7;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    
    .invoice-number-box .info-value {
      color: #92400e;
      font-weight: 700;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    
    thead tr {
      border-bottom: 2px solid #333;
    }
    
    th {
      padding: 8px 4px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    th:first-child { text-align: right; }
    th:nth-child(2), th:nth-child(3) { text-align: center; width: 48px; }
    th:last-child { text-align: left; width: 64px; }
    
    .totals {
      margin-top: 12px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12px;
    }
    
    .total-row.discount {
      color: #16a34a;
    }
    
    .total-row.vat {
      background: #f5f5f5;
      padding: 8px 12px;
      border-radius: 6px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .total-row.grand {
      background: #fef3c7;
      padding: 12px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 16px;
      color: #1a1a1a;
      margin-top: 8px;
    }
    
    .payment-method {
      background: #eff6ff;
      padding: 12px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }
    
    .payment-method .value {
      color: #1d4ed8;
      font-weight: 700;
    }
    
    .qr-section {
      text-align: center;
      margin: 16px 0;
    }
    
    .qr-title {
      font-size: 12px;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;
    }
    
    .qr-subtitle {
      font-size: 10px;
      color: #666;
      margin-bottom: 12px;
    }
    
    .qr-container {
      display: inline-block;
      padding: 8px;
      background: #fff;
      border: 2px solid #ddd;
      border-radius: 8px;
    }
    
    .qr-container img {
      width: 144px;
      height: 144px;
    }
    
    .qr-note {
      font-size: 9px;
      color: #888;
      margin-top: 8px;
    }
    
    .footer {
      text-align: center;
      padding-top: 16px;
      border-top: 2px solid #333;
    }
    
    .footer-thanks {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    
    .footer-thanks-en {
      font-size: 12px;
      color: #666;
      margin-bottom: 12px;
    }
    
    .footer-vat-note {
      background: #f5f5f5;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 12px;
    }
    
    .footer-vat-note p {
      color: #666;
    }
    
    .footer-social {
      font-size: 12px;
      color: #666;
    }
    
    .footer-social .handle {
      font-family: monospace;
      font-weight: 700;
      color: #b45309;
    }
    
    .footer-generated {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-size: 9px;
      color: #888;
    }
    
    @media print {
      @page {
        size: 80mm auto;
        margin: 0;
      }
      
      body {
        margin: 0;
        padding: 0;
      }
      
      .invoice-container {
        padding: 8px;
      }
      
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo-container">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5C22,3.89 21.1,3 20,3Z" />
        </svg>
      </div>
      <h1 class="company-name">${COMPANY_NAME}</h1>
      <p class="company-name-en">${COMPANY_NAME_EN}</p>
      <p class="branch-name">${displayBranchName}</p>
      <p class="branch-address">${displayBranchAddress}</p>
      <div class="invoice-title">
        <h2>فاتورة ضريبية مبسطة</h2>
        <p>Simplified Tax Invoice</p>
      </div>
    </div>

    <div class="section">
      <div class="vat-box">
        <div class="info-row">
          <span class="info-label">الرقم الضريبي VAT:</span>
          <span class="info-value">${VAT_NUMBER}</span>
        </div>
      </div>
      <div class="info-row">
        <span class="info-label">السجل التجاري CR:</span>
        <span class="info-value" style="font-family: monospace; direction: ltr;">${COMPANY_CR}</span>
      </div>
    </div>

    <div class="section">
      <div class="invoice-number-box">
        <div class="info-row">
          <span class="info-label">رقم الفاتورة:</span>
          <span class="info-value">${displayInvoiceNumber}</span>
        </div>
      </div>
      <div class="info-row">
        <span class="info-label">التاريخ:</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">الوقت:</span>
        <span class="info-value" style="direction: ltr; text-align: left;">${formattedTime}</span>
      </div>
    </div>

    <div class="section">
      <div class="info-row">
        <span class="info-label">العميل:</span>
        <span class="info-value">${data.customerName || 'عميل'}</span>
      </div>
      ${data.customerPhone ? `
      <div class="info-row">
        <span class="info-label">الجوال:</span>
        <span class="info-value" style="font-family: monospace; direction: ltr;">${data.customerPhone}</span>
      </div>
      ` : ''}
      ${data.tableNumber ? `
      <div class="info-row">
        <span class="info-label">الطاولة:</span>
        <span class="info-value">${data.tableNumber}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">الكاشير:</span>
        <span class="info-value">${data.employeeName}</span>
      </div>
    </div>

    <div class="section">
      <table>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>المجموع</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="total-row">
        <span>المجموع قبل الضريبة والخصم:</span>
        <span>${subtotalBeforeAllDiscounts.toFixed(2)} ر.س</span>
      </div>
      
      ${itemDiscountsTotal > 0 ? `
      <div class="total-row discount">
        <span>خصومات الأصناف:</span>
        <span>(${(itemDiscountsTotal / (1 + TAX_RATE)).toFixed(2)}) ر.س</span>
      </div>
      ` : ''}
      
      ${data.discount && codeDiscountAmount > 0 ? `
      <div class="total-row discount">
        <span>خصم ${data.discount.code} (${data.discount.percentage}%):</span>
        <span>(${(codeDiscountAmount / (1 + TAX_RATE)).toFixed(2)}) ر.س</span>
      </div>
      ` : ''}

      ${invDiscountAmount > 0 ? `
      <div class="total-row discount">
        <span>خصم الفاتورة:</span>
        <span>(${(invDiscountAmount / (1 + TAX_RATE)).toFixed(2)}) ر.س</span>
      </div>
      ` : ''}

      <div class="total-row" style="border-top: 1px solid #ddd; padding-top: 8px; margin-top: 4px;">
        <span>الصافي قبل الضريبة:</span>
        <span>${subtotalBeforeTax.toFixed(2)} ر.س</span>
      </div>

      <div class="total-row vat">
        <span>ضريبة القيمة المضافة (15%):</span>
        <span>${vatAmount.toFixed(2)} ر.س</span>
      </div>

      <div class="total-row grand">
        <span>الإجمالي شامل الضريبة:</span>
        <span>${totalAmount.toFixed(2)} ر.س</span>
      </div>
    </div>

    <div class="section" style="margin-top: 16px;">
      <div class="payment-method">
        <span>طريقة الدفع:</span>
        <span class="value">${data.paymentMethod}</span>
      </div>
    </div>

    <div class="qr-section">
      <p class="qr-title">رمز الاستجابة السريع للتحقق من الفاتورة</p>
      <p class="qr-subtitle">ZATCA Compliant QR Code for Verification</p>
      ${qrCodeUrl ? `
      <div class="qr-container">
        <img src="${qrCodeUrl}" alt="ZATCA QR Code" />
      </div>
      ` : ''}
      <p class="qr-note">امسح الرمز للتحقق من صحة الفاتورة</p>
    </div>

    <div class="footer">
      <p class="footer-thanks">شكراً لزيارتكم</p>
      <p class="footer-thanks-en">Thank you for visiting us</p>
      
      <div class="footer-vat-note">
        <p>جميع الأسعار شاملة ضريبة القيمة المضافة 15%</p>
        <p>All prices include 15% VAT</p>
      </div>
      
      <div class="footer-social">
        <p>تابعونا على وسائل التواصل الاجتماعي</p>
        <p class="handle">@QahwaCup</p>
      </div>
      
      <div class="footer-generated">
        <p>تم إنشاء هذه الفاتورة إلكترونياً</p>
        <p>This invoice was generated electronically</p>
      </div>
    </div>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #b45309; color: white; border: none; border-radius: 8px; cursor: pointer;">
      طباعة الفاتورة
    </button>
    <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">
      إغلاق
    </button>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  } else {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position: absolute; left: -9999px; top: -9999px; width: 0; height: 0;';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(invoiceHtml);
      iframeDoc.close();
      
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  }
}

export async function printSimpleReceipt(data: TaxInvoiceData): Promise<void> {
  const itemsHtml = data.items.map(item => {
    const unitPrice = parseNumber(item.coffeeItem.price);
    const lineTotal = unitPrice * item.quantity;
    return `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 8px 4px; text-align: right;">${item.coffeeItem.nameAr}</td>
        <td style="padding: 8px 4px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 4px; text-align: left;">${lineTotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const receiptHtml = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>إيصال - ${data.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Cairo', sans-serif;
      background: #fff;
      color: #000;
      direction: rtl;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .receipt {
      max-width: 80mm;
      margin: 0 auto;
      padding: 16px;
    }
    
    .header {
      text-align: center;
      border-bottom: 2px dashed #333;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    
    .company-name { font-size: 24px; font-weight: 700; }
    .company-name-en { font-size: 14px; color: #666; }
    
    .section {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #ccc;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 14px;
    }
    
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { padding: 8px 4px; font-weight: 700; border-bottom: 2px solid #333; }
    th:first-child { text-align: right; }
    th:nth-child(2) { text-align: center; }
    th:last-child { text-align: left; }
    
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .total-row.grand { font-size: 18px; font-weight: 700; border-top: 2px solid #333; padding-top: 12px; }
    
    .footer { text-align: center; padding-top: 16px; border-top: 2px dashed #333; }
    
    @media print {
      @page { size: 80mm auto; margin: 0; }
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1 class="company-name">${COMPANY_NAME}</h1>
      <p class="company-name-en">${COMPANY_NAME_EN}</p>
      <p style="margin-top: 8px; font-size: 12px;">فاتورة مبيعات</p>
    </div>

    <div class="section">
      <div class="info-row">
        <span><strong>رقم الطلب:</strong></span>
        <span>${data.orderNumber}</span>
      </div>
      <div class="info-row">
        <span>التاريخ:</span>
        <span>${data.date}</span>
      </div>
      <div class="info-row">
        <span>العميل:</span>
        <span>${data.customerName}</span>
      </div>
      <div class="info-row">
        <span>الجوال:</span>
        <span>${data.customerPhone}</span>
      </div>
      ${data.tableNumber ? `
      <div class="info-row">
        <span>الطاولة:</span>
        <span>${data.tableNumber}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span>الكاشير:</span>
        <span>${data.employeeName}</span>
      </div>
    </div>

    <div class="section">
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>السعر</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <div>
      <div class="total-row">
        <span>المجموع الفرعي:</span>
        <span>${data.subtotal} ريال</span>
      </div>
      ${data.discount ? `
      <div class="total-row" style="color: #16a34a;">
        <span>الخصم (${data.discount.code} - ${data.discount.percentage}%):</span>
        <span>-${data.discount.amount} ريال</span>
      </div>
      ` : ''}
      <div class="total-row grand">
        <span>الإجمالي:</span>
        <span>${data.total} ريال</span>
      </div>
      <div class="total-row" style="margin-top: 12px;">
        <span>طريقة الدفع:</span>
        <span><strong>${data.paymentMethod}</strong></span>
      </div>
    </div>

    <div class="footer">
      <p>شكراً لزيارتكم</p>
      <p style="font-size: 12px; color: #666;">نتمنى لكم تجربة ممتعة</p>
      <p style="margin-top: 12px; font-size: 12px;">تابعونا على وسائل التواصل الاجتماعي</p>
      <p style="font-family: monospace;">@QahwaCup</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  }
}
