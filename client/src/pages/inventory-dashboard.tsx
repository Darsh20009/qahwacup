import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const alertTypeLabels: Record<string, { label: string; color: string }> = {
  low_stock: { label: "مخزون منخفض", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  out_of_stock: { label: "نفاد المخزون", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  expiring_soon: { label: "قارب على الانتهاء", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  expired: { label: "منتهي الصلاحية", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

const transferStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "قيد الانتظار", variant: "secondary" },
  approved: { label: "تمت الموافقة", variant: "default" },
  in_transit: { label: "في الطريق", variant: "outline" },
  completed: { label: "مكتمل", variant: "default" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

export default function InventoryDashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/inventory/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">حدث خطأ في تحميل البيانات</p>
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

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <Warehouse className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">لوحة تحكم المخزون</h1>
          <p className="text-muted-foreground text-sm">نظرة عامة على إدارة المخزون والمواد</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">المواد الخام</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRawItems}</div>
            <Link href="/manager/inventory/raw-items">
              <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-raw-items">
                إدارة المواد الخام
                <ArrowRight className="h-3 w-3 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">الموردين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSuppliers}</div>
            <Link href="/manager/inventory/suppliers">
              <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-suppliers">
                إدارة الموردين
                <ArrowRight className="h-3 w-3 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">مادة تحتاج إعادة طلب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">التنبيهات</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.alertsCount}</div>
            <p className="text-xs text-muted-foreground">تنبيه غير محلول</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">تحويلات معلقة</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingTransfersCount}</div>
            <Link href="/manager/inventory/transfers">
              <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-transfers">
                عرض التحويلات
                <ArrowRight className="h-3 w-3 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">فواتير معلقة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingPurchasesCount}</div>
            <Link href="/manager/inventory/purchases">
              <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-purchases">
                عرض الفواتير
                <ArrowRight className="h-3 w-3 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">فواتير غير مدفوعة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.unpaidPurchasesCount}</div>
            <p className="text-xs text-muted-foreground">تحتاج متابعة</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              مواد منخفضة المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.lowStock && data.lowStock.length > 0 ? (
              <div className="space-y-3">
                {data.lowStock.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`low-stock-item-${index}`}
                  >
                    <div>
                      <p className="font-medium">{item.rawItem?.nameAr || "غير معروف"}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.branch?.nameAr || "غير محدد"}
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge variant={item.alertLevel === "critical" ? "destructive" : "secondary"}>
                        {item.stock?.currentQuantity || 0} متوفر
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد مواد منخفضة المخزون</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              آخر التنبيهات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentAlerts && data.recentAlerts.length > 0 ? (
              <div className="space-y-3">
                {data.recentAlerts.map((alert: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`alert-item-${index}`}
                  >
                    <div>
                      <p className="font-medium">{alert.rawItemId}</p>
                      <p className="text-sm text-muted-foreground">
                        الكمية الحالية: {alert.currentQuantity}
                      </p>
                    </div>
                    <Badge className={alertTypeLabels[alert.alertType]?.color || ""}>
                      {alertTypeLabels[alert.alertType]?.label || alert.alertType}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد تنبيهات حالياً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              التحويلات المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.pendingTransfers && data.pendingTransfers.length > 0 ? (
              <div className="space-y-3">
                {data.pendingTransfers.map((transfer: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`transfer-item-${index}`}
                  >
                    <div>
                      <p className="font-medium font-mono">{transfer.transferNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {transfer.items?.length || 0} مادة
                      </p>
                    </div>
                    <Badge variant={transferStatusLabels[transfer.status]?.variant || "secondary"}>
                      {transferStatusLabels[transfer.status]?.label || transfer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowRightLeft className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد تحويلات معلقة</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              الفواتير المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.pendingPurchases && data.pendingPurchases.length > 0 ? (
              <div className="space-y-3">
                {data.pendingPurchases.map((invoice: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`purchase-item-${index}`}
                  >
                    <div>
                      <p className="font-medium font-mono">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.totalAmount?.toFixed(2) || 0} ر.س
                      </p>
                    </div>
                    <Badge variant="outline">
                      {invoice.status === "pending" ? "قيد الانتظار" : "معتمدة"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد فواتير معلقة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>روابط سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/manager/inventory/raw-items">
              <Button variant="outline" className="w-full justify-start" data-testid="quick-link-raw-items">
                <Package className="h-4 w-4 ml-2" />
                إدارة المواد الخام
              </Button>
            </Link>
            <Link href="/manager/inventory/suppliers">
              <Button variant="outline" className="w-full justify-start" data-testid="quick-link-suppliers">
                <Users className="h-4 w-4 ml-2" />
                إدارة الموردين
              </Button>
            </Link>
            <Link href="/manager/inventory/purchases">
              <Button variant="outline" className="w-full justify-start" data-testid="quick-link-purchases">
                <FileText className="h-4 w-4 ml-2" />
                فواتير الشراء
              </Button>
            </Link>
            <Link href="/manager/inventory/transfers">
              <Button variant="outline" className="w-full justify-start" data-testid="quick-link-transfers">
                <ArrowRightLeft className="h-4 w-4 ml-2" />
                تحويلات المخزون
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
