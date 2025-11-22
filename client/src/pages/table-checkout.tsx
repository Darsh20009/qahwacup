import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Coffee, ArrowRight, User, Phone } from "lucide-react";

interface CartItem {
  item: {
    id: string;
    nameAr: string;
    price: number;
  };
  quantity: number;
}

export default function TableCheckout() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/table-checkout/:tableId/:tableNumber");
  const { toast } = useToast();
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableId = params?.tableId;
  const tableNumber = params?.tableNumber;
  
  const cart: CartItem[] = JSON.parse(sessionStorage.getItem(`cart_${tableId}`) || "[]");
  const branchId = sessionStorage.getItem(`branchId_${tableId}`) || "";

  const getTotalPrice = () => {
    return cart.reduce((total, ci) => total + ci.item.price * ci.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!customerName || customerName.trim() === "") {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الاسم",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: cart.map((ci) => ({
          id: ci.item.id,
          nameAr: ci.item.nameAr,
          price: ci.item.price,
          quantity: ci.quantity,
        })),
        totalAmount: getTotalPrice(),
        paymentMethod: "cash",
        status: "pending",
        orderType: "table",
        tableNumber: tableNumber,
        tableId: tableId,
        branchId: branchId,
        tableStatus: "pending",
        customerInfo: {
          name: customerName.trim(),
          phone: customerPhone.trim() || "guest",
        },
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to create order");
      
      const order = await response.json();

      sessionStorage.removeItem(`cart_${tableId}`);
      sessionStorage.removeItem(`branchId_${tableId}`);

      toast({
        title: "تم إرسال الطلب بنجاح! ✅",
        description: "سيتم التواصل معك قريباً للدفع",
      });

      navigate(`/table-order-tracking/${order._id}`);
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "خطأ",
        description: "فشل إرسال الطلب. حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tableId || !tableNumber || cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">لا توجد عناصر في السلة</h2>
            <p className="text-muted-foreground mb-4">الرجاء إضافة عناصر للسلة أولاً</p>
            <Button onClick={() => navigate("/")}>العودة للصفحة الرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir="rtl">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Coffee className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            إتمام الطلب
          </h1>
          <p className="text-muted-foreground">
            طاولة رقم {tableNumber}
          </p>
        </div>

        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cart.map((ci, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{ci.item.nameAr}</p>
                    <p className="text-sm text-muted-foreground">الكمية: {ci.quantity}</p>
                  </div>
                  <p className="font-bold text-lg text-foreground">
                    {(ci.item.price * ci.quantity).toFixed(2)} ر.س
                  </p>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20">
                <span className="text-xl font-bold text-foreground">الإجمالي</span>
                <span className="text-2xl font-bold text-primary">
                  {getTotalPrice().toFixed(2)} ر.س
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">معلوماتك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                الاسم *
              </Label>
              <Input
                id="name"
                placeholder="أدخل اسمك"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-lg h-12"
                data-testid="input-name"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الجوال (اختياري)
              </Label>
              <Input
                id="phone"
                placeholder="5xxxxxxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                maxLength={9}
                className="text-lg h-12"
                data-testid="input-phone"
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                💳 سيتم الدفع عند الكاشير
              </p>
            </div>

            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-bold shadow-lg"
              data-testid="button-submit-order"
            >
              {isSubmitting ? "جاري الإرسال..." : (
                <>
                  إرسال الطلب
                  <ArrowRight className="mr-2 w-5 h-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
