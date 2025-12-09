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
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

interface DashboardData {
  totalRevenue: number;
  totalVat: number;
  totalExpenses: number;
  totalCogs: number;
  grossProfit: number;
  netProfit: number;
  orderCount: number;
  invoiceCount: number;
  expensesByCategory: Record<string, number>;
  revenueByPayment: Record<string, number>;
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
      // Transform API response to match expected DashboardData structure
      return {
        totalRevenue: data.summary?.totalRevenue || 0,
        totalVat: data.summary?.totalVatCollected || 0,
        totalExpenses: data.summary?.totalExpenses || 0,
        totalCogs: data.summary?.totalCogs || 0,
        grossProfit: data.summary?.grossProfit || 0,
        netProfit: data.summary?.netProfit || 0,
        orderCount: data.summary?.orderCount || 0,
        invoiceCount: data.summary?.invoiceCount || 0,
        expensesByCategory: data.expensesByCategory || {},
        revenueByPayment: data.revenueByPayment || {},
      };
    },
  });

  const { data: expensesData, isLoading: isExpensesLoading } = useQuery<{ expenses: Expense[]; total: number }>({
    queryKey: ["/api/accounting/expenses", selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      const res = await fetch(`/api/accounting/expenses?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
  });

  const { data: revenuesData, isLoading: isRevenuesLoading } = useQuery<{ revenues: Revenue[]; total: number }>({
    queryKey: ["/api/accounting/revenue", selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      const res = await fetch(`/api/accounting/revenue?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch revenues");
      return res.json();
    },
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-[#1a1410] dark:via-[#1f1815] dark:to-[#231c17]" dir="rtl">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
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
            نظام المحاسبة والفواتير
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">إجمالي الإيرادات</p>
                          <p className="text-3xl font-bold mt-1">{(dashboardData.totalRevenue || 0).toFixed(2)}</p>
                          <p className="text-green-200 text-xs mt-1">ريال سعودي</p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm">إجمالي المصروفات</p>
                          <p className="text-3xl font-bold mt-1">{(dashboardData.totalExpenses || 0).toFixed(2)}</p>
                          <p className="text-red-200 text-xs mt-1">ريال سعودي</p>
                        </div>
                        <TrendingDown className="w-12 h-12 text-red-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">صافي الربح</p>
                          <p className="text-3xl font-bold mt-1">{(dashboardData.netProfit || 0).toFixed(2)}</p>
                          <p className="text-blue-200 text-xs mt-1">ريال سعودي</p>
                        </div>
                        <PiggyBank className="w-12 h-12 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm">ضريبة القيمة المضافة</p>
                          <p className="text-3xl font-bold mt-1">{(dashboardData.totalVat || 0).toFixed(2)}</p>
                          <p className="text-amber-200 text-xs mt-1">ريال سعودي</p>
                        </div>
                        <Receipt className="w-12 h-12 text-amber-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                        المصروفات حسب الفئة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(dashboardData.expensesByCategory || {}).map(([category, amount]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {expenseCategories.find(c => c.value === category)?.label || category}
                            </span>
                            <span className="font-bold text-red-600">{Number(amount).toFixed(2)} ر.س</span>
                          </div>
                        ))}
                        {Object.keys(dashboardData.expensesByCategory || {}).length === 0 && (
                          <p className="text-muted-foreground text-center py-4">لا توجد مصروفات</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        الإيرادات حسب طريقة الدفع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(dashboardData.revenueByPayment || {}).map(([method, amount]) => (
                          <div key={method} className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {paymentMethodLabels[method] || method}
                            </span>
                            <span className="font-bold text-green-600">{Number(amount).toFixed(2)} ر.س</span>
                          </div>
                        ))}
                        {Object.keys(dashboardData.revenueByPayment || {}).length === 0 && (
                          <p className="text-muted-foreground text-center py-4">لا توجد إيرادات</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PiggyBank className="w-5 h-5 text-green-600" />
                      حسابات الأرباح
                    </CardTitle>
                    <CardDescription>تفاصيل الأرباح وهوامش الربح</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">إجمالي الربح</p>
                        <p className="text-2xl font-bold text-green-600">{(dashboardData.grossProfit || 0).toFixed(2)}</p>
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
                        <p className="text-2xl font-bold text-purple-600">{(dashboardData.netProfit || 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">ر.س</p>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">هامش صافي الربح</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {dashboardData.totalRevenue > 0 
                            ? ((dashboardData.netProfit / dashboardData.totalRevenue) * 100).toFixed(1) 
                            : "0"}%
                        </p>
                        <p className="text-xs text-muted-foreground">من الإيرادات</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>إجمالي الإيرادات</span>
                          <span className="font-medium text-green-600">+{(dashboardData.totalRevenue || 0).toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between">
                          <span>تكلفة البضاعة المباعة (COGS)</span>
                          <span className="font-medium text-red-600">-{(dashboardData.totalCogs || 0).toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">= إجمالي الربح</span>
                          <span className="font-bold text-green-600">{(dashboardData.grossProfit || 0).toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between">
                          <span>المصروفات التشغيلية</span>
                          <span className="font-medium text-red-600">-{(dashboardData.totalExpenses || 0).toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">= صافي الربح</span>
                          <span className={`font-bold ${(dashboardData.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(dashboardData.netProfit || 0).toFixed(2)} ر.س
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                          <FileText className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">عدد الطلبات</p>
                          <p className="text-2xl font-bold">{dashboardData.orderCount}</p>
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
                          <p className="text-2xl font-bold">{dashboardData.invoiceCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <Wallet className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">تكلفة البضاعة المباعة</p>
                          <p className="text-2xl font-bold">{(dashboardData.totalCogs || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد بيانات متاحة
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
                                variant="ghost"
                                onClick={() => approveExpenseMutation.mutate(expense.id)}
                                disabled={approveExpenseMutation.isPending}
                                data-testid={`button-approve-expense-${expense.id}`}
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!expensesData?.expenses || expensesData.expenses.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                <CardDescription>جميع الإيرادات المسجلة من المبيعات</CardDescription>
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
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/manager/zatca-invoices")}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">الفواتير الضريبية (ZATCA)</h3>
                      <p className="text-muted-foreground text-sm">عرض وإدارة الفواتير الضريبية</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">التقرير اليومي</h3>
                      <p className="text-muted-foreground text-sm">ملخص المبيعات والمصروفات اليومية</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">تقرير الأرباح والخسائر</h3>
                      <p className="text-muted-foreground text-sm">تحليل الربحية الشهرية</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <Building2 className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">تقرير الفروع</h3>
                      <p className="text-muted-foreground text-sm">مقارنة أداء الفروع</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مصروف جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الفئة</Label>
                <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                  <SelectTrigger data-testid="select-expense-category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="وصف المصروف"
                  data-testid="input-expense-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المبلغ (قبل الضريبة)</Label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-expense-amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ضريبة القيمة المضافة</Label>
                  <Input
                    type="number"
                    value={newExpense.vatAmount}
                    onChange={(e) => setNewExpense({ ...newExpense, vatAmount: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-expense-vat"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select value={newExpense.paymentMethod} onValueChange={(v) => setNewExpense({ ...newExpense, paymentMethod: v })}>
                  <SelectTrigger data-testid="select-expense-payment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="pos">شبكة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية..."
                  data-testid="input-expense-notes"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
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
