import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Coffee, ArrowRight, Clock, CheckCircle2, XCircle, Package } from "lucide-react";
import type { Employee, Order, OrderStatus } from "@shared/schema";

interface OrderItemData {
  coffeeItemId: string;
  quantity: number;
  price: string;
  nameAr?: string;
  unitPrice?: string;
  imageUrl?: string;
}

function generateCompletionWhatsAppLink(order: Order): string {
  const customerInfo = order.customerInfo as any;
  const customerName = customerInfo?.name || "العميل";
  const customerPhone = customerInfo?.phone || "";
  
  const message = `
مرحباً ${customerName} 👋

✅ تم تجهيز طلبك!

📝 رقم الطلب: ${order.orderNumber}

الطلب جاهز للاستلام الآن ☕

شكراً لتعاملك معنا، نتمنى أن تستمتع بقهوتك! 🌹

قهوة كوب ☕
`.trim();

  const phoneNumber = customerPhone.replace(/[^0-9]/g, '');
  const internationalPhone = phoneNumber.startsWith('966') ? phoneNumber : `966${phoneNumber.replace(/^0/, '')}`;
  
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

export default function EmployeeOrders() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الطلب",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-600">قيد الانتظار</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600">قيد التنفيذ</Badge>;
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
      case "in_progress":
        return <Package className="w-5 h-5 text-blue-500" />;
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

  const activeOrders = orders.filter(order => 
    order.status === "pending" || order.status === "in_progress"
  );
  
  const completedOrders = orders.filter(order => 
    order.status === "completed" || order.status === "cancelled"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-500">إدارة الطلبات</h1>
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

        {isLoading ? (
          <div className="text-center text-gray-400 py-12">جاري التحميل...</div>
        ) : (
          <div className="space-y-6">
            {/* Active Orders */}
            <Card className="bg-[#2d1f1a] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-500 text-right">
                  الطلبات النشطة ({activeOrders.length})
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
                      
                      return (
                        <Card key={order.id} className="bg-[#1a1410] border-amber-500/10">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(order.status)}
                                <div className="text-right">
                                  <h3 className="text-amber-500 font-bold text-lg" data-testid={`text-order-number-${order.id}`}>
                                    {order.orderNumber}
                                  </h3>
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

                            <div className="bg-[#2d1f1a] rounded-lg p-3 mb-4">
                              <p className="text-gray-400 text-sm mb-2">العناصر</p>
                              <div className="space-y-2">
                                {items.map((item, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <div className="flex-1">
                                      <p className="text-white text-sm font-medium">
                                        {item.nameAr || "مشروب"}
                                      </p>
                                      <p className="text-gray-400 text-xs">
                                        {item.quantity} × {parseFloat(item.price || item.unitPrice || "0").toFixed(2)} ر.س
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {order.customerNotes && (
                              <div className="bg-amber-900/20 rounded-lg p-3 mb-4 border border-amber-500/20">
                                <p className="text-amber-400 text-sm font-semibold mb-1">ملاحظات العميل:</p>
                                <p className="text-white text-sm" data-testid={`text-customer-notes-${order.id}`}>
                                  {order.customerNotes}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between border-t border-amber-500/20 pt-4">
                              <div className="text-right">
                                <p className="text-gray-400 text-sm">الإجمالي</p>
                                <p className="text-amber-500 font-bold text-xl" data-testid={`text-total-${order.id}`}>
                                  {parseFloat(order.totalAmount).toFixed(2)} ريال
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <Select 
                                  value={order.status} 
                                  onValueChange={(value) => updateStatusMutation.mutate({ 
                                    orderId: order.id, 
                                    status: value as OrderStatus 
                                  })}
                                >
                                  <SelectTrigger 
                                    className="w-[180px] bg-[#2d1f1a] border-amber-500/30 text-white"
                                    data-testid={`select-status-${order.id}`}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                                    <SelectItem value="completed">مكتمل</SelectItem>
                                    <SelectItem value="cancelled">ملغي</SelectItem>
                                  </SelectContent>
                                </Select>
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
                  الطلبات المكتملة ({completedOrders.length})
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
                      
                      return (
                        <div 
                          key={order.id} 
                          className="bg-[#1a1410] rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(order.status)}
                            <div className="text-right">
                              <p className="text-amber-500 font-medium">
                                {order.orderNumber}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {customerInfo?.name || "غير محدد"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-white font-medium">
                              {parseFloat(order.totalAmount).toFixed(2)} ريال
                            </p>
                            {getStatusBadge(order.status)}
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
    </div>
  );
}
