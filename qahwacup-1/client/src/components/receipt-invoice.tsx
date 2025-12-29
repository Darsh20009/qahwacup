import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import type { Order } from "@shared/schema";
import logoImage from "../assets/qahwa-cup-logo.png";

interface ReceiptInvoiceProps {
 order: Order;
 variant?: "button" | "auto";
}

export function ReceiptInvoice({ order, variant = "button" }: ReceiptInvoiceProps) {
 const generatePDF = async () => {
 const receiptContent = document.createElement("div");
 receiptContent.style.direction = "rtl";
 receiptContent.style.fontFamily = "Arial, sans-serif";
 receiptContent.style.padding = "40px";
 receiptContent.style.width = "800px";
 receiptContent.style.backgroundColor = "#ffffff";

 receiptContent.innerHTML = `
 <div style="text-align: center; margin-bottom: 30px;">
 <img src="${logoImage}" style="width: 120px; height: auto; margin: 0 auto;" />
 <h1 style="color: #8B4513; margin: 20px 0 10px 0; font-size: 32px;">فاتورة استلام</h1>
 <p style="color: #666; font-size: 16px;">متجر قهوة كوب</p>
 </div>

 <div style="border: 2px solid #8B4513; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
 <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
 <div>
 <p style="color: #333; font-size: 18px;"><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
 <p style="color: #666; font-size: 14px; margin-top: 5px;">
 ${new Date(order.createdAt).toLocaleDateString('ar-SA', {
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })}
 </p>
 </div>
 <div style="text-align: left;">
 <p style="color: #333; font-size: 14px;"><strong>طريقة الدفع:</strong></p>
 <p style="color: #666; font-size: 14px;">${getPaymentMethodName(order.paymentMethod)}</p>
 </div>
 </div>

 ${order.customerInfo?.name ? `
 <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
 <p style="color: #333; font-size: 14px;"><strong>العميل:</strong> ${order.customerInfo.name}</p>
 ${order.customerInfo.phone ? `<p style="color: #666; font-size: 14px;">الهاتف: ${order.customerInfo.phone}</p>` : ''}
 </div>
 ` : ''}
 </div>

 <div style="margin-bottom: 20px;">
 <h2 style="color: #8B4513; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #8B4513; padding-bottom: 10px;">
 تفاصيل الطلب
 </h2>
 <table style="width: 100%; border-collapse: collapse;">
 <thead>
 <tr style="background-color: #f5f5f5;">
 <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">المنتج</th>
 <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">الكمية </th>
 <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">السعر</th>
 <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">المجموع</th>
 </tr>
 </thead>
 <tbody>
 ${(order.items || []).map((item: any) => `
 <tr>
 <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.nameAr || item.name}</td>
 <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
 <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${parseFloat(item.price).toFixed(2)} ريال</td>
 <td style="padding: 12px; text-align: left; border-bottom: 1px solid #eee;">${(parseFloat(item.price) * item.quantity).toFixed(2)} ريال</td>
 </tr>
 `).join('')}
 </tbody>
 </table>
 </div>

 <div style="margin-top: 30px; padding-top: 20px; border-top: 3px solid #8B4513;">
 <div style="text-align: left;">
 <p style="font-size: 28px; color: #8B4513; margin: 0;">
 <strong>المجموع الكلي: ${Number(order.totalAmount).toFixed(2)} ريال</strong>
 </p>
 </div>
 </div>

 ${order.customerNotes ? `
 <div style="margin-top: 20px; padding: 15px; background-color: #fff8dc; border-radius: 8px; border: 1px solid #f0e68c;">
 <p style="color: #8B4513; font-size: 14px; margin: 0;"><strong>ملاحظات:</strong></p>
 <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">${order.customerNotes}</p>
 </div>
 ` : ''}

 <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #ddd;">
 <p style="color: #8B4513; font-size: 16px; margin-bottom: 5px;">شكراً لزيارتكم</p>
 <p style="color: #666; font-size: 14px;">نتطلع لخدمتكم مرة أخرى</p>
 </div>
 `;

 document.body.appendChild(receiptContent);

 try {
 const canvas = await html2canvas(receiptContent, {
 scale: 2,
 useCORS: true,
 allowTaint: true,
 backgroundColor: "#ffffff"
 });

 const imgData = canvas.toDataURL("image/png");
 const pdf = new jsPDF({
 orientation: "portrait",
 unit: "mm",
 format: "a4"
 });

 const pdfWidth = pdf.internal.pageSize.getWidth();
 const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

 pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
 pdf.save(`فاتورة -${order.orderNumber}.pdf`);
 } finally {
 document.body.removeChild(receiptContent);
 }
 };

 const printReceipt = () => {
 window.print();
 };

 const getPaymentMethodName = (method: string) => {
 const methods: Record<string, string> = {
 'cash': 'نقداً',
 'pos': 'جهاز نقاط البيع',
 'delivery': 'الدفع عند التوصيل',
 'stc': 'STC Pay',
 'alinma': 'الإنماء باي',
 'ur': 'يور باي',
 'barq': 'برق',
 'rajhi': 'الراجحي',
 'qahwa-card': 'بطاقة قهوة '
 };
 return methods[method] || method;
 };

 if (variant === "auto") {
 return null;
 }

 return (
 <div className="flex gap-2 w-full">
 <Button
 onClick={printReceipt}
 variant="default"
 className="flex-1 bg-primary hover:bg-primary/90"
 data-testid="button-print-invoice"
 >
 <Printer className="ml-2 h-4 w-4" />
 طباعة الفاتورة 
 </Button>
 <Button
 onClick={generatePDF}
 variant="outline"
 className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
 data-testid="button-download-invoice"
 >
 <Download className="ml-2 h-4 w-4" />
 تحميل PDF
 </Button>
 </div>
 );
}
