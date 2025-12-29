import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Coffee, ShoppingCart, Flame, Snowflake, Star, Cake, Sprout, Zap, User, ArrowLeft, AlertCircle } from "lucide-react";
import { COFFEE_STRENGTH_CONFIG, getCoffeeStrengthConfig, filterCoffeeByStrength, type CoffeeStrengthType } from "@/lib/utils";
import type { CoffeeItem } from "@shared/schema";

interface ITable {
  _id: string;
  tableNumber: string;
  qrToken: string;
  branchId: string;
  isActive: number;
  isOccupied: number;
  currentOrderId?: string;
  reservedFor?: {
    customerName: string;
    customerPhone: string;
    reservationTime?: string;
    status?: string;
    autoExpiryTime?: string;
    extensionCount?: number;
  };
}

interface IPendingOrder {
  id: string;
  status: string;
  tableNumber?: string;
  customerInfo?: {
    customerName: string;
  };
}

interface CartItem {
  item: CoffeeItem;
  quantity: number;
}

export default function TableMenuNew() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/table-menu/:qrToken");
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStrength, setSelectedStrength] = useState<CoffeeStrengthType | "all">("all");
  const [reservationPhoneVerified, setReservationPhoneVerified] = useState(false);
  const [reservationPhoneInput, setReservationPhoneInput] = useState("");
  const [reservationStatus, setReservationStatus] = useState<"valid" | "before_window" | "after_window" | null>(null);

  const qrToken = params?.qrToken;

  // Helper function to check reservation time window
  const checkReservationWindow = (reservationTime: string | undefined) => {
    if (!reservationTime) return "valid";

    const reservation = new Date(reservationTime);
    const now = new Date();
    const diffMinutes = (reservation.getTime() - now.getTime()) / (1000 * 60);

    // Window: -30 minutes before to +5 minutes after
    if (diffMinutes >= -30 && diffMinutes <= 5) {
      return "valid";
    } else if (diffMinutes < -30) {
      return "after_window"; // More than 30 mins have passed
    } else {
      return "before_window"; // Reservation is more than 30 mins in future
    }
  };

  // Fetch table info
  const { data: table, isLoading: tableLoading } = useQuery<ITable>({
    queryKey: ["/api/tables/qr", qrToken],
    enabled: !!qrToken,
    queryFn: async () => {
      const response = await fetch(`/api/tables/qr/${qrToken}`);
      if (!response.ok) throw new Error("الطاولة غير موجودة");
      return response.json();
    },
  });

  // Check reservation window status when table data loads
  useEffect(() => {
    if (table?.reservedFor?.reservationTime) {
      const status = checkReservationWindow(table.reservedFor.reservationTime);
      setReservationStatus(status as any);
    }
  }, [table]);

  // Fetch pending order if table has currentOrderId
  const { data: pendingOrder } = useQuery<IPendingOrder>({
    queryKey: ["/api/orders", table?._id],
    enabled: !!table?.currentOrderId,
    queryFn: async () => {
      const response = await fetch(`/api/orders/${table?.currentOrderId}`);
      if (!response.ok) throw new Error("الطلب غير موجود");
      return response.json();
    },
  });

  // Fetch menu items
  const { data: coffeeItems = [], isLoading: menuLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    { id: "all", nameAr: "الكل", nameEn: "All", icon: Coffee },
    { id: "basic", nameAr: "قهوة أساسية", nameEn: "Basic Coffee", icon: Coffee },
    { id: "hot", nameAr: "قهوة ساخنة", nameEn: "Hot Coffee", icon: Flame },
    { id: "cold", nameAr: "قهوة باردة", nameEn: "Cold Coffee", icon: Snowflake },
    { id: "specialty", nameAr: "المشروبات الإضافية", nameEn: "Specialty Drinks", icon: Star },
    { id: "desserts", nameAr: "الحلويات", nameEn: "Desserts", icon: Cake },
  ];

  const strengthOptions = [
    { id: "all" as const, labelAr: "جميع الأنواع", icon: Star },
    { id: "mild" as const, labelAr: "خفيف (1-4)", icon: Sprout },
    { id: "medium" as const, labelAr: "متوسط (4-8)", icon: Zap },
    { id: "strong" as const, labelAr: "قوي (8-12)", icon: Flame },
    { id: "classic" as const, labelAr: "العادي/الكلاسيك", icon: Coffee },
  ];

  // Filter by both category and strength
  let filteredItems = selectedCategory === "all" 
    ? coffeeItems 
    : coffeeItems.filter(item => item.category === selectedCategory);
  
  filteredItems = filterCoffeeByStrength(filteredItems, selectedStrength);

  const addToCart = (item: CoffeeItem) => {
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
    
    toast({
      title: "تمت الإضافة للسلة",
      description: `تم إضافة ${item.nameAr} إلى سلتك`,
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

  // دالة تمديد الحجز
  const handleExtendReservation = async () => {
    if (!table?._id) return;
    try {
      const response = await fetch(`/api/tables/${table._id}/extend-reservation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        toast({
          title: "تم التمديد",
          description: "تم تمديد الحجز لمدة ساعة إضافية",
          className: "bg-green-600 text-white border-green-700"
        });
        // Refresh table data
        queryClient.invalidateQueries({ queryKey: ["/api/tables/qr", qrToken] });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تمديد الحجز",
        variant: "destructive"
      });
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "الرجاء إضافة عناصر للسلة أولاً",
        variant: "destructive",
      });
      return;
    }

    // If table is reserved, check time window and verify phone
    if (table?.reservedFor?.customerName) {
      if (reservationStatus === "after_window") {
        toast({
          title: "انتهاء فترة الحجز",
          description: "آسفون، فترة الحجز قد انتهت. يمكنك عمل طلب عادي جديد.",
          variant: "destructive",
        });
        // Clear reservation and allow normal order
        return;
      }

      if (reservationStatus === "before_window") {
        toast({
          title: "الحجز في وقت لاحق",
          description: "الحجز لم يبدأ بعد. يمكنك عمل طلب عادي الآن.",
        });
        // Allow normal order without reservation verification
        setReservationPhoneVerified(true);
        return;
      }

      // For "valid" window, verify phone number
      if (!reservationPhoneVerified) {
        const phoneToVerify = reservationPhoneInput.trim();
        if (!phoneToVerify) {
          toast({
            title: "التحقق من الحجز",
            description: "الرجاء إدخال رقم الجوال المسجل في الحجز",
            variant: "destructive",
          });
          return;
        }

        // Verify against reservation phone
        const reservationPhone = table.reservedFor.customerPhone.replace(/^0/, "");
        const inputPhone = phoneToVerify.replace(/^0/, "");
        
        if (reservationPhone !== inputPhone && reservationPhone !== phoneToVerify) {
          toast({
            title: "خطأ في التحقق",
            description: "رقم الجوال غير مطابق للحجز",
            variant: "destructive",
          });
          return;
        }
        
        setReservationPhoneVerified(true);
        return;
      }
    }

    // Update table occupancy when checking out
    if (table?._id) {
      try {
        await fetch(`/api/tables/${table._id}/occupancy`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOccupied: 1 }),
        });
      } catch (error) {
        console.error("Error updating table occupancy:", error);
      }
    }

    sessionStorage.setItem(`cart_${table?._id}`, JSON.stringify(cart));
    sessionStorage.setItem(`branchId_${table?._id}`, table?.branchId || "");
    navigate(`/table-checkout/${table?._id}/${table?.tableNumber}`);
  };


  if (tableLoading || menuLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.8s'}}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <Coffee className="w-20 h-20 text-primary mx-auto relative z-10 coffee-steam" />
          </div>
          
          <h3 className="font-amiri text-3xl font-bold text-primary mb-4 golden-gradient">
            جاري تحضير المنيو
          </h3>
          <p className="text-muted-foreground text-xl">أفضل ما لدينا من القهوة الطازجة</p>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">طاولة غير موجودة</h2>
          <p className="text-muted-foreground">عذراً، لم نتمكن من العثور على هذه الطاولة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Clean Header */}
      <header className="sticky top-0 bg-white border-b-2 border-amber-200 z-40 shadow-md" dir="rtl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
              <div>
                <h1 className="font-amiri text-lg sm:text-2xl font-bold text-slate-700">
                  قهوة كوب
                </h1>
                <p className="text-xs text-slate-500">طاولة {table.tableNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCheckout}
                variant="default"
                size="sm"
                disabled={cart.length === 0}
                className="relative bg-slate-600 hover:bg-slate-700 text-white transition-all duration-300 px-3 sm:px-6 py-1.5 sm:py-3 text-sm sm:text-lg font-semibold shadow-md hover:shadow-lg rounded-lg"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 sm:ml-2" />
                <span className="hidden sm:inline">السلة</span>
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1.5 sm:-top-2 -left-1.5 sm:-left-2 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center p-0 text-xs sm:text-sm font-bold bg-blue-500"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 relative z-10">
        {/* Reservation Info and Extension */}
        {table?.reservedFor?.status === 'pending' && (
          <div className="mb-8 p-5 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-md" dir="rtl">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2">معلومات الحجز</h3>
                <p className="text-sm text-blue-800">
                  الحجز باسم: <strong>{table.reservedFor.customerName}</strong>
                </p>
                {table.reservedFor.autoExpiryTime && (
                  <p className="text-sm text-blue-800 mt-1">
                    ينتهي الحجز في: <strong>{new Date(table.reservedFor.autoExpiryTime).toLocaleTimeString('ar')}</strong>
                  </p>
                )}
                {table.reservedFor.extensionCount === 0 && (
                  <Button
                    onClick={handleExtendReservation}
                    size="sm"
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="button-extend-reservation"
                  >
                    تمديد الحجز ساعة إضافية
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Order Alert */}
        {pendingOrder && pendingOrder.status !== 'completed' && (
          <div className="mb-8 p-5 bg-amber-50 border-2 border-amber-400 rounded-lg shadow-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-amber-900 mb-2">لديك طلب معلق!</h3>
                <p className="text-sm text-amber-800 mb-3">
                  لديك طلب تم طلبه سابقاً من هذه الطاولة ولا يزال في الانتظار. يمكنك متابعة الطلب أو إنشاء طلب جديد.
                </p>
                <Button
                  onClick={() => {
                    navigate(`/table-order-tracking/${table?.currentOrderId}`);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  data-testid="button-view-pending-order"
                >
                  متابعة الطلب السابق
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reservation Status - Show appropriate message based on time window */}
        {table?.reservedFor?.customerName && (
          <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            {reservationStatus === "after_window" ? (
              <>
                <h3 className="font-bold text-lg mb-3 text-red-900">⏰ انتهت فترة الحجز</h3>
                <p className="text-sm text-red-800 mb-3">
                  الحجز لـ: <strong>{table.reservedFor.customerName}</strong> قد انتهت فترته.
                </p>
                <p className="text-sm text-red-700">يمكنك تقديم طلب عادي جديد.</p>
              </>
            ) : reservationStatus === "before_window" ? (
              <>
                <h3 className="font-bold text-lg mb-3 text-amber-900">ℹ️ الحجز لم يبدأ بعد</h3>
                <p className="text-sm text-amber-800 mb-3">
                  هناك حجز باسم: <strong>{table.reservedFor.customerName}</strong>
                </p>
                <p className="text-sm text-amber-700">يمكنك تقديم طلب عادي حالياً.</p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-lg mb-3 text-blue-900">التحقق من الحجز</h3>
                <p className="text-sm text-blue-800 mb-3">هذه الطاولة محجوزة باسم: <strong>{table.reservedFor.customerName}</strong></p>
                {!reservationPhoneVerified && (
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="أدخل رقم الجوال المسجل في الحجز"
                      value={reservationPhoneInput}
                      onChange={(e) => setReservationPhoneInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg"
                      maxLength={9}
                    />
                    <Button
                      onClick={() => {
                        const phoneToVerify = reservationPhoneInput.trim();
                        const reservationPhone = table.reservedFor!.customerPhone.replace(/^0/, "");
                        const inputPhone = phoneToVerify.replace(/^0/, "");
                        
                        if (reservationPhone === inputPhone || reservationPhone === phoneToVerify) {
                          setReservationPhoneVerified(true);
                          toast({
                            title: "تم التحقق",
                            description: "تم التحقق من الحجز بنجاح",
                          });
                        } else {
                          toast({
                            title: "خطأ",
                            description: "رقم الجوال غير مطابق",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      تحقق
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Menu Section */}
        <section className="mb-12 sm:mb-16 md:mb-20">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
            <div className="relative inline-block mb-4 sm:mb-6">
              <h2 className="font-amiri text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 mb-2 sm:mb-4">
                منيو قهوة كوب
              </h2>
              <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-slate-300 rounded-full"></div>
            </div>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-4">
              انطلق في رحلة قهوة استثنائية مع تشكيلتنا المختارة بعناية من أجود حبوب القهوة العربية الأصيلة
            </p>
            
            <div className="flex justify-center space-x-4 mt-6">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 sm:gap-3 min-w-max px-2 sm:justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-slate-600 text-white shadow-lg scale-105"
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                  data-testid={`button-category-${category.id}`}
                >
                  <category.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{category.nameAr}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Strength Filter */}
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max px-2 sm:justify-center">
              {strengthOptions.map((option) => (
                <Button
                  key={option.id}
                  onClick={() => setSelectedStrength(option.id)}
                  variant={selectedStrength === option.id ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                    selectedStrength === option.id
                      ? "bg-indigo-500 text-white shadow-md scale-105"
                      : "bg-white text-slate-700 hover:bg-indigo-50 border-indigo-200/50 shadow-sm"
                  }`}
                  data-testid={`button-strength-${option.id}`}
                >
                  <option.icon className="w-3.5 h-3.5" />
                  <span className="text-xs">{option.labelAr}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Coffee Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const cartItem = cart.find((ci) => ci.item.id === item.id);
              const quantity = cartItem?.quantity || 0;
              
              return (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
                >
                  {item.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.nameAr}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {item.isNewProduct === 1 && (
                        <Badge className="absolute top-2 right-2 bg-blue-500">جديد</Badge>
                      )}
                      {item.oldPrice && (
                        <Badge className="absolute top-2 left-2 bg-red-500">خصم</Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg text-slate-800">{item.nameAr}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-800">{item.price} ر.س</span>
                        {item.oldPrice && (
                          <span className="text-sm text-slate-400 line-through">{item.oldPrice} ر.س</span>
                        )}
                      </div>
                      
                      {quantity > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => removeFromCart(item.id)}
                          >
                            -
                          </Button>
                          <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                          <Button
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => addToCart(item)}
                          >
                            +
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          className="bg-slate-600 hover:bg-slate-700"
                        >
                          إضافة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                لا توجد منتجات في هذه الفئة
              </p>
            </div>
          )}
        </section>
      </main>

    </div>
  );
}
