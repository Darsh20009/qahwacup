
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, MapPin, Truck, Check, Clock, Package } from "lucide-react";
import type { Order } from "@shared/schema";

export default function OrderTrackingPage() {
 const [orderNumber, setOrderNumber] = useState("");
 const [trackingOrderNumber, setTrackingOrderNumber] = useState("");

 const { data: order, isLoading } = useQuery<Order>({
 queryKey: ["/api/orders/number", trackingOrderNumber],
 queryFn: async () => {
 if (!trackingOrderNumber) return null;
 const res = await fetch(`/api/orders/number/${trackingOrderNumber}`);
 if (!res.ok) throw new Error("Order not found");
 return res.json();
 },
 enabled: !!trackingOrderNumber,
 });

 const handleTrack = () => {
 setTrackingOrderNumber(orderNumber);
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'pending':
 case 'payment_confirmed':
 return <Clock className="w-8 h-8 text-yellow-500" />;
 case 'in_progress':
 return <Package className="w-8 h-8 text-blue-500" />;
 case 'ready':
 return <Coffee className="w-8 h-8 text-green-500" />;
 case 'out_for_delivery':
 return <Truck className="w-8 h-8 text-purple-500" />;
 case 'completed':
 return <Check className="w-8 h-8 text-green-600" />;
 default:
 return <Clock className="w-8 h-8 text-gray-500" />;
 }
 };

 const getStatusText = (status: string) => {
 const statusMap: Record<string, string> = {
 'pending': 'في الانتظار',
 'payment_confirmed': 'تم تأكيد الدفع',
 'in_progress': 'قيد التحضير',
 'ready': 'جاهز للاستلام',
 'out_for_delivery': 'في الطريق',
 'completed': 'تم التسليم',
 'cancelled': 'ملغي'
 };
 return statusMap[status] || status;
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
 <div className="max-w-4xl mx-auto">
 <div className="text-center mb-8">
 <h1 className="font-amiri text-4xl font-bold text-primary mb-2">
 تتبع طلبك
 </h1>
 <p className="text-muted-foreground">
 أد� ل رقم طلبك لتتبع حالته
 </p>
 </div>

 <Card className="mb-8">
 <CardContent className="p-6">
 <div className="flex gap-4">
 <div className="flex-1">
 <Label htmlFor="order-number">رقم الطلب</Label>
 <Input
 id="order-number"
 value={orderNumber}
 onChange={(e) => setOrderNumber(e.target.value)}
 placeholder="ORD-..."
 className="text-right"
 dir="ltr"
 />
 </div>
 <div className="flex items-end">
 <Button
 onClick={handleTrack}
 disabled={!orderNumber || isLoading}
 className="bg-primary text-primary-foreground"
 >
 {isLoading ? "جاري البحث..." : "تتبع"}
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>

 {order && (
 <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
 {/* Order Status */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 {getStatusIcon(order.status)}
 <span>{getStatusText(order.status)}</span>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground">رقم الطلب:</span>
 <span className="font-bold text-primary">{order.orderNumber}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground">المبلغ الإجمالي:</span>
 <span className="font-bold">{order.totalAmount} ريال</span>
 </div>
 {order.deliveryType && (
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground">نوع التسليم:</span>
 <span className="font-bold">
 {order.deliveryType === 'delivery' ? 'توصيل' : 'استلام من الفرع'}
 </span>
 </div>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Live Driver Location (if applicable) */}
 {order.deliveryType === 'delivery' && order.status === 'out_for_delivery' && order.driverLocation && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <MapPin className="w-6 h-6 text-primary" />
 موقع السائق
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
 {/* Map placeholder - integrate with Google Maps or similar */}
 <p className="text-muted-foreground">� ريط� الموقع</p>
 </div>
 {order.estimatedDeliveryTime && (
 <p className="mt-4 text-center text-muted-foreground">
 الوصول المتوقع: {new Date(order.estimatedDeliveryTime).toLocaleTimeString('ar-SA')}
 </p>
 )}
 </CardContent>
 </Card>
 )}

 {/* Order Items */}
 <Card>
 <CardHeader>
 <CardTitle>تفاصيل الطلب</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
 <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
 <span>{item.name || item.nameAr}</span>
 <span className="text-muted-foreground">× {item.quantity}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 )}
 </div>
 </div>
 );
}
