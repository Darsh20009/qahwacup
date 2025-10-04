import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Coffee, ShoppingBag, User, Phone, Trash2, Plus, Minus, ArrowRight, Check, Scan, Search, X, Gift } from "lucide-react";
import QRScanner from "@/components/qr-scanner";
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
${data.items.map(item => `• ${item.coffeeItem.nameAr} × ${item.quantity} - ${(parseFloat(item.coffeeItem.price) * item.quantity).toFixed(2)} ريال`).join('\n')}

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  
  const { toast } = useToast();

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

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
    onSuccess: (order) => {
      const paymentMethodAr = paymentMethod === "cash" ? "نقدي" : 
                             paymentMethod === "stc" ? "STC Pay" :
                             paymentMethod === "alinma" ? "Alinma Pay" :
                             paymentMethod === "ur" ? "Ur Pay" :
                             paymentMethod === "barq" ? "Barq" : "تحويل بنكي";
      
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
        title: "تم إنشاء الطلب بنجاح",
        description: `رقم الطلب: ${order.orderNumber}`,
      });
      
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
    setPaymentMethod("cash");
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

  const calculateTotal = () => {
    const total = orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.coffeeItem.price) * item.quantity);
    }, 0);
    return total.toFixed(2);
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

    if (!customerName.trim() || !customerPhone.trim()) {
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
        customerPhone: customerPhone
      },
      employeeId: employee?.id,
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
                              {parseFloat(item.price).toFixed(2)} ريال
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
                                {parseFloat(item.coffeeItem.price).toFixed(2)} ريال
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
                              {(parseFloat(item.coffeeItem.price) * item.quantity).toFixed(2)} ريال
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
                          رقم الجوال
                        </Label>
                        <Input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="05xxxxxxxx"
                          className="bg-[#1a1410] border-amber-500/30 text-white text-right"
                          data-testid="input-customer-phone"
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
                            <SelectItem value="cash">نقدي</SelectItem>
                            <SelectItem value="stc">STC Pay</SelectItem>
                            <SelectItem value="alinma">Alinma Pay</SelectItem>
                            <SelectItem value="ur">Ur Pay</SelectItem>
                            <SelectItem value="barq">Barq</SelectItem>
                            <SelectItem value="rajhi">تحويل بنك الراجحي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator className="bg-amber-500/20" />

                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-amber-500">الإجمالي:</span>
                      <span className="text-amber-500" data-testid="text-total">
                        {calculateTotal()} ريال
                      </span>
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

    </div>
  );
}
