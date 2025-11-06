import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Coffee, ArrowRight, CheckCircle, XCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCoffeeImage } from "@/lib/coffee-images";
import { nanoid } from "nanoid";
import type { CoffeeItem, Employee } from "@shared/schema";

export default function EmployeeMenuManagement() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/coffee-items", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coffee-items"] });
      setIsAddDialogOpen(false);
      toast({
        title: "تم إضافة المشروب",
        description: "تم إضافة المشروب بنجاح إلى القائمة",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "فشل إضافة المشروب",
        description: error.message || "حدث خطأ أثناء إضافة المشروب",
      });
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable, availabilityStatus }: { id: string; isAvailable?: number; availabilityStatus?: string }) => {
      const response = await fetch(`/api/coffee-items/${id}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable, availabilityStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update availability");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coffee-items"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة توفر المشروب",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة توفر المشروب",
        variant: "destructive",
      });
    },
  });

  const handleToggleAvailability = (item: CoffeeItem) => {
    const newAvailability = item.isAvailable === 1 ? 0 : 1;
    updateAvailabilityMutation.mutate({ id: item.id, isAvailable: newAvailability });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateAvailabilityMutation.mutate({ 
      id, 
      availabilityStatus: status 
    });
  };

  const handleSubmitNewItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData = {
      id: nanoid(10),
      nameAr: formData.get("nameAr") as string,
      nameEn: formData.get("nameEn") as string || undefined,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      oldPrice: formData.get("oldPrice") ? parseFloat(formData.get("oldPrice") as string) : undefined,
      category: formData.get("category") as string,
      imageUrl: formData.get("imageUrl") as string || undefined,
      isAvailable: 1,
      availabilityStatus: "available",
    };

    createItemMutation.mutate(itemData);
  };

  const categoryNames = {
    basic: "قهوة أساسية",
    hot: "قهوة ساخنة",
    cold: "قهوة باردة",
    specialty: "مشروبات إضافية",
    desserts: "الحلويات",
  };

  const categorizedItems = coffeeItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CoffeeItem[]>);

  if (!employee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-500">إدارة المشروبات</h1>
              <p className="text-gray-400 text-sm">تحديث حالة توفر المشروبات</p>
            </div>
          </div>
          <div className="flex gap-3">
            {employee?.role === "manager" && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                    data-testid="button-add-item"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة مشروب جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#2d1f1a] border-amber-500/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-amber-500">إضافة مشروب جديد</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitNewItem} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nameAr" className="text-gray-300">الاسم بالعربية *</Label>
                        <Input
                          id="nameAr"
                          name="nameAr"
                          required
                          className="bg-[#1a1410] border-amber-500/30 text-white"
                          data-testid="input-name-ar"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nameEn" className="text-gray-300">الاسم بالإنجليزية</Label>
                        <Input
                          id="nameEn"
                          name="nameEn"
                          className="bg-[#1a1410] border-amber-500/30 text-white"
                          data-testid="input-name-en"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-300">الوصف *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        required
                        className="bg-[#1a1410] border-amber-500/30 text-white"
                        data-testid="input-description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category" className="text-gray-300">القسم *</Label>
                        <Select name="category" required>
                          <SelectTrigger className="bg-[#1a1410] border-amber-500/30 text-white" data-testid="select-category">
                            <SelectValue placeholder="اختر القسم" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2d1f1a] border-amber-500/20 text-white">
                            <SelectItem value="basic">قهوة أساسية</SelectItem>
                            <SelectItem value="hot">قهوة ساخنة</SelectItem>
                            <SelectItem value="cold">قهوة باردة</SelectItem>
                            <SelectItem value="specialty">مشروبات إضافية</SelectItem>
                            <SelectItem value="desserts">الحلويات</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-gray-300">السعر (ريال) *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          className="bg-[#1a1410] border-amber-500/30 text-white"
                          data-testid="input-price"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="oldPrice" className="text-gray-300">السعر القديم (ريال)</Label>
                        <Input
                          id="oldPrice"
                          name="oldPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          className="bg-[#1a1410] border-amber-500/30 text-white"
                          data-testid="input-old-price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="imageUrl" className="text-gray-300">رابط الصورة</Label>
                        <Input
                          id="imageUrl"
                          name="imageUrl"
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          className="bg-[#1a1410] border-amber-500/30 text-white"
                          data-testid="input-image-url"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        className="border-gray-600 text-gray-300"
                        data-testid="button-cancel"
                      >
                        إلغاء
                      </Button>
                      <Button
                        type="submit"
                        disabled={createItemMutation.isPending}
                        className="bg-gradient-to-r from-green-500 to-green-700"
                        data-testid="button-submit"
                      >
                        {createItemMutation.isPending ? "جاري الإضافة..." : "إضافة المشروب"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant="outline"
              onClick={() => setLocation("/employee/ingredients")}
              className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
              data-testid="button-ingredients"
            >
              إدارة المكونات
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/employee/dashboard")}
              className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
              data-testid="button-back"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {isLoading ? (
          <div className="text-center text-amber-500 py-12">
            <Coffee className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p>جاري تحميل المشروبات...</p>
          </div>
        ) : (
          Object.entries(categorizedItems).map(([category, items]) => (
            <Card key={category} className="bg-[#2d1f1a] border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-500 text-right text-xl">
                  {categoryNames[category as keyof typeof categoryNames] || category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-[#1a1410] rounded-lg border border-amber-500/10 hover:border-amber-500/30 transition-all"
                    data-testid={`item-${item.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={getCoffeeImage(item.id)}
                        alt={item.nameAr}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/default-coffee.png";
                        }}
                        data-testid={`img-${item.id}`}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-amber-500" data-testid={`text-name-${item.id}`}>
                          {item.nameAr}
                        </h3>
                        <p className="text-gray-400 text-sm">{item.nameEn}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-amber-500 font-bold" data-testid={`text-price-${item.id}`}>
                            {parseFloat(item.price).toFixed(2)} ريال
                          </span>
                          {item.coffeeStrength && item.coffeeStrength !== "classic" && (
                            <Badge variant="outline" className="text-xs border-amber-500/30 text-gray-400">
                              {item.coffeeStrength === "strong" && "قوي"}
                              {item.coffeeStrength === "medium" && "متوسط"}
                              {item.coffeeStrength === "mild" && "خفيف"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right flex flex-col gap-2">
                        <Badge
                          className={
                            item.availabilityStatus === 'available' ? "bg-green-500" :
                            item.availabilityStatus === 'out_of_stock' ? "bg-red-500" :
                            item.availabilityStatus === 'coming_soon' ? "bg-blue-500" :
                            "bg-orange-500"
                          }
                          data-testid={`badge-status-${item.id}`}
                        >
                          {item.availabilityStatus === 'available' && (
                            <>
                              <CheckCircle className="w-4 h-4 ml-1" />
                              متوفر
                            </>
                          )}
                          {item.availabilityStatus === 'out_of_stock' && (
                            <>
                              <XCircle className="w-4 h-4 ml-1" />
                              نفذت الكمية
                            </>
                          )}
                          {item.availabilityStatus === 'coming_soon' && (
                            <>
                              <Coffee className="w-4 h-4 ml-1" />
                              قريباً
                            </>
                          )}
                          {item.availabilityStatus === 'temporarily_unavailable' && (
                            <>
                              <XCircle className="w-4 h-4 ml-1" />
                              غير متوفر مؤقتاً
                            </>
                          )}
                        </Badge>
                        
                        <select
                          value={item.availabilityStatus || 'available'}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          disabled={updateAvailabilityMutation.isPending}
                          className="bg-[#1a1410] border border-amber-500/30 rounded-lg px-3 py-1 text-sm text-amber-500"
                          data-testid={`select-status-${item.id}`}
                        >
                          <option value="available">✅ متوفر</option>
                          <option value="out_of_stock">❌ نفذت الكمية</option>
                          <option value="temporarily_unavailable">⏸️ غير متوفر مؤقتاً</option>
                          <option value="coming_soon">🔜 قريباً</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
