import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Coffee,
  Percent,
  Timer,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth, differenceInMinutes } from "date-fns";
import { ar } from "date-fns/locale";

interface KPICard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: any;
  color: string;
  target?: number;
  current?: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  trend: number;
}

interface HourlyData {
  hour: number;
  orders: number;
  revenue: number;
}

interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    averageOrderValue: number;
    aovChange: number;
    newCustomers: number;
    customersChange: number;
    repeatRate: number;
    repeatChange: number;
    averagePrepTime: number;
    prepTimeChange: number;
  };
  topProducts: TopProduct[];
  hourlyData: HourlyData[];
  categoryBreakdown: { category: string; revenue: number; orders: number }[];
  paymentMethods: { method: string; amount: number; count: number }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
}

const mockAnalyticsData: AnalyticsData = {
  kpis: {
    totalRevenue: 45230,
    revenueChange: 12.5,
    totalOrders: 1245,
    ordersChange: 8.3,
    averageOrderValue: 36.3,
    aovChange: 3.7,
    newCustomers: 156,
    customersChange: 15.2,
    repeatRate: 42.5,
    repeatChange: 5.1,
    averagePrepTime: 8.5,
    prepTimeChange: -12.3,
  },
  topProducts: [
    { id: "1", name: "قهوة لاتيه", sales: 342, revenue: 6156, trend: 15 },
    { id: "2", name: "كابتشينو", sales: 289, revenue: 4913, trend: 8 },
    { id: "3", name: "موكا", sales: 234, revenue: 4446, trend: -3 },
    { id: "4", name: "أمريكانو", sales: 198, revenue: 2970, trend: 12 },
    { id: "5", name: "قهوة عربية", sales: 176, revenue: 2640, trend: 22 },
  ],
  hourlyData: [
    { hour: 6, orders: 12, revenue: 432 },
    { hour: 7, orders: 45, revenue: 1620 },
    { hour: 8, orders: 89, revenue: 3204 },
    { hour: 9, orders: 120, revenue: 4320 },
    { hour: 10, orders: 95, revenue: 3420 },
    { hour: 11, orders: 78, revenue: 2808 },
    { hour: 12, orders: 145, revenue: 5220 },
    { hour: 13, orders: 132, revenue: 4752 },
    { hour: 14, orders: 88, revenue: 3168 },
    { hour: 15, orders: 76, revenue: 2736 },
    { hour: 16, orders: 98, revenue: 3528 },
    { hour: 17, orders: 112, revenue: 4032 },
    { hour: 18, orders: 87, revenue: 3132 },
    { hour: 19, orders: 45, revenue: 1620 },
    { hour: 20, orders: 23, revenue: 828 },
  ],
  categoryBreakdown: [
    { category: "قهوة ساخنة", revenue: 18500, orders: 520 },
    { category: "قهوة باردة", revenue: 12300, orders: 342 },
    { category: "مشروبات أخرى", revenue: 8200, orders: 245 },
    { category: "حلويات", revenue: 4100, orders: 98 },
    { category: "وجبات خفيفة", revenue: 2130, orders: 40 },
  ],
  paymentMethods: [
    { method: "مدى", amount: 22000, count: 612 },
    { method: "نقدي", amount: 12500, count: 398 },
    { method: "Apple Pay", amount: 6800, count: 156 },
    { method: "STC Pay", amount: 3930, count: 79 },
  ],
  revenueByDay: [
    { date: "2025-12-23", revenue: 5200, orders: 145 },
    { date: "2025-12-24", revenue: 6100, orders: 168 },
    { date: "2025-12-25", revenue: 7800, orders: 212 },
    { date: "2025-12-26", revenue: 6500, orders: 178 },
    { date: "2025-12-27", revenue: 8200, orders: 225 },
    { date: "2025-12-28", revenue: 5800, orders: 162 },
    { date: "2025-12-29", revenue: 5630, orders: 155 },
  ],
};

export default function AdvancedAnalyticsPage() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analyticsData = mockAnalyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/advanced", period],
    enabled: false,
  });

  const data = analyticsData;

  const kpiCards: KPICard[] = [
    {
      id: "revenue",
      title: "إجمالي الإيرادات",
      value: `${data.kpis.totalRevenue.toLocaleString()} ر.س`,
      change: data.kpis.revenueChange,
      changeLabel: "مقارنة بالفترة السابقة",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "orders",
      title: "إجمالي الطلبات",
      value: data.kpis.totalOrders.toLocaleString(),
      change: data.kpis.ordersChange,
      changeLabel: "طلب",
      icon: ShoppingCart,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "aov",
      title: "متوسط قيمة الطلب",
      value: `${data.kpis.averageOrderValue.toFixed(1)} ر.س`,
      change: data.kpis.aovChange,
      changeLabel: "AOV",
      icon: Target,
      color: "from-purple-500 to-violet-600",
    },
    {
      id: "customers",
      title: "عملاء جدد",
      value: data.kpis.newCustomers.toLocaleString(),
      change: data.kpis.customersChange,
      changeLabel: "عميل جديد",
      icon: Users,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "repeat",
      title: "معدل العودة",
      value: `${data.kpis.repeatRate}%`,
      change: data.kpis.repeatChange,
      changeLabel: "Retention",
      icon: RefreshCw,
      color: "from-pink-500 to-rose-600",
    },
    {
      id: "prepTime",
      title: "متوسط وقت التحضير",
      value: `${data.kpis.averagePrepTime} دقيقة`,
      change: data.kpis.prepTimeChange,
      changeLabel: "أسرع",
      icon: Timer,
      color: "from-cyan-500 to-teal-600",
    },
  ];

  const maxHourlyOrders = data.hourlyData.length > 0 ? Math.max(...data.hourlyData.map(h => h.orders)) : 1;
  const peakHour = data.hourlyData.length > 0 
    ? data.hourlyData.reduce((max, h) => h.orders > max.orders ? h : max, data.hourlyData[0])
    : { hour: 12, orders: 0, revenue: 0 };
  const totalCategoryRevenue = data.categoryBreakdown.reduce((sum, c) => sum + c.revenue, 0);
  const totalPaymentAmount = data.paymentMethods.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/manager/dashboard")}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-cyan-400" />
            التحليلات المتقدمة
          </h1>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="quarter">ربع سنوي</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="border-slate-700 text-slate-300">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            const isPositive = kpi.change >= 0;
            const TrendIcon = kpi.id === "prepTime" 
              ? (kpi.change < 0 ? ArrowDownRight : ArrowUpRight)
              : (isPositive ? ArrowUpRight : ArrowDownRight);
            const trendColor = kpi.id === "prepTime"
              ? (kpi.change < 0 ? "text-green-400" : "text-red-400")
              : (isPositive ? "text-green-400" : "text-red-400");

            return (
              <Card key={kpi.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-slate-400 text-xs mb-1">{kpi.title}</p>
                  <p className="text-xl font-bold text-white mb-1">{kpi.value}</p>
                  <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{Math.abs(kpi.change)}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600">نظرة عامة</TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-cyan-600">المنتجات</TabsTrigger>
            <TabsTrigger value="time" className="data-[state=active]:bg-cyan-600">التوقيت</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-cyan-600">المدفوعات</TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-cyan-600">التنبؤات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    الإيرادات اليومية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.revenueByDay.map((day, idx) => {
                      const maxRevenue = Math.max(...data.revenueByDay.map(d => d.revenue));
                      const percentage = (day.revenue / maxRevenue) * 100;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">
                              {format(new Date(day.date), "EEEE", { locale: ar })}
                            </span>
                            <span className="text-white font-medium">{day.revenue.toLocaleString()} ر.س</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    توزيع الفئات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.categoryBreakdown.map((cat, idx) => {
                      const percentage = (cat.revenue / totalCategoryRevenue) * 100;
                      const colors = [
                        "from-amber-500 to-orange-500",
                        "from-blue-500 to-cyan-500",
                        "from-purple-500 to-pink-500",
                        "from-green-500 to-emerald-500",
                        "from-red-500 to-rose-500",
                      ];
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[idx % colors.length]}`} />
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-300 text-sm">{cat.category}</span>
                              <span className="text-white text-sm font-medium">{percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                          </div>
                          <span className="text-slate-400 text-xs w-20 text-left">
                            {cat.revenue.toLocaleString()} ر.س
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-sm">أفضل يوم</p>
                      <p className="text-2xl font-bold text-white mt-1">السبت</p>
                      <p className="text-green-400 text-sm mt-1">8,200 ر.س</p>
                    </div>
                    <Award className="w-12 h-12 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm">ساعة الذروة</p>
                      <p className="text-2xl font-bold text-white mt-1">{peakHour.hour}:00</p>
                      <p className="text-blue-400 text-sm mt-1">{peakHour.orders} طلب</p>
                    </div>
                    <Zap className="w-12 h-12 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">الأكثر مبيعاً</p>
                      <p className="text-2xl font-bold text-white mt-1">قهوة لاتيه</p>
                      <p className="text-purple-400 text-sm mt-1">342 مبيعة</p>
                    </div>
                    <Coffee className="w-12 h-12 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  أفضل المنتجات أداءً
                </CardTitle>
                <CardDescription className="text-slate-400">
                  ترتيب المنتجات حسب المبيعات والإيرادات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topProducts.map((product, idx) => {
                    const maxSales = Math.max(...data.topProducts.map(p => p.sales));
                    const percentage = (product.sales / maxSales) * 100;
                    return (
                      <div key={product.id} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === 0 ? 'bg-amber-500 text-white' :
                          idx === 1 ? 'bg-slate-400 text-white' :
                          idx === 2 ? 'bg-amber-700 text-white' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <span className="text-white font-medium">{product.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-sm">{product.sales} مبيعة</span>
                              <span className="text-white font-medium">{product.revenue.toLocaleString()} ر.س</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <Badge variant={product.trend >= 0 ? "default" : "destructive"} className="text-xs">
                              {product.trend >= 0 ? '+' : ''}{product.trend}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">منتجات تحتاج اهتمام</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">موكا</p>
                        <p className="text-red-400 text-xs">انخفاض 3% في المبيعات</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-900/20 border border-amber-800 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">شاي أخضر</p>
                        <p className="text-amber-400 text-xs">مخزون منخفض</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">فرص النمو</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">قهوة عربية</p>
                        <p className="text-green-400 text-xs">نمو 22% - فرصة للترويج</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">لاتيه بالكراميل</p>
                        <p className="text-blue-400 text-xs">طلب عالٍ - زيادة المخزون</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  توزيع الطلبات حسب الساعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-48">
                  {data.hourlyData.map((hour) => {
                    const percentage = (hour.orders / maxHourlyOrders) * 100;
                    const isPeak = hour.hour === peakHour.hour;
                    return (
                      <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className={`w-full rounded-t transition-all ${
                            isPeak ? 'bg-gradient-to-t from-cyan-600 to-cyan-400' : 'bg-slate-600'
                          }`}
                          style={{ height: `${percentage}%`, minHeight: '4px' }}
                        />
                        <span className="text-xs text-slate-500">{hour.hour}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-400 text-xs">فترة الصباح</p>
                    <p className="text-white font-bold">6-11</p>
                    <p className="text-cyan-400 text-sm">35% من الطلبات</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-400 text-xs">فترة الظهيرة</p>
                    <p className="text-white font-bold">12-17</p>
                    <p className="text-cyan-400 text-sm">48% من الطلبات</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-400 text-xs">فترة المساء</p>
                    <p className="text-white font-bold">18-22</p>
                    <p className="text-cyan-400 text-sm">17% من الطلبات</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">أداء وقت التحضير</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="text-white">ممتاز (أقل من 5 دقائق)</p>
                          <p className="text-green-400 text-sm">45% من الطلبات</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-green-400">561</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-amber-900/20 border border-amber-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-amber-400" />
                        <div>
                          <p className="text-white">جيد (5-10 دقائق)</p>
                          <p className="text-amber-400 text-sm">38% من الطلبات</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-amber-400">473</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <div>
                          <p className="text-white">يحتاج تحسين (أكثر من 10 دقائق)</p>
                          <p className="text-red-400 text-sm">17% من الطلبات</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-red-400">211</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">توصيات التحسين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-cyan-900/20 border border-cyan-800 rounded-lg">
                      <p className="text-white text-sm font-medium">زيادة الطاقم في الذروة</p>
                      <p className="text-cyan-400 text-xs mt-1">أضف موظفاً إضافياً بين 12:00-14:00</p>
                    </div>
                    <div className="p-3 bg-purple-900/20 border border-purple-800 rounded-lg">
                      <p className="text-white text-sm font-medium">تحضير مسبق</p>
                      <p className="text-purple-400 text-xs mt-1">جهز مكونات اللاتيه قبل الذروة</p>
                    </div>
                    <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
                      <p className="text-white text-sm font-medium">عروض الصباح الباكر</p>
                      <p className="text-green-400 text-xs mt-1">خصم 15% قبل الساعة 8 لتوزيع الحمل</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  توزيع طرق الدفع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.paymentMethods.map((method, idx) => {
                    const percentage = (method.amount / totalPaymentAmount) * 100;
                    const colors = [
                      { bg: "from-blue-600 to-blue-700", text: "text-blue-400" },
                      { bg: "from-green-600 to-green-700", text: "text-green-400" },
                      { bg: "from-gray-600 to-gray-700", text: "text-gray-400" },
                      { bg: "from-purple-600 to-purple-700", text: "text-purple-400" },
                    ];
                    return (
                      <Card key={method.method} className={`bg-gradient-to-br ${colors[idx].bg} border-0`}>
                        <CardContent className="p-4 text-center">
                          <p className="text-white/80 text-sm">{method.method}</p>
                          <p className="text-2xl font-bold text-white mt-2">{percentage.toFixed(1)}%</p>
                          <p className="text-white/70 text-sm mt-1">{method.amount.toLocaleString()} ر.س</p>
                          <p className="text-white/50 text-xs">{method.count} عملية</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  التنبؤات الذكية
                </CardTitle>
                <CardDescription className="text-indigo-300">
                  توقعات مبنية على بيانات الأسابيع الماضية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-indigo-700">
                    <p className="text-indigo-300 text-sm">توقع إيرادات الأسبوع القادم</p>
                    <p className="text-3xl font-bold text-white mt-2">52,450 ر.س</p>
                    <div className="flex items-center gap-1 text-green-400 text-sm mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>+16% عن الأسبوع الحالي</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-indigo-700">
                    <p className="text-indigo-300 text-sm">توقع عدد الطلبات</p>
                    <p className="text-3xl font-bold text-white mt-2">1,445</p>
                    <div className="flex items-center gap-1 text-green-400 text-sm mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>+200 طلب إضافي</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-indigo-700">
                    <p className="text-indigo-300 text-sm">المخزون المطلوب</p>
                    <p className="text-3xl font-bold text-white mt-2">15 كجم</p>
                    <p className="text-amber-400 text-sm mt-2">قهوة - اطلب قبل الخميس</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">تنبيه: ذروة متوقعة</p>
                      <p className="text-amber-300 text-sm mt-1">
                        يوم السبت القادم متوقع ارتفاع 35% في الطلبات. 
                        تأكد من توفر مخزون كافٍ وجدولة موظفين إضافيين.
                      </p>
                    </div>
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
