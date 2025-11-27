import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";

interface OrderItem {
 coffeeItem: {
 nameAr: string;
 price: string;
 };
 quantity: number;
}

interface TaxInvoiceProps {
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
 total: string;
 paymentMethod: string;
 employeeName: string;
 tableNumber?: string;
 date: string;
}

const TAX_RATE = 0.15;
const VAT_NUMBER = "311234567890003";
const COMPANY_NAME = "قهوة كوب";
const COMPANY_NAME_EN = "QahwaCup";

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

export const TaxInvoicePrint = forwardRef<HTMLDivElement, TaxInvoiceProps>(
 ({ orderNumber, invoiceNumber, customerName, customerPhone, items, subtotal, discount, total, paymentMethod, employeeName, tableNumber, date }, ref) => {
 const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

 const totalAmount = parseFloat(total);
 const subtotalBeforeTax = totalAmount / (1 + TAX_RATE);
 const vatAmount = totalAmount - subtotalBeforeTax;
 const discountAmount = discount ? parseFloat(discount.amount) : 0;
 const subtotalBeforeDiscount = subtotalBeforeTax + discountAmount;
 
 const displayInvoiceNumber = invoiceNumber || `INV-${orderNumber}`;

 useEffect(() => {
 const generateQR = async () => {
 try {
 const invoiceTimestamp = date ? new Date(date).toISOString() : new Date().toISOString();
 const zatcaData = generateZATCAQRCode({
 sellerName: COMPANY_NAME,
 vatNumber: VAT_NUMBER,
 timestamp: invoiceTimestamp,
 totalWithVat: totalAmount.toFixed(2),
 vatAmount: vatAmount.toFixed(2)
 });

 const qrDataUrl = await QRCode.toDataURL(zatcaData, {
 width: 150,
 margin: 2,
 color: {
 dark: '#000000',
 light: '#FFFFFF'
 },
 errorCorrectionLevel: 'M'
 });
 setQrCodeUrl(qrDataUrl);
 } catch (error) {
 console.error("Error generating QR code:", error);
 }
 };

 generateQR();
 }, [totalAmount, vatAmount, date]);

 return (
 <div ref={ref} className="hidden print:block">
 <div className="max-w-[80mm] mx-auto bg-white text-black p-4" dir="rtl">
 <div className="text-center mb-4 border-b-2 border-black pb-4">
 <h1 className="text-2xl font-bold mb-1">{COMPANY_NAME}</h1>
 <p className="text-sm">{COMPANY_NAME_EN}</p>
 <p className="text-lg font-bold mt-2">فاتورة ضريبية مبسطة</p>
 <p className="text-xs">Simplified Tax Invoice</p>
 </div>

 <div className="text-sm space-y-1 mb-4 border-b border-dashed border-gray-400 pb-3">
 <div className="flex justify-between">
 <span className="font-bold">الرقم الضريبي (VAT No.):</span>
 <span dir="ltr">{VAT_NUMBER}</span>
 </div>
 <div className="flex justify-between">
 <span className="font-bold">رقم الفاتورة (Invoice No.):</span>
 <span>{displayInvoiceNumber}</span>
 </div>
 <div className="flex justify-between">
 <span>التاريخ والوقت:</span>
 <span>{date}</span>
 </div>
 </div>

 <div className="text-sm space-y-1 mb-4 border-b border-dashed border-gray-400 pb-3">
 <div className="flex justify-between">
 <span>العميل:</span>
 <span>{customerName}</span>
 </div>
 <div className="flex justify-between">
 <span>الجوال:</span>
 <span dir="ltr">{customerPhone}</span>
 </div>
 {tableNumber && (
 <div className="flex justify-between">
 <span>رقم الطاولة:</span>
 <span>{tableNumber}</span>
 </div>
 )}
 <div className="flex justify-between">
 <span>الكاشير:</span>
 <span>{employeeName}</span>
 </div>
 </div>

 <div className="border-t-2 border-b-2 border-black py-3 mb-3">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-gray-300">
 <th className="text-right py-1">البند</th>
 <th className="text-center py-1">الكمية</th>
 <th className="text-left py-1">السعر</th>
 </tr>
 </thead>
 <tbody>
 {items.map((item, index) => (
 <tr key={index} className="border-b border-gray-200">
 <td className="text-right py-2">{item.coffeeItem.nameAr}</td>
 <td className="text-center py-2">{item.quantity}</td>
 <td className="text-left py-2">
 {(parseFloat(item.coffeeItem.price) * item.quantity).toFixed(2)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="text-sm space-y-2 mb-4 border-b border-dashed border-gray-400 pb-3">
 <div className="flex justify-between">
 <span>المجموع قبل الضريبة:</span>
 <span>{subtotalBeforeDiscount.toFixed(2)} ريال</span>
 </div>
 
 {discount && (
 <div className="flex justify-between text-green-700">
 <span>الخصم ({discount.code} - {discount.percentage}%):</span>
 <span>-{discount.amount} ريال</span>
 </div>
 )}

 <div className="flex justify-between">
 <span>الصافي قبل الضريبة:</span>
 <span>{subtotalBeforeTax.toFixed(2)} ريال</span>
 </div>

 <div className="flex justify-between font-bold">
 <span>ضريبة القيمة المضافة (15%):</span>
 <span>{vatAmount.toFixed(2)} ريال</span>
 </div>

 <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2">
 <span>الإجمالي شامل الضريبة:</span>
 <span>{totalAmount.toFixed(2)} ريال</span>
 </div>

 <div className="flex justify-between mt-2">
 <span>طريقة الدفع:</span>
 <span className="font-bold">{paymentMethod}</span>
 </div>
 </div>

 <div className="text-center mb-4">
 <p className="text-sm font-bold mb-2">رمز الاستجابة السريع للتحقق</p>
 <p className="text-xs mb-2">ZATCA Compliant QR Code</p>
 {qrCodeUrl && (
 <img 
 src={qrCodeUrl} 
 alt="ZATCA QR Code" 
 className="mx-auto w-32 h-32 border border-gray-300 p-1"
 />
 )}
 </div>

 <div className="text-center text-xs border-t-2 border-black pt-4 space-y-1">
 <p className="font-bold">شكراً لزيارتكم</p>
 <p>Thank you for visiting</p>
 <p className="mt-2">الأسعار شاملة ضريبة القيمة المضافة</p>
 <p>All prices include 15% VAT</p>
 <p className="mt-3">تابعونا على وسائل التواصل الاجتماعي</p>
 <p className="font-mono">@QahwaCup</p>
 </div>
 </div>

 <style>{`
 @media print {
 @page {
 size: 80mm auto;
 margin: 0;
 }
 body {
 margin: 0;
 padding: 0;
 }
 .print\\:block {
 display: block !important;
 }
 .hidden {
 display: none !important;
 }
 }
 `}</style>
 </div>
 );
 }
);

TaxInvoicePrint.displayName = "TaxInvoicePrint";
