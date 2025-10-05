import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Coffee, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CoffeeItem, Employee } from "@shared/schema";

export default function EmployeeMenuManagement() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
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

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: number }) => {
      const response = await fetch(`/api/coffee-items/${id}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable }),
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
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.nameAr}
                          className="w-16 h-16 rounded-lg object-cover"
                          data-testid={`img-${item.id}`}
                        />
                      )}
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
                      <div className="text-right">
                        <Badge
                          className={item.isAvailable === 1 ? "bg-green-500" : "bg-red-500"}
                          data-testid={`badge-status-${item.id}`}
                        >
                          {item.isAvailable === 1 ? (
                            <>
                              <CheckCircle className="w-4 h-4 ml-1" />
                              متوفر
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 ml-1" />
                              غير متوفر
                            </>
                          )}
                        </Badge>
                      </div>
                      <Switch
                        checked={item.isAvailable === 1}
                        onCheckedChange={() => handleToggleAvailability(item)}
                        disabled={updateAvailabilityMutation.isPending}
                        className="data-[state=checked]:bg-green-500"
                        data-testid={`switch-${item.id}`}
                      />
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
