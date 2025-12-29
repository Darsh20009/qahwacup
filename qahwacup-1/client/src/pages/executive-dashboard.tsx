import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/states";
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, 
  Coffee, Package, BarChart3, Calendar, ArrowUpRight, ArrowDownRight,
  Wallet, CreditCard, Building2, ChefHat, Settings, LogOut,
  FileText, PieChart, Activity, Target, Award, Sparkles
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line
} from "recharts";
import type { Employee, Order } from "@shared/schema";

export default function ExecutiveDashboard() {
  const [, setLocation] = useLocation();
  const [manager, setManager] = useState<Employee | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "year">("month");

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      if (emp.role !== "manager" && emp.role !== "admin" && emp.role !== "owner") {
        setLocation("/employee/dashboard");
        return;
      }
      setManager(emp);
    } else {
      setLocation("/manager/login");
    }
  }, [setLocation]);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!manager,
    refetchInterval: 30000,
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    enabled: !!manager,
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ["/api/branches"],
    enabled: !!manager,
  });

  if (!manager) {
    return <LoadingState message="جاري التحميل..." />;
  }

  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter(order => {
      if (!order.createdAt) return dateFilter === "year";
      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate.getTime())) return false;
      
      switch (dateFilter) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return orderDate >= yearAgo;
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const completedOrders = filteredOrders.filter(o => o.status === "completed");
  const completedRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  const todayOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return d.toDateString() === new Date().toDateString();
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const dailyData = (() => {
    const days: Record<string, { revenue: number; orders: number }> = {};
    filteredOrders.forEach(order => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      if (isNaN(date.getTime())) return;
      const key = date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
      if (!days[key]) days[key] = { revenue: 0, orders: 0 };
      days[key].revenue += Number(order.totalAmount || 0);
      days[key].orders += 1;
    });
    return Object.entries(days)
      .map(([date, data]) => ({ date, ...data }))
      .slice(-14);
  })();

  const paymentData = (() => {
    const methods: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const method = o.paymentMethod === 'cash' ? 'نقدي' : 
                     o.paymentMethod === 'card' ? 'بطاقة' : 
                     o.paymentMethod === 'mada' ? 'مدى' : o.paymentMethod;
      methods[method] = (methods[method] || 0) + Number(o.totalAmount || 0);
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
  })();

  const topProducts = (() => {
    const items: Record<string, { count: number; revenue: number }> = {};
    filteredOrders.forEach(order => {
      const orderItems = Array.isArray(order.items) ? order.items : [];
      orderItems.forEach((item: any) => {
        const name = item.coffeeItem?.nameAr || item.nameAr || 'منتج';
        if (!items[name]) items[name] = { count: 0, revenue: 0 };
        items[name].count += item.quantity || 1;
        items[name].revenue += (item.quantity || 1) * Number(item.price || 0);
      });
    });
    return Object.entries(items)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  })();

  const CHART_COLORS = ['#D4AF37', '#2D3748', '#38A169', '#E53E3E', '#805AD5'];

  const handleLogout = () => {
    localStorage.removeItem("currentEmployee");
    setLocation("/employee/gateway");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="header-gold px-6 py-4 border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-amber-100 title-executive">
                QahwaCup Enterprise
              </h1>
              <p className="text-sm text-slate-400">
                مرحباً، {manager.fullName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
              <SelectTrigger className="w-36 bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                <Calendar className="w-4 h-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="year">هذا العام</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/manager/dashboard")}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="dashboard-grid">
          <div className="kpi-card card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-slate-900" />
              </div>
              <Badge className="badge-premium badge-gold">
                <TrendingUp className="w-3 h-3" />
                +12.5%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">إجمالي الإيرادات</p>
            <p className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString('ar-SA')} <span className="text-sm font-normal">ر.س</span></p>
          </div>

          <div className="kpi-card card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <Badge className="badge-premium badge-success">
                <Activity className="w-3 h-3" />
                مكتمل
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">الإيرادات المحصلة</p>
            <p className="text-2xl font-bold text-foreground">{completedRevenue.toLocaleString('ar-SA')} <span className="text-sm font-normal">ر.س</span></p>
          </div>

          <div className="kpi-card card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">عدد الطلبات</p>
            <p className="text-2xl font-bold text-foreground">{filteredOrders.length.toLocaleString('ar-SA')}</p>
          </div>

          <div className="kpi-card card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">متوسط قيمة الطلب</p>
            <p className="text-2xl font-bold text-foreground">{avgOrderValue.toFixed(0)} <span className="text-sm font-normal">ر.س</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 stat-card-premium">
            <CardHeader className="section-header-executive pb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg title-executive">تحليل الإيرادات</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('ar-SA')} ر.س`, 'الإيرادات']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#D4AF37" 
                    strokeWidth={2}
                    fill="url(#revenueGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="stat-card-premium">
            <CardHeader className="section-header-executive pb-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg title-executive">طرق الدفع</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPie>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('ar-SA')} ر.س`, '']}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="stat-card-premium">
            <CardHeader className="section-header-executive pb-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg title-executive">أفضل المنتجات</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900' : 
                        index === 1 ? 'bg-slate-200 text-slate-700' :
                        index === 2 ? 'bg-orange-200 text-orange-700' :
                        'bg-slate-100 text-slate-600'}`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.count} طلب</p>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{product.revenue.toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card-premium">
            <CardHeader className="section-header-executive pb-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg title-executive">نظرة سريعة</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-700 dark:text-amber-300">الفروع</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{branches.length}</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">الموظفين</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{employees.length}</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">طلبات اليوم</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{todayOrders.length}</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700 dark:text-purple-300">إيراد اليوم</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{todayRevenue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setLocation("/manager/dashboard")}
            className="h-20 btn-premium flex flex-col gap-2"
          >
            <BarChart3 className="w-6 h-6" />
            <span>لوحة التحكم</span>
          </Button>
          <Button 
            onClick={() => setLocation("/employee/pos")}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
          >
            <Package className="w-6 h-6 text-amber-600" />
            <span>نقاط البيع</span>
          </Button>
          <Button 
            onClick={() => setLocation("/manager/inventory")}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <ChefHat className="w-6 h-6 text-emerald-600" />
            <span>المخزون</span>
          </Button>
          <Button 
            onClick={() => setLocation("/os/accounting")}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <FileText className="w-6 h-6 text-blue-600" />
            <span>المحاسبة</span>
          </Button>
        </div>
      </div>

      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            QahwaCup Enterprise &copy; {new Date().getFullYear()} - نظام إدارة المقاهي المتكامل
          </p>
        </div>
      </footer>
    </div>
  );
}
