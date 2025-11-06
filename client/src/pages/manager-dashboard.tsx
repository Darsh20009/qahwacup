import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, Users, ShoppingBag, TrendingUp, DollarSign, 
  Package, MapPin, Layers, ArrowLeft, Calendar,
  UserCheck, Receipt, BarChart3
} from "lucide-react";
import type { Employee, Order, Customer } from "@shared/schema";

interface EmployeeWithStats extends Employee {
  orderCount?: number;
  totalSales?: number;
}

export default function ManagerDashboard() {
  const [, setLocation] = useLocation();
  const [manager, setManager] = useState<Employee | null>(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      if (emp.role !== "manager") {
        setLocation("/employee/dashboard");
        return;
      }
      setManager(emp);
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["/api/branches"],
  });

  const handleLogout = () => {
    localStorage.removeItem("currentEmployee");
    setLocation("/employee/gateway");
  };

  if (!manager) {
    return null;
  }

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  const employeesWithStats: EmployeeWithStats[] = employees.map(emp => {
    const empOrders = orders.filter(o => o.employeeId === emp._id?.toString());
    return {
      ...emp,
      orderCount: empOrders.length,
      totalSales: empOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-500">لوحة تحكم المدير</h1>
              <p className="text-gray-400 text-sm">مرحباً، {manager.fullName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation("/employee/dashboard")}
              className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              رجوع
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              data-testid="button-logout"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                إجمالي العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{customers.length}</div>
              <p className="text-xs text-gray-500 mt-1">عميل مسجل</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                إجمالي الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{orders.length}</div>
              <p className="text-xs text-gray-500 mt-1">طلب كلي</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                إجمالي المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                مبيعات اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{todayRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">{todayOrders.length} طلب اليوم</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-stone-800/50">
            <TabsTrigger value="customers" data-testid="tab-customers">
              <Users className="w-4 h-4 ml-2" />
              العملاء
            </TabsTrigger>
            <TabsTrigger value="employees" data-testid="tab-employees">
              <UserCheck className="w-4 h-4 ml-2" />
              الموظفين
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Receipt className="w-4 h-4 ml-2" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="branches" data-testid="tab-branches">
              <MapPin className="w-4 h-4 ml-2" />
              الفروع
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <BarChart3 className="w-4 h-4 ml-2" />
              التقارير
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-4">
            <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-500">قائمة العملاء المسجلين</CardTitle>
                <CardDescription className="text-gray-400">
                  جميع العملاء الذين لديهم حسابات في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا يوجد عملاء مسجلين</p>
                  ) : (
                    customers.map((customer: any) => (
                      <div
                        key={customer._id}
                        className="flex items-center justify-between p-4 bg-stone-800/30 rounded-lg border border-amber-500/10 hover:border-amber-500/30 transition-colors"
                        data-testid={`customer-${customer._id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-200">{customer.name}</h3>
                              <p className="text-sm text-gray-400">{customer.phone}</p>
                              {customer.email && (
                                <p className="text-xs text-gray-500">{customer.email}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400">
                            عميل
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            منذ {new Date(customer.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-500">الموظفين وأداءهم</CardTitle>
                <CardDescription className="text-gray-400">
                  تفاصيل الموظفين مع إحصائيات المبيعات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employeesWithStats.map((emp) => (
                    <div
                      key={emp._id}
                      className="flex items-center justify-between p-4 bg-stone-800/30 rounded-lg border border-amber-500/10 hover:border-amber-500/30 transition-colors"
                      data-testid={`employee-${emp._id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {emp.imageUrl ? (
                            <img 
                              src={emp.imageUrl} 
                              alt={emp.fullName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
                              <UserCheck className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-200">{emp.fullName}</h3>
                            <p className="text-sm text-gray-400">{emp.jobTitle} - {emp.role === 'manager' ? 'مدير' : 'كاشير'}</p>
                            <p className="text-xs text-gray-500">{emp.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-left space-y-1">
                        <Badge variant="outline" className={emp.role === 'manager' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}>
                          {emp.role === 'manager' ? 'مدير' : 'كاشير'}
                        </Badge>
                        <div className="text-sm text-gray-400">
                          <p>{emp.orderCount || 0} طلب</p>
                          <p className="text-amber-400 font-semibold">{(emp.totalSales || 0).toFixed(2)} ر.س</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-500">جميع الطلبات</CardTitle>
                <CardDescription className="text-gray-400">
                  عرض تفاصيل الطلبات مع معلومات الموظف وطريقة الدفع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {orders.slice().reverse().map((order: any) => {
                    const employee = employees.find(e => e._id === order.employeeId);
                    const statusColors = {
                      'pending': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
                      'payment_confirmed': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                      'in_progress': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                      'ready': 'bg-green-500/10 border-green-500/30 text-green-400',
                      'completed': 'bg-green-600/10 border-green-600/30 text-green-500',
                      'cancelled': 'bg-red-500/10 border-red-500/30 text-red-400',
                    };

                    return (
                      <div
                        key={order._id}
                        className="p-4 bg-stone-800/30 rounded-lg border border-amber-500/10"
                        data-testid={`order-${order._id}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-amber-400">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(order.createdAt).toLocaleString('ar-SA')}
                            </p>
                            {order.tableNumber && (
                              <p className="text-sm text-blue-400">طاولة رقم: {order.tableNumber}</p>
                            )}
                          </div>
                          <Badge variant="outline" className={statusColors[order.status as keyof typeof statusColors] || statusColors.pending}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-400">
                            <span>العميل:</span>
                            <span className="text-gray-200">{order.customerInfo?.name || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>طريقة الدفع:</span>
                            <span className="text-gray-200">{order.paymentMethod === 'cash' ? 'نقدي' : order.paymentMethod}</span>
                          </div>
                          {employee && (
                            <div className="flex justify-between text-gray-400">
                              <span>الكاشير:</span>
                              <span className="text-gray-200">{employee.fullName}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-gray-400 pt-2 border-t border-gray-700">
                            <span>الإجمالي:</span>
                            <span className="text-amber-400 font-bold">{Number(order.totalAmount).toFixed(2)} ر.س</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branches" className="space-y-4">
            <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-amber-500">الفروع</CardTitle>
                    <CardDescription className="text-gray-400">
                      إدارة فروع المقهى
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                    data-testid="button-add-branch"
                  >
                    <Package className="w-4 h-4 ml-2" />
                    إضافة فرع
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {branches.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد فروع مسجلة</p>
                  ) : (
                    branches.map((branch: any) => (
                      <div
                        key={branch._id}
                        className="p-4 bg-stone-800/30 rounded-lg border border-amber-500/10"
                        data-testid={`branch-${branch._id}`}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-8 h-8 text-amber-500" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-200">{branch.nameAr}</h3>
                            <p className="text-sm text-gray-400">{branch.address}, {branch.city}</p>
                            <p className="text-sm text-gray-500">{branch.phone}</p>
                          </div>
                          <Badge variant="outline" className={branch.isActive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}>
                            {branch.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-500">التقارير والإحصائيات</CardTitle>
                <CardDescription className="text-gray-400">
                  تقارير المبيعات والأداء
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-stone-800/30 border-amber-500/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-200">المبيعات الشهرية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-amber-400">
                        {totalRevenue.toFixed(2)} ر.س
                      </div>
                      <p className="text-sm text-gray-500 mt-2">إجمالي المبيعات لجميع الأشهر</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-stone-800/30 border-amber-500/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-200">متوسط قيمة الطلب</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-400">
                        {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'} ر.س
                      </div>
                      <p className="text-sm text-gray-500 mt-2">متوسط قيمة كل طلب</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <h4 className="font-semibold text-amber-400 mb-3">طرق الدفع الأكثر استخداماً</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      orders.reduce((acc, order) => {
                        acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([method, count]) => (
                      <div key={method} className="flex justify-between items-center">
                        <span className="text-gray-300">{method === 'cash' ? 'نقدي' : method}</span>
                        <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400">
                          {count} طلب
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
