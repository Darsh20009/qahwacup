import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PaymentMethods from "./payment-methods";
import { generatePDF } from "@/lib/pdf-generator";
import { CreditCard, FileText, MessageCircle } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";

export default function CheckoutModal() {
  const { 
    cartItems, 
    isCheckoutOpen, 
    hideCheckout, 
    clearCart, 
    getTotalPrice 
  } = useCartStore();
  
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const { data: paymentMethods = [] } = useQuery<PaymentMethodInfo[]>({
    queryKey: ["/api/payment-methods"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      setOrderDetails(order);
      if (selectedPaymentMethod === 'cash') {
        handlePaymentConfirmed(order);
      } else {
        setShowConfirmation(true);
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الطلب",
        description: error.message,
      });
    },
  });

  const handleProceedPayment = () => {
    if (!selectedPaymentMethod) {
      toast({
        variant: "destructive",
        title: "يرجى اختيار طريقة الدفع",
      });
      return;
    }

    const orderData = {
      items: cartItems.map(item => ({
        coffeeItemId: item.coffeeItemId,
        quantity: item.quantity,
        price: item.coffeeItem?.price || "0",
        name: item.coffeeItem?.nameAr || "",
      })),
      totalAmount: getTotalPrice().toString(),
      paymentMethod: selectedPaymentMethod,
      paymentDetails: getPaymentMethodDetails(selectedPaymentMethod),
      status: "pending",
    };

    createOrderMutation.mutate(orderData);
  };

  const handlePaymentConfirmed = async (order: any) => {
    try {
      // Generate PDF invoice
      const pdfBlob = await generatePDF(order, cartItems, selectedPaymentMethod!);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Clear cart and close modals
      clearCart();
      hideCheckout();
      setShowConfirmation(false);
      setOrderDetails(null);
      setSelectedPaymentMethod(null);
      
      toast({
        title: "تم إنشاء الطلب بنجاح!",
        description: "تم تحميل الفاتورة. سيتم التواصل معك قريباً.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في توليد الفاتورة",
        description: "حدث خطأ أثناء إنشاء الفاتورة",
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (orderDetails) {
      const message = `طلب جديد من قهوة كوب\n\nرقم الطلب: ${orderDetails.orderNumber}\nالمجموع: ${getTotalPrice().toFixed(2)} ريال\nطريقة الدفع: ${getPaymentMethodName(selectedPaymentMethod!)}\n\nتفاصيل الطلب:\n${cartItems.map(item => `${item.coffeeItem?.nameAr} × ${item.quantity}`).join('\n')}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
  };

  const getPaymentMethodName = (method: PaymentMethod) => {
    const methodInfo = paymentMethods.find(m => m.id === method);
    return methodInfo?.nameAr || method;
  };

  const getPaymentMethodDetails = (method: PaymentMethod) => {
    const methodInfo = paymentMethods.find(m => m.id === method);
    return methodInfo?.details || '';
  };

  const handleClose = () => {
    hideCheckout();
    setShowConfirmation(false);
    setOrderDetails(null);
    setSelectedPaymentMethod(null);
  };

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={handleClose} data-testid="modal-checkout">
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold text-foreground" data-testid="text-checkout-modal-title">
            <CreditCard className="w-6 h-6 ml-2" />
            الدفع
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-background rounded-xl p-4 border" data-testid="section-checkout-summary">
            <h3 className="text-lg font-semibold text-foreground mb-3">ملخص الطلب</h3>
            <div className="space-y-2 mb-3">
              {cartItems.map((item) => (
                <div key={item.coffeeItemId} className="flex justify-between text-sm">
                  <span data-testid={`text-checkout-item-${item.coffeeItemId}`}>
                    {item.coffeeItem?.nameAr} × {item.quantity}
                  </span>
                  <span data-testid={`text-checkout-price-${item.coffeeItemId}`}>
                    {(parseFloat(item.coffeeItem?.price || "0") * item.quantity).toFixed(2)} ريال
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">المجموع:</span>
                <span className="text-xl font-bold text-primary" data-testid="text-checkout-total">
                  {getTotalPrice().toFixed(2)} ريال
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <PaymentMethods
            paymentMethods={paymentMethods}
            selectedMethod={selectedPaymentMethod}
            onSelectMethod={setSelectedPaymentMethod}
          />

          {/* Payment Confirmation */}
          {showConfirmation && (
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/30" data-testid="section-checkout-confirmation">
              <h4 className="font-semibold text-foreground mb-2">تأكيد الدفع</h4>
              <p className="text-sm text-muted-foreground mb-4">
                هل قمت بإرسال المبلغ باستخدام الطريقة المحددة؟
              </p>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => handlePaymentConfirmed(orderDetails)}
                  className="bg-primary text-accent-foreground flex-1"
                  data-testid="button-checkout-confirm"
                >
                  <FileText className="w-4 h-4 ml-2" />
                  نعم، تم الدفع
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                  data-testid="button-checkout-cancel"
                >
                  لا، لم أدفع بعد
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="w-full mt-3"
                data-testid="button-checkout-whatsapp"
              >
                <MessageCircle className="w-4 h-4 ml-2" />
                مشاركة عبر واتساب
              </Button>
            </div>
          )}

          {/* Proceed Button */}
          <Button
            onClick={handleProceedPayment}
            disabled={!selectedPaymentMethod || createOrderMutation.isPending}
            size="lg"
            className="w-full btn-primary text-accent-foreground py-3 text-lg font-semibold"
            data-testid="button-checkout-proceed"
          >
            {createOrderMutation.isPending ? (
              "جاري المعالجة..."
            ) : (
              <>
                <CreditCard className="w-5 h-5 ml-2" />
                متابعة الدفع
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
