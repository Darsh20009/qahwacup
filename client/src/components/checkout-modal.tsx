import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PaymentMethods from "./payment-methods";
import { generatePDF } from "@/lib/pdf-generator";
import { CreditCard, FileText, MessageCircle, Check, ArrowRight, Coffee, ShoppingCart, Wallet, Star, Phone } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CheckoutStep = 'review' | 'payment' | 'confirmation' | 'success';

export default function CheckoutModal() {
  const {
    cartItems,
    isCheckoutOpen,
    hideCheckout,
    clearCart,
    getTotalPrice
  } = useCartStore();
  const { customer } = useCustomer();

  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // State for customer form fields, pre-filled if customer is logged in
  const [customerName, setCustomerName] = useState(customer?.name || "");
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || "");

  const { data: paymentMethods = [] } = useQuery<PaymentMethodInfo[]>({
    queryKey: ["/api/payment-methods"],
    enabled: isCheckoutOpen, // Only fetch when modal is open
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
        setCurrentStep('confirmation');
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

    // Use form data if customer is not logged in or if fields were manually changed
    const finalCustomerName = customer?.name ? customerName : customerName;
    const finalCustomerPhone = customer?.phone ? customerPhone : customerPhone;

    if (!finalCustomerName || !finalCustomerPhone) {
      toast({
        variant: "destructive",
        title: "يرجى إدخال الاسم ورقم الهاتف",
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
      // Use customer ID if available, otherwise null
      customerId: customer?.id || null,
      customerInfo: {
        name: finalCustomerName,
        phone: finalCustomerPhone,
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

      // Move to success step
      setCurrentStep('success');

      toast({
        title: "تم إنشاء الطلب بنجاح! 🎉",
        description: "تم تحميل الفاتورة. سيتم إرسالها لرقمك الجوال قريباً.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في توليد الفاتورة",
        description: "حدث خطأ أثناء إنشاء الفاتورة",
      });
    }
  };

  const handleSendInvoiceToPhone = () => {
    if (orderDetails) {
      const message = `🎉 طلب جديد من قهوة كوب\n\n📋 رقم الطلب: ${orderDetails.orderNumber}\n💰 المجموع: ${getTotalPrice().toFixed(2)} ريال\n💳 طريقة الدفع: ${getPaymentMethodName(selectedPaymentMethod!)}\n\n📝 تفاصيل الطلب:\n${cartItems.map(item => `☕ ${item.coffeeItem?.nameAr} × ${item.quantity}`).join('\n')}\n\n🌐 الموقع: qahwacup.ma3k.online\n\n"لكل لحظة قهوة ، لحظة نجاح" ✨`;
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

  const handleClose = () => {
    hideCheckout();
    setCurrentStep('review');
    setOrderDetails(null);
    setSelectedPaymentMethod(null);
    // Reset form fields on close if customer is not logged in
    if (!customer) {
      setCustomerName("");
      setCustomerPhone("");
    }
  };

  const handleSuccessComplete = () => {
    clearCart();
    handleClose();
  };

  const steps = [
    { id: 'review', title: 'مراجعة الطلب', icon: ShoppingCart },
    { id: 'payment', title: 'طريقة الدفع', icon: Wallet },
    { id: 'confirmation', title: 'تأكيد الدفع', icon: Check },
    { id: 'success', title: 'تم بنجاح', icon: Star },
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={handleClose} data-testid="modal-checkout">
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-card to-background border-primary/30" dir="rtl">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="flex items-center justify-center text-3xl font-bold text-primary font-amiri" data-testid="text-checkout-modal-title">
            <Coffee className="w-8 h-8 ml-3 animate-bounce" />
            إتمام الطلب
          </DialogTitle>
          <p className="text-muted-foreground mt-2">"لكل لحظة قهوة ، لحظة نجاح"</p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < getCurrentStepIndex();
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500
                    ${isActive ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50' : ''}
                    ${isCompleted ? 'bg-primary/20 border-primary text-primary' : ''}
                    ${!isActive && !isCompleted ? 'bg-muted border-muted-foreground/30 text-muted-foreground' : ''}
                  `}>
                    {isCompleted ? (
                      <Check className="w-6 h-6 animate-in fade-in zoom-in" />
                    ) : (
                      <StepIcon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                    )}

                    {isActive && (
                      <div className="absolute -inset-1 rounded-full bg-primary/20 animate-ping" />
                    )}
                  </div>

                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-1 mx-2 rounded-full transition-all duration-500
                      ${isCompleted ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-1">
              {steps.find(s => s.id === currentStep)?.title}
            </h3>
            <div className="text-sm text-muted-foreground">
              الخطوة {getCurrentStepIndex() + 1} من {steps.length}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step Content */}
          {currentStep === 'review' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500" data-testid="section-checkout-review">
              {/* Customer Info Form */}
              {!customer && ( // Only show form if customer is not logged in
                <Card>
                  <CardHeader>
                    <CardTitle className="text-right flex items-center gap-2">
                      <User className="w-5 h-5" />
                      معلومات العميل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="customer-name">الاسم</Label>
                      <Input
                        id="customer-name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="أدخل اسمك"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-phone">رقم الهاتف</Label>
                      <Input
                        id="customer-phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="05xxxxxxxx"
                        className="text-right"
                        dir="ltr"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="bg-card/50 rounded-xl p-6 border border-primary/20" data-testid="section-checkout-summary">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 ml-2" />
                  ملخص الطلب
                </h3>
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.coffeeItemId} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <span className="font-medium" data-testid={`text-checkout-item-${item.coffeeItemId}`}>
                          {item.coffeeItem?.nameAr}
                        </span>
                        <span className="text-muted-foreground mr-2">× {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-primary" data-testid={`text-checkout-price-${item.coffeeItemId}`}>
                        {(parseFloat(item.coffeeItem?.price || "0") * item.quantity).toFixed(2)} ريال
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-primary/30 pt-4">
                  <div className="flex justify-between items-center bg-primary/10 p-4 rounded-lg">
                    <span className="text-lg font-semibold">المجموع الكلي:</span>
                    <span className="text-2xl font-bold text-primary" data-testid="text-checkout-total">
                      {getTotalPrice().toFixed(2)} ريال
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep('payment')}
                size="lg"
                className="w-full btn-primary text-accent-foreground py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                متابعة للدفع
              </Button>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500">
              <div className="bg-card/50 rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Wallet className="w-5 h-5 ml-2" />
                  اختر طريقة الدفع
                </h3>

                <PaymentMethods
                  paymentMethods={paymentMethods}
                  selectedMethod={selectedPaymentMethod}
                  onSelectMethod={setSelectedPaymentMethod}
                />
              </div>

              <div className="flex space-x-3 space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('review')}
                  size="lg"
                  className="flex-1 py-3"
                >
                  رجوع
                </Button>
                <Button
                  onClick={handleProceedPayment}
                  disabled={!selectedPaymentMethod || createOrderMutation.isPending}
                  size="lg"
                  className="flex-1 btn-primary text-accent-foreground py-3 text-lg font-semibold"
                  data-testid="button-checkout-proceed"
                >
                  {createOrderMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin ml-2" />
                      جاري المعالجة...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 ml-2" />
                      تأكيد الطلب
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'confirmation' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500" data-testid="section-checkout-confirmation">
              <div className="text-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/30">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">تم إنشاء طلبك بنجاح!</h4>
                <p className="text-muted-foreground mb-2">رقم الطلب: <span className="font-semibold text-primary">{orderDetails?.orderNumber}</span></p>
                <p className="text-sm text-muted-foreground mb-6">
                  يرجى إرسال المبلغ باستخدام الطريقة المحددة وتأكيد الدفع
                </p>

                <div className="bg-background/50 p-4 rounded-lg border border-primary/20 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">طريقة الدفع:</span>
                    <span className="text-primary font-semibold">{getPaymentMethodName(selectedPaymentMethod!)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">التفاصيل:</span>
                    <span className="text-primary font-semibold">{getPaymentMethodDetails(selectedPaymentMethod!)}</span>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse">
                  <Button
                    onClick={() => handlePaymentConfirmed(orderDetails)}
                    className="flex-1 bg-primary text-accent-foreground hover:bg-primary/90 py-3"
                    data-testid="button-checkout-confirm"
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    نعم، تم الدفع
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSendInvoiceToPhone}
                    className="flex-1 py-3"
                    data-testid="button-checkout-send-invoice"
                  >
                    <Phone className="w-4 h-4 ml-2" />
                    إرسال للجوال
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={handleSendInvoiceToPhone}
                  className="w-full mt-3 border-green-500/50 text-green-600 hover:bg-green-500/10"
                  data-testid="button-checkout-whatsapp"
                >
                  <MessageCircle className="w-4 h-4 ml-2" />
                  إرسال عبر واتساب للرقم: +966532441566
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500">
              <div className="text-center p-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/40">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Star className="w-10 h-10 text-primary-foreground" />
                </div>
                <h4 className="text-2xl font-bold text-primary mb-3 font-amiri">تم بنجاح! 🎉</h4>
                <p className="text-muted-foreground mb-4">
                  شكراً لاختياركم قهوة كوب. تم تحميل الفاتورة وإرسالها.
                </p>
                <p className="text-sm text-primary font-semibold mb-6">
                  "لكل لحظة قهوة ، لحظة نجاح" ✨
                </p>
                <p className="text-xs text-muted-foreground mb-6">
                  سيتم التواصل معكم قريباً لتأكيد الطلب وتحديد موعد الاستلام
                </p>

                <Button
                  onClick={handleSuccessComplete}
                  size="lg"
                  className="w-full btn-primary text-accent-foreground py-4 text-lg font-semibold shadow-lg"
                >
                  <Coffee className="w-5 h-5 ml-2" />
                  العودة للقائمة
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}