import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PaymentMethods from "@/components/payment-methods";
import { generatePDF } from "@/lib/pdf-generator";
import { CreditCard, FileText, MessageCircle, CheckCircle, Coffee, Clock, Star, User } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";

export default function CheckoutPage() {
  const { cartItems, clearCart, getTotalPrice } = useCartStore();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [transferOwnerName, setTransferOwnerName] = useState("");
  const [isSameAsCustomer, setIsSameAsCustomer] = useState(true);

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

    if (!customerName.trim()) {
      toast({
        variant: "destructive",
        title: "يرجى إدخال اسم العميل",
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
      customerInfo: {
        customerName: customerName.trim(),
        transferOwnerName: isSameAsCustomer ? customerName.trim() : transferOwnerName.trim(),
      },
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
      const totalAmount = parseFloat(orderDetails.totalAmount).toFixed(2);
      
      // Use orderDetails.items if available (after cart cleared), otherwise use cartItems
      const itemsSource = orderDetails.items && orderDetails.items.length > 0 ? orderDetails.items : cartItems;
      const itemsWithPrices = itemsSource.map((item: any) => {
        if (orderDetails.items && orderDetails.items.length > 0) {
          // Using orderDetails.items format
          const itemTotal = (parseFloat(item.price || "0") * item.quantity).toFixed(2);
          return `• ${item.name} × ${item.quantity} = ${itemTotal} ريال`;
        } else {
          // Using cartItems format
          const itemPrice = parseFloat(item.coffeeItem?.price || "0");
          const itemTotal = (itemPrice * item.quantity).toFixed(2);
          return `• ${item.coffeeItem?.nameAr} × ${item.quantity} = ${itemTotal} ريال`;
        }
      }).join('\n');
      
      const customerName = orderDetails.customerInfo?.customerName || 'غير محدد';
      const transferName = orderDetails.customerInfo?.transferOwnerName || 'غير محدد';
      
      const message = `🔔 طلب جديد للتجهيز - قهوة كوب ☕

📋 تفاصيل الطلب:
رقم الطلب: ${orderDetails.orderNumber}
اسم العميل: ${customerName}
اسم صاحب التحويل: ${transferName}
طريقة الدفع: ${getPaymentMethodName(selectedPaymentMethod!)}

☕ المنتجات المطلوبة:
${itemsWithPrices}

💰 إجمالي المبلغ: ${totalAmount} ريال

يرجى تجهيز الطلب وإشعار العميل عند الانتهاء.
شكراً لكم 🙏`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/966532441566?text=${encodedMessage}`, '_blank');
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
              
              {/* Personal Welcome for Customer */}
              {orderDetails?.customerInfo?.customerName && (
                <div className="mb-6 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-2xl p-6 border-2 border-primary/20 shadow-lg animate-in fade-in-20 slide-in-from-top-4 duration-1500">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center ml-3">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-amiri text-lg text-muted-foreground mb-1">أهلاً وسهلاً</p>
                      <h2 className="font-amiri text-3xl font-bold text-primary">
                        {orderDetails.customerInfo.customerName} 
                      </h2>
                      <p className="text-sm text-primary/70 mt-1">☕ لكل لحظة قهوة ، لحظة نجاح</p>
                    </div>
                  </div>
                  <div className="text-center text-muted-foreground text-sm bg-primary/5 rounded-lg p-3">
                    🌟 شكراً لثقتك في قهوة كوب - طلبك الآن في قائمة التحضير
                  </div>
                </div>
              )}
              
              <div className="space-y-6 mb-8">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                  <p className="text-2xl text-foreground font-medium mb-2">
                    رقم الطلب: <span className="font-bold text-primary">{orderDetails?.orderNumber}</span>
                  </p>
                  <p className="text-lg text-muted-foreground">
                    المبلغ المدفوع: <span className="font-semibold text-primary">{parseFloat(orderDetails.totalAmount).toFixed(2)} ريال</span>
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
                  مشاركة لتجهيز الطلب
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
            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="w-8 h-1 bg-primary/50 rounded-full animate-pulse"></div>
              <Coffee className="w-6 h-6 text-primary animate-bounce" />
              <div className="w-8 h-1 bg-primary/50 rounded-full animate-pulse"></div>
            </div>
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
                  
                  <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-amiri text-xl font-bold flex items-center">
                          <Coffee className="w-6 h-6 ml-2 animate-pulse" />
                          المجموع الكلي:
                        </span>
                        <div className="text-center">
                          <span className="text-3xl font-bold block" data-testid="text-summary-total">
                            {getTotalPrice().toFixed(2)} ريال
                          </span>
                          <span className="text-sm opacity-90">شامل جميع العناصر ☕</span>
                        </div>
                      </div>
                      <div className="mt-3 text-center text-sm opacity-90 bg-white/20 rounded-lg p-2">
                        ✨ لكل لحظة قهوة ، لحظة نجاح
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 bg-white/40 rounded-full animate-ping"></div>
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

                  {/* Customer Information - Creative Popup Style */}
                  <div className="space-y-6" data-testid="section-customer-info">
                    <div className="relative group">
                      {/* Glow effect background */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                      
                      {/* Main popup container */}
                      <div className="relative bg-gradient-to-br from-white/95 via-blue-50/80 to-slate-50/90 backdrop-blur-sm rounded-2xl p-8 border-2 border-primary/20 shadow-2xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-3xl">
                        {/* Header with floating animation */}
                        <div className="flex items-center justify-center mb-8">
                          <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-blue-500 rounded-full opacity-20 blur animate-pulse"></div>
                            <div className="relative bg-gradient-to-r from-primary to-blue-500 rounded-full p-4 text-white shadow-lg">
                              <User className="w-8 h-8" />
                            </div>
                          </div>
                        </div>
                        
                        <h4 className="font-amiri text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                          معلومات العميل
                        </h4>
                        <p className="text-center text-slate-600 mb-8 text-sm">
                          ✨ أدخل بياناتك للمتابعة مع تجربة قهوة رائعة
                        </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer-name" className="text-sm font-semibold text-slate-600">
                            اسم العميل (مطلوب) *
                          </Label>
                          <Input
                            id="customer-name"
                            type="text"
                            placeholder="أدخل اسم العميل"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="text-right"
                            data-testid="input-customer-name"
                            required
                          />
                        </div>
                        
                        {/* Transfer name section - always visible */}
                        <div className="space-y-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            <CreditCard className="w-4 h-4 ml-1" />
                            معلومات صاحب التحويل (إجباري)
                          </Label>
                          
                          {/* Checkbox for same as customer */}
                          <div className="flex items-center space-x-3 space-x-reverse bg-primary/5 rounded-lg p-3 border border-primary/20">
                            <Checkbox
                              id="same-as-customer"
                              checked={isSameAsCustomer}
                              onCheckedChange={(checked) => setIsSameAsCustomer(!!checked)}
                              data-testid="checkbox-same-as-customer"
                              className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label htmlFor="same-as-customer" className="text-sm font-medium text-slate-700 cursor-pointer flex items-center">
                              <User className="w-4 h-4 ml-2 text-primary" />
                              اسم صاحب التحويل هو نفس اسم العميل ✓
                            </Label>
                          </div>
                          
                          {/* Transfer name input - only show when not same as customer */}
                          {!isSameAsCustomer && (
                            <div className="space-y-2">
                              <Label htmlFor="transfer-name" className="text-sm font-medium text-slate-700">
                                اسم صاحب التحويل *
                              </Label>
                              <Input
                                id="transfer-name"
                                type="text"
                                placeholder="أدخل اسم صاحب التحويل"
                                value={transferOwnerName}
                                onChange={(e) => setTransferOwnerName(e.target.value)}
                                className="text-right focus:border-primary focus:ring-primary"
                                data-testid="input-transfer-name"
                                required
                              />
                              <p className="text-xs text-slate-600 bg-blue-50 p-2 rounded">
                                💳 يرجى إدخال اسم الشخص الذي سيقوم بالتحويل
                              </p>
                            </div>
                          )}
                          
                          {/* Info message based on selection */}
                          {isSameAsCustomer ? (
                            <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg flex items-center">
                              ✅ سيتم استخدام اسم العميل كاسم صاحب التحويل
                            </p>
                          ) : (
                            <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg flex items-center">
                              📝 يرجى كتابة اسم صاحب التحويل بوضوح
                            </p>
                          )}
                        </div>
                      </div>
                      
                        {selectedPaymentMethod === 'cash' && (
                          <p className="text-xs text-emerald-600 mt-3 bg-emerald-50 p-2 rounded-lg">
                            💰 الدفع النقدي - لا يتطلب تفاصيل تحويل إضافية
                          </p>
                        )}
                        {selectedPaymentMethod && selectedPaymentMethod !== 'cash' && (
                          <p className="text-xs text-blue-600 mt-3 bg-blue-50 p-2 rounded-lg">
                            💳 للدفع الإلكتروني - يرجى إدخال اسم صاحب التحويل أو ✓ للتأكيد
                          </p>
                        )}
                        
                        {/* Decorative elements */}
                        <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-60 animate-bounce"></div>
                        <div className="absolute bottom-4 left-4 w-2 h-2 bg-gradient-to-r from-primary to-blue-500 rounded-full opacity-40 animate-ping"></div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <PaymentMethods
                    paymentMethods={paymentMethods}
                    selectedMethod={selectedPaymentMethod}
                    onSelectMethod={setSelectedPaymentMethod}
                  />

                  {/* Payment Confirmation - Creative Popup Style */}
                  {showConfirmation && (
                    <div className="relative group animate-in fade-in-0 slide-in-from-bottom-10 duration-700" data-testid="section-payment-confirmation">
                      {/* Animated glow background */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-green-400/30 via-primary/30 to-emerald-500/30 rounded-3xl blur-xl opacity-40 animate-pulse"></div>
                      
                      {/* Main confirmation popup */}
                      <div className="relative bg-gradient-to-br from-white/95 via-green-50/90 to-emerald-50/85 backdrop-blur-sm rounded-3xl p-8 border-2 border-emerald-300/50 shadow-2xl transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
                        {/* Header with animated checkmark */}
                        <div className="flex items-center justify-center mb-6">
                          <div className="relative">
                            <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full opacity-20 blur animate-pulse"></div>
                            <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 rounded-full p-4 text-white shadow-xl animate-bounce">
                              <CheckCircle className="w-10 h-10" />
                            </div>
                            {/* Sparkle effects */}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
                            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-emerald-300 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        
                        <h4 className="font-amiri text-3xl font-bold text-center mb-3 bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                          تأكيد الدفع ✨
                        </h4>
                        
                        <div className="text-center mb-8 space-y-3">
                          <p className="text-slate-700 text-lg leading-relaxed">
                            هل قمت بإرسال المبلغ المطلوب؟
                          </p>
                          <div className="bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-2xl p-4 border border-primary/30">
                            <div className="text-3xl font-bold font-amiri bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                              {getTotalPrice().toFixed(2)} ريال
                            </div>
                            <p className="text-sm text-slate-600 mt-1">💳 باستخدام الطريقة المحددة</p>
                          </div>
                        </div>
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
                        مشاركة لتجهيز الطلب
                      </Button>
                      
                      {/* Decorative floating elements */}
                      <div className="absolute top-6 right-6 w-4 h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full opacity-50 animate-pulse"></div>
                      <div className="absolute bottom-8 left-8 w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full opacity-40 animate-bounce"></div>
                    </div>
                  </div>
                  )}

                  {/* Creative Proceed Button */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <Button
                      onClick={handleProceedPayment}
                      disabled={!selectedPaymentMethod || createOrderMutation.isPending}
                      size="lg"
                      className="relative w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground py-6 text-xl font-bold transition-all duration-500 shadow-xl hover:shadow-2xl rounded-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                      data-testid="button-proceed-payment"
                    >
                      {/* Animated background sparkle effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                      
                      {createOrderMutation.isPending ? (
                        <div className="flex items-center justify-center relative z-10">
                          <div className="flex space-x-1 space-x-reverse">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="mr-3 font-amiri">جاري معالجة طلبك بعناية...</span>
                          <Coffee className="w-6 h-6 animate-pulse ml-2" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center relative z-10">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ml-3 group-hover:scale-110 transition-transform duration-300">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-amiri text-xl">تأكيد طلب القهوة</div>
                            <div className="text-sm opacity-90">{getTotalPrice().toFixed(2)} ريال ☕</div>
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
