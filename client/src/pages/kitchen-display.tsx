import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { playNotificationSound } from "@/lib/notification-sounds";
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  AlertTriangle,
  Coffee,
  Snowflake,
  Loader2,
  RefreshCw,
  Timer,
  UtensilsCrossed,
  Play,
  Check,
  ArrowLeft,
  MapPin,
  Store,
  Truck,
  Volume2,
  VolumeX
} from "lucide-react";
import { Link } from "wouter";

interface OrderItem {
  coffeeItemId: string;
  quantity: number;
  size: string;
  extras: string[];
  sugarLevel?: string;
  notes?: string;
  coffeeItem?: {
    nameAr: string;
    nameEn: string;
    price: number;
    imageUrl?: string;
    category?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  tableStatus?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
  tableNumber?: string;
  orderType?: string;
  deliveryType?: 'pickup' | 'delivery' | 'dine-in';
  customerNotes?: string;
  branchId?: string;
}

const DELAY_THRESHOLD_MINUTES = 10;
const WARNING_THRESHOLD_MINUTES = 5;

const categoryMapping: Record<string, { nameAr: string; icon: any; color: string }> = {
  "hot-drinks": { nameAr: "مشروبات ساخنة", icon: Coffee, color: "bg-orange-500/20 text-orange-400" },
  "cold-drinks": { nameAr: "مشروبات باردة", icon: Snowflake, color: "bg-blue-500/20 text-blue-400" },
  "tea": { nameAr: "شاي", icon: Coffee, color: "bg-green-500/20 text-green-400" },
  "matcha": { nameAr: "ماتشا", icon: Coffee, color: "bg-emerald-500/20 text-emerald-400" },
  "desserts": { nameAr: "حلويات", icon: UtensilsCrossed, color: "bg-pink-500/20 text-pink-400" },
  "default": { nameAr: "أخرى", icon: Coffee, color: "bg-gray-500/20 text-gray-400" },
};

function getItemCategory(item: OrderItem): string {
  const itemId = item.coffeeItemId.toLowerCase();
  if (itemId.includes("iced") || itemId.includes("cold") || itemId.includes("ice")) {
    return "cold-drinks";
  }
  if (itemId.includes("tea")) {
    return "tea";
  }
  if (itemId.includes("matcha")) {
    return "matcha";
  }
  if (itemId.includes("dessert") || itemId.includes("cake") || itemId.includes("cookie")) {
    return "desserts";
  }
  return "hot-drinks";
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function getElapsedMinutes(dateString: string): number {
  const created = new Date(dateString).getTime();
  const now = Date.now();
  return Math.floor((now - created) / (1000 * 60));
}

function getSizeAr(size: string): string {
  const sizes: Record<string, string> = {
    small: "صغير",
    medium: "وسط",
    large: "كبير",
  };
  return sizes[size] || size;
}

function OrderCard({ 
  order, 
  onStartPreparing, 
  onMarkReady,
  isPending 
}: { 
  order: Order; 
  onStartPreparing: (id: string) => void;
  onMarkReady: (id: string) => void;
  isPending: boolean;
}) {
  const [elapsedMinutes, setElapsedMinutes] = useState(getElapsedMinutes(order.createdAt));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMinutes(getElapsedMinutes(order.createdAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const isDelayed = elapsedMinutes >= DELAY_THRESHOLD_MINUTES;
  const isWarning = elapsedMinutes >= WARNING_THRESHOLD_MINUTES && !isDelayed;
  const isPreparing = order.status === "in_progress";
  const isReady = order.status === "ready";

  const itemsByCategory = useMemo(() => {
    const items = Array.isArray(order.items) ? order.items : [];
    const grouped: Record<string, OrderItem[]> = {};
    
    items.forEach(item => {
      const category = getItemCategory(item);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  }, [order.items]);

  const statusBadge = () => {
    if (isReady) {
      return <Badge className="bg-green-500/20 text-green-400">جاهز</Badge>;
    }
    if (isPreparing) {
      return <Badge className="bg-yellow-500/20 text-yellow-400">قيد التحضير</Badge>;
    }
    if (isDelayed) {
      return <Badge className="bg-red-500/20 text-red-400">متأخر</Badge>;
    }
    if (isWarning) {
      return <Badge className="bg-orange-500/20 text-orange-400">تنبيه</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-400">جديد</Badge>;
  };

  const cardBorderClass = isDelayed 
    ? "border-red-500/50 animate-pulse" 
    : isWarning 
    ? "border-orange-500/50" 
    : isPreparing 
    ? "border-yellow-500/50" 
    : isReady 
    ? "border-green-500/50" 
    : "border-border";

  return (
    <Card className={`relative overflow-visible ${cardBorderClass} transition-all duration-300`}>
      {isDelayed && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-red-500 rounded-full p-1.5 animate-bounce">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg font-bold">#{order.orderNumber}</CardTitle>
            {statusBadge()}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>{elapsedMinutes} دقيقة</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(order.createdAt)}
          </span>
          {order.tableNumber && (
            <Badge variant="outline" className="text-xs">
              طاولة {order.tableNumber}
            </Badge>
          )}
          {(order.orderType === "dine_in" || order.deliveryType === "dine-in") && (
            <Badge variant="outline" className="text-sm font-semibold border-green-500/50 bg-green-500/20 text-green-500 dark:text-green-400 flex items-center gap-1">
              <Store className="h-4 w-4" />
              محلي
            </Badge>
          )}
          {(order.orderType === "takeaway" || order.deliveryType === "pickup") && (
            <Badge variant="outline" className="text-sm font-semibold border-amber-500/50 bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              سفري
            </Badge>
          )}
          {(order.orderType === "delivery" || order.deliveryType === "delivery") && (
            <Badge variant="outline" className="text-sm font-semibold border-blue-500/50 bg-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center gap-1">
              <Truck className="h-4 w-4" />
              توصيل
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {Object.entries(itemsByCategory).map(([category, items]) => {
          const categoryInfo = categoryMapping[category] || categoryMapping.default;
          const CategoryIcon = categoryInfo.icon;
          
          return (
            <div key={category} className="space-y-2">
              <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${categoryInfo.color}`}>
                <CategoryIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{categoryInfo.nameAr}</span>
              </div>
              
              <div className="space-y-1.5 pr-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 text-sm bg-muted/30 rounded-md p-2">
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.coffeeItem?.nameAr || item.coffeeItemId}
                        <span className="text-muted-foreground mr-1">×{item.quantity}</span>
                      </div>
                      <div className="text-xs text-muted-foreground space-x-reverse space-x-1">
                        <span>{getSizeAr(item.size)}</span>
                        {item.sugarLevel && <span>• {item.sugarLevel}</span>}
                        {item.extras && item.extras.length > 0 && (
                          <span>• {item.extras.join("، ")}</span>
                        )}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-yellow-500 mt-1">
                          ملاحظة: {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {order.customerNotes && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-2 text-sm">
            <span className="font-medium text-yellow-500">ملاحظات العميل:</span>
            <p className="text-muted-foreground">{order.customerNotes}</p>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {!isPreparing && !isReady && (
            <Button 
              onClick={() => onStartPreparing(order.id)}
              disabled={isPending}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
              data-testid={`button-start-preparing-${order.orderNumber}`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-4 w-4 ml-1" />
                  بدء التحضير
                </>
              )}
            </Button>
          )}
          
          {isPreparing && (
            <Button 
              onClick={() => onMarkReady(order.id)}
              disabled={isPending}
              className="flex-1 bg-green-500 hover:bg-green-600"
              data-testid={`button-mark-ready-${order.orderNumber}`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 ml-1" />
                  جاهز للتسليم
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function KitchenDisplay() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousOrderCountRef = useRef<number>(0);
  const previousReadyCountRef = useRef<number>(0);

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["/api/orders/kitchen"],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  useEffect(() => {
    if (!soundEnabled || orders.length === 0) return;
    
    const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "payment_confirmed");
    const readyOrders = orders.filter(o => o.status === "ready");
    
    if (pendingOrders.length > previousOrderCountRef.current) {
      playNotificationSound('newOrder', 0.7);
      toast({
        title: "طلب جديد!",
        description: `وصل طلب جديد - الإجمالي: ${pendingOrders.length} طلب`,
      });
    }
    
    if (readyOrders.length > previousReadyCountRef.current) {
      playNotificationSound('success', 0.8);
    }
    
    previousOrderCountRef.current = pendingOrders.length;
    previousReadyCountRef.current = readyOrders.length;
  }, [orders, soundEnabled, toast]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/kitchen"] });
      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديث حالة الطلب بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الطلب",
        variant: "destructive",
      });
    },
  });

  const handleStartPreparing = (id: string) => {
    updateStatusMutation.mutate({ id, status: "in_progress" });
  };

  const handleMarkReady = (id: string) => {
    updateStatusMutation.mutate({ id, status: "ready" });
  };

  const { pendingOrders, preparingOrders, readyOrders, delayedCount } = useMemo(() => {
    const pending = orders.filter(o => 
      o.status === "pending" || o.status === "payment_confirmed"
    );
    const preparing = orders.filter(o => o.status === "in_progress");
    const ready = orders.filter(o => o.status === "ready");
    
    const delayed = pending.filter(o => 
      getElapsedMinutes(o.createdAt) >= DELAY_THRESHOLD_MINUTES
    ).length;

    return {
      pendingOrders: pending,
      preparingOrders: preparing,
      readyOrders: ready,
      delayedCount: delayed,
    };
  }, [orders]);

  const getFilteredOrders = () => {
    switch (activeTab) {
      case "pending":
        return pendingOrders;
      case "preparing":
        return preparingOrders;
      case "ready":
        return readyOrders;
      default:
        return [...pendingOrders, ...preparingOrders, ...readyOrders];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/employee/dashboard">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">شاشة المطبخ</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {delayedCount > 0 && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  <AlertTriangle className="h-3 w-3 ml-1" />
                  {delayedCount} طلب متأخر
                </Badge>
              )}
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/10">
                  انتظار: {pendingOrders.length}
                </Badge>
                <Badge variant="outline" className="bg-yellow-500/10">
                  تحضير: {preparingOrders.length}
                </Badge>
                <Badge variant="outline" className="bg-green-500/10">
                  جاهز: {readyOrders.length}
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? "border-green-500 text-green-500" : "border-muted text-muted-foreground"}
                data-testid="button-toggle-sound"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 ml-1" /> : <VolumeX className="h-4 w-4 ml-1" />}
                {soundEnabled ? "الصوت" : "صامت"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "border-green-500 text-green-500" : ""}
                data-testid="button-toggle-auto-refresh"
              >
                <RefreshCw className={`h-4 w-4 ml-1 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "تحديث تلقائي" : "تحديث يدوي"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                data-testid="button-refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all" data-testid="tab-all">
              الكل ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              انتظار ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="preparing" data-testid="tab-preparing">
              تحضير ({preparingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="ready" data-testid="tab-ready">
              جاهز ({readyOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {getFilteredOrders().length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد طلبات</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all" 
                    ? "لا توجد طلبات حالياً" 
                    : `لا توجد طلبات في حالة ${
                        activeTab === "pending" ? "الانتظار" : 
                        activeTab === "preparing" ? "التحضير" : "جاهز"
                      }`
                  }
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFilteredOrders()
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStartPreparing={handleStartPreparing}
                      onMarkReady={handleMarkReady}
                      isPending={updateStatusMutation.isPending}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
