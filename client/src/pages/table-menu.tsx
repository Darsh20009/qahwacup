import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, User, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ICoffeeItem {
  _id: string;
  id: string;
  nameAr: string;
  nameEn?: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  imageUrl?: string;
  isAvailable: number;
}

interface ITable {
  _id: string;
  tableNumber: string;
  qrToken: string;
  isActive: number;
  isOccupied: number;
}

interface CartItem {
  item: ICoffeeItem;
  quantity: number;
}

export default function TableMenu() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/table-menu/:qrToken");
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isGuestCheckout, setIsGuestCheckout] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  const qrToken = params?.qrToken;

  // Fetch table info
  const { data: table, isLoading: tableLoading } = useQuery<ITable>({
    queryKey: ["/api/tables/qr", qrToken],
    enabled: !!qrToken,
    queryFn: async () => {
      const response = await fetch(`/api/tables/qr/${qrToken}`);
      if (!response.ok) throw new Error("Table not found");
      return response.json();
    },
  });

  // Fetch menu items
  const { data: menuItems, isLoading: menuLoading } = useQuery<ICoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
    queryFn: async () => {
      const response = await fetch("/api/coffee-items");
      if (!response.ok) throw new Error("Failed to fetch menu");
      return response.json();
    },
  });

  // Search customer by phone
  const searchCustomerMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch(`/api/cashier/customers/search?phone=${phone}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.exists) {
        setCustomerInfo(data.customer);
        setCustomerName(data.customer.name);
        setIsGuestCheckout(false);
        toast({
          title: "تم العثور على حسابك",
          description: `مرحباً ${data.customer.name}! لديك ${data.customer.points} نقطة`,
        });
      } else {
        setIsGuestCheckout(true);
        toast({
          title: "رقم جديد",
          description: "يمكنك المتابعة كضيف",
        });
      }
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "تم إرسال الطلب",
        description: "سيتم التواصل معك قريباً للدفع",
      });
      // Navigate to order tracking
      navigate(`/table-order-tracking/${order._id}`);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل إرسال الطلب",
        variant: "destructive",
      });
    },
  });

  const addToCart = (item: ICoffeeItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((ci) =>
          ci.item.id === itemId
            ? { ...ci, quantity: ci.quantity - 1 }
            : ci
        );
      }
      return prev.filter((ci) => ci.item.id !== itemId);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, ci) => total + ci.item.price * ci.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, ci) => total + ci.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "الرجاء إضافة عناصر للسلة أولاً",
        variant: "destructive",
      });
      return;
    }
    setShowCheckout(true);
  };

  const handlePhoneSearch = () => {
    if (!customerPhone || customerPhone.length !== 9) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم هاتف صحيح (9 أرقام)",
        variant: "destructive",
      });
      return;
    }
    searchCustomerMutation.mutate(customerPhone);
  };

  const handleSubmitOrder = () => {
    if (!customerName) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الاسم",
        variant: "destructive",
      });
      return;
    }

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
      tableNumber: table?.tableNumber,
      tableId: table?._id,
      tableStatus: "pending",
      customerInfo: {
        name: customerName,
        phone: customerPhone || "guest",
        isGuest: isGuestCheckout,
      },
      customerId: customerInfo?._id,
    };

    createOrderMutation.mutate(orderData);
  };

  if (tableLoading || menuLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>طاولة غير موجودة</CardTitle>
          </CardHeader>
          <CardContent>
            <p>عذراً، لم نتمكن من العثور على هذه الطاولة.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">قهوة كوب</h1>
            <p className="text-sm text-muted-foreground">
              طاولة {table.tableNumber}
            </p>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            data-testid="button-checkout"
          >
            <ShoppingCart className="w-4 h-4 ml-2" />
            السلة ({getTotalItems()})
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems?.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.nameAr}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold">{item.nameAr}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-lg">{item.price} ر.س</span>
                      {cart.find((ci) => ci.item.id === item.id) ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {cart.find((ci) => ci.item.id === item.id)?.quantity}
                          </span>
                          <Button
                            size="icon"
                            onClick={() => addToCart(item)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          data-testid={`button-add-${item.id}`}
                        >
                          <Plus className="w-4 h-4 ml-1" />
                          إضافة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إتمام الطلب</DialogTitle>
            <DialogDescription>
              أدخل بياناتك لإرسال الطلب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="5xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  maxLength={9}
                  data-testid="input-phone"
                />
                <Button
                  onClick={handlePhoneSearch}
                  disabled={searchCustomerMutation.isPending}
                  data-testid="button-search-phone"
                >
                  بحث
                </Button>
              </div>
            </div>

            {/* Customer Info */}
            {customerInfo && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <div>
                      <p className="font-bold">{customerInfo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        النقاط: {customerInfo.points}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guest Name */}
            {isGuestCheckout && (
              <div className="space-y-2">
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  placeholder="أدخل اسمك"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  data-testid="input-name"
                />
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="font-bold mb-2">ملخص الطلب</h3>
              {cart.map((ci) => (
                <div key={ci.item.id} className="flex justify-between text-sm mb-1">
                  <span>
                    {ci.item.nameAr} × {ci.quantity}
                  </span>
                  <span>{(ci.item.price * ci.quantity).toFixed(2)} ر.س</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>الإجمالي</span>
                <span>{getTotalPrice().toFixed(2)} ر.س</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitOrder}
              disabled={createOrderMutation.isPending}
              className="w-full"
              data-testid="button-submit-order"
            >
              إرسال الطلب
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              سيتم الدفع عند الكاشير
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
