import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Coffee, ShoppingBag, User, Phone, Trash2, Plus, Minus, ArrowRight, Check, Scan, Search, X, Gift, Printer, MonitorSmartphone } from "lucide-react";
import QRScanner from "@/components/qr-scanner";
import { ReceiptPrint } from "@/components/receipt-print";
import type { Employee, CoffeeItem, PaymentMethod, LoyaltyCard } from "@shared/schema";

interface OrderItem {
  coffeeItem: CoffeeItem;
  quantity: number;
}

interface WhatsAppMessageData {
  phone: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: string;
  paymentMethod: string;
}

function generateWhatsAppLink(data: WhatsAppMessageData): string {
  const message = `
مرحباً ${data.customerName} 👋

تم استلام طلبك بنجاح! ☕

📝 رقم الطلب: ${data.orderNumber}

🛍️ تفاصيل الطلب:
${data.items.map(item => `• ${item.coffeeItem.nameAr} × ${item.quantity} - ${(Number(item.coffeeItem.price) * item.quantity).toFixed(2)} ريال`).join('\n')}

💰 الإجمالي: ${data.total} ريال
💳 طريقة الدفع: ${data.paymentMethod}

🔄 حالة الطلب: تحت التنفيذ

سنبلغك عند اكتمال طلبك. شكراً لتعاملك معنا! 🌹

قهوة كوب ☕
`.trim();

  const phoneNumber = data.phone.replace(/[^0-9]/g, '');
  const internationalPhone = phoneNumber.startsWith('966') ? phoneNumber : `966${phoneNumber.replace(/^0/, '')}`;
  
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

export default function EmployeeCashier() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percentage: number, reason: string} | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

  // Check for existing customer when phone number is entered
  useEffect(() => {
    const checkCustomer = async () => {
      if (customerPhone.length === 9 && customerPhone.startsWith('5')) {
        setIsCheckingCustomer(true);
        try {
          const response = await fetch(`/api/customers/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: customerPhone })
          });
          
          if (response.ok) {
            const customer = await response.json();
            setCustomerName(customer.name);
            setCustomerId(customer.id);
            toast({
              title: "عميل مسجل ✓",
              description: `مرحباً ${customer.name}! سيتم إضافة أختام الولاء تلقائياً`,
              className: "bg-green-600 text-white",
            });
          } else {
            setCustomerId(null);
          }
        } catch (error) {
          console.error('Error checking customer:', error);
          setCustomerId(null);
        } finally {
          setIsCheckingCustomer(false);
        }
      }
    };

    const debounceTimer = setTimeout(checkCustomer, 500);
    return () => clearTimeout(debounceTimer);
  }, [customerPhone, toast]);

  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      
      return response.json();
    },
    onSuccess: async (order) => {
      const paymentMethodAr = paymentMethod === "cash" ? "نقدي" : 
                             paymentMethod === "stc" ? "STC Pay" :
                             paymentMethod === "alinma" ? "Alinma Pay" :
                             paymentMethod === "ur" ? "Ur Pay" :
                             paymentMethod === "barq" ? "Barq" : "تحويل بنكي";
      
      setLastOrder({
        orderNumber: order.orderNumber,
        customerName,
        customerPhone,
        items: orderItems,
        subtotal: calculateSubtotal().toFixed(2),
        discount: appliedDiscount ? {
          code: appliedDiscount.code,
          percentage: appliedDiscount.percentage,
          amount: calculateDiscount().toFixed(2)
        } : undefined,
        total: order.totalAmount,
        paymentMethod: paymentMethodAr,
        employeeName: employee?.fullName || "",
        tableNumber: tableNumber || undefined,
        date: new Date().toLocaleString('ar-SA')
      });
      
      const whatsappData: WhatsAppMessageData = {
        phone: customerPhone,
        orderNumber: order.orderNumber,
        customerName,
        items: orderItems,
        total: order.totalAmount,
        paymentMethod: paymentMethodAr
      };
      
      const whatsappLink = generateWhatsAppLink(whatsappData);
      window.open(whatsappLink, '_blank');
      
      toast({
        title: "✅ تم إنشاء الطلب بنجاح",
        description: `رقم الطلب: ${order.orderNumber}`,
        className: "bg-green-600 text-white",
      });
      
      // تحديث قائمة الطلبات في صفحة الطلبات
      await queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      resetForm();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل إنشاء الطلب. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setOrderItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerId(null);
    setTableNumber("");
    setPaymentMethod("cash");
    setDiscountCode("");
    setAppliedDiscount(null);
  };

  const addToOrder = (coffeeItem: CoffeeItem) => {
    const existingItem = orderItems.find(item => item.coffeeItem.id === coffeeItem.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.coffeeItem.id === coffeeItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { coffeeItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (coffeeItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(item => item.coffeeItem.id !== coffeeItemId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.coffeeItem.id === coffeeItemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromOrder = (coffeeItemId: string) => {
    setOrderItems(orderItems.filter(item => item.coffeeItem.id !== coffeeItemId));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      return sum + (Number(item.coffeeItem.price) * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    const subtotal = calculateSubtotal();
    return (subtotal * appliedDiscount.percentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount).toFixed(2);
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كود الخصم",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingDiscount(true);
    try {
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode })
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        toast({
          title: "خطأ",
          description: "فشل قراءة استجابة الخادم",
          variant: "destructive",
        });
        setIsValidatingDiscount(false);
        return;
      }

      if (!response.ok || !data.valid) {
        toast({
          title: "كود خصم غير صالح",
          description: data.error || "الكود المدخل غير صحيح أو منتهي الصلاحية",
          variant: "destructive",
        });
        setAppliedDiscount(null);
        setIsValidatingDiscount(false);
        return;
      }

      setAppliedDiscount({
        code: data.code,
        percentage: data.discountPercentage,
        reason: data.reason
      });

      toast({
        title: "تم تطبيق الخصم بنجاح",
        description: `${data.reason} - ${data.discountPercentage}%`,
        className: "bg-green-600 text-white",
      });
    } catch (error) {
      console.error('Error validating discount code:', error);
      toast({
        title: "خطأ",
        description: "فشل التحقق من كود الخصم",
        variant: "destructive",
      });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setDiscountCode("");
    setAppliedDiscount(null);
    toast({
      title: "تم إزالة الخصم",
      description: "تم إلغاء الخصم من الطلب",
    });
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة عناصر للطلب",
        variant: "destructive",
      });
      return;
    }

    if (!(customerName || '').trim() || !(customerPhone || '').trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال بيانات العميل",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      items: orderItems.map(item => ({
        coffeeItemId: item.coffeeItem.id,
        quantity: item.quantity,
        price: item.coffeeItem.price
      })),
      totalAmount: calculateTotal(),
      paymentMethod,
      customerInfo: {
        customerName: customerName,
        phoneNumber: customerPhone
      },
      customerId: customerId || undefined,
      employeeId: employee?.id,
      tableNumber: tableNumber || undefined,
      status: "in_progress"
    };

    createOrderMutation.mutate(orderData);
  };

  if (!employee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-500">نظام الكاشير</h1>
              <p className="text-gray-400 text-sm">الموظف: {employee.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-[#2d1f1a] border border-amber-500/20 rounded-lg px-4 py-2 hover-elevate">
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">جهاز POS:</span>
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  غير متصل
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">خيار "POS" متاح في طرق الدفع</p>
            </div>
            {lastOrder && (
              <Button
                onClick={handlePrintReceipt}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                data-testid="button-print-receipt"
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة الفاتورة 🖨️
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setLocation("/employee/dashboard")}
              className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
              data-testid="button-back-dashboard"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <Card className="bg-[#2d1f1a] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-500 text-right">القائمة</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center text-gray-400 py-8">جاري التحميل...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coffeeItems.map((item) => (
                      <Card key={item.id} className="bg-[#1a1410] border-amber-500/10 hover:border-amber-500/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-right flex-1">
                              <h3 className="text-amber-500 font-bold mb-1" data-testid={`text-item-name-${item.id}`}>
                                {item.nameAr}
                              </h3>
                              <p className="text-gray-400 text-sm line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                              {Number(item.price).toFixed(2)} ريال
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => addToOrder(item)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              data-testid={`button-add-${item.id}`}
                            >
                              <Plus className="w-4 h-4 ml-1" />
                              إضافة
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-[#2d1f1a] border-amber-500/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-amber-500 text-right flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  الطلب الحالي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    لا توجد عناصر في الطلب
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {orderItems.map((item) => (
                        <div key={item.coffeeItem.id} className="bg-[#1a1410] rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-right flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-amber-500 font-medium text-sm" data-testid={`text-order-item-${item.coffeeItem.id}`}>
                                  {item.coffeeItem.nameAr}
                                </h4>
                              </div>
                              <p className="text-gray-400 text-xs">
                                {Number(item.coffeeItem.price).toFixed(2)} ريال
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromOrder(item.coffeeItem.id)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              data-testid={`button-remove-${item.coffeeItem.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.coffeeItem.id, item.quantity - 1)}
                                className="h-7 w-7 p-0 border-amber-500/30"
                                data-testid={`button-decrease-${item.coffeeItem.id}`}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-white font-bold min-w-[30px] text-center" data-testid={`text-quantity-${item.coffeeItem.id}`}>
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.coffeeItem.id, item.quantity + 1)}
                                className="h-7 w-7 p-0 border-amber-500/30"
                                data-testid={`button-increase-${item.coffeeItem.id}`}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <span className="font-bold text-amber-500">
                              {(Number(item.coffeeItem.price) * item.quantity).toFixed(2)} ريال
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-amber-500/20" />

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-gray-300 text-right block">
                          <User className="w-4 h-4 inline ml-2" />
                          اسم العميل
                        </Label>
                        <Input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="أدخل اسم العميل"
                          className="bg-[#1a1410] border-amber-500/30 text-white text-right"
                          data-testid="input-customer-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 text-right block">
                          <Phone className="w-4 h-4 inline ml-2" />
                          رقم الجوال (9 أرقام تبدأ بـ 5)
                        </Label>
                        <Input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="5xxxxxxxx"
                          className="bg-[#1a1410] border-amber-500/30 text-white text-right"
                          data-testid="input-customer-phone"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 text-right block">
                          <Coffee className="w-4 h-4 inline ml-2" />
                          رقم الطاولة (اختياري)
                        </Label>
                        <Input
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="مثال: 5 أو A3"
                          className="bg-[#1a1410] border-amber-500/30 text-white text-right"
                          data-testid="input-table-number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 text-right block">
                          طريقة الدفع
                        </Label>
                        <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                          <SelectTrigger className="bg-[#1a1410] border-amber-500/30 text-white" data-testid="select-payment-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">💵 نقدي</SelectItem>
                            <SelectItem value="pos">💳 جهاز نقاط البيع (POS)</SelectItem>
                            <SelectItem value="stc">📱 STC Pay</SelectItem>
                            <SelectItem value="alinma">🏦 Alinma Pay</SelectItem>
                            <SelectItem value="ur">🔷 Ur Pay</SelectItem>
                            <SelectItem value="barq">⚡ Barq</SelectItem>
                            <SelectItem value="rajhi">🏛️ تحويل بنك الراجحي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-4 rounded-lg border border-green-500/20">
                        <Label className="text-gray-300 text-right block flex items-center justify-end gap-2">
                          <span className="text-green-400">💳 كود الخصم (اختياري)</span>
                          <Gift className="w-5 h-5 text-green-400" />
                        </Label>
                        <p className="text-xs text-gray-400 text-right mb-2">
                          هل لديك كود خصم؟ أدخله هنا للحصول على تخفيض فوري
                        </p>
                        {!appliedDiscount ? (
                          <div className="flex gap-2">
                            <Input
                              value={discountCode}
                              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                              placeholder="مثال: WELCOME10"
                              className="bg-[#1a1410] border-green-500/30 text-white text-right flex-1 focus:border-green-500"
                              data-testid="input-discount-code"
                            />
                            <Button
                              onClick={validateDiscountCode}
                              disabled={isValidatingDiscount || !discountCode.trim()}
                              className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                              data-testid="button-apply-discount"
                            >
                              {isValidatingDiscount ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                  جاري التحقق
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 ml-2" />
                                  تطبيق
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-green-500/20 border-2 border-green-500/50 rounded-lg p-4 animate-pulse-slow">
                            <div className="flex items-center justify-between">
                              <div className="text-right flex-1">
                                <div className="flex items-center gap-2 justify-end mb-1">
                                  <p className="text-green-400 font-bold text-lg" data-testid="text-applied-discount-code">{appliedDiscount.code}</p>
                                  <Check className="w-5 h-5 text-green-400" />
                                </div>
                                <p className="text-sm text-green-300">{appliedDiscount.reason}</p>
                              </div>
                              <div className="flex items-center gap-2 mr-4">
                                <Badge className="bg-green-600 text-white text-base px-3 py-1">-{appliedDiscount.percentage}%</Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={removeDiscount}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  data-testid="button-remove-discount"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-amber-500/20" />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">المجموع الفرعي:</span>
                        <span className="text-gray-300" data-testid="text-subtotal">
                          {calculateSubtotal().toFixed(2)} ريال
                        </span>
                      </div>
                      
                      {appliedDiscount && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-400">الخصم ({appliedDiscount.percentage}%):</span>
                          <span className="text-green-400" data-testid="text-discount-amount">
                            -{calculateDiscount().toFixed(2)} ريال
                          </span>
                        </div>
                      )}

                      <Separator className="bg-amber-500/10" />
                      
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-amber-500">الإجمالي:</span>
                        <span className="text-amber-500" data-testid="text-total">
                          {calculateTotal()} ريال
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmitOrder}
                      disabled={createOrderMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-6"
                      data-testid="button-submit-order"
                    >
                      <Check className="w-5 h-5 ml-2" />
                      {createOrderMutation.isPending ? "جاري الإنشاء..." : "إنشاء الطلب وإرسال واتساب"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {lastOrder && (
        <ReceiptPrint
          ref={receiptRef}
          orderNumber={lastOrder.orderNumber}
          customerName={lastOrder.customerName}
          customerPhone={lastOrder.customerPhone}
          items={lastOrder.items}
          subtotal={lastOrder.subtotal}
          discount={lastOrder.discount}
          total={lastOrder.total}
          paymentMethod={lastOrder.paymentMethod}
          employeeName={lastOrder.employeeName}
          tableNumber={lastOrder.tableNumber}
          date={lastOrder.date}
        />
      )}
    </div>
  );
}
