import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DialogDescription,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Package,
  Coffee,
  Warehouse,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Scale,
  Droplet,
  Box,
  History,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface RawItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn?: string;
  unit: string;
  unitCost: number;
  category?: string;
  minimumStock?: number;
  isActive?: number;
}

interface BranchStock {
  id: string;
  branchId: string;
  rawItemId: string;
  currentQuantity: number;
  minimumStock: number;
  lastUpdated: string;
}

interface RecipeItem {
  id: string;
  coffeeItemId: string;
  rawItemId: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface CoffeeItem {
  id: string;
  nameAr: string;
  nameEn?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface Branch {
  id: string;
  nameAr: string;
}

interface StockMovement {
  id: string;
  branchId: string;
  rawItemId: string;
  movementType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdAt: string;
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

const formatQuantityWithUnit = (quantity: number, unit: string): { display: string; secondary?: string } => {
  if (unit === "kg") {
    if (quantity >= 1) {
      return { display: `${quantity.toFixed(2)} كجم`, secondary: `(${(quantity * 1000).toFixed(0)} جرام)` };
    } else {
      return { display: `${(quantity * 1000).toFixed(0)} جرام`, secondary: `(${quantity.toFixed(3)} كجم)` };
    }
  }
  if (unit === "g") {
    if (quantity >= 1000) {
      return { display: `${(quantity / 1000).toFixed(2)} كجم`, secondary: `(${quantity.toFixed(0)} جرام)` };
    } else {
      return { display: `${quantity.toFixed(0)} جرام` };
    }
  }
  if (unit === "liter") {
    if (quantity >= 1) {
      return { display: `${quantity.toFixed(2)} لتر`, secondary: `(${(quantity * 1000).toFixed(0)} مل)` };
    } else {
      return { display: `${(quantity * 1000).toFixed(0)} مل`, secondary: `(${quantity.toFixed(3)} لتر)` };
    }
  }
  if (unit === "ml") {
    if (quantity >= 1000) {
      return { display: `${(quantity / 1000).toFixed(2)} لتر`, secondary: `(${quantity.toFixed(0)} مل)` };
    } else {
      return { display: `${quantity.toFixed(0)} مل` };
    }
  }
  return { display: `${quantity.toFixed(quantity % 1 === 0 ? 0 : 2)} ${unitLabels[unit] || unit}` };
};

const categoryLabels: Record<string, string> = {
  coffee: "قهوة",
  dairy: "منتجات ألبان",
  syrups: "شراب",
  cups: "أكواب",
  chocolate: "شوكولاتة",
  tea: "شاي",
  other: "أخرى",
};

const defaultRecipes: Record<string, { rawCode: string; quantity: number; unit: string }[]> = {
  "espresso": [
    { rawCode: "RAW-001", quantity: 18, unit: "g" },
  ],
  "cappuccino": [
    { rawCode: "RAW-001", quantity: 18, unit: "g" },
    { rawCode: "RAW-003", quantity: 120, unit: "ml" },
  ],
  "latte": [
    { rawCode: "RAW-001", quantity: 18, unit: "g" },
    { rawCode: "RAW-003", quantity: 180, unit: "ml" },
  ],
  "mocha": [
    { rawCode: "RAW-001", quantity: 18, unit: "g" },
    { rawCode: "RAW-003", quantity: 150, unit: "ml" },
    { rawCode: "RAW-008", quantity: 30, unit: "ml" },
  ],
};

export default function IngredientsRecipesInventoryPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isViewRecipeOpen, setIsViewRecipeOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<CoffeeItem | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<RawItem | null>(null);
  const [deletingIngredientId, setDeletingIngredientId] = useState<string | null>(null);
  const [isEditRecipeOpen, setIsEditRecipeOpen] = useState(false);
  const [editingRecipeDrink, setEditingRecipeDrink] = useState<CoffeeItem | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<Array<{ rawItemId: string; quantity: string; unit: string }>>([]);

  const [newIngredient, setNewIngredient] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    unit: "kg",
    unitCost: "",
    category: "other",
    minimumStock: "",
  });

  const [newStock, setNewStock] = useState({
    rawItemId: "",
    quantity: "",
    unitCost: "",
    notes: "",
  });

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const { data: rawItems = [], isLoading: isRawItemsLoading } = useQuery<RawItem[]>({
    queryKey: ["/api/raw-items"],
  });

  const { data: branchStocks = [] } = useQuery<BranchStock[]>({
    queryKey: ["/api/branch-stock", selectedBranch],
    queryFn: async () => {
      const params = selectedBranch !== "all" ? `?branchId=${selectedBranch}` : "";
      const res = await fetch(`/api/branch-stock${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch branch stock");
      return res.json();
    },
  });

  const { data: coffeeItems = [] } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const { data: recipeItems = [] } = useQuery<RecipeItem[]>({
    queryKey: ["/api/inventory/all-recipes"],
  });

  const { data: stockMovements = [] } = useQuery<StockMovement[]>({
    queryKey: ["/api/stock-movements", selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      const res = await fetch(`/api/stock-movements?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stock movements");
      return res.json();
    },
  });

  const createIngredientMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/raw-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-items"] });
      setIsAddIngredientOpen(false);
      resetNewIngredient();
      toast({ title: "تم إضافة المكون بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في إضافة المكون", variant: "destructive" });
    },
  });

  const updateIngredientMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      return apiRequest("PUT", `/api/raw-items/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-items"] });
      setEditingIngredient(null);
      toast({ title: "تم تحديث المكون بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في تحديث المكون", variant: "destructive" });
    },
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/raw-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-items"] });
      setDeletingIngredientId(null);
      toast({ title: "تم حذف المكون بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في حذف المكون", variant: "destructive" });
    },
  });

  const addStockMutation = useMutation({
    mutationFn: async (data: any) => {
      if (selectedBranch === "all") {
        throw new Error("يرجى اختيار فرع محدد لإضافة المخزون");
      }
      
      return apiRequest("POST", "/api/stock-movements", {
        branchId: selectedBranch,
        rawItemId: data.rawItemId,
        movementType: "purchase",
        quantity: parseFloat(data.quantity),
        notes: data.notes || "إضافة مخزون جديد",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branch-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] });
      setIsAddStockOpen(false);
      setNewStock({ rawItemId: "", quantity: "", unitCost: "", notes: "" });
      toast({ title: "تم إضافة المخزون بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "فشل في إضافة المخزون", variant: "destructive" });
    },
  });

  const saveRecipeMutation = useMutation({
    mutationFn: async (data: { coffeeItemId: string; ingredients: Array<{ rawItemId: string; quantity: number; unit: string }> }) => {
      const existingRecipes = recipeItems.filter(r => r.coffeeItemId === data.coffeeItemId);
      const createdRecipeIds: string[] = [];
      
      try {
        for (const ingredient of data.ingredients) {
          const response = await apiRequest("POST", "/api/inventory/recipes", {
            coffeeItemId: data.coffeeItemId,
            rawItemId: ingredient.rawItemId,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          });
          if (response && (response as any).id) {
            createdRecipeIds.push((response as any).id);
          }
        }
        
        for (const recipe of existingRecipes) {
          await apiRequest("DELETE", `/api/inventory/recipes/${recipe.id}`);
        }
        
        return true;
      } catch (error) {
        for (const recipeId of createdRecipeIds) {
          try {
            await apiRequest("DELETE", `/api/inventory/recipes/${recipeId}`);
          } catch {}
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/all-recipes"] });
      setIsEditRecipeOpen(false);
      setEditingRecipeDrink(null);
      setRecipeIngredients([]);
      toast({ title: "تم حفظ الوصفة بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في حفظ الوصفة", variant: "destructive" });
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (coffeeItemId: string) => {
      const existingRecipes = recipeItems.filter(r => r.coffeeItemId === coffeeItemId);
      for (const recipe of existingRecipes) {
        await apiRequest("DELETE", `/api/inventory/recipes/${recipe.id}`);
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/all-recipes"] });
      toast({ title: "تم حذف الوصفة بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في حذف الوصفة", variant: "destructive" });
    },
  });

  const resetNewIngredient = () => {
    setNewIngredient({
      code: "",
      nameAr: "",
      nameEn: "",
      unit: "kg",
      unitCost: "",
      category: "other",
      minimumStock: "",
    });
  };

  const filteredRawItems = useMemo(() => {
    return rawItems.filter(item =>
      item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rawItems, searchQuery]);

  const inventoryWithStock = useMemo(() => {
    return rawItems.map(item => {
      const stock = branchStocks.find(s => s.rawItemId === item.id);
      return {
        ...item,
        currentQuantity: stock?.currentQuantity || 0,
        minimumStock: stock?.minimumStock || item.minimumStock || 10,
        lastUpdated: stock?.lastUpdated,
        stockStatus: stock ? 
          (stock.currentQuantity <= (stock.minimumStock || 10) * 0.2 ? "critical" :
           stock.currentQuantity <= (stock.minimumStock || 10) ? "low" : "ok") : "unknown",
      };
    }).filter(item =>
      item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rawItems, branchStocks, searchQuery]);

  const drinksWithRecipes = useMemo(() => {
    return coffeeItems.map(drink => {
      const recipes = recipeItems.filter(r => r.coffeeItemId === drink.id);
      const recipeCost = recipes.reduce((total, recipe) => {
        const rawItem = rawItems.find(r => r.id === recipe.rawItemId);
        if (!rawItem) return total;
        let costPerUnit = rawItem.unitCost;
        if (rawItem.unit === "kg" && recipe.unit === "g") costPerUnit = rawItem.unitCost / 1000;
        if (rawItem.unit === "liter" && recipe.unit === "ml") costPerUnit = rawItem.unitCost / 1000;
        return total + (costPerUnit * recipe.quantity);
      }, 0);
      
      return {
        ...drink,
        recipes,
        hasRecipe: recipes.length > 0,
        recipeCost,
        profit: drink.price - recipeCost,
        profitMargin: drink.price > 0 ? ((drink.price - recipeCost) / drink.price) * 100 : 0,
      };
    }).filter(item =>
      item.nameAr.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coffeeItems, recipeItems, rawItems, searchQuery]);

  const totalInventoryValue = useMemo(() => {
    return inventoryWithStock.reduce((total, item) => {
      return total + (item.currentQuantity * item.unitCost);
    }, 0);
  }, [inventoryWithStock]);

  const lowStockItems = useMemo(() => {
    return inventoryWithStock.filter(item => item.stockStatus === "low" || item.stockStatus === "critical");
  }, [inventoryWithStock]);

  const handleSubmitIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newIngredient.code || `RAW-${Date.now().toString(36).toUpperCase()}`;
    
    createIngredientMutation.mutate({
      code,
      nameAr: newIngredient.nameAr,
      nameEn: newIngredient.nameEn || undefined,
      unit: newIngredient.unit,
      unitCost: parseFloat(newIngredient.unitCost) || 0,
      category: newIngredient.category,
      minimumStock: parseFloat(newIngredient.minimumStock) || 10,
      isActive: 1,
    });
  };

  const handleSubmitStock = (e: React.FormEvent) => {
    e.preventDefault();
    addStockMutation.mutate(newStock);
  };

  const getRawItemName = (rawItemId: string) => {
    const item = rawItems.find(r => r.id === rawItemId);
    return item?.nameAr || rawItemId;
  };

  const openEditRecipe = (drink: CoffeeItem) => {
    setEditingRecipeDrink(drink);
    const existingRecipes = recipeItems.filter(r => r.coffeeItemId === drink.id);
    if (existingRecipes.length > 0) {
      setRecipeIngredients(existingRecipes.map(r => ({
        rawItemId: r.rawItemId,
        quantity: r.quantity.toString(),
        unit: r.unit,
      })));
    } else {
      setRecipeIngredients([{ rawItemId: "", quantity: "", unit: "g" }]);
    }
    setIsEditRecipeOpen(true);
  };

  const addRecipeIngredient = () => {
    setRecipeIngredients(prev => [...prev, { rawItemId: "", quantity: "", unit: "g" }]);
  };

  const removeRecipeIngredient = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateRecipeIngredient = (index: number, field: string, value: string) => {
    setRecipeIngredients(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveRecipe = () => {
    if (!editingRecipeDrink) return;
    const validIngredients = recipeIngredients.filter(
      ing => ing.rawItemId && ing.quantity && parseFloat(ing.quantity) > 0
    );
    if (validIngredients.length === 0) {
      toast({ title: "يرجى إضافة مكون واحد على الأقل", variant: "destructive" });
      return;
    }
    saveRecipeMutation.mutate({
      coffeeItemId: editingRecipeDrink.id,
      ingredients: validIngredients.map(ing => ({
        rawItemId: ing.rawItemId,
        quantity: parseFloat(ing.quantity),
        unit: ing.unit,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-50 bg-background border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">المكونات والوصفات والمخزون</h1>
              <p className="text-sm text-muted-foreground">إدارة متكاملة للمخزون والوصفات</p>
            </div>
          </div>

          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48" data-testid="select-branch">
              <SelectValue placeholder="جميع الفروع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفروع</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>{branch.nameAr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المكونات</p>
                  <p className="text-2xl font-bold">{rawItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Warehouse className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                  <p className="text-2xl font-bold">{totalInventoryValue.toFixed(2)} ر.س</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مخزون منخفض</p>
                  <p className="text-2xl font-bold">{lowStockItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Coffee className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المشروبات بوصفات</p>
                  <p className="text-2xl font-bold">{drinksWithRecipes.filter(d => d.hasRecipe).length}/{coffeeItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              data-testid="input-search"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory" data-testid="tab-inventory">
              <Warehouse className="h-4 w-4 ml-2" />
              المخزون
            </TabsTrigger>
            <TabsTrigger value="ingredients" data-testid="tab-ingredients">
              <Package className="h-4 w-4 ml-2" />
              المكونات
            </TabsTrigger>
            <TabsTrigger value="recipes" data-testid="tab-recipes">
              <Coffee className="h-4 w-4 ml-2" />
              الوصفات
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="h-4 w-4 ml-2" />
              السجل
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">مخزون المكونات</h2>
              <Button onClick={() => setIsAddStockOpen(true)} data-testid="button-add-stock">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مخزون
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الكود</TableHead>
                      <TableHead>المكون</TableHead>
                      <TableHead>الكمية الحالية</TableHead>
                      <TableHead>الوحدة</TableHead>
                      <TableHead>الحد الأدنى</TableHead>
                      <TableHead>التكلفة/وحدة</TableHead>
                      <TableHead>القيمة</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryWithStock.map(item => (
                      <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                        <TableCell className="font-mono text-xs">{item.code}</TableCell>
                        <TableCell className="font-medium">{item.nameAr}</TableCell>
                        <TableCell>
                          {(() => {
                            const formatted = formatQuantityWithUnit(item.currentQuantity, item.unit);
                            return (
                              <div className={item.stockStatus === "critical" ? "text-destructive font-bold" : 
                                              item.stockStatus === "low" ? "text-amber-500 font-medium" : ""}>
                                <span className="font-semibold">{formatted.display}</span>
                                {formatted.secondary && (
                                  <span className="text-xs text-muted-foreground block">{formatted.secondary}</span>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const formatted = formatQuantityWithUnit(item.minimumStock, item.unit);
                            return <span>{formatted.display}</span>;
                          })()}
                        </TableCell>
                        <TableCell>{item.unitCost.toFixed(2)} ر.س/{unitLabels[item.unit] || item.unit}</TableCell>
                        <TableCell className="font-medium">{(item.currentQuantity * item.unitCost).toFixed(2)} ر.س</TableCell>
                        <TableCell>
                          {item.stockStatus === "critical" ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 ml-1" />
                              حرج
                            </Badge>
                          ) : item.stockStatus === "low" ? (
                            <Badge variant="secondary" className="bg-amber-500/20 text-amber-700">
                              <TrendingDown className="h-3 w-3 ml-1" />
                              منخفض
                            </Badge>
                          ) : item.stockStatus === "ok" ? (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              جيد
                            </Badge>
                          ) : (
                            <Badge variant="outline">غير محدد</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">قائمة المكونات</h2>
              <Button onClick={() => setIsAddIngredientOpen(true)} data-testid="button-add-ingredient">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مكون
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRawItems.map(item => (
                <Card key={item.id} data-testid={`card-ingredient-${item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {item.unit === "kg" || item.unit === "g" ? <Scale className="h-5 w-5" /> :
                           item.unit === "liter" || item.unit === "ml" ? <Droplet className="h-5 w-5" /> :
                           <Box className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{item.nameAr}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingIngredient(item)}
                          data-testid={`button-edit-ingredient-${item.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeletingIngredientId(item.id)}
                          data-testid={`button-delete-ingredient-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">الوحدة:</span>
                        <span className="mr-1">{unitLabels[item.unit] || item.unit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">التكلفة:</span>
                        <span className="mr-1">{item.unitCost.toFixed(2)} ر.س</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الفئة:</span>
                        <span className="mr-1">{categoryLabels[item.category || "other"]}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">وصفات المشروبات</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4" />
                <span>جميع الأكواب 250 مل</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drinksWithRecipes.map(drink => (
                <Card 
                  key={drink.id} 
                  className={`transition-all ${!drink.hasRecipe ? "opacity-60" : ""}`}
                  data-testid={`card-recipe-${drink.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => {
                          setSelectedDrink(drink);
                          setIsViewRecipeOpen(true);
                        }}
                      >
                        {drink.imageUrl ? (
                          <img src={drink.imageUrl} alt={drink.nameAr} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="p-3 rounded-lg bg-muted">
                            <Coffee className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{drink.nameAr}</h3>
                          <p className="text-sm text-muted-foreground">{drink.price.toFixed(2)} ر.س</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {drink.hasRecipe ? (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                            <CheckCircle className="h-3 w-3 ml-1" />
                            وصفة
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600">
                            <AlertTriangle className="h-3 w-3 ml-1" />
                            بدون
                          </Badge>
                        )}
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditRecipe(drink);
                            }}
                            data-testid={`button-edit-recipe-${drink.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {drink.hasRecipe && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRecipeMutation.mutate(drink.id);
                              }}
                              data-testid={`button-delete-recipe-${drink.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {drink.hasRecipe && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">تكلفة المكونات:</span>
                          <span className="font-medium">{drink.recipeCost.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">الربح:</span>
                          <span className={`font-medium ${drink.profit > 0 ? "text-green-600" : "text-destructive"}`}>
                            {drink.profit.toFixed(2)} ر.س ({drink.profitMargin.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(drink.profitMargin, 100)} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground">
                          {drink.recipes.length} مكون/مكونات
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">سجل حركة المخزون</h2>
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] })}>
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المكون</TableHead>
                      <TableHead>نوع الحركة</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>من</TableHead>
                      <TableHead>إلى</TableHead>
                      <TableHead>ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.map(movement => (
                      <TableRow key={movement.id} data-testid={`row-movement-${movement.id}`}>
                        <TableCell className="text-sm">
                          {format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                        </TableCell>
                        <TableCell className="font-medium">{getRawItemName(movement.rawItemId)}</TableCell>
                        <TableCell>
                          <Badge variant={movement.movementType === "purchase" ? "default" : 
                                        movement.movementType === "sale" ? "secondary" : "outline"}>
                            {movement.movementType === "purchase" ? "شراء" :
                             movement.movementType === "sale" ? "بيع" :
                             movement.movementType === "adjustment" ? "تعديل" :
                             movement.movementType === "transfer" ? "نقل" : movement.movementType}
                          </Badge>
                        </TableCell>
                        <TableCell className={movement.quantity > 0 ? "text-green-600" : "text-destructive"}>
                          {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                        </TableCell>
                        <TableCell>{movement.previousQuantity.toFixed(2)}</TableCell>
                        <TableCell>{movement.newQuantity.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{movement.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                    {stockMovements.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          لا توجد حركات مخزون
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isAddIngredientOpen} onOpenChange={setIsAddIngredientOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مكون جديد</DialogTitle>
            <DialogDescription>
              أضف مكون جديد لاستخدامه في وصفات المشروبات
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitIngredient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم بالعربي *</Label>
                <Input
                  id="nameAr"
                  value={newIngredient.nameAr}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, nameAr: e.target.value }))}
                  required
                  data-testid="input-ingredient-name-ar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزي</Label>
                <Input
                  id="nameEn"
                  value={newIngredient.nameEn}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, nameEn: e.target.value }))}
                  data-testid="input-ingredient-name-en"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">الوحدة *</Label>
                <Select
                  value={newIngredient.unit}
                  onValueChange={(value) => setNewIngredient(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger data-testid="select-ingredient-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">كيلوجرام</SelectItem>
                    <SelectItem value="g">جرام</SelectItem>
                    <SelectItem value="liter">لتر</SelectItem>
                    <SelectItem value="ml">ملليلتر</SelectItem>
                    <SelectItem value="piece">قطعة</SelectItem>
                    <SelectItem value="box">صندوق</SelectItem>
                    <SelectItem value="bag">كيس</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select
                  value={newIngredient.category}
                  onValueChange={(value) => setNewIngredient(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-ingredient-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coffee">قهوة</SelectItem>
                    <SelectItem value="dairy">منتجات ألبان</SelectItem>
                    <SelectItem value="syrups">شراب</SelectItem>
                    <SelectItem value="cups">أكواب</SelectItem>
                    <SelectItem value="chocolate">شوكولاتة</SelectItem>
                    <SelectItem value="tea">شاي</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitCost">التكلفة لكل وحدة (ر.س) *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  value={newIngredient.unitCost}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, unitCost: e.target.value }))}
                  required
                  data-testid="input-ingredient-cost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumStock">الحد الأدنى للمخزون</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  step="0.1"
                  value={newIngredient.minimumStock}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, minimumStock: e.target.value }))}
                  placeholder="10"
                  data-testid="input-ingredient-min-stock"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddIngredientOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createIngredientMutation.isPending} data-testid="button-submit-ingredient">
                {createIngredientMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                إضافة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مخزون</DialogTitle>
            <DialogDescription>
              أضف كمية جديدة للمخزون (مثل: اشتريت 2 كيلو قهوة)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitStock} className="space-y-4">
            <div className="space-y-2">
              <Label>المكون *</Label>
              <Select
                value={newStock.rawItemId}
                onValueChange={(value) => setNewStock(prev => ({ ...prev, rawItemId: value }))}
              >
                <SelectTrigger data-testid="select-stock-raw-item">
                  <SelectValue placeholder="اختر المكون" />
                </SelectTrigger>
                <SelectContent>
                  {rawItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nameAr} ({unitLabels[item.unit]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">الكمية *</Label>
              <Input
                id="stockQuantity"
                type="number"
                step="0.01"
                value={newStock.quantity}
                onChange={(e) => setNewStock(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="مثال: 2 (كيلو)"
                required
                data-testid="input-stock-quantity"
              />
              <p className="text-xs text-muted-foreground">
                أدخل الكمية بالوحدة الأساسية للمكون
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockNotes">ملاحظات</Label>
              <Input
                id="stockNotes"
                value={newStock.notes}
                onChange={(e) => setNewStock(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="مثال: فاتورة رقم 123"
                data-testid="input-stock-notes"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddStockOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={addStockMutation.isPending} data-testid="button-submit-stock">
                {addStockMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                إضافة للمخزون
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewRecipeOpen} onOpenChange={setIsViewRecipeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>وصفة {selectedDrink?.nameAr}</DialogTitle>
            <DialogDescription>
              المكونات المطلوبة لتحضير المشروب (كوب 250 مل)
            </DialogDescription>
          </DialogHeader>
          
          {selectedDrink && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                {selectedDrink.imageUrl ? (
                  <img src={selectedDrink.imageUrl} alt={selectedDrink.nameAr} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="p-4 rounded-lg bg-background">
                    <Coffee className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{selectedDrink.nameAr}</h3>
                  <p className="text-muted-foreground">السعر: {selectedDrink.price.toFixed(2)} ر.س</p>
                </div>
              </div>

              {(selectedDrink as any).hasRecipe ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المكون</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>التكلفة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedDrink as any).recipes.map((recipe: RecipeItem) => {
                        const rawItem = rawItems.find(r => r.id === recipe.rawItemId);
                        let cost = 0;
                        if (rawItem) {
                          let costPerUnit = rawItem.unitCost;
                          if (rawItem.unit === "kg" && recipe.unit === "g") costPerUnit = rawItem.unitCost / 1000;
                          if (rawItem.unit === "liter" && recipe.unit === "ml") costPerUnit = rawItem.unitCost / 1000;
                          cost = costPerUnit * recipe.quantity;
                        }
                        return (
                          <TableRow key={recipe.id}>
                            <TableCell className="font-medium">{rawItem?.nameAr || recipe.rawItemId}</TableCell>
                            <TableCell>{recipe.quantity} {unitLabels[recipe.unit] || recipe.unit}</TableCell>
                            <TableCell>{cost.toFixed(2)} ر.س</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">تكلفة المكونات</p>
                      <p className="text-lg font-bold">{(selectedDrink as any).recipeCost.toFixed(2)} ر.س</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">الربح</p>
                      <p className={`text-lg font-bold ${(selectedDrink as any).profit > 0 ? "text-green-600" : "text-destructive"}`}>
                        {(selectedDrink as any).profit.toFixed(2)} ر.س
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">نسبة الربح</p>
                      <p className="text-lg font-bold">{(selectedDrink as any).profitMargin.toFixed(0)}%</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                  <p>لم يتم تحديد وصفة لهذا المشروب بعد</p>
                  <p className="text-sm mt-2">يمكنك إضافة الوصفة من صفحة إدارة الوصفات</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingIngredientId} onOpenChange={() => setDeletingIngredientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المكون؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingIngredientId && deleteIngredientMutation.mutate(deletingIngredientId)}
              className="bg-destructive text-destructive-foreground"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditRecipeOpen} onOpenChange={setIsEditRecipeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecipeDrink ? `تعديل وصفة ${editingRecipeDrink.nameAr}` : "تعديل الوصفة"}
            </DialogTitle>
            <DialogDescription>
              حدد المكونات والكميات المطلوبة لتحضير هذا المشروب (كوب 250 مل)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {recipeIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-end gap-3 p-3 bg-muted rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>المكون</Label>
                  <Select
                    value={ingredient.rawItemId}
                    onValueChange={(value) => updateRecipeIngredient(index, "rawItemId", value)}
                  >
                    <SelectTrigger data-testid={`select-recipe-ingredient-${index}`}>
                      <SelectValue placeholder="اختر المكون" />
                    </SelectTrigger>
                    <SelectContent>
                      {rawItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.nameAr} ({unitLabels[item.unit]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24 space-y-2">
                  <Label>الكمية</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={ingredient.quantity}
                    onChange={(e) => updateRecipeIngredient(index, "quantity", e.target.value)}
                    placeholder="الكمية"
                    data-testid={`input-recipe-quantity-${index}`}
                  />
                </div>

                <div className="w-28 space-y-2">
                  <Label>الوحدة</Label>
                  <Select
                    value={ingredient.unit}
                    onValueChange={(value) => updateRecipeIngredient(index, "unit", value)}
                  >
                    <SelectTrigger data-testid={`select-recipe-unit-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">جرام</SelectItem>
                      <SelectItem value="ml">ملليلتر</SelectItem>
                      <SelectItem value="piece">قطعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRecipeIngredient(index)}
                  disabled={recipeIngredients.length === 1}
                  data-testid={`button-remove-ingredient-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addRecipeIngredient}
              className="w-full"
              data-testid="button-add-recipe-ingredient"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة مكون
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditRecipeOpen(false);
                setEditingRecipeDrink(null);
                setRecipeIngredients([]);
              }}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSaveRecipe}
              disabled={saveRecipeMutation.isPending}
              data-testid="button-save-recipe"
            >
              {saveRecipeMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              حفظ الوصفة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
