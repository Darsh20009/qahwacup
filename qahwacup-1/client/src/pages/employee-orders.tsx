import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Coffee, ArrowRight, Clock, CheckCircle2, XCircle, Package, Bell, BellRing, Filter, Search, RefreshCw, Car, Users, ChevronDown, ChevronUp, Layers, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { OrderMeta } from "@/components/OrderMeta";
import { playNotificationSound } from "@/lib/notification-sound";
import type { Employee, Order, OrderStatus } from "@shared/schema";

interface OrderItemData {
 coffeeItemId: string;
 quantity: number;
 price: string;
 nameAr?: string;
 unitPrice?: string;
 imageUrl?: string;
 coffeeItem?: {
 nameAr: string;
 price: string;
 imageUrl?: string;
 };
}

interface InventoryDeductionDetail {
  rawItemId: string;
  rawItemName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

function InventoryDeductionDisplay({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false);
  const deductionDetails = (order as any).inventoryDeductionDetails as InventoryDeductionDetail[] | null | undefined;
  const inventoryDeducted = (order as any).inventoryDeducted as number | undefined;
  const costOfGoods = (order as any).costOfGoods as number | undefined;
  
  // Guard against null/undefined deduction details
  if (!deductionDetails || !Array.isArray(deductionDetails) || deductionDetails.length === 0) {
    return null;
  }
  
  // Calculate gross profit locally for more accurate display
  const totalRevenue = Number(order.totalAmount) || 0;
  const actualCostOfGoods = costOfGoods || 0;
  const grossProfit = totalRevenue - actualCostOfGoods;

  const getDeductionStatusBadge = () => {
    switch (inventoryDeducted) {
      case 1:
        return (
          <Badge className="bg-green-600/80 text-white text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            تم الخصم بالكامل
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-yellow-600/80 text-white text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            خصم جزئي
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-600/80 text-white text-xs flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            لم يتم الخصم
          </Badge>
        );
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger asChild>
        <div 
          className="flex items-center justify-between bg-gradient-to-r from-amber-900/30 to-amber-800/20 rounded-lg p-3 cursor-pointer hover:from-amber-900/40 hover:to-amber-800/30 transition-colors"
          data-testid={`trigger-inventory-details-${order.id}`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold">تفاصيل المخزون</span>
            {getDeductionStatusBadge()}
          </div>
          <div className="flex items-center gap-3">
            {actualCostOfGoods > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <DollarSign className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">التكلفة:</span>
                <span className="text-amber-400 font-medium">{actualCostOfGoods.toFixed(2)} ر.س</span>
              </div>
            )}
            {actualCostOfGoods > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-gray-400">الربح:</span>
                <span className={`font-medium ${grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {grossProfit.toFixed(2)} ر.س
                </span>
              </div>
            )}
            {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="bg-[#1f1510] rounded-lg p-3 space-y-2 border border-amber-500/10">
          <p className="text-gray-400 text-xs mb-2">المواد الخام المخصومة من المخزون:</p>
          {deductionDetails.map((detail, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between text-sm py-1 border-b border-amber-500/10 last:border-b-0"
              data-testid={`inventory-item-${detail.rawItemId}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-300">{detail.rawItemName}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-400">
                  {detail.quantity.toFixed(2)} {detail.unit}
                </span>
                <span className="text-amber-400">
                  {detail.totalCost.toFixed(2)} ر.س
                </span>
              </div>
            </div>
          ))}
          {actualCostOfGoods > 0 && (
            <div className="pt-2 mt-2 border-t border-amber-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">إجمالي التكلفة:</span>
                <span className="text-amber-400 font-semibold">{actualCostOfGoods.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">صافي الربح:</span>
                <span className={`font-semibold ${grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {grossProfit.toFixed(2)} ر.س
                </span>
              </div>
              {totalRevenue > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">هامش الربح:</span>
                  <span className="text-purple-400 font-semibold">
                    {((grossProfit / totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function generateCompletionWhatsAppLink(order: Order): string {
 const customerInfo = order.customerInfo as any;
 const customerName = customerInfo?.name || "العميل";
 const customerPhone = customerInfo?.phone || "";
 
 const message = `
مرحباً ${customerName} 

 تم تجهيز طلبك!

 رقم الطلب: ${order.orderNumber}

الطلب جاهز للاستلام الآن

شكراً لتعاملك معنا، نتمنى أن تستمتع بقهوتك! 

قهوة كوب 
`.trim();

 const phoneNumber = customerPhone.replace(/[^0-9]/g, '');
 const internationalPhone = phoneNumber.startsWith('966') ? phoneNumber : `966${phoneNumber.replace(/^0/, '')}`;
 
 return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

export default function EmployeeOrders() {
 const [, setLocation] = useLocation();
 const [employee, setEmployee] = useState<Employee | null>(null);
 const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
 const [selectedOrderId, setSelectedOrderId] = useState<string>("");
 const [cancellationReason, setCancellationReason] = useState("");
 const [statusFilter, setStatusFilter] = useState<string>("all");
 const [searchQuery, setSearchQuery] = useState("");
 const [newOrdersCount, setNewOrdersCount] = useState(0);
 const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
 const previousOrderIdsRef = useRef<Set<string>>(new Set());
 const { toast } = useToast();

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      try {
        setEmployee(JSON.parse(storedEmployee));
      } catch (err) {
        console.error("Failed to parse employee data", err);
        setLocation("/employee/gateway");
      }
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

 const { data: regularOrders = [], isLoading, refetch } = useQuery<Order[]>({
 queryKey: ["/api/orders"],
 refetchInterval: 3000,
 enabled: !!employee,
 });

 const orders = regularOrders;

 const { data: allBranches = [] } = useQuery<any[]>({
 queryKey: ["/api/branches"],
 enabled: !!employee,
 });

 // Helper to get normalized order ID
 const getOrderId = (order: Order) => order.id?.toString() || order._id?.toString() || '';

 // Detect new orders by comparing order IDs
 useEffect(() => {
 if (orders.length > 0) {
 const currentOrderIds = new Set(orders.map(getOrderId).filter(Boolean));
 
 // Find truly new orders (IDs that weren't in previous set)
 const newOrderIds = [...currentOrderIds].filter(id => !previousOrderIdsRef.current.has(id));
 
 if (newOrderIds.length > 0 && previousOrderIdsRef.current.size > 0) {
 setNewOrdersCount(newOrderIds.length);
 
 // Play notification sound
 try {
 playNotificationSound('new-order');
 } catch (err) {
 console.log('Notification sound failed:', err);
 }
 
 // Show toast notification
 toast({
 title: "طلب جديد",
 description: `لديك ${newOrderIds.length} طلب ${newOrderIds.length === 1 ? 'جديد' : 'جديدة'}`,
 className: "bg-green-600 text-white border-green-700",
 });
 
 // Clear notification count after 5 seconds
 setTimeout(() => setNewOrdersCount(0), 5000);
 }
 
 // Update the ref with current order IDs
 previousOrderIdsRef.current = currentOrderIds;
 }
 }, [orders, toast]);

 const updateStatusMutation = useMutation({
 mutationFn: async ({ orderId, status, cancellationReason }: { orderId: string; status: OrderStatus; cancellationReason?: string }) => {
 const response = await fetch(`/api/orders/${orderId}/status`, {
 method: "PUT",
 headers: { "Content-Type": "application/json" },
 credentials: 'include',
 body: JSON.stringify({ status, cancellationReason }),
 });
 
 if (!response.ok) {
 throw new Error("Failed to update order status");
 }
 
 return response.json();
 },
 onSuccess: (updatedOrder) => {
 queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
 
 toast({
 title: "تم تحديث حالة الطلب",
 description: `الطلب ${updatedOrder.orderNumber}`,
 });

 // If order is completed, open WhatsApp
 if (updatedOrder.status === "completed") {
 const whatsappLink = generateCompletionWhatsAppLink(updatedOrder);
 window.open(whatsappLink, '_blank');
 }
 
 // Reset cancellation dialog
 setCancelDialogOpen(false);
 setSelectedOrderId("");
 setCancellationReason("");
 },
 onError: () => {
 toast({
 title: "خطأ",
 description: "فشل تحديث حالة الطلب",
 variant: "destructive",
 });
 },
 });

 const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
 if (newStatus === "cancelled") {
 setSelectedOrderId(orderId);
 setCancelDialogOpen(true);
 } else {
 updateStatusMutation.mutate({ orderId, status: newStatus });
 }
 };

 const handleCancelConfirm = () => {
 if (!cancellationReason.trim()) {
 toast({
 title: "تنبيه",
 description: "يرجى إدخال سبب الإلغاء",
 variant: "destructive",
 });
 return;
 }
 updateStatusMutation.mutate({ 
 orderId: selectedOrderId, 
 status: "cancelled",
 cancellationReason: cancellationReason.trim()
 });
 };

 const completeAllOrdersMutation = useMutation({
 mutationFn: async () => {
 const response = await fetch('/api/orders/complete-all', {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 credentials: 'include',
 });
 if (!response.ok) throw new Error('Failed to complete all orders');
 return response.json();
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
 toast({
 title: "تم بنجاح",
 description: data.message,
 className: "bg-green-600 text-white",
 });
 },
 onError: (error: Error) => {
 toast({
 title: "خطأ",
 description: error.message,
 variant: "destructive",
 });
 },
 });

 const getStatusBadge = (status: string) => {
 switch (status) {
 case "pending":
 return <Badge className="bg-yellow-600">إرسال الطلب</Badge>;
 case "payment_confirmed":
 return <Badge className="bg-orange-600">تأكيد الدفع</Badge>;
 case "in_progress":
 return <Badge className="bg-blue-600">جاري التحضير</Badge>;
 case "ready":
 return <Badge className="bg-purple-600">جاهز للاستلام</Badge>;
 case "completed":
 return <Badge className="bg-green-600">مكتمل</Badge>;
 case "cancelled":
 return <Badge className="bg-red-600">ملغي</Badge>;
 default:
 return <Badge>{status}</Badge>;
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case "pending":
 return <Clock className="w-5 h-5 text-yellow-500" />;
 case "payment_confirmed":
 return <CheckCircle2 className="w-5 h-5 text-orange-500" />;
 case "in_progress":
 return <Package className="w-5 h-5 text-blue-500" />;
 case "ready":
 return <Coffee className="w-5 h-5 text-purple-500" />;
 case "completed":
 return <CheckCircle2 className="w-5 h-5 text-green-500" />;
 case "cancelled":
 return <XCircle className="w-5 h-5 text-red-500" />;
 default:
 return <Clock className="w-5 h-5" />;
 }
 };

 const getPaymentMethodAr = (method: string) => {
 const paymentMethods: Record<string, string> = {
 cash: "نقدي",
 stc: "STC Pay",
 alinma: "Alinma Pay",
 ur: "Ur Pay",
 barq: "Barq",
 rajhi: "تحويل بنكي"
 };
 return paymentMethods[method] || method;
 };

 if (!employee) {
 return null;
 }

 // Apply filters
 const filteredOrders = orders.filter(order => {
 // Branch filter
 if (selectedBranchId && order.branchId !== selectedBranchId) {
 return false;
 }

 // Status filter
 if (statusFilter !== "all") {
 if (statusFilter === "active") {
 if (!["pending", "payment_confirmed", "in_progress", "ready"].includes(order.status)) {
 return false;
 }
 } else if (statusFilter === "completed_cancelled") {
 if (!["completed", "cancelled"].includes(order.status)) {
 return false;
 }
 } else if (order.status !== statusFilter) {
 return false;
 }
 }
 
 // Search filter
 if (searchQuery.trim()) {
 const query = searchQuery.toLowerCase();
 const customerInfo = order.customerInfo as any;
 const orderNumber = order.orderNumber.toLowerCase();
 const customerName = (customerInfo?.name || "").toLowerCase();
 const customerPhone = (customerInfo?.phone || "").toLowerCase();
 
 return orderNumber.includes(query) || 
 customerName.includes(query) || 
 customerPhone.includes(query);
 }
 
 return true;
 });

 const activeOrders = filteredOrders.filter(order => 
 order.status === "pending" || order.status === "payment_confirmed" || order.status === "in_progress" || order.status === "ready"
 );
 
 const completedOrders = filteredOrders.filter(order => 
 order.status === "completed" || order.status === "cancelled"
 );

 return (
  <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4">
   <div className="max-w-7xl mx-auto">
   <div className="space-y-4 mb-6">
   <div className="flex items-center justify-between">
   <div className="flex items-center gap-3">
   <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center relative">
   <Coffee className="w-6 h-6 text-white" />
   {newOrdersCount > 0 && (
   <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center animate-bounce">
   <span className="text-white text-xs font-bold">{newOrdersCount}</span>
   </div>
   )}
   </div>
   <div>
   <h1 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
   إدارة الطلبات
   {newOrdersCount > 0 && <BellRing className="w-5 h-5 text-red-500 animate-pulse" />}
   </h1>
   <p className="text-gray-400 text-sm">الموظف: {employee.fullName}</p>
   </div>
   </div>
   <div className="flex gap-2">
   <Button
   variant="outline"
   onClick={() => refetch()}
   className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
   data-testid="button-refresh"
   >
   <RefreshCw className="w-4 h-4 ml-2" />
   تحديث
   </Button>
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

   {/* Branch Filter and Complete All Orders Button */}
   <div className="flex flex-wrap items-center gap-3 text-[#f59e0b]">
   <Label className="font-semibold">تصفية حسب الفرع:</Label>
   <Select value={selectedBranchId || "all"} onValueChange={(value) => setSelectedBranchId(value === "all" ? null : value)}>
   <SelectTrigger className="w-56" data-testid="select-branch-filter">
   <SelectValue placeholder="اختر فرع" />
   </SelectTrigger>
   <SelectContent>
   <SelectItem value="all">جميع الفروع</SelectItem>
   {allBranches.map((branch) => (
   <SelectItem key={branch._id} value={branch._id}>
   {branch.nameAr}
   </SelectItem>
   ))}
   </SelectContent>
   </Select>

   <Button 
   onClick={() => {
   if (confirm('هل تريد حقاً جعل جميع الطلبات مكتملة؟')) {
   completeAllOrdersMutation.mutate();
   }
   }}
   disabled={completeAllOrdersMutation.isPending}
   className="bg-emerald-600 hover:bg-emerald-700 text-white"
   data-testid="button-complete-all-orders"
   >
   {completeAllOrdersMutation.isPending ? 'جاري المعالجة...' : 'جعل جميع الطلبات مكتملة'}
   </Button>
   </div>

   {/* Filters */}
   <Card className="bg-[#2d1f1a] border-amber-500/20">
   <CardContent className="p-4">
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
   <div className="relative">
   <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
   <Input
   placeholder="بحث برقم الطلب، اسم العميل، أو رقم الجوال..."
   value={searchQuery}
   onChange={(e) => setSearchQuery(e.target.value)}
   className="bg-[#1a1410] border-amber-500/30 text-white pr-10 text-right"
   dir="rtl"
   data-testid="input-search"
   />
   </div>
   
   <div className="flex items-center gap-2">
   <Filter className="text-amber-500 w-5 h-5" />
   <Select value={statusFilter} onValueChange={setStatusFilter}>
   <SelectTrigger className="bg-[#1a1410] border-amber-500/30 text-white" data-testid="select-filter">
   <SelectValue placeholder="فلترة حسب الحالة" />
   </SelectTrigger>
   <SelectContent>
   <SelectItem value="all">جميع الطلبات</SelectItem>
   <SelectItem value="active">الطلبات النشطة</SelectItem>
   <SelectItem value="pending">في الانتظار</SelectItem>
   <SelectItem value="payment_confirmed">تم تأكيد الدفع</SelectItem>
   <SelectItem value="in_progress">قيد التحضير</SelectItem>
   <SelectItem value="ready">جاهز للاستلام</SelectItem>
   <SelectItem value="completed_cancelled">المكتملة والملغاة</SelectItem>
   <SelectItem value="completed">مكتملة</SelectItem>
   <SelectItem value="cancelled">ملغاة</SelectItem>
   </SelectContent>
   </Select>
   </div>
   </div>
   
   {/* Stats Summary */}
   <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
   <div className="bg-[#1a1410] rounded-lg p-2 text-center">
   <p className="text-amber-500 text-lg font-bold">{filteredOrders.length}</p>
   <p className="text-gray-400 text-xs">إجمالي</p>
   </div>
   <div className="bg-[#1a1410] rounded-lg p-2 text-center">
   <p className="text-yellow-500 text-lg font-bold">{filteredOrders.filter(o => o.status === "pending").length}</p>
   <p className="text-gray-400 text-xs">جديد</p>
   </div>
   <div className="bg-[#1a1410] rounded-lg p-2 text-center">
   <p className="text-blue-500 text-lg font-bold">{filteredOrders.filter(o => o.status === "in_progress").length}</p>
   <p className="text-gray-400 text-xs">قيد التحضير</p>
   </div>
   <div className="bg-[#1a1410] rounded-lg p-2 text-center">
   <p className="text-purple-500 text-lg font-bold">{filteredOrders.filter(o => o.status === "ready").length}</p>
   <p className="text-gray-400 text-xs">جاهز</p>
   </div>
   </div>
   </CardContent>
   </Card>
   </div>

   {isLoading ? (
   <div className="text-center text-gray-400 py-12">جاري التحميل...</div>
   ) : (
   <div className="space-y-6">
   {/* Active Orders */}
   <Card className="bg-[#2d1f1a] border-amber-500/20">
   <CardHeader>
   <CardTitle className="text-amber-500 text-right">
   الطلبات النشطة({activeOrders.length})
   </CardTitle>
   </CardHeader>
   <CardContent>
   {activeOrders.length === 0 ? (
   <div className="text-center text-gray-400 py-8">
   لا توجد طلبات نشطة
   </div>
   ) : (
   <div className="space-y-4">
   {activeOrders.map((order) => {
   const customerInfo = order.customerInfo as any;
   const items = (order.items as OrderItemData[]) || [];
   const branch = allBranches.find(b => b._id === order.branchId);
   
   return (
   <Card key={order.id} className="bg-[#1a1410] border-amber-500/10">
   <CardContent className="p-4">
   {branch && (
   <p className="text-xs bg-gradient-to-r from-amber-600 to-amber-700 text-white px-2 py-1 rounded mb-3 inline-block">
   {branch.nameAr}
   </p>
   )}
   <div className="flex items-start justify-between mb-4">
   <div className="flex items-center gap-3">
   {getStatusIcon(order.status)}
   <div className="text-right flex-1">
   <div className="flex items-center gap-2 mb-1">
   <h3 className="text-amber-500 font-bold text-lg" data-testid={`text-order-number-${order.id}`}>
   {order.orderNumber}
   </h3>
   {(order as any).tableNumber && (
   <Badge className="bg-blue-600 text-xs flex items-center gap-1">
   <Users className="w-3 h-3" />
   طاولة {(order as any).tableNumber}
   </Badge>
   )}
   </div>
   <p className="text-gray-400 text-sm">
   {new Date(order.createdAt).toLocaleString('ar-SA')}
   </p>
   </div>
   </div>
   {getStatusBadge(order.status)}
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
   <div className="text-right">
   <div className="flex items-center gap-2 mb-1">
   <p className="text-gray-400 text-sm">العميل</p>
   {order.customerId && (
   <Badge className="bg-green-600/80 text-xs">عضو مسجل</Badge>
   )}
   </div>
   <p className="text-white font-medium" data-testid={`text-customer-name-${order.id}`}>
   {customerInfo?.name || "غير محدد"}
   </p>
   <p className="text-gray-400 text-sm">
   {customerInfo?.phone || ""}
   </p>
   </div>
   
   <div className="text-right">
   <p className="text-gray-400 text-sm mb-1">الدفع</p>
   <p className="text-white font-medium">
   {getPaymentMethodAr(order.paymentMethod)}
   </p>
   </div>
   </div>

   
   <OrderMeta
   orderId={order.id}
   deliveryType={order.deliveryType}
   paymentReceiptUrl={order.paymentReceiptUrl}
   deliveryAddress={order.deliveryAddress as any}
   branchId={order.branchId}
   tableNumber={(order as any).tableNumber}
   arrivalTime={(order as any).arrivalTime || (order as any).customerInfo?.arrivalTime}
   />

   <div className="bg-[#2d1f1a] rounded-lg p-3 mb-4">
   <p className="text-gray-400 text-sm mb-2">العناصر ({items.length})</p>
   <div className="space-y-2">
   {items.map((item, index) => {
   // Get the coffee item name from the coffeeItem object if available
   const itemName = item.coffeeItem?.nameAr || item.nameAr || "مشروب";
   const itemPrice = item.price || item.unitPrice || item.coffeeItem?.price || "0";
   
   return (
   <div key={index} className="flex items-start gap-2">
   <span className="text-amber-400">•</span>
   <div className="flex-1">
   <p className="text-white text-sm font-medium">
   {itemName}
   </p>
   <p className="text-gray-400 text-xs">
   الكمية : {item.quantity} × {parseFloat(itemPrice).toFixed(2)} ر.س = {(item.quantity * parseFloat(itemPrice)).toFixed(2)} ر.س
   </p>
   </div>
   </div>
   );
   })}
   </div>
   </div>

   {/* Inventory Deduction Details */}
   <InventoryDeductionDisplay order={order} />

   {order.customerNotes && (
   <div className="bg-amber-900/20 rounded-lg p-3 mb-4 border border-amber-500/20">
   <p className="text-amber-400 text-sm font-semibold mb-1">ملاحظات العميل:</p>
   <p className="text-white text-sm" data-testid={`text-customer-notes-${order.id}`}>
   {order.customerNotes}
   </p>
   </div>
   )}

   {/* Car Pickup Info */}
   {order.status === 'ready' && order.carPickup && (
   <div className="bg-purple-900/20 rounded-lg p-3 mb-4 border border-purple-500/20">
   <div className="flex items-start gap-2">
   <Car className="w-5 h-5 text-purple-400 mt-0.5" />
   <div className="flex-1">
   <p className="text-purple-400 text-sm font-semibold mb-2">معلومات السيارة- استلام من المركبة</p>
   <div className="space-y-1">
   <p className="text-white text-sm">
   <span className="text-gray-400">النوع:</span> {order.carPickup.carType}
   </p>
   <p className="text-white text-sm">
   <span className="text-gray-400">اللون:</span> {order.carPickup.carColor}
   </p>
   </div>
   <p className="text-xs text-purple-300 mt-2">يرجى توصيل الطلب للعميل في السيارة</p>
   </div>
   </div>
   </div>
   )}

   <div className="flex items-center justify-between border-t border-amber-500/20 pt-4">
   <div className="text-right">
   <p className="text-gray-400 text-sm">الإجمالي</p>
   <p className="text-amber-500 font-bold text-xl" data-testid={`text-total-${order.id}`}>
   {Number(order.totalAmount).toFixed(2)} ريال
   </p>
   </div>

   <div className="flex flex-col gap-2">
   {(order as any).tableNumber ? (
   <div className="flex gap-2 flex-wrap">
   <Button
   variant="outline"
   size="sm"
   className="bg-green-600 hover:bg-green-700 text-white border-green-700"
   data-testid={`button-accept-table-${order.id}`}
   >
   ✓ قبول
   </Button>
   <Button
   variant="outline"
   size="sm"
   className="bg-red-600 hover:bg-red-700 text-white border-red-700"
   onClick={() => {
   if (confirm(`هل أنت متأكد من رفض طلب الطاولة؟`)) {
   }
   }}
   data-testid={`button-reject-table-${order.id}`}
   >
   ✕ رفض
   </Button>
   <Button
   variant="outline"
   size="sm"
   className="bg-blue-600 hover:bg-blue-700 text-white border-blue-700"
   onClick={() => setLocation("/employee/table-orders")}
   data-testid={`button-manage-tables-${order.id}`}
   >
   إدارة الطاولات
   </Button>
   </div>
   ) : (
   <>
   <Select 
   value={order.status} 
   onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
   >
   <SelectTrigger 
   className="w-[180px] bg-[#2d1f1a] border-amber-500/30 text-white"
   data-testid={`select-status-${order.id}`}
   >
   <SelectValue />
   </SelectTrigger>
   <SelectContent>
   <SelectItem value="pending">إرسال الطلب</SelectItem>
   <SelectItem value="payment_confirmed">تأكيد الدفع</SelectItem>
   <SelectItem value="in_progress">جاري التحضير</SelectItem>
   <SelectItem value="ready">جاهز للاستلام</SelectItem>
   <SelectItem value="completed">مكتمل</SelectItem>
   <SelectItem value="cancelled">ملغي</SelectItem>
   </SelectContent>
   </Select>
   {order.status === "pending" && (
   <div className="flex gap-2">
   <Button
   variant="outline"
   size="sm"
   className="bg-green-600 hover:bg-green-700 text-white border-green-700"
   onClick={() => handleStatusChange(order.id, "payment_confirmed")}
   data-testid={`button-accept-${order.id}`}
   >
   ✓ قبول
   </Button>
   <Button
   variant="outline"
   size="sm"
   className="bg-red-600 hover:bg-red-700 text-white border-red-700"
   onClick={() => {
   if (confirm(`هل أنت متأكد من رفض هذا الطلب؟`)) {
   handleStatusChange(order.id, "cancelled");
   }
   }}
   data-testid={`button-reject-${order.id}`}
   >
   ✕ رفض
   </Button>
   </div>
   )}
   </>
   )}
   </div>
   </div>
   </CardContent>
   </Card>
   );
   })}
   </div>
   )}
   </CardContent>
   </Card>

   {/* Completed Orders */}
   <Card className="bg-[#2d1f1a] border-amber-500/20">
   <CardHeader>
   <CardTitle className="text-gray-400 text-right">
   الطلبات المكتملة({completedOrders.length})
   </CardTitle>
   </CardHeader>
   <CardContent>
   {completedOrders.length === 0 ? (
   <div className="text-center text-gray-400 py-8">
   لا توجد طلبات مكتملة
   </div>
   ) : (
   <div className="space-y-3">
   {completedOrders.slice(0, 10).map((order) => {
   const customerInfo = order.customerInfo as any;
   const items = (order.items as OrderItemData[]) || [];
   const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
   const branch = allBranches.find(b => b._id === order.branchId);
   
   return (
   <div key={order.id}>
   {branch && (
   <p className="text-xs bg-gradient-to-r from-amber-600 to-amber-700 text-white px-2 py-1 rounded mb-2 inline-block">
   {branch.nameAr}
   </p>
   )}
   <div className="bg-[#1a1410] rounded-lg p-3 flex items-center justify-between">
   <div className="flex items-center gap-3">
   {getStatusIcon(order.status)}
   <div className="text-right">
   <p className="text-amber-500 font-medium">
   {order.orderNumber}
   </p>
   <p className="text-gray-400 text-xs">
   {customerInfo?.name || "غير محدد"} • {itemsCount} عنصر
   </p>
   </div>
   </div>
   <div className="flex items-center gap-3">
   <p className="text-white font-medium">
   {Number(order.totalAmount).toFixed(2)} ريال
   </p>
   {getStatusBadge(order.status)}
   </div>
   </div>
   </div>
   );
   })}
   </div>
   )}
   </CardContent>
   </Card>
   </div>
   )}
   </div>
   {/* Cancellation Reason Dialog */}
   <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
   <DialogContent className="bg-[#2d1f1a] border-amber-500/30 text-white">
   <DialogHeader>
   <DialogTitle className="text-amber-500 text-right">سبب إلغاء الطلب</DialogTitle>
   </DialogHeader>
   <div className="py-4">
   <Textarea
   placeholder="يرجى إدخال سبب إلغاء الطلب..."
   value={cancellationReason}
   onChange={(e) => setCancellationReason(e.target.value)}
   className="bg-[#1a1410] border-amber-500/30 text-white text-right min-h-[100px]"
   dir="rtl"
   />
   </div>
   <DialogFooter className="flex gap-2">
   <Button
   variant="outline"
   onClick={() => {
   setCancelDialogOpen(false);
   setCancellationReason("");
   }}
   className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
   >
   إلغاء
   </Button>
   <Button
   onClick={handleCancelConfirm}
   className="bg-red-600 hover:bg-red-700 text-white"
   >
   تأكيد الإلغاء
   </Button>
   </DialogFooter>
   </DialogContent>
   </Dialog>
  </div>
 );
}
