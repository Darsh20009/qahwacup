import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Coffee, Milk, Droplets, Plus, Minus, Check, Loader2,
  CandyOff, Candy, RotateCcw
} from "lucide-react";
import type { CoffeeItem } from "@shared/schema";

interface ProductAddon {
  id: string;
  nameAr: string;
  nameEn?: string;
  category: 'sugar' | 'milk' | 'shot' | 'syrup' | 'topping' | 'size' | 'other';
  price: number;
  isAvailable: number;
  rawItemId?: string;
  quantityPerUnit?: number;
  unit?: string;
}

interface CoffeeItemAddon {
  coffeeItemId: string;
  addonId: string;
  isDefault: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface SelectedAddon {
  addonId: string;
  nameAr: string;
  quantity: number;
  price: number;
  category: string;
  rawItemId?: string;
  quantityPerUnit?: number;
  unit?: string;
}

export interface DrinkCustomization {
  selectedAddons: SelectedAddon[];
  totalAddonsPrice: number;
  notes?: string;
}

interface DrinkCustomizationDialogProps {
  coffeeItem: CoffeeItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (customization: DrinkCustomization, quantity: number) => void;
  initialCustomization?: DrinkCustomization;
  initialQuantity?: number;
}

const CATEGORY_INFO: Record<string, { name: string; icon: typeof Coffee; description: string }> = {
  sugar: { name: "السكر", icon: Candy, description: "اختر مستوى السكر" },
  milk: { name: "الحليب", icon: Milk, description: "اختر نوع الحليب" },
  shot: { name: "شوت القهوة", icon: Coffee, description: "إضافة شوت إسبريسو" },
  syrup: { name: "النكهات", icon: Droplets, description: "إضافة نكهة" },
  topping: { name: "الإضافات", icon: Plus, description: "إضافات إضافية" },
  size: { name: "الحجم", icon: Coffee, description: "اختر الحجم" },
  other: { name: "أخرى", icon: Plus, description: "خيارات أخرى" },
};

export default function DrinkCustomizationDialog({
  coffeeItem,
  open,
  onClose,
  onConfirm,
  initialCustomization,
  initialQuantity = 1,
}: DrinkCustomizationDialogProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedAddons, setSelectedAddons] = useState<Map<string, SelectedAddon>>(new Map());
  const [notes, setNotes] = useState("");

  const { data: allAddons = [], isLoading: loadingAddons } = useQuery<ProductAddon[]>({
    queryKey: ["/api/product-addons"],
  });

  const { data: coffeeAddons = [], isLoading: loadingCoffeeAddons } = useQuery<CoffeeItemAddon[]>({
    queryKey: ["/api/coffee-items", coffeeItem?.id, "addons"],
    enabled: !!coffeeItem?.id,
  });

  useEffect(() => {
    if (initialCustomization?.selectedAddons) {
      const map = new Map<string, SelectedAddon>();
      initialCustomization.selectedAddons.forEach(addon => {
        map.set(addon.addonId, addon);
      });
      setSelectedAddons(map);
      setNotes(initialCustomization.notes || "");
    } else if (coffeeAddons.length > 0 && allAddons.length > 0) {
      const map = new Map<string, SelectedAddon>();
      coffeeAddons.forEach(link => {
        if (link.isDefault === 1) {
          const addon = allAddons.find(a => a.id === link.addonId);
          if (addon) {
            map.set(addon.id, {
              addonId: addon.id,
              nameAr: addon.nameAr,
              quantity: 1,
              price: addon.price,
              category: addon.category,
              rawItemId: addon.rawItemId,
              quantityPerUnit: addon.quantityPerUnit,
              unit: addon.unit,
            });
          }
        }
      });
      setSelectedAddons(map);
    }
  }, [coffeeAddons, allAddons, initialCustomization]);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const availableAddons = allAddons.filter(addon => 
    addon.isAvailable === 1 && 
    coffeeAddons.some(link => link.addonId === addon.id)
  );

  const groupedAddons = availableAddons.reduce((groups, addon) => {
    const category = addon.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addon);
    return groups;
  }, {} as Record<string, ProductAddon[]>);

  const getAddonLink = (addonId: string) => {
    return coffeeAddons.find(link => link.addonId === addonId);
  };

  const toggleAddon = (addon: ProductAddon, isSingleSelect: boolean) => {
    const newSelection = new Map(selectedAddons);
    
    if (isSingleSelect) {
      availableAddons
        .filter(a => a.category === addon.category)
        .forEach(a => newSelection.delete(a.id));
    }
    
    if (selectedAddons.has(addon.id) && !isSingleSelect) {
      newSelection.delete(addon.id);
    } else {
      newSelection.set(addon.id, {
        addonId: addon.id,
        nameAr: addon.nameAr,
        quantity: 1,
        price: addon.price,
        category: addon.category,
        rawItemId: addon.rawItemId,
        quantityPerUnit: addon.quantityPerUnit,
        unit: addon.unit,
      });
    }
    
    setSelectedAddons(newSelection);
  };

  const updateAddonQuantity = (addonId: string, delta: number) => {
    const addon = selectedAddons.get(addonId);
    const link = getAddonLink(addonId);
    if (!addon || !link) return;

    const newQuantity = addon.quantity + delta;
    if (newQuantity < link.minQuantity) {
      const newSelection = new Map(selectedAddons);
      newSelection.delete(addonId);
      setSelectedAddons(newSelection);
    } else if (newQuantity <= link.maxQuantity) {
      const newSelection = new Map(selectedAddons);
      newSelection.set(addonId, { ...addon, quantity: newQuantity });
      setSelectedAddons(newSelection);
    }
  };

  const calculateAddonsPrice = () => {
    let total = 0;
    selectedAddons.forEach(addon => {
      total += addon.price * addon.quantity;
    });
    return total;
  };

  const handleConfirm = () => {
    const customization: DrinkCustomization = {
      selectedAddons: Array.from(selectedAddons.values()),
      totalAddonsPrice: calculateAddonsPrice(),
      notes: notes.trim() || undefined,
    };
    onConfirm(customization, quantity);
  };

  const handleResetToDefault = () => {
    const map = new Map<string, SelectedAddon>();
    coffeeAddons.forEach(link => {
      if (link.isDefault === 1) {
        const addon = allAddons.find(a => a.id === link.addonId);
        if (addon) {
          map.set(addon.id, {
            addonId: addon.id,
            nameAr: addon.nameAr,
            quantity: 1,
            price: addon.price,
            category: addon.category,
            rawItemId: addon.rawItemId,
            quantityPerUnit: addon.quantityPerUnit,
            unit: addon.unit,
          });
        }
      }
    });
    setSelectedAddons(map);
    setNotes("");
  };

  const basePrice = Number(coffeeItem?.price || 0);
  const addonsPrice = calculateAddonsPrice();
  const totalItemPrice = (basePrice + addonsPrice) * quantity;

  const isLoading = loadingAddons || loadingCoffeeAddons;

  if (!coffeeItem) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col" data-testid="dialog-customization">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Coffee className="w-5 h-5" />
            تخصيص {coffeeItem.nameAr}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="space-y-4 p-1">
              {Object.entries(groupedAddons).map(([category, addons]) => {
                const categoryInfo = CATEGORY_INFO[category] || CATEGORY_INFO.other;
                const isSingleSelect = category === 'sugar' || category === 'milk' || category === 'size';
                const CategoryIcon = categoryInfo.icon;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CategoryIcon className="w-4 h-4" />
                      <span>{categoryInfo.name}</span>
                      {isSingleSelect && (
                        <Badge variant="outline" className="text-xs">اختر واحد</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {addons.map(addon => {
                        const isSelected = selectedAddons.has(addon.id);
                        const selectedAddon = selectedAddons.get(addon.id);
                        const link = getAddonLink(addon.id);
                        const canHaveMultiple = link && link.maxQuantity > 1 && !isSingleSelect;

                        return (
                          <div
                            key={addon.id}
                            className={`relative rounded-md border p-3 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover-elevate'
                            }`}
                            onClick={() => !canHaveMultiple && toggleAddon(addon, isSingleSelect)}
                            data-testid={`addon-${addon.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{addon.nameAr}</p>
                                {addon.price > 0 && (
                                  <p className="text-xs text-primary">+{addon.price} ر.س</p>
                                )}
                              </div>
                              
                              {isSelected && !canHaveMultiple && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                              
                              {canHaveMultiple && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isSelected) {
                                        updateAddonQuantity(addon.id, -1);
                                      }
                                    }}
                                    data-testid={`button-decrease-${addon.id}`}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-6 text-center text-sm font-medium">
                                    {selectedAddon?.quantity || 0}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isSelected) {
                                        updateAddonQuantity(addon.id, 1);
                                      } else {
                                        toggleAddon(addon, false);
                                      }
                                    }}
                                    data-testid={`button-increase-${addon.id}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Separator className="mt-3" />
                  </div>
                );
              })}

              {Object.keys(groupedAddons).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <CandyOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>لا توجد خيارات تخصيص متاحة لهذا المشروب</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">الكمية</span>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-semibold" data-testid="text-quantity">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
                data-testid="button-increase-quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">سعر المشروب</span>
            <span>{basePrice.toFixed(2)} ر.س</span>
          </div>
          
          {addonsPrice > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الإضافات</span>
              <span className="text-primary">+{addonsPrice.toFixed(2)} ر.س</span>
            </div>
          )}

          <Separator />
          
          <div className="flex items-center justify-between font-semibold">
            <span>الإجمالي</span>
            <span className="text-lg" data-testid="text-total-price">{totalItemPrice.toFixed(2)} ر.س</span>
          </div>
        </div>

        <DialogFooter className="flex flex-row flex-wrap justify-between gap-2">
          <Button 
            variant="ghost" 
            onClick={handleResetToDefault} 
            className="gap-1"
            data-testid="button-reset-default"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة للافتراضي
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel">
              إلغاء
            </Button>
            <Button onClick={handleConfirm} data-testid="button-confirm">
              إضافة للطلب
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
