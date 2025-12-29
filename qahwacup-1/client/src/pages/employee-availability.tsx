import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { CoffeeItem } from "@shared/schema";
import { Coffee, Check, X } from "lucide-react";

export default function EmployeeAvailability() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<{[key: string]: string}>({});

  const { data: items = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: { itemId: string; availabilityStatus: string }) => {
      const res = await fetch(`/api/coffee-items/${data.itemId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus: data.availabilityStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coffee-items"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة المشروب بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة المشروب",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-amiri text-3xl font-bold text-primary flex items-center gap-2">
            <Coffee className="w-8 h-8" />
            إدارة توفر المشروبات
          </h1>
          <p className="text-muted-foreground mt-2">
            تغيير حالة توفر المشروبات (متاح / نفذت الكمية / قريباً)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-amiri text-right">{item.nameAr}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={item.availabilityStatus === 'available' ? 'default' : 'secondary'}>
                    {item.availabilityStatus === 'available' && "متاح"}
                    {item.availabilityStatus === 'out_of_stock' && "نفذت الكمية"}
                    {item.availabilityStatus === 'coming_soon' && "قريباً"}
                    {item.availabilityStatus === 'temporarily_unavailable' && "غير متوفر مؤقتاً"}
                  </Badge>
                  <span className="text-2xl font-bold text-primary">{item.price} ريال</span>
                </div>

                <Select
                  value={selectedStatus[item.id] || item.availabilityStatus || 'available'}
                  onValueChange={(value) => {
                    setSelectedStatus(prev => ({ ...prev, [item.id]: value }));
                  }}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">متاح</SelectItem>
                    <SelectItem value="out_of_stock">نفذت الكمية</SelectItem>
                    <SelectItem value="coming_soon">قريباً</SelectItem>
                    <SelectItem value="temporarily_unavailable">غير متوفر مؤقتاً</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    const newStatus = selectedStatus[item.id] || item.availabilityStatus || 'available';
                    updateAvailabilityMutation.mutate({
                      itemId: item.id,
                      availabilityStatus: newStatus,
                    });
                  }}
                  disabled={updateAvailabilityMutation.isPending}
                  className="w-full"
                >
                  <Check className="w-4 h-4 ml-2" />
                  تحديث الحالة
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">لا توجد مشروبات</p>
          </div>
        )}
      </div>
    </div>
  );
}
