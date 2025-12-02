import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Users,
  AlertTriangle,
  ArrowRightLeft,
  FileText,
  Warehouse,
  TrendingDown,
  Bell,
  ArrowRight,
  Loader2,
  BookOpen,
  History,
  Coffee,
  DollarSign,
  CheckCircle,
  Clock,
  Boxes,
} from "lucide-react";

interface DashboardData {
  summary: {
    totalRawItems: number;
    totalSuppliers: number;
    lowStockCount: number;
    alertsCount: number;
    pendingTransfersCount: number;
    pendingPurchasesCount: number;
    unpaidPurchasesCount: number;
  };
  lowStock: any[];
  recentAlerts: any[];
  pendingTransfers: any[];
  pendingPurchases: any[];
}

const alertTypeLabels: Record<string, { label: string; color: string; icon: any }> = {
  low_stock: { 
    label: "مخزون منخفض", 
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    icon: TrendingDown
  },
  out_of_stock: { 
    label: "نفاد المخزون", 
    color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    icon: AlertTriangle
  },
  expiring_soon: { 
    label: "قارب على الانتهاء", 
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
    icon: Clock
  },
  expired: { 
    label: "منتهي الصلاحية", 
    color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    icon: AlertTriangle
  },
};

const transferStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "قيد الانتظار", variant: "secondary" },
  approved: { label: "تمت الموافقة", variant: "default" },
  in_transit: { label: "في الطريق", variant: "outline" },
  completed: { label: "مكتمل", variant: "default" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  color = "default",
  link,
  linkText,
  subtitle
}: { 
  title: string; 
  value: number | string; 
  icon: any;
  color?: "default" | "success" | "warning" | "danger" | "info";
  link?: string;
  linkText?: string;
  subtitle?: string;
}) {
  const colorClasses = {
    default: "bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900/50 dark:to-stone-800/50 border-stone-200 dark:border-stone-700",
    success: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-emerald-200 dark:border-emerald-700",
    warning: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-700",
    danger: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-700",
    info: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700",
  };

  const iconColors = {
    default: "text-stone-600 dark:text-stone-400",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  const valueColors = {
    default: "text-stone-900 dark:text-stone-100",
    success: "text-emerald-700 dark:text-emerald-300",
    warning: "text-amber-700 dark:text-amber-300",
    danger: "text-red-700 dark:text-red-300",
    info: "text-blue-700 dark:text-blue-300",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]} transition-all duration-200`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={`p-2 rounded-lg bg-white/60 dark:bg-black/20 ${iconColors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`text-3xl font-bold ${valueColors[color]}`}>{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
      {link && linkText && (
        <Link href={link}>
          <Button variant="ghost" size="sm" className="p-0 h-auto text-xs mt-2" data-testid={`link-${title.replace(/\s/g, '-')}`}>
            {linkText}
            <ArrowRight className="h-3 w-3 mr-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function InventoryDashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/inventory/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <Coffee className="h-12 w-12 text-amber-700 dark:text-amber-500 animate-pulse mx-auto" />
            <Loader2 className="h-6 w-6 animate-spin text-amber-600 absolute -bottom-1 -right-1" />
          </div>
          <p className="text-muted-foreground mt-3">جاري تحميل بيانات المخزون...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
          <p className="text-muted-foreground">حدث خطأ في تحميل البيانات</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalRawItems: 0,
    totalSuppliers: 0,
    lowStockCount: 0,
    alertsCount: 0,
    pendingTransfersCount: 0,
    pendingPurchasesCount: 0,
    unpaidPurchasesCount: 0,
  };

  const healthScore = Math.max(0, 100 - (summary.lowStockCount * 10) - (summary.alertsCount * 5));

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50">
          <Warehouse className="h-8 w-8 text-amber-700 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">لوحة تحكم المخزون</h1>
          <p className="text-muted-foreground text-sm">نظرة عامة على إدارة المخزون والمواد الخام</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="المواد الخام"
          value={summary.totalRawItems}
          icon={Package}
          color="default"
          link="/manager/inventory/raw-items"
          linkText="إدارة المواد"
        />
        <KPICard
          title="الموردين"
          value={summary.totalSuppliers}
          icon={Users}
          color="info"
          link="/manager/inventory/suppliers"
          linkText="إدارة الموردين"
        />
        <KPICard
          title="مخزون منخفض"
          value={summary.lowStockCount}
          icon={TrendingDown}
          color={summary.lowStockCount > 0 ? "danger" : "success"}
          subtitle={summary.lowStockCount > 0 ? "مادة تحتاج إعادة طلب" : "جميع المواد متوفرة"}
        />
        <KPICard
          title="التنبيهات النشطة"
          value={summary.alertsCount}
          icon={Bell}
          color={summary.alertsCount > 0 ? "warning" : "success"}
          subtitle={summary.alertsCount > 0 ? "تنبيه غير محلول" : "لا توجد تنبيهات"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="تحويلات معلقة"
          value={summary.pendingTransfersCount}
          icon={ArrowRightLeft}
          color={summary.pendingTransfersCount > 0 ? "warning" : "default"}
          link="/manager/inventory/transfers"
          linkText="عرض التحويلات"
        />
        <KPICard
          title="فواتير معلقة"
          value={summary.pendingPurchasesCount}
          icon={FileText}
          color={summary.pendingPurchasesCount > 0 ? "info" : "default"}
          link="/manager/inventory/purchases"
          linkText="عرض الفواتير"
        />
        <KPICard
          title="فواتير غير مدفوعة"
          value={summary.unpaidPurchasesCount}
          icon={DollarSign}
          color={summary.unpaidPurchasesCount > 0 ? "danger" : "success"}
          subtitle={summary.unpaidPurchasesCount > 0 ? "تحتاج متابعة" : "جميع الفواتير مسددة"}
        />
      </div>

      <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/20 dark:to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-amber-600" />
            صحة المخزون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">مستوى الصحة العام</span>
              <span className={`font-medium ${
                healthScore >= 80 ? "text-emerald-600" : 
                healthScore >= 50 ? "text-amber-600" : "text-red-600"
              }`}>
                {healthScore}%
              </span>
            </div>
            <Progress 
              value={healthScore} 
              className="h-2 bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {healthScore >= 80 ? "المخزون في حالة ممتازة" :
               healthScore >= 50 ? "يوجد بعض العناصر التي تحتاج اهتمام" :
               "المخزون يحتاج مراجعة عاجلة"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-900/10 dark:to-transparent">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-red-500" />
              مواد منخفضة المخزون
              {data?.lowStock && data.lowStock.length > 0 && (
                <Badge variant="destructive" className="mr-auto">
                  {data.lowStock.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {data?.lowStock && data.lowStock.length > 0 ? (
              <div className="space-y-3">
                {data.lowStock.slice(0, 5).map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-muted hover-elevate transition-all"
                    data-testid={`low-stock-item-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${
                        item.alertLevel === "critical" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      <div>
                        <p className="font-medium">{item.rawItem?.nameAr || "غير معروف"}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.branch?.nameAr || "غير محدد"}
                        </p>
                      </div>
                    </div>
                    <div className="text-left flex items-center gap-2">
                      <Badge 
                        variant={item.alertLevel === "critical" ? "destructive" : "secondary"}
                        className="font-mono"
                      >
                        {item.stock?.currentQuantity || 0}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        من {item.rawItem?.minStockLevel || 0}
                      </span>
                    </div>
                  </div>
                ))}
                {data.lowStock.length > 5 && (
                  <Link href="/manager/inventory/stock">
                    <Button variant="outline" className="w-full mt-2" size="sm">
                      عرض الكل ({data.lowStock.length})
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 inline-block mb-3">
                  <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">جميع المواد متوفرة</p>
                <p className="text-sm">لا توجد مواد منخفضة المخزون</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10 dark:to-transparent">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-amber-500" />
              آخر التنبيهات
              {data?.recentAlerts && data.recentAlerts.length > 0 && (
                <Badge variant="secondary" className="mr-auto bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {data.recentAlerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {data?.recentAlerts && data.recentAlerts.length > 0 ? (
              <div className="space-y-3">
                {data.recentAlerts.slice(0, 5).map((alert: any, index: number) => {
                  const alertInfo = alertTypeLabels[alert.alertType] || { label: alert.alertType, color: "", icon: Bell };
                  const AlertIcon = alertInfo.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-muted hover-elevate transition-all"
                      data-testid={`alert-item-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <AlertIcon className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="font-medium">{alert.rawItemId}</p>
                          <p className="text-sm text-muted-foreground">
                            الكمية: {alert.currentQuantity} / {alert.thresholdQuantity}
                          </p>
                        </div>
                      </div>
                      <Badge className={alertInfo.color}>
                        {alertInfo.label}
                      </Badge>
                    </div>
                  );
                })}
                {data.recentAlerts.length > 5 && (
                  <Link href="/manager/inventory/alerts">
                    <Button variant="outline" className="w-full mt-2" size="sm">
                      عرض الكل ({data.recentAlerts.length})
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 inline-block mb-3">
                  <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">لا توجد تنبيهات</p>
                <p className="text-sm">جميع المواد في المستوى الآمن</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRightLeft className="h-5 w-5 text-blue-500" />
              التحويلات المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {data?.pendingTransfers && data.pendingTransfers.length > 0 ? (
              <div className="space-y-3">
                {data.pendingTransfers.slice(0, 4).map((transfer: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-muted hover-elevate transition-all"
                    data-testid={`transfer-item-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <Boxes className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium font-mono text-sm">{transfer.transferNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {transfer.items?.length || 0} مادة
                        </p>
                      </div>
                    </div>
                    <Badge variant={transferStatusLabels[transfer.status]?.variant || "secondary"}>
                      {transferStatusLabels[transfer.status]?.label || transfer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowRightLeft className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>لا توجد تحويلات معلقة</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-indigo-500" />
              الفواتير المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {data?.pendingPurchases && data.pendingPurchases.length > 0 ? (
              <div className="space-y-3">
                {data.pendingPurchases.slice(0, 4).map((invoice: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-muted hover-elevate transition-all"
                    data-testid={`purchase-item-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="font-medium font-mono text-sm">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.totalAmount?.toFixed(2) || 0} ر.س
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {invoice.status === "pending" ? "قيد الانتظار" : "معتمدة"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>لا توجد فواتير معلقة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900/50 dark:to-stone-800/50">
        <CardHeader>
          <CardTitle className="text-lg">روابط سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/manager/inventory/raw-items">
              <Button variant="outline" className="w-full justify-start bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700" data-testid="quick-link-raw-items">
                <Package className="h-4 w-4 ml-2 text-amber-600" />
                إدارة المواد الخام
              </Button>
            </Link>
            <Link href="/manager/inventory/suppliers">
              <Button variant="outline" className="w-full justify-start bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700" data-testid="quick-link-suppliers">
                <Users className="h-4 w-4 ml-2 text-blue-600" />
                إدارة الموردين
              </Button>
            </Link>
            <Link href="/manager/inventory/purchases">
              <Button variant="outline" className="w-full justify-start bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700" data-testid="quick-link-purchases">
                <FileText className="h-4 w-4 ml-2 text-indigo-600" />
                فواتير الشراء
              </Button>
            </Link>
            <Link href="/manager/inventory/transfers">
              <Button variant="outline" className="w-full justify-start bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700" data-testid="quick-link-transfers">
                <ArrowRightLeft className="h-4 w-4 ml-2 text-purple-600" />
                تحويلات المخزون
              </Button>
            </Link>
            <Link href="/manager/inventory/recipes">
              <Button variant="outline" className="w-full justify-start bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700" data-testid="quick-link-recipes">
                <BookOpen className="h-4 w-4 ml-2 text-emerald-600" />
                وصفات المنتجات (COGS)
              </Button>
            </Link>
            <Link href="/manager/inventory/stock">
              <Button variant="outline" className="w-full justify-start bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700" data-testid="quick-link-stock">
                <Warehouse className="h-4 w-4 ml-2 text-teal-600" />
                مخزون الفروع
              </Button>
            </Link>
            <Link href="/manager/inventory/alerts">
              <Button variant="outline" className="w-full justify-start bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700" data-testid="quick-link-alerts">
                <Bell className="h-4 w-4 ml-2 text-amber-600" />
                تنبيهات المخزون
              </Button>
            </Link>
            <Link href="/manager/inventory/movements">
              <Button variant="outline" className="w-full justify-start bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700" data-testid="quick-link-movements">
                <History className="h-4 w-4 ml-2 text-slate-600" />
                حركات المخزون
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
