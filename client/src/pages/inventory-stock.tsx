import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  Warehouse,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  TrendingDown,
  Package,
  Loader2,
  RefreshCw,
  Scale,
  CheckCircle,
  DollarSign,
  PackagePlus,
  Bell,
  Calculator
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
    unitCost: number;
    category?: string;
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
  unitCost: number;
  category?: string;
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
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSubtractOpen, setIsSubtractOpen] = useState(false);
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<BranchStock | null>(null);
  const [quickAddQuantity, setQuickAddQuantity] = useState<string>("");
  const [subtractQuantity, setSubtractQuantity] = useState<string>("");
  const [adjustNotes, setAdjustNotes] = useState("");
  
  const [newBatchData, setNewBatchData] = useState({
    branchId: "",
    rawItemId: "",
    quantity: "",
    unitCost: "",
    notes: "",
    batchNumber: "",
  });

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
      return apiRequest("POST", "/api/inventory/stock/adjust", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
      setIsQuickAddOpen(false);
      setIsSubtractOpen(false);
      setSelectedStock(null);
      setQuickAddQuantity("");
      setSubtractQuantity("");
      setAdjustNotes("");
      toast({ 
        title: variables.type === "add" ? "تمت إضافة المخزون بنجاح" : "تم خصم المخزون بنجاح",
        description: `${Math.abs(variables.quantity)} ${unitLabels[selectedStock?.rawItem?.unit || ''] || ''}`
      });
    },
    onError: (error: any) => {
      toast({ title: error.message || "فشل في تعديل المخزون", variant: "destructive" });
    },
  });

  const newBatchMutation = useMutation({
    mutationFn: (data: { branchId: string; rawItemId: string; quantity: number; unitCost?: number; notes: string }) => {
      return apiRequest("POST", "/api/inventory/stock/adjust", {
        ...data,
        type: "add",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
      setIsNewBatchOpen(false);
      setNewBatchData({
        branchId: "",
        rawItemId: "",
        quantity: "",
        unitCost: "",
        notes: "",
        batchNumber: "",
      });
      toast({ 
        title: "تمت إضافة الدفعة بنجاح",
        description: "تم تحديث المخزون بالكمية الجديدة"
      });
    },
    onError: (error: any) => {
      toast({ title: error.message || "فشل في إضافة الدفعة", variant: "destructive" });
    },
  });

  const handleQuickAdd = (stock: BranchStock) => {
    setSelectedStock(stock);
    setQuickAddQuantity("");
    setAdjustNotes("");
    setIsQuickAddOpen(true);
  };

  const handleSubtract = (stock: BranchStock) => {
    setSelectedStock(stock);
    setSubtractQuantity("");
    setAdjustNotes("");
    setIsSubtractOpen(true);
  };

  const handleSubmitQuickAdd = () => {
    if (!selectedStock) return;
    const qty = parseFloat(quickAddQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "يرجى إدخال كمية صحيحة", variant: "destructive" });
      return;
    }
    adjustMutation.mutate({
      branchId: selectedStock.branchId,
      rawItemId: selectedStock.rawItemId,
      quantity: qty,
      type: "add",
      notes: adjustNotes || "إضافة مخزون",
    });
  };

  const handleSubmitSubtract = () => {
    if (!selectedStock) return;
    const qty = parseFloat(subtractQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "يرجى إدخال كمية صحيحة", variant: "destructive" });
      return;
    }
    if (qty > selectedStock.currentQuantity) {
      toast({ title: "لا يمكن خصم كمية أكبر من المتوفر", variant: "destructive" });
      return;
    }
    adjustMutation.mutate({
      branchId: selectedStock.branchId,
      rawItemId: selectedStock.rawItemId,
      quantity: -qty,
      type: "subtract",
      notes: adjustNotes || "خصم يدوي",
    });
  };

  const handleSubmitNewBatch = () => {
    const qty = parseFloat(newBatchData.quantity);
    if (!newBatchData.branchId || !newBatchData.rawItemId) {
      toast({ title: "يرجى اختيار الفرع والمادة", variant: "destructive" });
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "يرجى إدخال كمية صحيحة", variant: "destructive" });
      return;
    }
    
    const batchNote = newBatchData.batchNumber 
      ? `دفعة جديدة #${newBatchData.batchNumber}: ${newBatchData.notes || 'توريد'}`
      : newBatchData.notes || "دفعة جديدة";
      
    newBatchMutation.mutate({
      branchId: newBatchData.branchId,
      rawItemId: newBatchData.rawItemId,
      quantity: qty,
      unitCost: newBatchData.unitCost ? parseFloat(newBatchData.unitCost) : undefined,
      notes: batchNote,
    });
  };

  const getBranchName = (id: string) => branches.find(b => (b.id || b._id) === id)?.nameAr || id;

  const getStockStatus = (stock: BranchStock) => {
    const minLevel = stock.rawItem?.minStockLevel || 0;
    if (stock.currentQuantity <= 0) {
      return { label: "نفاد", variant: "destructive" as const, icon: AlertTriangle, priority: 3 };
    } else if (stock.currentQuantity <= minLevel) {
      return { label: "منخفض", variant: "secondary" as const, icon: TrendingDown, priority: 2 };
    } else if (stock.currentQuantity <= minLevel * 1.5) {
      return { label: "تنبيه", variant: "outline" as const, icon: Bell, priority: 1 };
    }
    return { label: "متوفر", variant: "default" as const, icon: Package, priority: 0 };
  };

  const calculateStockValue = (stock: BranchStock) => {
    const unitCost = stock.rawItem?.unitCost || 0;
    return stock.currentQuantity * unitCost;
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
    } else if (stockFilter === "warning") {
      const minLevel = stock.rawItem?.minStockLevel || 0;
      matchesStockFilter = stock.currentQuantity > minLevel && stock.currentQuantity <= minLevel * 1.5;
    }
    
    return matchesSearch && matchesBranch && matchesStockFilter;
  });

  const totalItems = stockData.length;
  const lowStockItems = stockData.filter(s => s.currentQuantity <= (s.rawItem?.minStockLevel || 0) && s.currentQuantity > 0).length;
  const outOfStockItems = stockData.filter(s => s.currentQuantity <= 0).length;
  const warningItems = stockData.filter(s => {
    const minLevel = s.rawItem?.minStockLevel || 0;
    return s.currentQuantity > minLevel && s.currentQuantity <= minLevel * 1.5;
  }).length;
  
  const totalStockValue = stockData.reduce((acc, stock) => acc + calculateStockValue(stock), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Warehouse className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">مخزون الفروع</h1>
            <p className="text-muted-foreground text-sm">تتبع كميات المواد الخام في كل فرع مع حساب التكلفة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsNewBatchOpen(true)}
            data-testid="button-new-batch"
          >
            <PackagePlus className="h-4 w-4 ml-2" />
            دفعة جديدة
          </Button>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] })}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStockValue.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">إجمالي تكلفة المواد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">تحتاج مراقبة</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{warningItems}</div>
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

      {(lowStockItems > 0 || outOfStockItems > 0) && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stockData
                .filter(s => getStockStatus(s).priority >= 2)
                .sort((a, b) => getStockStatus(b).priority - getStockStatus(a).priority)
                .slice(0, 10)
                .map((stock) => {
                  const status = getStockStatus(stock);
                  return (
                    <Badge
                      key={stock.id}
                      variant={status.variant}
                      className="flex items-center gap-1"
                    >
                      <status.icon className="h-3 w-3" />
                      {stock.rawItem?.nameAr} - {getBranchName(stock.branchId)}
                      <span className="font-bold mr-1">({stock.currentQuantity})</span>
                    </Badge>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

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
                <SelectItem value="warning">يحتاج مراقبة</SelectItem>
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
                  <TableHead className="text-right">تكلفة الوحدة</TableHead>
                  <TableHead className="text-right">القيمة الإجمالية</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      لا توجد بيانات مخزون
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStock.map((stock) => {
                    const status = getStockStatus(stock);
                    const StatusIcon = status.icon;
                    const stockValue = calculateStockValue(stock);
                    
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
                          <span className="font-medium">{(stock.rawItem?.unitCost || 0).toFixed(2)}</span>
                          <span className="text-muted-foreground mr-1">ر.س</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calculator className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-green-600">{stockValue.toFixed(2)}</span>
                            <span className="text-muted-foreground">ر.س</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="default"
                              onClick={() => handleQuickAdd(stock)}
                              title="إضافة مخزون"
                              data-testid={`button-add-${stock.id}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleSubtract(stock)}
                              title="خصم من المخزون"
                              data-testid={`button-subtract-${stock.id}`}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
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

      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              إضافة مخزون
            </DialogTitle>
            <DialogDescription>
              أضف كمية جديدة للمخزون الحالي
            </DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold">{selectedStock.rawItem?.nameAr}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">المخزون الحالي:</span>
                  <span className="font-bold text-xl">{selectedStock.currentQuantity}</span>
                  <span className="text-muted-foreground">{unitLabels[selectedStock.rawItem?.unit || ""] || selectedStock.rawItem?.unit}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1 text-sm">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">تكلفة الوحدة:</span>
                  <span className="font-medium">{(selectedStock.rawItem?.unitCost || 0).toFixed(2)} ر.س</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-lg">الكمية المضافة ({unitLabels[selectedStock.rawItem?.unit || ""] || selectedStock.rawItem?.unit})</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quickAddQuantity}
                  onChange={(e) => setQuickAddQuantity(e.target.value)}
                  placeholder="0"
                  className="text-2xl h-14 text-center font-bold"
                  data-testid="input-quick-add-quantity"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Input
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="توريد جديد، شراء..."
                  data-testid="input-quick-add-notes"
                />
              </div>

              {quickAddQuantity && parseFloat(quickAddQuantity) > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">المخزون الجديد:</span>
                    <span className="font-bold text-2xl text-green-600">
                      {selectedStock.currentQuantity + parseFloat(quickAddQuantity)}
                    </span>
                    <span className="text-muted-foreground">{unitLabels[selectedStock.rawItem?.unit || ""] || selectedStock.rawItem?.unit}</span>
                  </div>
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    قيمة الإضافة: {(parseFloat(quickAddQuantity) * (selectedStock.rawItem?.unitCost || 0)).toFixed(2)} ر.س
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsQuickAddOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleSubmitQuickAdd}
              disabled={adjustMutation.isPending || !quickAddQuantity || parseFloat(quickAddQuantity) <= 0}
              data-testid="button-submit-quick-add"
            >
              {adjustMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              <Plus className="h-4 w-4 ml-1" />
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubtractOpen} onOpenChange={setIsSubtractOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5 text-orange-600" />
              خصم من المخزون
            </DialogTitle>
            <DialogDescription>
              اخصم كمية من المخزون الحالي
            </DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold">{selectedStock.rawItem?.nameAr}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">المتوفر:</span>
                  <span className="font-bold text-xl">{selectedStock.currentQuantity}</span>
                  <span className="text-muted-foreground">{unitLabels[selectedStock.rawItem?.unit || ""] || selectedStock.rawItem?.unit}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-lg">الكمية المخصومة ({unitLabels[selectedStock.rawItem?.unit || ""] || selectedStock.rawItem?.unit})</Label>
                <Input
                  type="number"
                  min="0"
                  max={selectedStock.currentQuantity}
                  step="0.01"
                  value={subtractQuantity}
                  onChange={(e) => setSubtractQuantity(e.target.value)}
                  placeholder="0"
                  className="text-2xl h-14 text-center font-bold"
                  data-testid="input-subtract-quantity"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  الحد الأقصى: {selectedStock.currentQuantity} {unitLabels[selectedStock.rawItem?.unit || ""] || selectedStock.rawItem?.unit}
                </p>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Input
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="تالف، استخدام، تسوية..."
                  data-testid="input-subtract-notes"
                />
              </div>

              {subtractQuantity && parseFloat(subtractQuantity) > 0 && (
                <div className={`p-4 rounded-lg border ${
                  parseFloat(subtractQuantity) > selectedStock.currentQuantity 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    {parseFloat(subtractQuantity) > selectedStock.currentQuantity ? (
                      <>
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-medium">الكمية أكبر من المتوفر!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-orange-600" />
                        <span className="text-muted-foreground">المخزون بعد الخصم:</span>
                        <span className="font-bold text-2xl text-orange-600">
                          {selectedStock.currentQuantity - parseFloat(subtractQuantity)}
                        </span>
                        <span className="text-muted-foreground">{unitLabels[selectedStock.rawItem?.unit || ""] || selectedStock.rawItem?.unit}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsSubtractOpen(false)}>إلغاء</Button>
            <Button
              variant="destructive"
              onClick={handleSubmitSubtract}
              disabled={adjustMutation.isPending || !subtractQuantity || parseFloat(subtractQuantity) <= 0 || parseFloat(subtractQuantity) > (selectedStock?.currentQuantity || 0)}
              data-testid="button-submit-subtract"
            >
              {adjustMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              <Minus className="h-4 w-4 ml-1" />
              خصم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewBatchOpen} onOpenChange={setIsNewBatchOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              إضافة دفعة جديدة
            </DialogTitle>
            <DialogDescription>
              أضف دفعة جديدة من المواد الخام مع تفاصيل التوريد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الفرع *</Label>
                <Select
                  value={newBatchData.branchId}
                  onValueChange={(value) => setNewBatchData({ ...newBatchData, branchId: value })}
                >
                  <SelectTrigger data-testid="select-batch-branch">
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id || branch._id} value={(branch.id || branch._id) as string}>
                        {branch.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>المادة الخام *</Label>
                <Select
                  value={newBatchData.rawItemId}
                  onValueChange={(value) => setNewBatchData({ ...newBatchData, rawItemId: value })}
                >
                  <SelectTrigger data-testid="select-batch-item">
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {rawItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nameAr} ({item.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newBatchData.quantity}
                  onChange={(e) => setNewBatchData({ ...newBatchData, quantity: e.target.value })}
                  placeholder="0"
                  data-testid="input-batch-quantity"
                />
                {newBatchData.rawItemId && (
                  <p className="text-xs text-muted-foreground">
                    الوحدة: {unitLabels[rawItems.find(r => r.id === newBatchData.rawItemId)?.unit || ""] || rawItems.find(r => r.id === newBatchData.rawItemId)?.unit}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>تكلفة الوحدة (ر.س)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newBatchData.unitCost}
                  onChange={(e) => setNewBatchData({ ...newBatchData, unitCost: e.target.value })}
                  placeholder={rawItems.find(r => r.id === newBatchData.rawItemId)?.unitCost?.toString() || "0"}
                  data-testid="input-batch-cost"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>رقم الدفعة (اختياري)</Label>
              <Input
                value={newBatchData.batchNumber}
                onChange={(e) => setNewBatchData({ ...newBatchData, batchNumber: e.target.value })}
                placeholder="مثال: B2024-001"
                data-testid="input-batch-number"
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={newBatchData.notes}
                onChange={(e) => setNewBatchData({ ...newBatchData, notes: e.target.value })}
                placeholder="معلومات إضافية عن الدفعة..."
                data-testid="input-batch-notes"
              />
            </div>

            {newBatchData.quantity && parseFloat(newBatchData.quantity) > 0 && (
              <div className="p-4 bg-primary/5 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">إجمالي قيمة الدفعة:</span>
                  <span className="font-bold text-xl text-primary">
                    {(parseFloat(newBatchData.quantity) * parseFloat(newBatchData.unitCost || rawItems.find(r => r.id === newBatchData.rawItemId)?.unitCost?.toString() || "0")).toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsNewBatchOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleSubmitNewBatch}
              disabled={newBatchMutation.isPending || !newBatchData.branchId || !newBatchData.rawItemId || !newBatchData.quantity || parseFloat(newBatchData.quantity) <= 0}
              data-testid="button-submit-batch"
            >
              {newBatchMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              <PackagePlus className="h-4 w-4 ml-1" />
              إضافة الدفعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
