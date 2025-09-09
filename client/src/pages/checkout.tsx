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
        description: "تم تحميل الفاتورة. تقدر تستلم طلبك الآن.",
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
    <div className="min-h-screen bg-background" data-testid="page-checkout">
      {/* Elegant Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-secondary/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-accent/8 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-amiri text-4xl font-bold text-foreground mb-2">إتمام الطلب</h1>
            <p className="text-muted-foreground text-lg">اختر طريقة الدفع المناسبة لك</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary Card */}
            <div className="lg:col-span-1">
              <Card className="card-hover bg-card border border-card-border shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
                  <CardTitle className="font-amiri text-xl font-bold text-foreground">ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="p-6" data-testid="section-order-summary">
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.coffeeItemId} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm" data-testid={`text-summary-item-${item.coffeeItemId}`}>
                            {item.coffeeItem?.nameAr}
                          </p>
                          <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-primary" data-testid={`text-summary-price-${item.coffeeItemId}`}>
                          {(parseFloat(item.coffeeItem?.price || "0") * item.quantity).toFixed(2)} ريال
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="font-amiri text-lg font-bold text-foreground">المجموع الكلي:</span>
                      <span className="text-2xl font-bold text-primary" data-testid="text-summary-total">
                        {getTotalPrice().toFixed(2)} ريال
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Section */}
            <div className="lg:col-span-2">
              <Card className="card-hover bg-card border border-card-border shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
                  <CardTitle className="flex items-center font-amiri text-xl font-bold text-foreground" data-testid="text-checkout-title">
                    <CreditCard className="w-6 h-6 ml-3" />
                    طرق الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">

                  {/* Payment Methods */}
                  <PaymentMethods
                    paymentMethods={paymentMethods}
                    selectedMethod={selectedPaymentMethod}
                    onSelectMethod={setSelectedPaymentMethod}
                  />

                  {/* Payment Confirmation */}
                  {showConfirmation && (
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/30 shadow-lg" data-testid="section-payment-confirmation">
                      <h4 className="font-amiri text-lg font-bold text-foreground mb-3">تأكيد الدفع</h4>
                      <p className="text-muted-foreground mb-6">
                        هل قمت بإرسال المبلغ <span className="font-bold text-primary">{getTotalPrice().toFixed(2)} ريال</span> باستخدام الطريقة المحددة؟
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <Button 
                          onClick={() => handlePaymentConfirmed(orderDetails)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                          data-testid="button-confirm-payment"
                        >
                          <FileText className="w-4 h-4 ml-2" />
                          نعم، تم الدفع
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowConfirmation(false)}
                          className="border-border hover:bg-muted font-semibold py-3"
                          data-testid="button-cancel-payment"
                        >
                          لا، لم أدفع بعد
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleShareWhatsApp}
                        className="w-full border-primary/50 text-primary hover:bg-primary/10 font-semibold py-3"
                        data-testid="button-share-whatsapp"
                      >
                        <MessageCircle className="w-4 h-4 ml-2" />
                        مشاركة تفاصيل الطلب عبر واتساب
                      </Button>
                    </div>
                  )}

                  {/* Proceed Button */}
                  <Button
                    onClick={handleProceedPayment}
                    disabled={!selectedPaymentMethod || createOrderMutation.isPending}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="button-proceed-payment"
                  >
                    {createOrderMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground ml-2"></div>
                        جاري المعالجة...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 ml-2" />
                        متابعة الدفع ({getTotalPrice().toFixed(2)} ريال)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
