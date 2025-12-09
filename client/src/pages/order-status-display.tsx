import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Coffee, 
  CheckCircle2, 
  Clock, 
  Loader2,
  RefreshCw,
  Store,
  MapPin,
  Truck,
  Bell
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  itemCount: number;
  createdAt: string;
  orderType?: string;
  deliveryType?: 'pickup' | 'delivery' | 'dine-in';
}

const getLastThreeDigits = (orderNumber: string): string => {
  const digits = orderNumber.replace(/\D/g, '');
  return digits.slice(-3).padStart(3, '0');
};

const getOrderTypeDisplay = (order: Order) => {
  const type = order.deliveryType || order.orderType;
  
  if (type === 'dine-in' || type === 'dine_in') {
    return { label: "محلي", icon: Store, color: "bg-green-500/20 text-green-400 border-green-500/50" };
  }
  if (type === 'pickup' || type === 'takeaway') {
    return { label: "سفري", icon: MapPin, color: "bg-amber-500/20 text-amber-400 border-amber-500/50" };
  }
  if (type === 'delivery') {
    return { label: "توصيل", icon: Truck, color: "bg-blue-500/20 text-blue-400 border-blue-500/50" };
  }
  return { label: "طلب", icon: Coffee, color: "bg-gray-500/20 text-gray-400 border-gray-500/50" };
};

function OrderCard({ order, isReady }: { order: Order; isReady: boolean }) {
  const orderType = getOrderTypeDisplay(order);
  const OrderIcon = orderType.icon;
  const lastThree = getLastThreeDigits(order.orderNumber);
  
  return (
    <Card 
      className={`relative overflow-visible transition-all duration-500 ${
        isReady 
          ? "border-green-500/50 bg-green-500/10 animate-pulse" 
          : "border-amber-500/30 bg-amber-500/5"
      }`}
      data-testid={`order-card-${order.id}`}
    >
      <CardContent className="p-6 text-center">
        <div className="text-6xl font-bold mb-3" style={{ fontFamily: 'monospace' }}>
          <span className={isReady ? "text-green-400" : "text-amber-400"}>
            {lastThree}
          </span>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <Badge variant="outline" className={orderType.color}>
            <OrderIcon className="h-4 w-4 ml-1" />
            {orderType.label}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {order.itemCount || 0} عناصر
        </div>
        
        {isReady && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-green-500 rounded-full p-2 animate-bounce">
              <Bell className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrderStatusDisplayPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: ordersData, isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["/api/orders/active-display"],
    queryFn: async () => {
      const res = await fetch("/api/orders/active-display");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 5000,
  });

  const orders = ordersData || [];
  const inProgressOrders = orders.filter(o => o.status === "in_progress" || o.status === "preparing");
  const readyOrders = orders.filter(o => o.status === "ready");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-amber-500">حالة الطلبات</h1>
              <p className="text-gray-400">متابعة الطلبات الجارية والجاهزة</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-2xl font-mono text-amber-400">
              {currentTime.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="border-amber-500/30"
              data-testid="button-refresh-orders"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-400">جاري التحضير</h2>
                <p className="text-sm text-gray-400">{inProgressOrders.length} طلب</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {inProgressOrders.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>لا توجد طلبات قيد التحضير</p>
                </div>
              ) : (
                inProgressOrders.map(order => (
                  <OrderCard key={order.id} order={order} isReady={false} />
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-400">جاهز للاستلام</h2>
                <p className="text-sm text-gray-400">{readyOrders.length} طلب</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {readyOrders.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>لا توجد طلبات جاهزة</p>
                </div>
              ) : (
                readyOrders.map(order => (
                  <OrderCard key={order.id} order={order} isReady={true} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            يتم تحديث الشاشة تلقائياً كل 5 ثوانٍ
          </p>
        </div>
      </div>
    </div>
  );
}
