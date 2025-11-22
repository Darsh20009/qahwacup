import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle, ChefHat, Truck, XCircle, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Employee {
  _id: string;
  username: string;
  fullName: string;
  role: string;
}

interface IOrder {
  _id: string;
  orderNumber: string;
  items: any[];
  totalAmount: number;
  status: string;
  tableStatus?: string;
  tableNumber?: string;
  assignedCashierId?: string;
  customerInfo?: {
    name: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function CashierTableOrders() {
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

  // Fetch unassigned orders
  const { data: unassignedOrders } = useQuery<IOrder[]>({
    queryKey: ["/api/orders/table/unassigned"],
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Fetch cashier's assigned orders
  const { data: myOrders } = useQuery<IOrder[]>({
    queryKey: ["/api/cashier", employee?._id, "orders"],
    enabled: !!employee?._id,
    queryFn: async () => {
      const response = await fetch(`/api/cashier/${employee?._id}/orders`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Assign order to cashier mutation
  const assignOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/orders/${orderId}/assign-cashier`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cashierId: employee?._id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/table/unassigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cashier", employee?._id, "orders"] });
      toast({
        title: "تم استلام الطلب",
        description: "تم استلام الطلب بنجاح",
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

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/table-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableStatus: status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cashier", employee?._id, "orders"] });
      toast({
        title: "تم تحديث حالة الطلب",
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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">في الانتظار ⏳</Badge>;
      case "payment_confirmed":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">تم تأكيد الدفع ✅</Badge>;
      case "preparing":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">جاري التحضير ☕</Badge>;
      case "delivering_to_table":
        return <Badge className="bg-purple-500 hover:bg-purple-600 text-white">جاري التوصيل 🚶</Badge>;
      case "delivered":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">تم التوصيل 🎉</Badge>;
      case "cancelled":
        return <Badge className="bg-red-600 hover:bg-red-700 text-white">ملغي ❌</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "payment_confirmed":
        return CheckCircle;
      case "preparing":
        return ChefHat;
      case "delivering_to_table":
        return Truck;
      case "delivered":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">إدارة طلبات الطاولات</h1>
            <p className="text-muted-foreground">
              مرحباً {employee?.fullName}
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/employee/dashboard")}>
            العودة للوحة التحكم
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              طلبات جديدة ({unassignedOrders?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="my-orders">
              طلباتي ({myOrders?.filter(o => o.tableStatus !== 'delivered' && o.tableStatus !== 'cancelled').length || 0})
            </TabsTrigger>
            <TabsTrigger value="tables">
              إدارة الطاولات
            </TabsTrigger>
          </TabsList>

          {/* Unassigned Orders */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>الطلبات الجديدة</CardTitle>
              </CardHeader>
              <CardContent>
                {!unassignedOrders || unassignedOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات جديدة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {unassignedOrders.map((order) => {
                      const StatusIcon = getStatusIcon(order.tableStatus);
                      return (
                        <Card key={order._id} className="border-2">
                          <CardContent className="p-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <StatusIcon className="w-5 h-5" />
                                  <h3 className="font-bold text-lg">
                                    طاولة {order.tableNumber}
                                  </h3>
                                  {getStatusBadge(order.tableStatus)}
                                </div>
                                {order.customerInfo && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="w-4 h-4" />
                                    <span>{order.customerInfo.name}</span>
                                  </div>
                                )}
                                <div className="text-sm">
                                  <span className="font-medium">العناصر:</span>{" "}
                                  {order.items.map((item: any) => `${item.nameAr} (${item.quantity})`).join(", ")}
                                </div>
                                <div className="font-bold text-lg">
                                  {order.totalAmount.toFixed(2)} ر.س
                                </div>
                              </div>
                              <Button
                                onClick={() => assignOrderMutation.mutate(order._id)}
                                disabled={assignOrderMutation.isPending}
                                data-testid={`button-accept-${order._id}`}
                              >
                                استلام الطلب
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Orders */}
          <TabsContent value="my-orders">
            <Card>
              <CardHeader>
                <CardTitle>طلباتي</CardTitle>
              </CardHeader>
              <CardContent>
                {!myOrders || myOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات مستلمة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => {
                      const StatusIcon = getStatusIcon(order.tableStatus);
                      return (
                        <Card key={order._id} className="border-2">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <StatusIcon className="w-5 h-5" />
                                    <h3 className="font-bold text-lg">
                                      طاولة {order.tableNumber}
                                    </h3>
                                    {getStatusBadge(order.tableStatus)}
                                  </div>
                                  {order.customerInfo && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <User className="w-4 h-4" />
                                      <span>{order.customerInfo.name}</span>
                                    </div>
                                  )}
                                  <div className="text-sm">
                                    <span className="font-medium">العناصر:</span>{" "}
                                    {order.items.map((item: any) => `${item.nameAr} (${item.quantity})`).join(", ")}
                                  </div>
                                  <div className="font-bold text-lg">
                                    {order.totalAmount.toFixed(2)} ر.س
                                  </div>
                                </div>
                              </div>

                              {/* Status Controls */}
                              {order.tableStatus !== "delivered" && order.tableStatus !== "cancelled" && (
                                <div className="border-t pt-4">
                                  <Label className="text-sm mb-2 block">تحديث حالة الطلب:</Label>
                                  <Select
                                    value={order.tableStatus}
                                    onValueChange={(value) =>
                                      updateStatusMutation.mutate({
                                        orderId: order._id,
                                        status: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger data-testid={`select-status-${order._id}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">في الانتظار</SelectItem>
                                      <SelectItem value="payment_confirmed">
                                        تم تأكيد الدفع
                                      </SelectItem>
                                      <SelectItem value="preparing">جاري التحضير</SelectItem>
                                      <SelectItem value="delivering_to_table">
                                        جاري التوصيل للطاولة
                                      </SelectItem>
                                      <SelectItem value="delivered">تم التوصيل</SelectItem>
                                      <SelectItem value="cancelled">إلغاء</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tables Management */}
          <TabsContent value="tables">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الطاولات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    لإدارة الطاولات، يرجى الذهاب إلى لوحة تحكم المدير
                  </p>
                  <Button onClick={() => setLocation("/manager/tables")}>
                    الذهاب إلى إدارة الطاولات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
