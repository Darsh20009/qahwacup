import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  FileText,
  ArrowLeft,
  Loader2,
  Calendar,
  Check,
  X,
  CreditCard,
  Banknote,
  PiggyBank,
  BarChart3,
  Building2,
  Package,
  ShoppingCart,
  Percent,
  Eye,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface Branch {
  id?: string;
  _id?: string;
  nameAr: string;
}

interface Expense {
  id: string;
  branchId: string;
  date: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  approvedBy?: string;
  approvalDate?: string;
  paidDate?: string;
  createdAt: string;
}

interface Revenue {
  id: string;
  branchId: string;
  date: string;
  orderId?: string;
  invoiceId?: string;
  category: string;
  description: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
}

interface TrendData {
  date?: string;
  week?: string;
  revenue: number;
  expenses: number;
  cogs: number;
  netProfit: number;
}

interface TopSellingItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  totalAmount: number;
  costOfGoods?: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items?: Array<{ nameAr?: string; quantity: number; price?: number }>;
}

interface StockMovement {
  id: string;
  rawItemName?: string;
  movementType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  notes?: string;
  createdAt: string;
}

type DrilldownType = 'revenue' | 'cogs' | 'expenses' | 'orders' | null;

interface DashboardData {
  totalRevenue: number;
  totalVat: number;
  totalExpenses: number;
  totalCogs: number;
  grossProfit: number;
  netProfit: number;
  orderCount: number;
  invoiceCount: number;
  profitMargin: number;
  expensesByCategory: Record<string, number>;
  revenueByPayment: Record<string, number>;
  dailyTrend: TrendData[];
  weeklyTrend: TrendData[];
  topSellingItems: TopSellingItem[];
}

const expenseCategories = [
  { value: "inventory", label: "المخزون والمواد الخام" },
  { value: "salaries", label: "الرواتب والأجور" },
  { value: "rent", label: "الإيجار" },
  { value: "utilities", label: "المرافق (كهرباء/ماء)" },
  { value: "marketing", label: "التسويق والإعلان" },
  { value: "maintenance", label: "الصيانة" },
  { value: "supplies", label: "المستلزمات" },
  { value: "other", label: "أخرى" },
];

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "قيد الانتظار", variant: "secondary" },
  approved: { label: "معتمد", variant: "default" },
  rejected: { label: "مرفوض", variant: "destructive" },
  paid: { label: "مدفوع", variant: "default" },
};

const paymentMethodLabels: Record<string, string> = {
  cash: "نقدي",
  pos: "شبكة",
  bank_transfer: "تحويل بنكي",
  stc: "STC Pay",
  alinma: "Alinma Pay",
};

const CHART_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899'];

export default function AccountingDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("today");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  
  const [newExpense, setNewExpense] = useState({
    category: "",
    subcategory: "",
    description: "",
    amount: "",
    vatAmount: "",
    paymentMethod: "cash",
    notes: "",
  });
  
  const [drilldownType, setDrilldownType] = useState<DrilldownType>(null);
  const [drilldownOpen, setDrilldownOpen] = useState(false);

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/accounting/dashboard", period, selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      const res = await fetch(`/api/accounting/dashboard?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const data = await res.json();
      return {
        totalRevenue: data.summary?.totalRevenue || 0,
        totalVat: data.summary?.totalVatCollected || 0,
        totalExpenses: data.summary?.totalExpenses || 0,
        totalCogs: data.summary?.totalCogs || 0,
        grossProfit: data.summary?.grossProfit || 0,
        netProfit: data.summary?.netProfit || 0,
        orderCount: data.summary?.orderCount || 0,
        invoiceCount: data.summary?.invoiceCount || 0,
        profitMargin: data.summary?.profitMargin || 0,
        expensesByCategory: data.expensesByCategory || {},
        revenueByPayment: data.revenueByPayment || {},
        dailyTrend: data.dailyTrend || [],
        weeklyTrend: data.weeklyTrend || [],
        topSellingItems: data.topSellingItems || [],
      };
    },
  });

  const { data: expensesData, isLoading: isExpensesLoading } = useQuery<{ expenses: Expense[]; total: number }>({
    queryKey: ["/api/accounting/expenses", period, selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50", period });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      const res = await fetch(`/api/accounting/expenses?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
  });

  const { data: revenuesData, isLoading: isRevenuesLoading } = useQuery<{ revenues: Revenue[]; total: number }>({
    queryKey: ["/api/accounting/revenue", period, selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50", period });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      const res = await fetch(`/api/accounting/revenue?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch revenues");
      return res.json();
    },
  });

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ["/api/orders", period, selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100", period });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      const res = await fetch(`/api/orders?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const orders = await res.json();
      return { orders: Array.isArray(orders) ? orders : [] };
    },
    enabled: drilldownOpen && (drilldownType === 'revenue' || drilldownType === 'cogs' || drilldownType === 'orders'),
  });

  const { data: stockMovementsData, isLoading: isStockLoading } = useQuery<{ movements: StockMovement[] }>({
    queryKey: ["/api/inventory/stock-movements", period, selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50", period });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      const res = await fetch(`/api/inventory/stock-movements?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stock movements");
      const data = await res.json();
      return { movements: data.movements || [] };
    },
    enabled: drilldownOpen && drilldownType === 'cogs',
  });

  const openDrilldown = (type: DrilldownType) => {
    setDrilldownType(type);
    setDrilldownOpen(true);
  };

  const closeDrilldown = () => {
    setDrilldownOpen(false);
    setDrilldownType(null);
  };

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/accounting/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/dashboard"] });
      setIsAddExpenseOpen(false);
      setNewExpense({
        category: "",
        subcategory: "",
        description: "",
        amount: "",
        vatAmount: "",
        paymentMethod: "cash",
        notes: "",
      });
      toast({ title: "تم إضافة المصروف بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في إضافة المصروف", variant: "destructive" });
    },
  });

  const approveExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/accounting/expenses/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/dashboard"] });
      toast({ title: "تم اعتماد المصروف بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في اعتماد المصروف", variant: "destructive" });
    },
  });

  const handleAddExpense = () => {
    const amount = parseFloat(newExpense.amount);
    const vatAmount = parseFloat(newExpense.vatAmount || "0");
    
    createExpenseMutation.mutate({
      branchId: selectedBranch !== "all" ? selectedBranch : undefined,
      date: new Date().toISOString(),
      category: newExpense.category,
      subcategory: newExpense.subcategory,
      description: newExpense.description,
      amount,
      vatAmount,
      totalAmount: amount + vatAmount,
      paymentMethod: newExpense.paymentMethod,
      notes: newExpense.notes,
    });
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => (b.id || b._id) === branchId);
    return branch?.nameAr || "غير محدد";
  };

  const paymentMethodData = dashboardData?.revenueByPayment 
    ? Object.entries(dashboardData.revenueByPayment).map(([method, amount]) => ({
        name: paymentMethodLabels[method] || method,
        value: amount as number,
      }))
    : [];

  const expenseCategoryData = dashboardData?.expensesByCategory 
    ? Object.entries(dashboardData.expensesByCategory).map(([category, amount]) => ({
        name: expenseCategories.find(c => c.value === category)?.label || category,
        value: amount as number,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-[#1a1410] dark:via-[#1f1815] dark:to-[#231c17]" dir="rtl">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/employee/dashboard")}
            className="text-amber-700 dark:text-amber-400"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-amber-800 dark:text-amber-400">
            نظام المحاسبة المتكامل
          </h1>
          <div className="w-20"></div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40" data-testid="select-period">
              <SelectValue placeholder="الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="year">هذه السنة</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48" data-testid="select-branch">
              <SelectValue placeholder="الفرع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفروع</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id || branch._id} value={branch.id || branch._id || ""}>
                  {branch.nameAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={() => setIsAddExpenseOpen(true)}
            className="bg-amber-600 hover:bg-amber-700"
            data-testid="button-add-expense"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مصروف
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-amber-100 dark:bg-amber-900/30">
            <TabsTrigger value="overview" data-testid="tab-overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="expenses" data-testid="tab-expenses">المصروفات</TabsTrigger>
            <TabsTrigger value="revenues" data-testid="tab-revenues">الإيرادات</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isDashboardLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : dashboardData ? (
              <>
                {/* Main KPI Cards - Clickable for Drilldown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card 
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => openDrilldown('revenue')}
                    data-testid="card-revenue-drilldown"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-green-100 text-sm flex items-center gap-1">
                            إجمالي الإيرادات
                            <Eye className="w-3 h-3" />
                          </p>
                          <p className="text-3xl font-bold mt-1" data-testid="text-total-revenue">{dashboardData.totalRevenue.toFixed(2)}</p>
                          <p className="text-green-200 text-xs mt-1">ريال سعودي - انقر للتفاصيل</p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => openDrilldown('cogs')}
                    data-testid="card-cogs-drilldown"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-orange-100 text-sm flex items-center gap-1">
                            تكلفة المكونات (COGS)
                            <Eye className="w-3 h-3" />
                          </p>
                          <p className="text-3xl font-bold mt-1" data-testid="text-total-cogs">{dashboardData.totalCogs.toFixed(2)}</p>
                          <p className="text-orange-200 text-xs mt-1">ريال سعودي - انقر للتفاصيل</p>
                        </div>
                        <Package className="w-12 h-12 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => openDrilldown('expenses')}
                    data-testid="card-expenses-drilldown"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-red-100 text-sm flex items-center gap-1">
                            المصروفات الشهرية
                            <Eye className="w-3 h-3" />
                          </p>
                          <p className="text-3xl font-bold mt-1" data-testid="text-total-expenses">{dashboardData.totalExpenses.toFixed(2)}</p>
                          <p className="text-red-200 text-xs mt-1">ريال سعودي - انقر للتفاصيل</p>
                        </div>
                        <TrendingDown className="w-12 h-12 text-red-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`bg-gradient-to-br ${dashboardData.netProfit >= 0 ? 'from-blue-500 to-blue-600' : 'from-red-600 to-red-700'} text-white cursor-pointer transition-transform hover:scale-[1.02]`}
                    onClick={() => openDrilldown('orders')}
                    data-testid="card-profit-drilldown"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className={`${dashboardData.netProfit >= 0 ? 'text-blue-100' : 'text-red-100'} text-sm flex items-center gap-1`}>
                            صافي الربح
                            <Eye className="w-3 h-3" />
                          </p>
                          <p className="text-3xl font-bold mt-1" data-testid="text-net-profit">{dashboardData.netProfit.toFixed(2)}</p>
                          <p className={`${dashboardData.netProfit >= 0 ? 'text-blue-200' : 'text-red-200'} text-xs mt-1`}>ريال سعودي - انقر للتفاصيل</p>
                        </div>
                        <PiggyBank className={`w-12 h-12 ${dashboardData.netProfit >= 0 ? 'text-blue-200' : 'text-red-200'}`} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profit Breakdown Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      تحليل الأرباح التفصيلي
                    </CardTitle>
                    <CardDescription>تفاصيل حسابات الأرباح وهوامش الربح</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">إجمالي الربح</p>
                        <p className="text-2xl font-bold text-green-600" data-testid="text-gross-profit">{dashboardData.grossProfit.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">ر.س</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">هامش الربح الإجمالي</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {dashboardData.totalRevenue > 0 
                            ? ((dashboardData.grossProfit / dashboardData.totalRevenue) * 100).toFixed(1) 
                            : "0"}%
                        </p>
                        <p className="text-xs text-muted-foreground">من الإيرادات</p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">صافي الربح</p>
                        <p className={`text-2xl font-bold ${dashboardData.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                          {dashboardData.netProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">ر.س</p>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">هامش صافي الربح</p>
                        <p className={`text-2xl font-bold ${dashboardData.profitMargin >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                          {dashboardData.profitMargin.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">من الإيرادات</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>إجمالي الإيرادات</span>
                          <span className="font-medium text-green-600">+{dashboardData.totalRevenue.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ضريبة القيمة المضافة</span>
                          <span className="font-medium text-amber-600">-{dashboardData.totalVat.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between">
                          <span>تكلفة المكونات (COGS)</span>
                          <span className="font-medium text-red-600">-{dashboardData.totalCogs.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">= إجمالي الربح</span>
                          <span className="font-bold text-green-600">{dashboardData.grossProfit.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between">
                          <span>المصروفات التشغيلية</span>
                          <span className="font-medium text-red-600">-{dashboardData.totalExpenses.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 border-primary">
                          <span className="font-bold">= صافي الربح</span>
                          <span className={`font-bold text-lg ${dashboardData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {dashboardData.netProfit.toFixed(2)} ر.س
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-600" />
                      صافي الربح اليومي (آخر 7 أيام)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.dailyTrend && dashboardData.dailyTrend.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dashboardData.dailyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                              }}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: number) => [`${value.toFixed(2)} ر.س`]}
                              labelFormatter={(label) => {
                                const date = new Date(label);
                                return format(date, "EEEE dd/MM/yyyy", { locale: ar });
                              }}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="revenue" 
                              stackId="1"
                              stroke="#10b981" 
                              fill="#10b981" 
                              fillOpacity={0.6}
                              name="الإيرادات"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="netProfit" 
                              stackId="2"
                              stroke="#3b82f6" 
                              fill="#3b82f6" 
                              fillOpacity={0.6}
                              name="صافي الربح"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">لا توجد بيانات كافية لعرض الرسم البياني</p>
                    )}
                  </CardContent>
                </Card>

                {/* Weekly Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      صافي الربح الأسبوعي (آخر 4 أسابيع)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.weeklyTrend && dashboardData.weeklyTrend.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dashboardData.weeklyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`]} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
                            <Bar dataKey="cogs" fill="#f97316" name="تكلفة المكونات" />
                            <Bar dataKey="expenses" fill="#ef4444" name="المصروفات" />
                            <Bar dataKey="netProfit" fill="#3b82f6" name="صافي الربح" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">لا توجد بيانات كافية لعرض الرسم البياني</p>
                    )}
                  </CardContent>
                </Card>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Methods Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        الإيرادات حسب طريقة الدفع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {paymentMethodData.length > 0 ? (
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentMethodData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {paymentMethodData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">لا توجد بيانات</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Expenses by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-red-600" />
                        المصروفات حسب الفئة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {expenseCategoryData.length > 0 ? (
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={expenseCategoryData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="name" width={120} />
                              <Tooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`]} />
                              <Bar dataKey="value" fill="#ef4444" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">لا توجد مصروفات</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                          <ShoppingCart className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">عدد الطلبات</p>
                          <p className="text-2xl font-bold" data-testid="text-order-count">{dashboardData.orderCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Receipt className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">عدد الفواتير</p>
                          <p className="text-2xl font-bold" data-testid="text-invoice-count">{dashboardData.invoiceCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <Percent className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">متوسط قيمة الطلب</p>
                          <p className="text-2xl font-bold">
                            {dashboardData.orderCount > 0 
                              ? (dashboardData.totalRevenue / dashboardData.orderCount).toFixed(2)
                              : "0"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">ضريبة القيمة المضافة</p>
                          <p className="text-2xl font-bold">{dashboardData.totalVat.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Selling Items */}
                {dashboardData.topSellingItems && dashboardData.topSellingItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                        المنتجات الأكثر مبيعاً
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">المنتج</TableHead>
                            <TableHead className="text-right">الكمية المباعة</TableHead>
                            <TableHead className="text-right">الإيرادات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboardData.topSellingItems.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{index + 1}</Badge>
                                  {item.name}
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell className="font-bold text-green-600">{item.revenue.toFixed(2)} ر.س</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سجل المصروفات</CardTitle>
                <CardDescription>جميع المصروفات المسجلة في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                {isExpensesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الفئة</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">الضريبة</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expensesData?.expenses?.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{format(new Date(expense.date), "yyyy/MM/dd", { locale: ar })}</TableCell>
                          <TableCell>
                            {expenseCategories.find(c => c.value === expense.category)?.label || expense.category}
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{expense.amount.toFixed(2)}</TableCell>
                          <TableCell>{expense.vatAmount.toFixed(2)}</TableCell>
                          <TableCell className="font-bold">{expense.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={statusLabels[expense.status]?.variant || "secondary"}>
                              {statusLabels[expense.status]?.label || expense.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {expense.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveExpenseMutation.mutate(expense.id)}
                                disabled={approveExpenseMutation.isPending}
                                data-testid={`button-approve-expense-${expense.id}`}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!expensesData?.expenses || expensesData.expenses.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            لا توجد مصروفات مسجلة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سجل الإيرادات</CardTitle>
                <CardDescription>جميع الإيرادات المسجلة في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                {isRevenuesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الفرع</TableHead>
                        <TableHead className="text-right">الفئة</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">الضريبة</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead className="text-right">طريقة الدفع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenuesData?.revenues?.map((revenue) => (
                        <TableRow key={revenue.id}>
                          <TableCell>{format(new Date(revenue.date), "yyyy/MM/dd", { locale: ar })}</TableCell>
                          <TableCell>{getBranchName(revenue.branchId)}</TableCell>
                          <TableCell>{revenue.category}</TableCell>
                          <TableCell>{revenue.description}</TableCell>
                          <TableCell>{revenue.amount.toFixed(2)}</TableCell>
                          <TableCell>{revenue.vatAmount.toFixed(2)}</TableCell>
                          <TableCell className="font-bold text-green-600">{revenue.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>{paymentMethodLabels[revenue.paymentMethod] || revenue.paymentMethod}</TableCell>
                        </TableRow>
                      ))}
                      {(!revenuesData?.revenues || revenuesData.revenues.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            لا توجد إيرادات مسجلة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {isDashboardLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : dashboardData ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>تطور الإيرادات اليومية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardData.dailyTrend && dashboardData.dailyTrend.length > 0 ? (
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData.dailyTrend}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                              />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: number) => [`${value.toFixed(2)} ر.س`]}
                                labelFormatter={(label) => {
                                  const date = new Date(label);
                                  return format(date, "EEEE dd/MM/yyyy", { locale: ar });
                                }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                fill="#10b981" 
                                fillOpacity={0.3}
                                name="الإيرادات"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">لا توجد بيانات</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Profit vs Expenses */}
                  <Card>
                    <CardHeader>
                      <CardTitle>مقارنة الأرباح والمصروفات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardData.weeklyTrend && dashboardData.weeklyTrend.length > 0 ? (
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.weeklyTrend}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="week" />
                              <YAxis />
                              <Tooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`]} />
                              <Legend />
                              <Bar dataKey="netProfit" fill="#10b981" name="صافي الربح" />
                              <Bar dataKey="expenses" fill="#ef4444" name="المصروفات" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">لا توجد بيانات</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Drilldown Dialog */}
        <Dialog open={drilldownOpen} onOpenChange={closeDrilldown}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={closeDrilldown}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {drilldownType === 'revenue' && 'تفاصيل الإيرادات'}
                {drilldownType === 'cogs' && 'تفاصيل تكلفة المكونات (COGS)'}
                {drilldownType === 'expenses' && 'تفاصيل المصروفات'}
                {drilldownType === 'orders' && 'تفاصيل الطلبات والأرباح'}
              </DialogTitle>
              <DialogDescription>
                {drilldownType === 'revenue' && 'جميع الطلبات المساهمة في الإيرادات'}
                {drilldownType === 'cogs' && 'تكلفة المكونات المستخدمة في الطلبات'}
                {drilldownType === 'expenses' && 'جميع المصروفات التشغيلية'}
                {drilldownType === 'orders' && 'تفصيل الطلبات مع هوامش الربح'}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[60vh]">
              {(drilldownType === 'revenue' || drilldownType === 'orders') && (
                isOrdersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم الطلب</TableHead>
                        <TableHead className="text-right">العميل</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead className="text-right">التكلفة</TableHead>
                        <TableHead className="text-right">الربح</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData?.orders?.filter(o => o.status !== 'cancelled').map((order) => {
                        const profit = order.totalAmount - (order.costOfGoods || 0);
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>{order.customerName || 'عميل'}</TableCell>
                            <TableCell className="text-green-600 font-medium">{order.totalAmount?.toFixed(2)} ر.س</TableCell>
                            <TableCell className="text-orange-600">{(order.costOfGoods || 0).toFixed(2)} ر.س</TableCell>
                            <TableCell className={profit >= 0 ? 'text-blue-600 font-medium' : 'text-red-600'}>
                              {profit.toFixed(2)} ر.س
                            </TableCell>
                            <TableCell>
                              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                {order.status === 'completed' ? 'مكتمل' : order.status === 'pending' ? 'قيد الانتظار' : order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(order.createdAt), "yyyy/MM/dd HH:mm", { locale: ar })}</TableCell>
                          </TableRow>
                        );
                      })}
                      {(!ordersData?.orders || ordersData.orders.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            لا توجد طلبات
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )
              )}

              {drilldownType === 'cogs' && (
                <>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">تكلفة المكونات حسب الطلب</h4>
                    {isOrdersLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">رقم الطلب</TableHead>
                            <TableHead className="text-right">الإجمالي</TableHead>
                            <TableHead className="text-right">تكلفة المكونات</TableHead>
                            <TableHead className="text-right">هامش الربح</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ordersData?.orders?.filter(o => o.costOfGoods && o.costOfGoods > 0).map((order) => {
                            const margin = order.totalAmount > 0 ? ((order.totalAmount - (order.costOfGoods || 0)) / order.totalAmount * 100) : 0;
                            return (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                <TableCell>{order.totalAmount?.toFixed(2)} ر.س</TableCell>
                                <TableCell className="text-orange-600 font-medium">{order.costOfGoods?.toFixed(2)} ر.س</TableCell>
                                <TableCell className={margin >= 50 ? 'text-green-600' : margin >= 30 ? 'text-amber-600' : 'text-red-600'}>
                                  {margin.toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">حركات المخزون</h4>
                    {isStockLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">المادة</TableHead>
                            <TableHead className="text-right">النوع</TableHead>
                            <TableHead className="text-right">الكمية</TableHead>
                            <TableHead className="text-right">الرصيد السابق</TableHead>
                            <TableHead className="text-right">الرصيد الجديد</TableHead>
                            <TableHead className="text-right">ملاحظات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockMovementsData?.movements?.slice(0, 20).map((movement) => (
                            <TableRow key={movement.id}>
                              <TableCell>{movement.rawItemName || 'مادة'}</TableCell>
                              <TableCell>
                                <Badge variant={movement.movementType === 'sale' ? 'destructive' : movement.movementType === 'purchase' ? 'default' : 'secondary'}>
                                  {movement.movementType === 'sale' ? 'بيع' : movement.movementType === 'purchase' ? 'شراء' : movement.movementType}
                                </Badge>
                              </TableCell>
                              <TableCell className={movement.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                                {movement.quantity.toFixed(3)}
                              </TableCell>
                              <TableCell>{movement.previousQuantity.toFixed(3)}</TableCell>
                              <TableCell>{movement.newQuantity.toFixed(3)}</TableCell>
                              <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                {movement.notes}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </>
              )}

              {drilldownType === 'expenses' && (
                isExpensesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الفئة</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">الضريبة</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expensesData?.expenses?.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{format(new Date(expense.date), "yyyy/MM/dd", { locale: ar })}</TableCell>
                          <TableCell>
                            {expenseCategories.find(c => c.value === expense.category)?.label || expense.category}
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{expense.amount.toFixed(2)} ر.س</TableCell>
                          <TableCell>{expense.vatAmount.toFixed(2)} ر.س</TableCell>
                          <TableCell className="font-bold text-red-600">{expense.totalAmount.toFixed(2)} ر.س</TableCell>
                          <TableCell>
                            <Badge variant={statusLabels[expense.status]?.variant || "secondary"}>
                              {statusLabels[expense.status]?.label || expense.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!expensesData?.expenses || expensesData.expenses.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            لا توجد مصروفات
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Add Expense Dialog */}
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة مصروف جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الفئة</Label>
                <Select value={newExpense.category} onValueChange={(v) => setNewExpense(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger data-testid="select-expense-category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الوصف</Label>
                <Input 
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف المصروف"
                  data-testid="input-expense-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المبلغ</Label>
                  <Input 
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    data-testid="input-expense-amount"
                  />
                </div>
                <div>
                  <Label>الضريبة</Label>
                  <Input 
                    type="number"
                    value={newExpense.vatAmount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, vatAmount: e.target.value }))}
                    placeholder="0.00"
                    data-testid="input-expense-vat"
                  />
                </div>
              </div>
              <div>
                <Label>طريقة الدفع</Label>
                <Select value={newExpense.paymentMethod} onValueChange={(v) => setNewExpense(prev => ({ ...prev, paymentMethod: v }))}>
                  <SelectTrigger data-testid="select-expense-payment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Textarea 
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="ملاحظات إضافية (اختياري)"
                  data-testid="input-expense-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={handleAddExpense}
                disabled={!newExpense.category || !newExpense.description || !newExpense.amount || createExpenseMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700"
                data-testid="button-submit-expense"
              >
                {createExpenseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
