import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
 Coffee, Users, ShoppingBag, TrendingUp, DollarSign, 
 Package, MapPin, Layers, ArrowLeft, Calendar,
 UserCheck, Receipt, BarChart3, Download, TrendingDown, Activity, Plus
} from "lucide-react";
import * as XLSX from 'xlsx';
import { 
 AreaChart, Area, BarChart as RechartsBar, Bar, 
 PieChart, Pie, Cell, LineChart, Line,
 XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
 ResponsiveContainer 
} from "recharts";
import type { Employee, Order, Customer } from "@shared/schema";

interface EmployeeWithStats extends Employee {
 orderCount?: number;
 totalSales?: number;
}

export default function ManagerDashboard() {
 const [, setLocation] = useLocation();
 const [manager, setManager] = useState<Employee | null>(null);
 const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
 const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
 const [branchForm, setBranchForm] = useState({
 nameAr: "",
 nameEn: "",
 address: "",
 phone: "",
 city: "",
 managerName: "",
 });
 const { toast } = useToast();

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
 queryKey: ["/api/customers"],
 });

 const { data: orders = [] } = useQuery<Order[]>({
 queryKey: ["/api/orders"],
 });

 const { data: branches = [] } = useQuery<any[]>({
 queryKey: ["/api/branches"],
 });

 const createBranchMutation = useMutation({
 mutationFn: async (branchData: typeof branchForm) => {
 const response = await fetch("/api/branches", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({
 ...branchData,
 isActive: 1,
 }),
 });
 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || "Failed to create branch");
 }
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
 setIsAddBranchOpen(false);
 setBranchForm({
 nameAr: "",
 nameEn: "",
 address: "",
 phone: "",
 city: "",
 managerName: "",
 });
 toast({
 title: "تم إضاف� الفرع بنجاح",
 description: "تم إضاف� الفرع الجديد إلى النظام",
 });
 },
 onError: (error: any) => {
 toast({
 title: "� طأ في إضاف� الفرع",
 description: error.message || "حدث � طأ أثناء إضاف� الفرع",
 variant: "destructive",
 });
 },
 });

 const handleLogout = () => {
 localStorage.removeItem("currentEmployee");
 setLocation("/employee/gateway");
 };

 const handleCreateBranch = () => {
 if (!branchForm.nameAr || !branchForm.address || !branchForm.city || !branchForm.phone) {
 toast({
 title: "بيانات ناقص� ",
 description: "الرجاء إد� ال جميع البيانات المطلوب� ",
 variant: "destructive",
 });
 return;
 }
 createBranchMutation.mutate(branchForm);
 };

 const handleExportData = () => {
 try {
 // Prepare data for export
 const ordersData = filteredOrders.map(order => {
 const employee = employees.find(e => e._id === order.employeeId);
 return {
 'رقم الطلب': order.orderNumber,
 'التاري� ': order.createdAt ? new Date(order.createdAt).toLocaleString('ar-SA') : '',
 'اسم العميل': order.customerInfo?.name || '',
 'رقم الجوال': order.customerInfo?.phone || '',
 'رقم الطاول� ': order.tableNumber || '',
 'الحال� ': order.status,
 'طريق� الدفع': order.paymentMethod === 'cash' ? 'نقدي' : order.paymentMethod,
 'الكاشير': employee?.fullName || '',
 'الإجمالي': Number(order.totalAmount).toFixed(2),
 };
 });

 const topItemsExport = topItemsData.map(item => ({
 'المنتج': item.name,
 'عدد المبيعات': item.count,
 'الإيرادات': item.revenue.toFixed(2),
 }));

 const employeesExport = employeesWithStats.map(emp => ({
 'الاسم': emp.fullName,
 'الوظيف� ': emp.jobTitle,
 'الدور': emp.role === 'manager' ? 'مدير' : 'كاشير',
 'رقم الجوال': emp.phone,
 'عدد الطلبات': emp.orderCount || 0,
 'إجمالي المبيعات': (emp.totalSales || 0).toFixed(2),
 }));

 // Create workbook
 const wb = XLSX.utils.book_new();
 
 // Add sheets
 const wsOrders = XLSX.utils.json_to_sheet(ordersData);
 const wsTopItems = XLSX.utils.json_to_sheet(topItemsExport);
 const wsEmployees = XLSX.utils.json_to_sheet(employeesExport);
 
 XLSX.utils.book_append_sheet(wb, wsOrders, 'الطلبات');
 XLSX.utils.book_append_sheet(wb, wsTopItems, 'أكثر المنتجات مبيعاً');
 XLSX.utils.book_append_sheet(wb, wsEmployees, 'الموظفين');

 // Generate file name with date
 const dateStr = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
 const fileName = `تقرير-المبيعات-${dateStr}.xlsx`;

 // Save file
 XLSX.writeFile(wb, fileName);

 toast({
 title: "تم التصدير بنجاح",
 description: "تم تصدير البيانات إلى ملف Excel",
 });
 } catch (error) {
 toast({
 title: "� طأ في التصدير",
 description: "حدث � طأ أثناء تصدير البيانات",
 variant: "destructive",
 });
 }
 };

 if (!manager) {
 return null;
 }

 // Filter orders based on date range
 const getFilteredOrders = () => {
 const now = new Date();
 return orders.filter(order => {
 // Handle missing or invalid createdAt
 if (!order.createdAt) return dateFilter === "all";
 
 const orderDate = new Date(order.createdAt);
 // Validate date
 if (isNaN(orderDate.getTime())) return dateFilter === "all";
 
 switch (dateFilter) {
 case "today":
 return orderDate.toDateString() === now.toDateString();
 case "week":
 const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
 return orderDate >= weekAgo;
 case "month":
 const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
 return orderDate >= monthAgo;
 default:
 return true;
 }
 });
 };

 const filteredOrders = getFilteredOrders();
 const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
 const completedOrders = filteredOrders.filter(o => o.status === "completed");
 const completedRevenue = completedOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
 
 // Get today's orders using validated date logic
 const todayOrders = orders.filter(o => {
 if (!o.createdAt) return false;
 const orderDate = new Date(o.createdAt);
 if (isNaN(orderDate.getTime())) return false;
 const today = new Date();
 return orderDate.toDateString() === today.toDateString();
 });
 const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

 const employeesWithStats: EmployeeWithStats[] = employees.map(emp => {
 const empId = emp._id?.toString() || emp.id?.toString();
 const empOrders = filteredOrders.filter(o => {
 const orderEmpId = o.employeeId?.toString();
 return orderEmpId === empId;
 });
 return {
 ...emp,
 orderCount: empOrders.length,
 totalSales: empOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
 } as EmployeeWithStats;
 });

 // Prepare chart data
 const dailyRevenueData = (() => {
 const days: Record<string, number> = {};
 filteredOrders.forEach(order => {
 if (!order.createdAt) return;
 const orderDate = new Date(order.createdAt);
 if (isNaN(orderDate.getTime())) return;
 
 const dateStr = orderDate.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
 days[dateStr] = (days[dateStr] || 0) + Number(order.totalAmount || 0);
 });
 return Object.entries(days).map(([date, revenue]) => ({
 date,
 revenue: Number(revenue.toFixed(2))
 })).slice(-14); // Last 14 days
 })();

 const paymentMethodsData = (() => {
 const methods: Record<string, number> = {};
 filteredOrders.forEach(order => {
 methods[order.paymentMethod] = (methods[order.paymentMethod] || 0) + 1;
 });
 return Object.entries(methods).map(([name, value]) => ({
 name: name === 'cash' ? 'نقدي' : name,
 value
 }));
 })();

 const topItemsData = (() => {
 const items: Record<string, { count: number; revenue: number }> = {};
 filteredOrders.forEach(order => {
 const orderItems = Array.isArray(order.items) ? order.items : [];
 orderItems.forEach((item: any) => {
 const name = item.coffeeItem?.nameAr || item.nameAr || 'مشروب';
 if (!items[name]) {
 items[name] = { count: 0, revenue: 0 };
 }
 items[name].count += item.quantity || 0;
 items[name].revenue += (item.quantity || 0) * Number(item.price || item.coffeeItem?.price || 0);
 });
 });
 return Object.entries(items)
 .map(([name, data]) => ({
 name,
 count: data.count,
 revenue: Number(data.revenue.toFixed(2))
 }))
 .sort((a, b) => b.revenue - a.revenue)
 .slice(0, 10);
 })();

 const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];
 
 const growthRate = (() => {
 if (dateFilter === "today" || dateFilter === "all") return 0;
 const now = new Date();
 const periodStart = dateFilter === "week" ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) :
 dateFilter === "month" ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) : null;
 if (!periodStart) return 0;
 
 const periodOrders = orders.filter(o => {
 if (!o.createdAt) return false;
 const date = new Date(o.createdAt);
 return !isNaN(date.getTime()) && date >= periodStart;
 });
 
 const prevPeriodEnd = periodStart;
 const prevPeriodStart = dateFilter === "week" ? new Date(periodStart.getTime() - 7 * 24 * 60 * 60 * 1000) :
 new Date(periodStart.getTime() - 30 * 24 * 60 * 60 * 1000);
 const prevPeriodOrders = orders.filter(o => {
 if (!o.createdAt) return false;
 const date = new Date(o.createdAt);
 return !isNaN(date.getTime()) && date >= prevPeriodStart && date < prevPeriodEnd;
 });
 
 const currentRevenue = periodOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
 const previousRevenue = prevPeriodOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
 
 if (previousRevenue === 0) return currentRevenue > 0 ? 100 : 0;
 return Number((((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1));
 })();

 return (
 <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4" dir="rtl">
 <div className="max-w-7xl mx-auto">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
 <Coffee className="w-6 h-6 text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-amber-500">لوح� تحكم المدير</h1>
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
 تسجيل ال� روج
 </Button>
 </div>
 </div>

 {/* Date Filter */}
 <Card className="bg-[#2d1f1a] border-amber-500/20 mb-6">
 <CardContent className="p-4">
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-2">
 <Calendar className="w-5 h-5 text-amber-500" />
 <span className="text-gray-300">فلتر� التقارير:</span>
 </div>
 <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
 <SelectTrigger className="w-[200px] bg-[#1a1410] border-amber-500/30 text-white">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="today">اليوم</SelectItem>
 <SelectItem value="week">آ� ر أسبوع</SelectItem>
 <SelectItem value="month">آ� ر شهر</SelectItem>
 <SelectItem value="all">كل الفتر� </SelectItem>
 </SelectContent>
 </Select>
 </div>
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all">
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

 <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 transition-all">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
 <ShoppingBag className="w-4 h-4" />
 الطلبات ({dateFilter === "all" ? "كل الفتر� " : dateFilter === "today" ? "اليوم" : dateFilter === "week" ? "أسبوع" : "شهر"})
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold text-green-400">{filteredOrders.length}</div>
 <p className="text-xs text-gray-500 mt-1">{completedOrders.length} مكتمل</p>
 </CardContent>
 </Card>

 <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40 transition-all">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
 <DollarSign className="w-4 h-4" />
 إجمالي المبيعات
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold text-amber-400">{totalRevenue.toFixed(2)}</div>
 <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
 {growthRate !== 0 && (
 <div className="flex items-center gap-1 mt-2">
 {growthRate > 0 ? (
 <TrendingUp className="w-4 h-4 text-green-500" />
 ) : (
 <TrendingDown className="w-4 h-4 text-red-500" />
 )}
 <span className={`text-xs font-semibold ${growthRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
 {growthRate > 0 ? '+' : ''}{growthRate}%
 </span>
 </div>
 )}
 </CardContent>
 </Card>

 <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
 <Activity className="w-4 h-4" />
 متوسط الطلب
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold text-purple-400">
 {filteredOrders.length > 0 ? (totalRevenue / filteredOrders.length).toFixed(2) : '0.00'}
 </div>
 <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
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
 <CardTitle className="text-amber-500">قائم� العملاء المسجلين</CardTitle>
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
 {employeesWithStats.length === 0 ? (
 <p className="text-center text-gray-500 py-8">لا يوجد موظفين مسجلين</p>
 ) : (
 employeesWithStats.map((emp) => (
 <div
 key={emp._id?.toString() || emp.id || Math.random()}
 className="flex items-center justify-between p-4 bg-stone-800/30 rounded-lg border border-amber-500/10 hover:border-amber-500/30 transition-colors"
 data-testid={`employee-${emp._id || emp.id}`}
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
 ))
 )}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="orders" className="space-y-4">
 <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
 <CardHeader>
 <CardTitle className="text-amber-500">جميع الطلبات</CardTitle>
 <CardDescription className="text-gray-400">
 عرض تفاصيل الطلبات مع معلومات الموظف وطريق� الدفع
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
 <p className="text-sm text-blue-400">طاول� رقم: {order.tableNumber}</p>
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
 <span>طريق� الدفع:</span>
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
 إدار� فروع المقهى
 </CardDescription>
 </div>
 <Dialog open={isAddBranchOpen} onOpenChange={setIsAddBranchOpen}>
 <DialogTrigger asChild>
 <Button 
 className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
 data-testid="button-add-branch"
 >
 <Plus className="w-4 h-4 ml-2" />
 إضاف� فرع
 </Button>
 </DialogTrigger>
 <DialogContent className="bg-[#2d1f1a] border-amber-500/30 text-white sm:max-w-[500px]">
 <DialogHeader>
 <DialogTitle className="text-amber-500 text-xl">إضاف� فرع جديد</DialogTitle>
 </DialogHeader>
 <div className="grid gap-4 py-4">
 <div className="grid gap-2">
 <Label htmlFor="nameAr" className="text-gray-300">اسم الفرع (عربي) *</Label>
 <Input
 id="nameAr"
 value={branchForm.nameAr}
 onChange={(e) => setBranchForm({ ...branchForm, nameAr: e.target.value })}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 placeholder="مثال: فرع الرياض"
 data-testid="input-branch-name-ar"
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="nameEn" className="text-gray-300">اسم الفرع (إنجليزي)</Label>
 <Input
 id="nameEn"
 value={branchForm.nameEn}
 onChange={(e) => setBranchForm({ ...branchForm, nameEn: e.target.value })}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 placeholder="Example: Riyadh Branch"
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="address" className="text-gray-300">العنوان *</Label>
 <Input
 id="address"
 value={branchForm.address}
 onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 placeholder="مثال: شارع الملك فهد"
 data-testid="input-branch-address"
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="city" className="text-gray-300">المدين� *</Label>
 <Input
 id="city"
 value={branchForm.city}
 onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 placeholder="مثال: الرياض"
 data-testid="input-branch-city"
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="phone" className="text-gray-300">رقم الهاتف *</Label>
 <Input
 id="phone"
 value={branchForm.phone}
 onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 placeholder="مثال: 0501234567"
 data-testid="input-branch-phone"
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="managerName" className="text-gray-300">اسم المدير</Label>
 <Input
 id="managerName"
 value={branchForm.managerName}
 onChange={(e) => setBranchForm({ ...branchForm, managerName: e.target.value })}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 placeholder="مثال: أحمد محمد"
 />
 </div>
 </div>
 <div className="flex gap-2 justify-end">
 <Button
 variant="outline"
 onClick={() => setIsAddBranchOpen(false)}
 className="border-gray-500/50 text-gray-300"
 >
 إلغاء
 </Button>
 <Button
 onClick={handleCreateBranch}
 disabled={createBranchMutation.isPending}
 className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
 data-testid="button-submit-branch"
 >
 {createBranchMutation.isPending ? "جاري الإضاف� ..." : "إضاف� الفرع"}
 </Button>
 </div>
 </DialogContent>
 </Dialog>
 </div>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {branches.length === 0 ? (
 <p className="text-center text-gray-500 py-8">لا توجد فروع مسجل� </p>
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
 {/* Revenue Trend Chart */}
 <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
 <CardHeader>
 <div className="flex justify-between items-center">
 <div>
 <CardTitle className="text-amber-500">م� طط المبيعات اليومي� </CardTitle>
 <CardDescription className="text-gray-400">
 تطور المبيعات � لال الفتر� المحدد� 
 </CardDescription>
 </div>
 <Button 
 variant="outline" 
 className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
 onClick={handleExportData}
 data-testid="button-export-data"
 >
 <Download className="w-4 h-4 ml-2" />
 تصدير
 </Button>
 </div>
 </CardHeader>
 <CardContent>
 {dailyRevenueData.length > 0 ? (
 <ResponsiveContainer width="100%" height={300}>
 <AreaChart data={dailyRevenueData}>
 <defs>
 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
 <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#444" />
 <XAxis dataKey="date" stroke="#888" />
 <YAxis stroke="#888" />
 <Tooltip 
 contentStyle={{ backgroundColor: '#1a1410', border: '1px solid #f59e0b' }}
 labelStyle={{ color: '#f59e0b' }}
 />
 <Area 
 type="monotone" 
 dataKey="revenue" 
 stroke="#f59e0b" 
 fillOpacity={1} 
 fill="url(#colorRevenue)" 
 />
 </AreaChart>
 </ResponsiveContainer>
 ) : (
 <p className="text-center text-gray-500 py-12">لا توجد بيانات للعرض</p>
 )}
 </CardContent>
 </Card>

 {/* Top Products and Payment Methods */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Top Selling Items */}
 <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
 <CardHeader>
 <CardTitle className="text-amber-500">أكثر المنتجات مبيعاً</CardTitle>
 <CardDescription className="text-gray-400">
 أعلى 10 منتجات من حيث الإيرادات
 </CardDescription>
 </CardHeader>
 <CardContent>
 {topItemsData.length > 0 ? (
 <ResponsiveContainer width="100%" height={300}>
 <RechartsBar data={topItemsData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#444" />
 <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={100} />
 <YAxis stroke="#888" />
 <Tooltip 
 contentStyle={{ backgroundColor: '#1a1410', border: '1px solid #f59e0b' }}
 labelStyle={{ color: '#f59e0b' }}
 />
 <Bar dataKey="revenue" fill="#f59e0b" />
 </RechartsBar>
 </ResponsiveContainer>
 ) : (
 <p className="text-center text-gray-500 py-12">لا توجد بيانات للعرض</p>
 )}
 
 {/* Top items list */}
 <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
 {topItemsData.slice(0, 5).map((item, index) => (
 <div key={index} className="flex justify-between items-center p-2 bg-stone-800/30 rounded">
 <div className="flex items-center gap-2">
 <Badge className="bg-amber-500">{index + 1}</Badge>
 <span className="text-gray-300">{item.name}</span>
 </div>
 <div className="text-left">
 <p className="text-amber-400 font-semibold">{item.revenue.toFixed(2)} ر.س</p>
 <p className="text-xs text-gray-500">{item.count} مبيعات</p>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Payment Methods Distribution */}
 <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
 <CardHeader>
 <CardTitle className="text-amber-500">توزيع طرق الدفع</CardTitle>
 <CardDescription className="text-gray-400">
 نسب است� دام وسائل الدفع الم� تلف� 
 </CardDescription>
 </CardHeader>
 <CardContent>
 {paymentMethodsData.length > 0 ? (
 <>
 <ResponsiveContainer width="100%" height={250}>
 <PieChart>
 <Pie
 data={paymentMethodsData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {paymentMethodsData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ backgroundColor: '#1a1410', border: '1px solid #f59e0b' }} />
 </PieChart>
 </ResponsiveContainer>
 
 {/* Payment methods legend */}
 <div className="mt-4 space-y-2">
 {paymentMethodsData.map((method, index) => (
 <div key={index} className="flex justify-between items-center p-2 bg-stone-800/30 rounded">
 <div className="flex items-center gap-2">
 <div 
 className="w-4 h-4 rounded" 
 style={{ backgroundColor: COLORS[index % COLORS.length] }}
 />
 <span className="text-gray-300">{method.name}</span>
 </div>
 <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400">
 {method.value} طلب
 </Badge>
 </div>
 ))}
 </div>
 </>
 ) : (
 <p className="text-center text-gray-500 py-12">لا توجد بيانات للعرض</p>
 )}
 </CardContent>
 </Card>
 </div>

 {/* Employee Performance */}
 <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20">
 <CardHeader>
 <CardTitle className="text-amber-500">أداء الموظفين</CardTitle>
 <CardDescription className="text-gray-400">
 مبيعات كل موظف � لال الفتر� المحدد� 
 </CardDescription>
 </CardHeader>
 <CardContent>
 {employeesWithStats.length > 0 ? (
 <ResponsiveContainer width="100%" height={300}>
 <RechartsBar data={employeesWithStats}>
 <CartesianGrid strokeDasharray="3 3" stroke="#444" />
 <XAxis dataKey="fullName" stroke="#888" />
 <YAxis stroke="#888" />
 <Tooltip 
 contentStyle={{ backgroundColor: '#1a1410', border: '1px solid #f59e0b' }}
 labelStyle={{ color: '#f59e0b' }}
 />
 <Legend />
 <Bar dataKey="orderCount" fill="#3b82f6" name="عدد الطلبات" />
 <Bar dataKey="totalSales" fill="#10b981" name="إجمالي المبيعات" />
 </RechartsBar>
 </ResponsiveContainer>
 ) : (
 <p className="text-center text-gray-500 py-12">لا توجد بيانات للعرض</p>
 )}
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
