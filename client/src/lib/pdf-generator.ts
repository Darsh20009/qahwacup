import type { Order } from "@shared/schema";
import type { PaymentMethod } from "@shared/schema";
import QRCode from "qrcode";

interface CartItem {
  coffeeItemId: string;
  quantity: number;
  coffeeItem?: {
    nameAr: string;
    nameEn: string | null;
    price: string;
  };
}

// Simple PDF generation using browser APIs and HTML canvas
export const generatePDF = async (
  order: Order,
  cartItems: CartItem[],
  paymentMethod: PaymentMethod
): Promise<Blob> => {
  // Generate QR code for order number
  const qrCodeDataURL = await QRCode.toDataURL(order.orderNumber, {
    width: 120,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  // Create a temporary div for PDF content
  const content = document.createElement('div');
  content.style.cssText = `
    width: 600px;
    padding: 40px;
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    background: white;
    color: #000;
    font-size: 14px;
    line-height: 1.6;
  `;

  // Get payment method details
  const paymentMethodNames: Record<PaymentMethod, string> = {
    cash: 'الدفع نقداً',
    stc: 'STC Pay',
    alinma: 'Alinma Pay',
    ur: 'Ur Pay',
    barq: 'Barq',
    rajhi: 'بنك الراجحي'
  };

  const paymentDetails: Record<PaymentMethod, string> = {
    cash: 'الدفع عند الاستلام',
    stc: '0532441566',
    alinma: '0532441566',
    ur: '0532441566',
    barq: '0532441566',
    rajhi: 'SA78 8000 0539 6080 1942 4738'
  };

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #D4AF37; padding-bottom: 20px;">
      <div style="flex: 1; text-align: center;">
        <h1 style="font-family: 'Amiri', serif; font-size: 36px; color: #D4AF37; margin: 0; font-weight: bold;">
          قهوة كوب
        </h1>
        <p style="color: #8B6F47; font-size: 16px; margin: 10px 0 5px 0;">تجربة قهوة استثنائية</p>
        <p style="color: #666; font-size: 14px; margin: 5px 0 0 0; font-style: italic;">
          "لحظة قهوة، لحظة نجاح"
        </p>
      </div>
      <div style="text-align: center; padding: 0 20px;">
        <img src="${qrCodeDataURL}" alt="QR Code" style="width: 100px; height: 100px; border: 2px solid #D4AF37; border-radius: 8px;" />
        <p style="margin: 8px 0 0 0; color: #666; font-size: 10px; font-weight: bold;">
          مسح الرمز للتحقق
        </p>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="color: #D4AF37; font-size: 24px; margin-bottom: 15px; font-weight: bold;">فاتورة</h2>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-weight: bold;">رقم الطلب:</span>
        <span>${order.orderNumber}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-weight: bold;">التاريخ:</span>
        <span>${new Date(order.createdAt).toLocaleDateString('ar-SA')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-weight: bold;">الوقت:</span>
        <span>${new Date(order.createdAt).toLocaleTimeString('ar-SA')}</span>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #D4AF37; font-size: 20px; margin-bottom: 15px; font-weight: bold;">تفاصيل الطلب</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">المنتج</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">الكمية</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">السعر</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">المجموع</th>
          </tr>
        </thead>
        <tbody>
          ${cartItems.map(item => `
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;">${item.coffeeItem?.nameAr || 'غير محدد'}</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${item.coffeeItem?.price || '0'} ريال</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${(parseFloat(item.coffeeItem?.price || '0') * item.quantity).toFixed(2)} ريال</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 18px;">
        <span style="font-weight: bold;">إجمالي المبلغ:</span>
        <span style="font-weight: bold; color: #D4AF37; font-size: 20px;">${order.totalAmount} ريال</span>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #D4AF37; font-size: 20px; margin-bottom: 15px; font-weight: bold;">طريقة الدفع</h3>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-weight: bold;">الطريقة:</span>
        <span>${paymentMethodNames[paymentMethod]}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-weight: bold;">التفاصيل:</span>
        <span>${paymentDetails[paymentMethod]}</span>
      </div>
    </div>

    <!-- Company Information -->
    <div style="margin-bottom: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #D4AF37;">
      <h3 style="color: #D4AF37; font-size: 18px; margin-bottom: 15px; font-weight: bold;">معلومات الشركة</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 12px;">
        <div>
          <p style="margin: 0 0 5px 0;"><span style="font-weight: bold;">الاسم:</span> شركة قهوة كوب المحدودة</p>
          <p style="margin: 0 0 5px 0;"><span style="font-weight: bold;">رقم السجل التجاري:</span> 1010234567</p>
          <p style="margin: 0 0 5px 0;"><span style="font-weight: bold;">الرقم الضريبي:</span> 300234567890003</p>
        </div>
        <div>
          <p style="margin: 0 0 5px 0;"><span style="font-weight: bold;">الهاتف:</span> 0532441566</p>
          <p style="margin: 0 0 5px 0;"><span style="font-weight: bold;">البريد الإلكتروني:</span> info@qahwacup.com</p>
          <p style="margin: 0 0 5px 0;"><span style="font-weight: bold;">الموقع:</span> www.qahwacup.com</p>
        </div>
      </div>
    </div>

    <!-- QR Code Information -->
    <div style="margin-bottom: 20px; padding: 15px; background-color: #fff8dc; border-radius: 8px; border: 1px solid #D4AF37;">
      <p style="margin: 0; font-size: 12px; text-align: center; color: #666;">
        <span style="font-weight: bold;">رمز الاستجابة السريع:</span> يحتوي على رقم الطلبية ${order.orderNumber}
      </p>
      <p style="margin: 5px 0 0 0; font-size: 11px; text-align: center; color: #666;">
        يمكن استخدام هذا الرمز للتحقق من صحة الفاتورة والاستعلام عن حالة الطلب
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 3px solid #D4AF37; color: #8B6F47;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #D4AF37;">شكراً لاختياركم قهوة كوب</p>
      <p style="margin: 5px 0; font-size: 14px;">"لحظة قهوة، لحظة نجاح"</p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
        تم إنشاء هذه الفاتورة إلكترونياً في ${new Date().toLocaleDateString('ar-SA')} الساعة ${new Date().toLocaleTimeString('ar-SA')}
      </p>
    </div>
  `;

  // Add content to document temporarily
  content.style.position = 'absolute';
  content.style.left = '-9999px';
  document.body.appendChild(content);

  try {
    // Use html2canvas if available, otherwise create a simple text-based PDF
    if (window.html2canvas) {
      const canvas = await window.html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Convert canvas to PDF using jsPDF
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output('blob');
    } else {
      // Fallback: Create a simple text-based PDF
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add Arabic font support if available
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      
      let yPosition = 20;
      const lineHeight = 7;
      
      // Header
      pdf.text('Qahwat Kob - Coffee Invoice', 105, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;
      
      // Order details
      pdf.setFontSize(12);
      pdf.text(`Order Number: ${order.orderNumber}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Time: ${new Date(order.createdAt).toLocaleTimeString()}`, 20, yPosition);
      yPosition += lineHeight * 2;
      
      // Items
      pdf.text('Order Items:', 20, yPosition);
      yPosition += lineHeight;
      
      cartItems.forEach(item => {
        const itemText = `${item.coffeeItem?.nameEn || item.coffeeItem?.nameAr || 'Item'} x${item.quantity} - ${(parseFloat(item.coffeeItem?.price || '0') * item.quantity).toFixed(2)} SAR`;
        pdf.text(itemText, 25, yPosition);
        yPosition += lineHeight;
      });
      
      yPosition += lineHeight;
      pdf.setFontSize(14);
      pdf.text(`Total: ${order.totalAmount} SAR`, 20, yPosition);
      yPosition += lineHeight * 2;
      
      // Payment method
      pdf.setFontSize(12);
      pdf.text(`Payment Method: ${paymentMethodNames[paymentMethod]}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Details: ${paymentDetails[paymentMethod]}`, 20, yPosition);
      
      return pdf.output('blob');
    }
  } finally {
    // Clean up
    document.body.removeChild(content);
  }
};

// Declare global types for external libraries
declare global {
  interface Window {
    html2canvas?: any;
    jsPDF?: any;
  }
}

// Dynamically load required libraries
export const loadPDFLibraries = async (): Promise<void> => {
  // Load jsPDF
  if (!window.jsPDF) {
    await import('jspdf');
  }
  
  // Load html2canvas for better PDF generation
  if (!window.html2canvas) {
    try {
      const html2canvas = await import('html2canvas');
      window.html2canvas = html2canvas.default;
    } catch (error) {
      console.warn('html2canvas not available, using fallback PDF generation');
    }
  }
};

// Initialize libraries on module load
loadPDFLibraries().catch(console.error);
