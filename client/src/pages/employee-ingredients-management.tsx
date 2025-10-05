import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Coffee, Droplet, Cherry, Snowflake, Leaf, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Ingredient, Employee } from "@shared/schema";

// Icon mapping for ingredients
const getIngredientIcon = (nameAr: string) => {
  const iconMap: Record<string, any> = {
    "حليب": Droplet,
    "حبوب البن": Coffee,
    "بن مطحون": Coffee,
    "شوكولاتة": Cherry,
    "حليب مكثف": Droplet,
    "فانيليا": Sparkles,
    "كاكاو": Cherry,
    "كراميل": Droplet,
    "ثلج": Snowflake,
    "ماء": Droplet,
    "شاي": Leaf,
    "نعناع": Leaf,
    "ليمون": Cherry,
    "ماتشا": Leaf,
    "كيك": Cherry,
    "كريمة": Droplet,
    "بسكويت": Cherry
  };
  return iconMap[nameAr] || Coffee;
};

export default function EmployeeIngredientsManagement() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

  const { data: ingredients = [], isLoading } = useQuery<Ingredient[]>({
    queryKey: ["/api/ingredients"],
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: number }) => {
      const response = await fetch(`/api/ingredients/${id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });
      if (!response.ok) throw new Error("Failed to update ingredient");
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coffee-items"] });
      
      const affectedCount = data.affectedItems || 0;
      toast({
        title: "تم التحديث بنجاح",
        description: affectedCount > 0 
          ? `تم تحديث حالة توفر المكون وتأثر ${affectedCount} مشروب`
          : "تم تحديث حالة توفر المكون",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة توفر المكون",
        variant: "destructive",
      });
    },
  });

  const handleToggleAvailability = (ingredient: Ingredient) => {
    const newAvailability = ingredient.isAvailable === 1 ? 0 : 1;
    updateAvailabilityMutation.mutate({ id: ingredient.id, isAvailable: newAvailability });
  };

  if (!employee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">إدارة المكونات</h1>
              <p className="text-amber-100">مرحباً، {employee.fullName}</p>
            </div>
            <Button 
              onClick={() => setLocation("/employee/menu")}
              variant="secondary"
              size="lg"
              className="gap-2"
              data-testid="button-back-to-menu"
            >
              <ArrowRight className="w-5 h-5" />
              العودة للقائمة
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-r-4 border-amber-500">
            <p className="text-gray-700 dark:text-gray-300">
              💡 <strong>تنبيه:</strong> عند تعطيل أي مكون، سيتم تلقائياً جعل جميع المشروبات التي تحتوي على هذا المكون غير متوفرة.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ingredients.map((ingredient) => {
              const Icon = getIngredientIcon(ingredient.nameAr);
              const isAvailable = ingredient.isAvailable === 1;
              
              return (
                <Card 
                  key={ingredient.id} 
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isAvailable 
                      ? 'bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800' 
                      : 'bg-gray-100 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 opacity-75'
                  }`}
                  data-testid={`card-ingredient-${ingredient.id}`}
                >
                  {/* Decorative background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    isAvailable 
                      ? 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20' 
                      : 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'
                  } opacity-50`} />
                  
                  <CardContent className="relative p-6">
                    {/* Icon and availability badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-full ${
                        isAvailable 
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                          : 'bg-gray-400'
                      } shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge 
                        variant={isAvailable ? "default" : "secondary"}
                        className={`${
                          isAvailable 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white`}
                        data-testid={`badge-status-${ingredient.id}`}
                      >
                        {isAvailable ? "متوفر" : "غير متوفر"}
                      </Badge>
                    </div>

                    {/* Name */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1" data-testid={`text-name-${ingredient.id}`}>
                        {ingredient.nameAr}
                      </h3>
                      {ingredient.nameEn && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{ingredient.nameEn}</p>
                      )}
                    </div>

                    {/* Availability toggle */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        الحالة
                      </span>
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={() => handleToggleAvailability(ingredient)}
                        disabled={updateAvailabilityMutation.isPending}
                        className="data-[state=checked]:bg-green-500"
                        data-testid={`switch-availability-${ingredient.id}`}
                      />
                    </div>
                  </CardContent>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 border-2 border-amber-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && ingredients.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-4">
              <Coffee className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              لا توجد مكونات
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              لم يتم إضافة أي مكونات بعد
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
