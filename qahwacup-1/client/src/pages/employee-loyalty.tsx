import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Gift, UserPlus, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoadingState, EmptyState } from "@/components/ui/states";
import LoyaltyCardComponent from "@/components/loyalty-card";
import type { LoyaltyCard } from "@shared/schema";

export default function EmployeeLoyalty() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Fetch all loyalty cards
  const { data: cards = [], isLoading } = useQuery<LoyaltyCard[]>({
    queryKey: ["/api/loyalty/cards"]
  });

  // Create loyalty card mutation
  const createCardMutation = useMutation({
    mutationFn: async (customerData: { customerName: string; phoneNumber: string }) => {
      const response = await apiRequest("POST", "/api/loyalty/cards", customerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/cards"] });
      toast({
        title: "تم إنشاء بطاقة الولاء!",
        description: `تم إصدار بطاقة جديدة للعميل ${customerName}`,
      });
      setIsDialogOpen(false);
      setCustomerName("");
      setPhoneNumber("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل في إنشاء بطاقة الولاء"
      });
    }
  });

  const handleCreateCard = () => {
    if (!phoneNumber.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال رقم الهاتف"
      });
      return;
    }
    createCardMutation.mutate({
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim()
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/employee/dashboard")}
            data-testid="button-back"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة للوحة التحكم
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
              <Gift className="w-5 h-5" />
              <span className="font-bold">إدارة بطاقات الولاء</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Create Card Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              إصدار بطاقة ولاء جديدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full"
                  data-testid="button-create-card"
                >
                  <UserPlus className="w-4 h-4 ml-2" />
                  إنشاء بطاقة ولاء جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>بيانات العميل</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">اسم العميل</Label>
                    <Input
                      id="customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="محمد أحمد"
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">رقم الهاتف (9 أرقام تبدأ بـ 5)</Label>
                    <Input
                      id="phone-number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="5xxxxxxxx"
                      data-testid="input-phone-number"
                    />
                  </div>
                  <Button 
                    onClick={handleCreateCard}
                    disabled={createCardMutation.isPending}
                    className="w-full"
                    data-testid="button-submit-card"
                  >
                    {createCardMutation.isPending ? "جاري الإنشاء..." : "إصدار البطاقة"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Cards List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              بطاقات الولاء المُصدرة ({cards.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState message="جاري تحميل بطاقات الولاء..." />
            ) : cards.length === 0 ? (
              <EmptyState 
                title="لا توجد بطاقات ولاء"
                description="لم يتم إصدار أي بطاقات ولاء حتى الآن. قم بإنشاء أول بطاقة للبدء!"
                icon={<Gift className="h-10 w-10 text-muted-foreground" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card) => (
                  <div key={card.id} data-testid={`loyalty-card-${card.id}`}>
                    <LoyaltyCardComponent card={card} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
