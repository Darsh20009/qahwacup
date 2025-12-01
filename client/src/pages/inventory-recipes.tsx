import { useState, useMemo } from "react";
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
  Plus, 
  BookOpen,
  Search,
  Eye,
  Edit,
  Trash2,
  Calculator,
  Loader2
} from "lucide-react";

interface CoffeeItem {
  id: string;
  nameAr: string;
  nameEn?: string;
  price: number;
  category: string;
}

interface RawItem {
  id: string;
  code: string;
  nameAr: string;
  unit: string;
  unitCost: number;
}

interface RecipeItem {
  id: string;
  coffeeItemId: string;
  rawItemId: string;
  quantity: number;
  unit: string;
  notes?: string;
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

const unitDimensions: Record<string, string> = {
  kg: "mass",
  g: "mass",
  liter: "volume",
  ml: "volume",
  piece: "count",
  box: "count",
  bag: "count",
};

const unitConversions: Record<string, Record<string, number>> = {
  mass: { kg: 1000, g: 1 },
  volume: { liter: 1000, ml: 1 },
  count: { piece: 1, box: 1, bag: 1 },
};

const getCompatibleUnits = (baseUnit: string): string[] => {
  const dimension = unitDimensions[baseUnit];
  if (!dimension) return [baseUnit];
  return Object.keys(unitConversions[dimension] || {});
};

const normalizeQuantity = (quantity: number, fromUnit: string, toUnit: string): number | null => {
  const fromDimension = unitDimensions[fromUnit];
  const toDimension = unitDimensions[toUnit];
  
  if (fromDimension !== toDimension) return null;
  
  const conversions = unitConversions[fromDimension];
  if (!conversions) return quantity;
  
  const fromFactor = conversions[fromUnit] || 1;
  const toFactor = conversions[toUnit] || 1;
  
  return (quantity * fromFactor) / toFactor;
};

export default function InventoryRecipesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoffeeItem, setSelectedCoffeeItem] = useState<CoffeeItem | null>(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);

  const [newIngredient, setNewIngredient] = useState({
    rawItemId: "",
    quantity: 1,
    unit: "g",
  });

  const { data: coffeeItems = [], isLoading: loadingCoffee } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/menu"],
  });

  const { data: rawItems = [] } = useQuery<RawItem[]>({
    queryKey: ["/api/inventory/raw-items"],
  });

  const { data: recipes = [], isLoading: loadingRecipes, isFetched: recipesFetched } = useQuery<RecipeItem[]>({
    queryKey: selectedCoffeeItem?.id ? ["/api/inventory/recipes", selectedCoffeeItem.id] : ["/api/inventory/recipes"],
    enabled: !!selectedCoffeeItem?.id,
  });

  const addIngredientMutation = useMutation({
    mutationFn: (data: { coffeeItemId: string; rawItemId: string; quantity: number; unit: string }) => {
      if (!data.coffeeItemId || !data.rawItemId) {
        return Promise.reject(new Error("يرجى تحديد المنتج والمادة الخام"));
      }
      return apiRequest("POST", "/api/inventory/recipes", data);
    },
    onSuccess: () => {
      if (selectedCoffeeItem?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/inventory/recipes", selectedCoffeeItem.id] });
      }
      setIsAddIngredientOpen(false);
      setNewIngredient({ rawItemId: "", quantity: 1, unit: "g" });
      toast({ title: "تم إضافة المكون بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "فشل في إضافة المكون", variant: "destructive" });
    },
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/inventory/recipes/${id}`),
    onSuccess: () => {
      if (selectedCoffeeItem?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/inventory/recipes", selectedCoffeeItem.id] });
      }
      toast({ title: "تم حذف المكون بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "فشل في حذف المكون", variant: "destructive" });
    },
  });

  const getRawItemName = (id: string) => rawItems.find(r => r.id === id)?.nameAr || id;
  const getRawItemCost = (id: string) => rawItems.find(r => r.id === id)?.unitCost || 0;

  const selectedRawItem = useMemo(() => {
    return rawItems.find(r => r.id === newIngredient.rawItemId);
  }, [rawItems, newIngredient.rawItemId]);

  const compatibleUnits = useMemo(() => {
    if (!selectedRawItem) return Object.keys(unitLabels);
    return getCompatibleUnits(selectedRawItem.unit);
  }, [selectedRawItem]);

  const recipeCost = useMemo(() => {
    if (loadingRecipes || rawItems.length === 0) return null;
    
    return recipes.reduce((total, item) => {
      const rawItem = rawItems.find(r => r.id === item.rawItemId);
      if (!rawItem) return total;
      
      const normalizedQty = normalizeQuantity(item.quantity, item.unit, rawItem.unit);
      if (normalizedQty === null) return total;
      
      return total + (rawItem.unitCost * normalizedQty);
    }, 0);
  }, [recipes, rawItems, loadingRecipes]);

  const profitMargin = useMemo(() => {
    if (recipeCost === null || !selectedCoffeeItem) return null;
    const margin = selectedCoffeeItem.price - recipeCost;
    const percentage = selectedCoffeeItem.price > 0 
      ? ((1 - recipeCost / selectedCoffeeItem.price) * 100)
      : 0;
    return { margin, percentage };
  }, [recipeCost, selectedCoffeeItem]);

  const handleViewRecipe = (item: CoffeeItem) => {
    setSelectedCoffeeItem(item);
    setIsRecipeDialogOpen(true);
  };

  const handleAddIngredient = () => {
    if (!selectedCoffeeItem?.id) {
      toast({ title: "يرجى تحديد المنتج أولاً", variant: "destructive" });
      return;
    }
    if (!recipesFetched) {
      toast({ title: "جاري تحميل البيانات، يرجى الانتظار", variant: "destructive" });
      return;
    }
    if (!newIngredient.rawItemId || !selectedRawItem) {
      toast({ title: "يرجى تحديد المادة الخام", variant: "destructive" });
      return;
    }
    if (newIngredient.quantity <= 0) {
      toast({ title: "يرجى إدخال كمية صحيحة", variant: "destructive" });
      return;
    }
    
    const normalizedQty = normalizeQuantity(newIngredient.quantity, newIngredient.unit, selectedRawItem.unit);
    if (normalizedQty === null) {
      toast({ title: "وحدة القياس غير متوافقة مع المادة الخام", variant: "destructive" });
      return;
    }
    
    addIngredientMutation.mutate({
      coffeeItemId: selectedCoffeeItem.id,
      rawItemId: newIngredient.rawItemId,
      quantity: normalizedQty,
      unit: selectedRawItem.unit,
    });
  };

  const filteredCoffeeItems = coffeeItems.filter((item) =>
    item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getRecipeCountForItem = (coffeeItemId: string) => {
    return 0;
  };

  if (loadingCoffee) {
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
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">وصفات المنتجات</h1>
            <p className="text-muted-foreground text-sm">ربط المنتجات بالمواد الخام وحساب تكلفة الصنف (COGS)</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              data-testid="input-search-recipes"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">سعر البيع</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoffeeItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      لا توجد منتجات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoffeeItems.map((item) => (
                    <TableRow key={item.id} data-testid={`row-recipe-${item.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.nameAr}</div>
                          {item.nameEn && (
                            <div className="text-sm text-muted-foreground">{item.nameEn}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.price.toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleViewRecipe(item)}
                          data-testid={`button-view-recipe-${item.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              وصفة {selectedCoffeeItem?.nameAr}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCoffeeItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-muted-foreground">سعر البيع</Label>
                  <p className="text-xl font-bold">{selectedCoffeeItem.price.toFixed(2)} ر.س</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">تكلفة الصنف (COGS)</Label>
                  {recipeCost === null ? (
                    <p className="text-xl font-bold text-muted-foreground">جاري الحساب...</p>
                  ) : (
                    <p className="text-xl font-bold text-destructive">
                      {recipeCost.toFixed(2)} ر.س
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">هامش الربح</Label>
                  {profitMargin === null ? (
                    <p className="text-xl font-bold text-muted-foreground">جاري الحساب...</p>
                  ) : selectedCoffeeItem.price === 0 ? (
                    <p className="text-xl font-bold text-muted-foreground">غير متاح</p>
                  ) : (
                    <p className="text-xl font-bold text-green-600">
                      {profitMargin.margin.toFixed(2)} ر.س
                      <span className="text-sm text-muted-foreground mr-1">
                        ({profitMargin.percentage.toFixed(1)}%)
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  المكونات
                </h3>
                <Button 
                  size="sm" 
                  onClick={() => setIsAddIngredientOpen(true)}
                  data-testid="button-add-ingredient"
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة مكون
                </Button>
              </div>

              {loadingRecipes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recipes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد مكونات مضافة لهذا المنتج</p>
                  <p className="text-sm">أضف المكونات لحساب تكلفة الصنف</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-right">المكون</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">الوحدة</TableHead>
                        <TableHead className="text-right">تكلفة الوحدة</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipes.map((recipe) => {
                        const rawItem = rawItems.find(r => r.id === recipe.rawItemId);
                        let costPerUnit = rawItem?.unitCost || 0;
                        if (rawItem?.unit === 'kg' && recipe.unit === 'g') {
                          costPerUnit = (rawItem?.unitCost || 0) / 1000;
                        } else if (rawItem?.unit === 'liter' && recipe.unit === 'ml') {
                          costPerUnit = (rawItem?.unitCost || 0) / 1000;
                        }
                        const totalCost = costPerUnit * recipe.quantity;

                        return (
                          <TableRow key={recipe.id}>
                            <TableCell className="font-medium">{getRawItemName(recipe.rawItemId)}</TableCell>
                            <TableCell>{recipe.quantity}</TableCell>
                            <TableCell>{unitLabels[recipe.unit] || recipe.unit}</TableCell>
                            <TableCell>{costPerUnit.toFixed(4)} ر.س</TableCell>
                            <TableCell className="font-medium">{totalCost.toFixed(2)} ر.س</TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteIngredientMutation.mutate(recipe.id)}
                                disabled={deleteIngredientMutation.isPending}
                                data-testid={`button-delete-ingredient-${recipe.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecipeDialogOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddIngredientOpen} onOpenChange={setIsAddIngredientOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مكون جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>المادة الخام *</Label>
              <Select
                value={newIngredient.rawItemId}
                onValueChange={(value) => setNewIngredient({ ...newIngredient, rawItemId: value })}
              >
                <SelectTrigger data-testid="select-raw-item">
                  <SelectValue placeholder="اختر المادة الخام" />
                </SelectTrigger>
                <SelectContent>
                  {rawItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nameAr} ({item.unitCost.toFixed(2)} ر.س / {unitLabels[item.unit]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 1 })}
                  data-testid="input-quantity"
                />
              </div>
              <div className="space-y-2">
                <Label>الوحدة *</Label>
                <Select
                  value={newIngredient.unit}
                  onValueChange={(value) => setNewIngredient({ ...newIngredient, unit: value })}
                >
                  <SelectTrigger data-testid="select-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {compatibleUnits.map((key) => (
                      <SelectItem key={key} value={key}>{unitLabels[key] || key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRawItem && (
                  <p className="text-xs text-muted-foreground">
                    وحدة المادة الخام: {unitLabels[selectedRawItem.unit] || selectedRawItem.unit}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddIngredientOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleAddIngredient}
              disabled={addIngredientMutation.isPending || !newIngredient.rawItemId}
              data-testid="button-submit-ingredient"
            >
              {addIngredientMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
