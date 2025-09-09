import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PaymentMethods from "@/components/payment-methods";
import { generatePDF } from "@/lib/pdf-generator";
import { CreditCard, FileText, MessageCircle, CheckCircle, Coffee, Clock, Star } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";

export default function CheckoutPage() {
  const { cartItems, clearCart, getTotalPrice } = useCartStore();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showSuccessPage, setShowSuccessPage] = useState(false);

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
      
      // Show success page
      setShowSuccessPage(true);
      setShowConfirmation(false);
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

  // Success Page
  if (showSuccessPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 relative overflow-hidden">
        {/* Floating Coffee Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-secondary/25 rounded-full blur-lg animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-16 w-20 h-20 bg-accent/15 rounded-full blur-2xl animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-32 w-14 h-14 bg-primary/30 rounded-full blur-xl animate-bounce" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <Card className="max-w-2xl w-full bg-card/95 backdrop-blur-md border-2 border-primary/30 shadow-2xl">
            <CardContent className="p-12 text-center">
              {/* Success Icon */}
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto flex items-center justify-center mb-6">
                  <CheckCircle className="w-20 h-20 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full animate-ping"></div>
              </div>

              {/* Main Message */}
              <h1 className="font-amiri text-5xl font-bold text-primary mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
                تم إنشاء طلبك بنجاح!
              </h1>
              
              <div className="space-y-6 mb-8">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                  <p className="text-2xl text-foreground font-medium mb-2">
                    رقم الطلب: <span className="font-bold text-primary">{orderDetails?.orderNumber}</span>
                  </p>
                  <p className="text-lg text-muted-foreground">
                    المبلغ المدفوع: <span className="font-semibold text-primary">{getTotalPrice().toFixed(2)} ريال</span>
                  </p>
                </div>

                {/* Coffee Animation */}
                <div className="flex justify-center items-center space-x-4 py-6">
                  <Coffee className="w-12 h-12 text-primary animate-bounce" style={{animationDelay: '0s'}} />
                  <div className="w-4 h-4 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-br from-card/50 to-background/30 rounded-xl p-6 border border-border/50">
                  <div className="flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-primary ml-2" />
                    <h3 className="font-amiri text-xl font-bold text-foreground">خطوات الاستلام</h3>
                  </div>
                  <div className="space-y-3 text-right">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
                      <p className="text-muted-foreground flex-1">توجه إلى مقهى قهوة كوب</p>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">2</div>
                      <p className="text-muted-foreground flex-1">أظهر رقم الطلب للموظف</p>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
                      <p className="text-muted-foreground flex-1">استمتع بقهوتك الطازجة!</p>
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-6 border border-accent/20">
                  <h4 className="font-amiri text-lg font-bold text-foreground mb-3">شاركنا تقييمك</h4>
                  <div className="flex justify-center space-x-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-8 h-8 text-primary fill-primary cursor-pointer hover:scale-110 transition-transform" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">تقييمك يساعدنا على تحسين خدماتنا</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleShareWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
                >
                  <MessageCircle className="w-5 h-5 ml-2" />
                  مشاركة تفاصيل الطلب عبر واتساب
                </Button>
                
                <Button
                  onClick={() => {
                    setShowSuccessPage(false);
                    setOrderDetails(null);
                    window.location.href = '/menu';
                  }}
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary/10 py-4 text-lg font-semibold"
                >
                  <Coffee className="w-5 h-5 ml-2" />
                  طلب المزيد من القهوة
                </Button>
              </div>

              {/* Footer Message */}
              <div className="mt-8 pt-6 border-t border-border/30">
                <p className="text-muted-foreground text-sm">
                  شكراً لاختيارك قهوة كوب - لكل لحظة قهوة، لحظة نجاح ✨
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !showSuccessPage) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" data-testid="page-checkout">
      {/* Soft Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-indigo-200/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-slate-200/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Clean Header */}
          <div className="text-center mb-12">
            <h1 className="font-amiri text-4xl font-bold text-slate-700 mb-4">
              إتمام عملية الدفع
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              اختر طريقة الدفع المفضلة لديك واستمتع بتجربة قهوة لا تُنسى
            </p>
            <div className="mt-6 w-24 h-1 bg-slate-300 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Modern Order Summary Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader className="bg-slate-100 rounded-t-lg">
                  <CardTitle className="font-amiri text-xl font-bold flex items-center text-slate-700">
                    <Coffee className="w-5 h-5 ml-2" />
                    ملخص طلبك
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6" data-testid="section-order-summary">
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item, index) => (
                      <div 
                        key={item.coffeeItemId} 
                        className="flex justify-between items-center py-3 px-4 bg-violet-50 rounded-xl border border-violet-100 animate-in fade-in-0 slide-in-from-left-5 duration-500"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                            <Coffee className="w-6 h-6 text-violet-600" />
                          </div>
                          <div>
                            <p className="font-bold text-violet-800" data-testid={`text-summary-item-${item.coffeeItemId}`}>
                              {item.coffeeItem?.nameAr}
                            </p>
                            <p className="text-sm text-violet-600">الكمية: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-violet-700 text-lg" data-testid={`text-summary-price-${item.coffeeItemId}`}>
                          {(parseFloat(item.coffeeItem?.price || "0") * item.quantity).toFixed(2)} ريال
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-slate-600 text-white rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-amiri text-lg font-bold">المجموع الكلي:</span>
                      <span className="text-2xl font-bold" data-testid="text-summary-total">
                        {getTotalPrice().toFixed(2)} ريال
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Modern Payment Section */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader className="bg-slate-100 rounded-t-lg">
                  <CardTitle className="flex items-center font-amiri text-xl font-bold text-slate-700" data-testid="text-checkout-title">
                    <CreditCard className="w-5 h-5 ml-2" />
                    اختر طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

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

                  {/* Modern Proceed Button */}
                  <Button
                    onClick={handleProceedPayment}
                    disabled={!selectedPaymentMethod || createOrderMutation.isPending}
                    size="lg"
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white py-4 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
                    data-testid="button-proceed-payment"
                  >
                    {createOrderMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                        جاري معالجة طلبك...
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
