import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { 
  Warehouse,
  Search,
  Edit,
  AlertTriangle,
  TrendingDown,
  Package,
  Loader2,
  RefreshCw
} from "lucide-react";

interface BranchStock {
  id: string;
  branchId: string;
  rawItemId: string;
  currentQuantity: number;
  reservedQuantity: number;
  lastUpdated: string;
  notes?: string;
  rawItem?: {
    nameAr: string;
    nameEn?: string;
    code: string;
    unit: string;
    minStockLevel: number;
  };
  branch?: {
    nameAr: string;
  };
}

interface RawItem {
  id: string;
  code: string;
  nameAr: string;
  unit: string;
  minStockLevel: number;
}

interface Branch {
  id?: string;
  _id?: string;
  nameAr: string;
}

const unitLabels: Record<string, string> = {
  kg: "كيلوجرام",
  g: "جرام",
  liter: "لتر",
  ml: "ملليلتر",
  piece: "قطعة",
  box: "صندوق",
  bag: "كيس",
};

export default function InventoryStockPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<BranchStock | null>(null);

  const [adjustData, setAdjustData] = useState({
    quantity: 0,
    type: "add" as "add" | "subtract" | "set",
    notes: "",
  });
  const [isQuantityDirty, setIsQuantityDirty] = useState(false);

  const { data: stockData = [], isLoading } = useQuery<BranchStock[]>({
    queryKey: ["/api/inventory/stock"],
  });

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const { data: rawItems = [] } = useQuery<RawItem[]>({
    queryKey: ["/api/inventory/raw-items"],
  });

  const adjustMutation = useMutation({
    mutationFn: (data: { branchId: string; rawItemId: string; quantity: number; type: string; notes: string }) => {
      if (!data.branchId || !data.rawItemId) {
        return Promise.reject(new Error("بيانات غير صالحة"));
      }
      if (data.type === "set" && data.quantity < 0) {
        return Promise.reject(new Error("الكمية يجب أن تكون موجبة"));
      }
      return apiRequest("POST", "/api/inventory/stock/adjust", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
      setIsAdjustDialogOpen(false);
      setSelectedStock(null);
      setAdjustData({ quantity: 0, type: "add", notes: "" });
      toast({ title: "تم تعديل المخزون بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "فشل في تعديل المخزون", variant: "destructive" });
    },
  });

  const handleAdjust = (stock: BranchStock) => {
    setSelectedStock(stock);
    setAdjustData({ quantity: 0, type: "add", notes: "" });
    setIsQuantityDirty(false);
    setIsAdjustDialogOpen(true);
  };

  const handleSubmitAdjust = () => {
    if (!selectedStock) {
      toast({ title: "يرجى تحديد المادة أولاً", variant: "destructive" });
      return;
    }
    
    if (adjustData.type === "add" && adjustData.quantity <= 0) {
      toast({ title: "يرجى إدخال كمية صحيحة للإضافة", variant: "destructive" });
      return;
    }

    if (adjustData.type === "subtract") {
      if (adjustData.quantity <= 0) {
        toast({ title: "يرجى إدخال كمية صحيحة للخصم", variant: "destructive" });
        return;
      }
      if (adjustData.quantity > selectedStock.currentQuantity) {
        toast({ title: "لا يمكن خصم كمية أكبر من المتوفر", variant: "destructive" });
        return;
      }
    }

    if (adjustData.type === "set") {
      if (adjustData.quantity < 0) {
        toast({ title: "الكمية لا يمكن أن تكون سالبة", variant: "destructive" });
        return;
      }
      if (!isQuantityDirty) {
        toast({ title: "يرجى تغيير الكمية أولاً", variant: "destructive" });
        return;
      }
    }

    let adjustedQuantity = adjustData.quantity;
    if (adjustData.type === "subtract") {
      adjustedQuantity = -adjustData.quantity;
    } else if (adjustData.type === "add") {
      adjustedQuantity = adjustData.quantity;
    }
    
    adjustMutation.mutate({
      branchId: selectedStock.branchId,
      rawItemId: selectedStock.rawItemId,
      quantity: adjustedQuantity,
      type: adjustData.type,
      notes: adjustData.notes,
    });
  };

  const getBranchName = (id: string) => branches.find(b => (b.id || b._id) === id)?.nameAr || id;

  const getStockStatus = (stock: BranchStock) => {
    const minLevel = stock.rawItem?.minStockLevel || 0;
    if (stock.currentQuantity <= 0) {
      return { label: "نفاد", variant: "destructive" as const, icon: AlertTriangle };
    } else if (stock.currentQuantity <= minLevel) {
      return { label: "منخفض", variant: "secondary" as const, icon: TrendingDown };
    }
    return { label: "متوفر", variant: "default" as const, icon: Package };
  };

  const filteredStock = stockData.filter((stock) => {
    const matchesSearch = 
      (stock.rawItem?.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (stock.rawItem?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesBranch = branchFilter === "all" || stock.branchId === branchFilter;
    
    let matchesStockFilter = true;
    if (stockFilter === "low") {
      matchesStockFilter = stock.currentQuantity <= (stock.rawItem?.minStockLevel || 0) && stock.currentQuantity > 0;
    } else if (stockFilter === "out") {
      matchesStockFilter = stock.currentQuantity <= 0;
    }
    
    return matchesSearch && matchesBranch && matchesStockFilter;
  });

  const totalItems = stockData.length;
  const lowStockItems = stockData.filter(s => s.currentQuantity <= (s.rawItem?.minStockLevel || 0) && s.currentQuantity > 0).length;
  const outOfStockItems = stockData.filter(s => s.currentQuantity <= 0).length;

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
          <Warehouse className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">مخزون الفروع</h1>
            <p className="text-muted-foreground text-sm">تتبع كميات المواد الخام في كل فرع</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] })}
          data-testid="button-refresh"
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المواد</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">نفاد المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockItems}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الكود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="input-search-stock"
              />
            </div>
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
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-stock-filter">
                <SelectValue placeholder="حالة المخزون" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="low">مخزون منخفض</SelectItem>
                <SelectItem value="out">نفاد المخزون</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">المادة</TableHead>
                  <TableHead className="text-right">الفرع</TableHead>
                  <TableHead className="text-right">الكمية المتوفرة</TableHead>
                  <TableHead className="text-right">الحد الأدنى</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد بيانات مخزون
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStock.map((stock) => {
                    const status = getStockStatus(stock);
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={stock.id} data-testid={`row-stock-${stock.id}`}>
                        <TableCell className="font-mono">{stock.rawItem?.code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{stock.rawItem?.nameAr}</div>
                            {stock.rawItem?.nameEn && (
                              <div className="text-sm text-muted-foreground">{stock.rawItem?.nameEn}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getBranchName(stock.branchId)}</TableCell>
                        <TableCell>
                          <span className="font-medium">{stock.currentQuantity}</span>
                          <span className="text-muted-foreground mr-1">
                            {unitLabels[stock.rawItem?.unit || ""] || stock.rawItem?.unit}
                          </span>
                        </TableCell>
                        <TableCell>{stock.rawItem?.minStockLevel || 0}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleAdjust(stock)}
                            data-testid={`button-adjust-${stock.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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

      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المخزون</DialogTitle>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium">{selectedStock.rawItem?.nameAr}</p>
                <p className="text-sm text-muted-foreground">
                  الكمية الحالية: {selectedStock.currentQuantity} {unitLabels[selectedStock.rawItem?.unit || ""] || selectedStock.rawItem?.unit}
                </p>
              </div>

              <div className="space-y-2">
                <Label>نوع التعديل</Label>
                <Select
                  value={adjustData.type}
                  onValueChange={(value: "add" | "subtract" | "set") => {
                    const newQuantity = value === "set" ? selectedStock?.currentQuantity || 0 : 0;
                    setAdjustData({ ...adjustData, type: value, quantity: newQuantity });
                    setIsQuantityDirty(false);
                  }}
                >
                  <SelectTrigger data-testid="select-adjust-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">إضافة للمخزون</SelectItem>
                    <SelectItem value="subtract">خصم من المخزون</SelectItem>
                    <SelectItem value="set">تعيين قيمة جديدة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {adjustData.type === "set" ? "الكمية الجديدة" : "الكمية"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={adjustData.quantity}
                  onChange={(e) => {
                    setAdjustData({ ...adjustData, quantity: parseFloat(e.target.value) || 0 });
                    setIsQuantityDirty(true);
                  }}
                  data-testid="input-adjust-quantity"
                />
                {adjustData.type === "set" && (
                  <p className="text-xs text-muted-foreground">أدخل الكمية المطلوبة كقيمة نهائية للمخزون</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>سبب التعديل</Label>
                <Input
                  value={adjustData.notes}
                  onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                  placeholder="جرد، تالف، تسوية..."
                  data-testid="input-adjust-notes"
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">الكمية بعد التعديل:</p>
                <p className="text-xl font-bold">
                  {adjustData.type === "add" 
                    ? selectedStock.currentQuantity + adjustData.quantity
                    : adjustData.type === "subtract"
                    ? selectedStock.currentQuantity - adjustData.quantity
                    : adjustData.quantity
                  } {unitLabels[selectedStock.rawItem?.unit || ""] || selectedStock.rawItem?.unit}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleSubmitAdjust}
              disabled={adjustMutation.isPending}
              data-testid="button-submit-adjust"
            >
              {adjustMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              تأكيد التعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
