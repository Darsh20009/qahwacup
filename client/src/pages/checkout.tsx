import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PaymentMethods from "@/components/payment-methods";
import { generatePDF } from "@/lib/pdf-generator";
import { CreditCard, FileText, MessageCircle } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";

export default function CheckoutPage() {
  const { cartItems, clearCart, getTotalPrice } = useCartStore();
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

      // Clear cart
      clearCart();
      
      toast({
        title: "تم إنشاء الطلب بنجاح!",
        description: "تم تحميل الفاتورة. سيتم التواصل معك قريباً.",
      });

      setShowConfirmation(false);
      setOrderDetails(null);
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="page-checkout-empty">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">السلة فارغة</p>
            <Button variant="outline">العودة للمنيو</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8" data-testid="page-checkout">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold text-foreground" data-testid="text-checkout-title">
              <CreditCard className="w-6 h-6 ml-2" />
              الدفع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-background rounded-xl p-4 border" data-testid="section-order-summary">
              <h3 className="text-lg font-semibold text-foreground mb-3">ملخص الطلب</h3>
              <div className="space-y-2 mb-3">
                {cartItems.map((item) => (
                  <div key={item.coffeeItemId} className="flex justify-between text-sm">
                    <span data-testid={`text-summary-item-${item.coffeeItemId}`}>
                      {item.coffeeItem?.nameAr} × {item.quantity}
                    </span>
                    <span data-testid={`text-summary-price-${item.coffeeItemId}`}>
                      {(parseFloat(item.coffeeItem?.price || "0") * item.quantity).toFixed(2)} ريال
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">المجموع:</span>
                  <span className="text-xl font-bold text-primary" data-testid="text-summary-total">
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
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/30" data-testid="section-payment-confirmation">
                <h4 className="font-semibold text-foreground mb-2">تأكيد الدفع</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  هل قمت بإرسال المبلغ باستخدام الطريقة المحددة؟
                </p>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => handlePaymentConfirmed(orderDetails)}
                    className="bg-primary text-accent-foreground flex-1"
                    data-testid="button-confirm-payment"
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    نعم، تم الدفع
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1"
                    data-testid="button-cancel-payment"
                  >
                    لا، لم أدفع بعد
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleShareWhatsApp}
                  className="w-full mt-3"
                  data-testid="button-share-whatsapp"
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
              data-testid="button-proceed-payment"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
