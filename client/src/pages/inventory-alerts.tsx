import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Bell,
  AlertTriangle,
  TrendingDown,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface StockAlert {
  id: string;
  branchId: string;
  rawItemId: string;
  alertType: string;
  currentQuantity: number;
  thresholdQuantity: number;
  isRead: number;
  isResolved: number;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  rawItem?: {
    nameAr: string;
    code: string;
    unit: string;
  };
  branch?: {
    nameAr: string;
  };
}

interface Branch {
  id?: string;
  _id?: string;
  nameAr: string;
}

const alertTypeConfig: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  low_stock: { label: "مخزون منخفض", icon: TrendingDown, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  out_of_stock: { label: "نفاد المخزون", icon: AlertTriangle, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  expiring_soon: { label: "قارب على الانتهاء", icon: Clock, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  expired: { label: "منتهي الصلاحية", icon: AlertTriangle, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

const unitLabels: Record<string, string> = {
  kg: "كيلوجرام",
  g: "جرام",
  liter: "لتر",
  ml: "ملليلتر",
  piece: "قطعة",
  box: "صندوق",
  bag: "كيس",
};

export default function InventoryAlertsPage() {
  const { toast } = useToast();
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("unresolved");

  const { data: alerts = [], isLoading } = useQuery<StockAlert[]>({
    queryKey: ["/api/inventory/alerts"],
  });

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/inventory/alerts/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/alerts"] });
      toast({ title: "تم حل التنبيه بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "فشل في حل التنبيه", variant: "destructive" });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/inventory/alerts/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/alerts"] });
    },
    onError: (error: any) => {
      toast({ title: error.message || "فشل في تحديث التنبيه", variant: "destructive" });
    },
  });

  const getBranchName = (id: string) => branches.find(b => (b.id || b._id) === id)?.nameAr || id;

  const filteredAlerts = alerts.filter((alert) => {
    const matchesBranch = branchFilter === "all" || alert.branchId === branchFilter;
    const matchesType = typeFilter === "all" || alert.alertType === typeFilter;
    let matchesStatus = true;
    if (statusFilter === "unresolved") {
      matchesStatus = alert.isResolved === 0;
    } else if (statusFilter === "resolved") {
      matchesStatus = alert.isResolved === 1;
    }
    
    return matchesBranch && matchesType && matchesStatus;
  });

  const unresolvedCount = alerts.filter(a => a.isResolved === 0).length;
  const unreadCount = alerts.filter(a => a.isRead === 0 && a.isResolved === 0).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">تنبيهات المخزون</h1>
            <p className="text-muted-foreground text-sm">متابعة تنبيهات نفاد وانخفاض المخزون</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/inventory/alerts"] })}
          data-testid="button-refresh"
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">تنبيهات غير محلولة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unresolvedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">تنبيهات غير مقروءة</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{unreadCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-branch-filter">
                <SelectValue placeholder="الفرع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفروع</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id || branch._id} value={(branch.id || branch._id) as string}>
                    {branch.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                <SelectValue placeholder="نوع التنبيه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {Object.entries(alertTypeConfig).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="unresolved">غير محلولة</SelectItem>
                <SelectItem value="resolved">محلولة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المادة</TableHead>
                  <TableHead className="text-right">الفرع</TableHead>
                  <TableHead className="text-right">الكمية الحالية</TableHead>
                  <TableHead className="text-right">الحد الأدنى</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>لا توجد تنبيهات</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map((alert) => {
                    const config = alertTypeConfig[alert.alertType] || alertTypeConfig.low_stock;
                    const AlertIcon = config.icon;
                    
                    return (
                      <TableRow 
                        key={alert.id} 
                        className={alert.isRead === 0 ? "bg-muted/30" : ""}
                        data-testid={`row-alert-${alert.id}`}
                      >
                        <TableCell>
                          <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
                            <AlertIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{alert.rawItem?.nameAr}</div>
                            <div className="text-sm text-muted-foreground font-mono">{alert.rawItem?.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>{alert.branch?.nameAr || getBranchName(alert.branchId)}</TableCell>
                        <TableCell>
                          <span className="font-medium">{alert.currentQuantity}</span>
                          <span className="text-muted-foreground mr-1">
                            {unitLabels[alert.rawItem?.unit || ""] || alert.rawItem?.unit}
                          </span>
                        </TableCell>
                        <TableCell>{alert.thresholdQuantity}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(alert.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                        </TableCell>
                        <TableCell>
                          {alert.isResolved === 1 ? (
                            <Badge variant="default" className="flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" />
                              محلول
                            </Badge>
                          ) : (
                            <Badge variant="secondary">قيد الانتظار</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {alert.isResolved === 0 && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resolveMutation.mutate(alert.id)}
                                disabled={resolveMutation.isPending}
                                data-testid={`button-resolve-${alert.id}`}
                              >
                                <CheckCircle className="h-4 w-4 ml-1" />
                                حل
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
