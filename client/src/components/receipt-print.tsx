import { forwardRef } from "react";

interface OrderItem {
 coffeeItem: {
 nameAr: string;
 price: string;
 };
 quantity: number;
}

interface ReceiptProps {
 orderNumber: string;
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

export const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptProps>(
 ({ orderNumber, customerName, customerPhone, items, subtotal, discount, total, paymentMethod, employeeName, tableNumber, date }, ref) => {
 return (
 <div ref={ref} className="hidden print:block">
 <div className="max-w-[80mm] mx-auto bg-white text-black p-4" dir="rtl">
 <div className="text-center mb-4 border-b-2 border-dashed border-gray-400 pb-4">
 <h1 className="text-2xl font-bold mb-1">قهوة كوب</h1>
 <p className="text-sm">QahwaCup</p>
 <p className="text-xs mt-2">فاتورة مبيعات</p>
 </div>

 <div className="text-sm space-y-1 mb-4">
 <div className="flex justify-between">
 <span className="font-bold">رقم الطلب:</span>
 <span>{orderNumber}</span>
 </div>
 <div className="flex justify-between">
 <span>التاريخ :</span>
 <span>{date}</span>
 </div>
 <div className="flex justify-between">
 <span>العميل:</span>
 <span>{customerName}</span>
 </div>
 <div className="flex justify-between">
 <span>الجوال:</span>
 <span>{customerPhone}</span>
 </div>
 {tableNumber && (
 <div className="flex justify-between">
 <span>الطاولة :</span>
 <span>{tableNumber}</span>
 </div>
 )}
 <div className="flex justify-between">
 <span>الكاشير:</span>
 <span>{employeeName}</span>
 </div>
 </div>

 <div className="border-t-2 border-b-2 border-dashed border-gray-400 py-3 mb-3">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-gray-300">
 <th className="text-right py-1">المنتج</th>
 <th className="text-center py-1">الكمية </th>
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

 <div className="text-sm space-y-2 mb-4">
 <div className="flex justify-between">
 <span>المجموع الفرعي:</span>
 <span>{subtotal} ريال</span>
 </div>
 
 {discount && (
 <div className="flex justify-between text-green-600">
 <span>الخصم ({discount.code} - {discount.percentage}%):</span>
 <span>-{discount.amount} ريال</span>
 </div>
 )}

 <div className="flex justify-between font-bold text-lg border-t-2 border-gray-400 pt-2">
 <span>الإجمالي:</span>
 <span>{total} ريال</span>
 </div>

 <div className="flex justify-between mt-3">
 <span>طريقة الدفع:</span>
 <span className="font-bold">{paymentMethod}</span>
 </div>
 </div>

 <div className="text-center text-xs border-t-2 border-dashed border-gray-400 pt-4 space-y-1">
 <p>شكراً لزيارتكم</p>
 <p>نتمنى لكم تجربة ممتعة </p>
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

ReceiptPrint.displayName = "ReceiptPrint";
