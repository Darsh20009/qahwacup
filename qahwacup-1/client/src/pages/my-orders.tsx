import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import OrderTracker from "@/components/order-tracker";
import { ReceiptInvoice } from "@/components/receipt-invoice";
import { CarPickupForm } from "@/components/car-pickup-form";
import type { Order as OrderType } from "@shared/schema";
import { useCustomer } from "@/contexts/CustomerContext";

interface OrderDisplay extends OrderType {
 items: any[];
}

export default function MyOrders() {
 const [, setLocation] = useLocation();
 const { customer } = useCustomer();
 const customerId = customer?._id || customer?.id;

 const { data: orders = [], isLoading, refetch } = useQuery<OrderDisplay[]>({
 queryKey: ["/api/customers", customerId, "orders"],
 enabled: !!customerId,
 refetchInterval: 5000, // Refresh every 5 seconds to show status updates
 });

 return (
 <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 overflow-hidden relative" data-testid="page-my-orders">
 <div className="absolute inset-0 pointer-events-none">
 <div className="absolute top-20 left-20 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl animate-pulse"></div>
 <div className="absolute bottom-32 right-16 w-32 h-32 bg-orange-300/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
 <div className="absolute top-1/2 left-10 w-28 h-28 bg-amber-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
 </div>

 <div className="max-w-4xl mx-auto p-4 relative z-10">
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center justify-between mb-6"
 >
 <Button
 variant="ghost"
 onClick={() => setLocation("/menu")}
 className="text-amber-800 hover:text-amber-900 hover:bg-amber-100/50 backdrop-blur-sm"
 data-testid="button-back"
 >
 <ArrowRight className="ml-2 h-5 w-5" />
 العودةللقائمة 
 </Button>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5 }}
 className="text-center mb-8"
 >
 <h1 className="text-4xl font-amiri font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">
 طلباتي
 </h1>
 <p className="text-amber-700 font-cairo">
 تتبع طلباتك السابقةوالحالية 
 </p>
 </motion.div>

 {!customerId ? (
 <Card className="p-8 bg-white/90 backdrop-blur-lg shadow-2xl border-2 border-amber-200/50 text-center">
 <Coffee className="h-16 w-16 text-amber-600 mx-auto mb-4" />
 <h2 className="text-2xl font-amiri font-bold text-amber-900 mb-3">
 لا توجد طلبات بعد
 </h2>
 <p className="text-amber-700 font-cairo mb-6">
 قم بتسجيل الدخول أو إنشاء طلب جديد لعرض طلباتك
 </p>
 <Button
 onClick={() => setLocation("/menu")}
 className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-cairo"
 >
 تصفح القائمة
 </Button>
 </Card>
 ) : isLoading ? (
 <div className="flex items-center justify-center py-20">
 <div className="flex space-x-2 space-x-reverse">
 <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
 <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
 <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
 </div>
 </div>
 ) : orders.length === 0 ? (
 <Card className="p-8 bg-white/90 backdrop-blur-lg shadow-2xl border-2 border-amber-200/50 text-center">
 <Coffee className="h-16 w-16 text-amber-600 mx-auto mb-4" />
 <h2 className="text-2xl font-amiri font-bold text-amber-900 mb-3">
 لا توجد طلبات بعد
 </h2>
 <p className="text-amber-700 font-cairo mb-6">
 ابدأ طلبك الأول واستمتع بأفضل القهوة !
 </p>
 <Button
 onClick={() => setLocation("/menu")}
 className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-cairo"
 >
 تصفح القائمة
 </Button>
 </Card>
 ) : (
 <div className="space-y-6">
 {orders.map((order: OrderDisplay, index: number) => (
 <motion.div
 key={order.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 >
 <div className="space-y-4">
 {/* Order Details Card */}
 <Card className="p-6 bg-white/90 backdrop-blur-lg shadow-lg border-2 border-amber-200/50">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <Coffee className="h-5 w-5 text-amber-600" />
 <h3 className="text-lg font-cairo font-bold text-amber-900">
 طلب #{order.orderNumber}
 </h3>
 </div>
 <p className="text-sm text-amber-700 font-cairo">
 {new Date(order.createdAt).toLocaleDateString('ar-SA', {
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })}
 </p>
 </div>
 <div className="text-left">
 <span className="text-2xl font-bold text-amber-900 font-cairo">
 {Number(order.totalAmount).toFixed(2)} ريال
 </span>
 </div>
 </div>

 <div className="space-y-2">
 {(order.items || []).map((item: any, i: number) => (
 <div key={i} className="flex justify-between text-sm bg-amber-50 p-2 rounded-lg">
 <span className="text-amber-800 font-cairo">
 {item.nameAr || item.name} × {item.quantity}
 </span>
 <span className="text-amber-900 font-bold">
 {(parseFloat(item.price) * item.quantity).toFixed(2)} ريال
 </span>
 </div>
 ))}
 </div>
 </Card>

 {/* Order Tracker */}
 <OrderTracker order={order} />

 {/* Car Pickup Form - Show when order is ready */}
 {order.status === 'ready' && (
 <CarPickupForm order={order} customer={customer} />
 )}

 {/* PDF Invoice Button */}
 {(order.status === 'ready' || order.status === 'completed') && (
 <ReceiptInvoice order={order} />
 )}

 {order.customerNotes && (
 <div className="bg-amber-900/20 rounded-lg p-3 mb-4 border border-amber-500/20">
 <p className="text-amber-400 text-sm font-semibold mb-1">ملاحظات العميل:</p>
 <p className="text-white text-sm" data-testid={`text-customer-notes-${order.id}`}>
 {order.customerNotes}
 </p>
 </div>
 )}

 {order.status === 'cancelled' && (order as any).cancellationReason && (
 <div className="bg-red-900/20 rounded-lg p-3 mb-4 border border-red-500/20">
 <p className="text-red-400 text-sm font-semibold mb-1">سبب الإلغاء:</p>
 <p className="text-white text-sm">
 {(order as any).cancellationReason}
 </p>
 </div>
 )}
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}