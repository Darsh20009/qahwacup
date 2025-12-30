import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Package, Truck, Globe, Settings2, Link2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ExternalIntegrationsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [apiKey, setApiKey] = useState("");

  const { data: integrations = [] } = useQuery({
    queryKey: ["/api/integrations/delivery"],
  });

  const mutation = useMutation({
    mutationFn: async (newIntegration: any) => {
      const res = await apiRequest("POST", "/api/integrations/delivery", newIntegration);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/delivery"] });
      toast({ title: "تم التفعيل بنجاح", className: "bg-green-600 text-white" });
    },
  });

  const providers = [
    { id: 'hungerstation', nameAr: 'هنقرستيشن', nameEn: 'HungerStation' },
    { id: 'jahez', nameAr: 'جاهز', nameEn: 'Jahez' },
    { id: 'toyou', nameAr: 'تويو', nameEn: 'ToYou' }
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/manager")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">الربط مع تطبيقات التوصيل</h1>
          <p className="text-muted-foreground">قم بربط متجرك مع تطبيقات التوصيل العالمية لزيادة مبيعاتك</p>
        </div>
        <Globe className="h-10 w-10 text-primary mr-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((provider) => {
          const isEnabled = integrations.find((i: any) => i.provider === provider.id && i.isActive);
          return (
            <Card key={provider.id} className="border-2 hover:border-primary transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{provider.nameAr}</CardTitle>
                <Truck className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  ربط الطلبات آلياً مع {provider.nameAr} وتحديث حالة المخزون.
                </CardDescription>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${provider.id}-active`}>حالة الربط</Label>
                    <Switch id={`${provider.id}-active`} checked={!!isEnabled} />
                  </div>
                  {!isEnabled && (
                    <div className="space-y-2">
                      <Label>مفتاح API الخاص بـ {provider.nameAr}</Label>
                      <Input 
                        type="password" 
                        placeholder="أدخل المفتاح هنا..." 
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <Button 
                        className="w-full" 
                        onClick={() => mutation.mutate({ provider: provider.id, apiKey, isActive: true })}
                      >
                        تفعيل الربط <Link2 className="mr-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {isEnabled && (
                    <Button variant="outline" className="w-full">
                      إعدادات متقدمة <Settings2 className="mr-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10">
        <Card className="bg-muted/50 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="ml-2 h-6 w-6 text-primary" /> مستودعات الإمداد
            </CardTitle>
            <CardDescription>هذه الميزة تمكنك من إدارة المخزون المركزي وتوزيعه على الفروع</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">جاري العمل على واجهة المستودعات المركزية لتمكين التحويل بين المخازن...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
