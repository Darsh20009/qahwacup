import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { playNotificationSound } from "@/lib/notification-sounds";
import { 
  Coffee, 
  CheckCircle2, 
  Clock, 
  Loader2,
  RefreshCw,
  Store,
  MapPin,
  Truck,
  Bell,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
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

function OrderCard({ order, isReady, isFullscreen }: { order: Order; isReady: boolean; isFullscreen: boolean }) {
  const orderType = getOrderTypeDisplay(order);
  const OrderIcon = orderType.icon;
  const lastThree = getLastThreeDigits(order.orderNumber);
  
  return (
    <Card 
      className={`relative overflow-visible transition-all duration-500 ${
        isReady 
          ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20" 
          : "border-amber-500/30 bg-amber-500/5"
      } ${isReady ? "animate-pulse" : ""}`}
      data-testid={`order-card-${order.id}`}
    >
      <CardContent className={`text-center ${isFullscreen ? 'p-8' : 'p-6'}`}>
        <div 
          className={`font-bold mb-3 ${isFullscreen ? 'text-8xl' : 'text-6xl'}`} 
          style={{ fontFamily: 'monospace' }}
        >
          <span className={isReady ? "text-green-400" : "text-amber-400"}>
            {lastThree}
          </span>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <Badge variant="outline" className={`${orderType.color} ${isFullscreen ? 'text-base px-4 py-1' : ''}`}>
            <OrderIcon className={`${isFullscreen ? 'h-5 w-5' : 'h-4 w-4'} ml-1`} />
            {orderType.label}
          </Badge>
        </div>
        
        <div className={`text-muted-foreground ${isFullscreen ? 'text-base' : 'text-sm'}`}>
          {order.itemCount || 0} عناصر
        </div>
        
        {isReady && (
          <div className="absolute -top-3 -right-3 z-10">
            <div className={`bg-green-500 rounded-full animate-bounce ${isFullscreen ? 'p-3' : 'p-2'}`}>
              <Bell className={`text-white ${isFullscreen ? 'h-6 w-6' : 'h-4 w-4'}`} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrderStatusDisplayPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previousReadyIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);
  
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

  useEffect(() => {
    const currentReadyIds = new Set(readyOrders.map(o => o.id));
    
    if (isFirstLoadRef.current) {
      previousReadyIdsRef.current = currentReadyIds;
      isFirstLoadRef.current = false;
      return;
    }
    
    if (!soundEnabled) {
      previousReadyIdsRef.current = currentReadyIds;
      return;
    }
    
    let newReadyCount = 0;
    currentReadyIds.forEach(id => {
      if (!previousReadyIdsRef.current.has(id)) {
        newReadyCount++;
      }
    });
    
    if (newReadyCount > 0) {
      playNotificationSound('success', 0.8);
    }
    
    previousReadyIdsRef.current = currentReadyIds;
  }, [readyOrders, soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(false);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] ${isFullscreen ? 'p-8' : 'p-6'}`}>
      <div className={`mx-auto ${isFullscreen ? 'max-w-none' : 'max-w-7xl'}`}>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center ${isFullscreen ? 'w-20 h-20' : 'w-14 h-14'}`}>
              <Coffee className={`text-white ${isFullscreen ? 'w-10 h-10' : 'w-7 h-7'}`} />
            </div>
            <div>
              <h1 className={`font-bold text-amber-500 ${isFullscreen ? 'text-5xl' : 'text-3xl'}`}>
                حالة الطلبات
              </h1>
              <p className={`text-gray-400 ${isFullscreen ? 'text-xl' : 'text-base'}`}>
                متابعة الطلبات الجارية والجاهزة
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className={`font-mono text-amber-400 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              {currentTime.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            
            <Button
              variant="outline"
              size={isFullscreen ? "lg" : "icon"}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`border-amber-500/30 ${soundEnabled ? 'text-green-400 border-green-500/50' : 'text-gray-400'}`}
              data-testid="button-toggle-sound"
              aria-label={soundEnabled ? "كتم الصوت" : "تفعيل الصوت"}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="outline"
              size={isFullscreen ? "lg" : "icon"}
              onClick={toggleFullscreen}
              className="border-amber-500/30"
              data-testid="button-toggle-fullscreen"
              aria-label={isFullscreen ? "إلغاء ملء الشاشة" : "ملء الشاشة"}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="outline"
              size={isFullscreen ? "lg" : "icon"}
              onClick={() => refetch()}
              className="border-amber-500/30"
              data-testid="button-refresh-orders"
              aria-label="تحديث الطلبات"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isFullscreen ? 'lg:grid-cols-2 gap-12' : 'lg:grid-cols-2 gap-8'}`}>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={`bg-amber-500/20 rounded-full flex items-center justify-center ${isFullscreen ? 'w-14 h-14' : 'w-10 h-10'}`}>
                <Clock className={`text-amber-400 ${isFullscreen ? 'h-7 w-7' : 'h-5 w-5'}`} />
              </div>
              <div>
                <h2 className={`font-bold text-amber-400 ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
                  جاري التحضير
                </h2>
                <p className={`text-gray-400 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                  {inProgressOrders.length} طلب
                </p>
              </div>
            </div>
            
            <div className={`grid gap-4 ${isFullscreen ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {inProgressOrders.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Loader2 className={`mx-auto mb-4 opacity-30 ${isFullscreen ? 'h-16 w-16' : 'h-12 w-12'}`} />
                  <p className={isFullscreen ? 'text-xl' : ''}>لا توجد طلبات قيد التحضير</p>
                </div>
              ) : (
                inProgressOrders.map(order => (
                  <OrderCard key={order.id} order={order} isReady={false} isFullscreen={isFullscreen} />
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={`bg-green-500/20 rounded-full flex items-center justify-center ${isFullscreen ? 'w-14 h-14' : 'w-10 h-10'}`}>
                <CheckCircle2 className={`text-green-400 ${isFullscreen ? 'h-7 w-7' : 'h-5 w-5'}`} />
              </div>
              <div>
                <h2 className={`font-bold text-green-400 ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
                  جاهز للاستلام
                </h2>
                <p className={`text-gray-400 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                  {readyOrders.length} طلب
                </p>
              </div>
            </div>
            
            <div className={`grid gap-4 ${isFullscreen ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {readyOrders.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <CheckCircle2 className={`mx-auto mb-4 opacity-30 ${isFullscreen ? 'h-16 w-16' : 'h-12 w-12'}`} />
                  <p className={isFullscreen ? 'text-xl' : ''}>لا توجد طلبات جاهزة</p>
                </div>
              ) : (
                readyOrders.map(order => (
                  <OrderCard key={order.id} order={order} isReady={true} isFullscreen={isFullscreen} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className={`mt-8 text-center ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
          <p className="text-gray-500">
            يتم تحديث الشاشة تلقائياً كل 5 ثوانٍ
          </p>
        </div>
      </div>
    </div>
  );
}
