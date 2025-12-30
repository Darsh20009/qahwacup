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

export default function ExternalIntegrationsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [integrationToConnect, setIntegrationToConnect] = useState<Integration | null>(null);

  const connectedIntegrations = mockIntegrations.filter(i => i.status === "connected");
  const totalOrders = connectedIntegrations.reduce((sum, i) => sum + i.ordersToday, 0);
  const totalRevenue = connectedIntegrations.reduce((sum, i) => sum + i.revenueToday, 0);
  const avgCommission = connectedIntegrations.length > 0 
    ? connectedIntegrations.reduce((sum, i) => sum + i.commission, 0) / connectedIntegrations.length
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/manager")}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">التكاملات الخارجية</h1>
              <p className="text-white/60 text-sm">إدارة تطبيقات التوصيل ومزامنة الطلبات</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              مزامنة الآن
            </Button>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
              <Link2 className="w-4 h-4 ml-2" />
              إضافة تكامل
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">التكاملات النشطة</p>
                  <p className="text-2xl font-bold text-white mt-1">{connectedIntegrations.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/20">
                  <Link2 className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">طلبات اليوم</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalOrders}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">إيرادات اليوم</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalRevenue} ر.س</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/20">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">متوسط العمولة</p>
                  <p className="text-2xl font-bold text-white mt-1">{avgCommission.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Link2 className="w-4 h-4 ml-2" />
              التكاملات
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Package className="w-4 h-4 ml-2" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Activity className="w-4 h-4 ml-2" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <History className="w-4 h-4 ml-2" />
              السجلات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockIntegrations.map((integration) => (
                <Card 
                  key={integration.id}
                  className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer ${
                    integration.status === "connected" ? "ring-2 ring-green-500/30" : ""
                  }`}
                  onClick={() => {
                    if (integration.status === "connected") {
                      setSelectedIntegration(integration);
                      setShowSettingsDialog(true);
                    } else {
                      setIntegrationToConnect(integration);
                      setShowConnectDialog(true);
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{integration.logo}</div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{integration.nameAr}</h3>
                          <p className="text-white/60 text-sm">{integration.name}</p>
                        </div>
                      </div>
                      <Badge className={
                        integration.status === "connected" 
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : integration.status === "pending"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-white/10 text-white/60 border-white/20"
                      }>
                        {integration.status === "connected" ? "متصل" : 
                         integration.status === "pending" ? "قيد المراجعة" : "غير متصل"}
                      </Badge>
                    </div>

                    {integration.status === "connected" && (
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <p className="text-2xl font-bold text-white">{integration.ordersToday}</p>
                          <p className="text-white/60 text-xs">طلب اليوم</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <p className="text-2xl font-bold text-white">{integration.revenueToday}</p>
                          <p className="text-white/60 text-xs">ر.س</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <p className="text-2xl font-bold text-white">{integration.commission}%</p>
                          <p className="text-white/60 text-xs">عمولة</p>
                        </div>
                      </div>
                    )}

                    {integration.lastSync && (
                      <div className="mt-4 flex items-center gap-2 text-white/40 text-sm">
                        <RefreshCw className="w-3 h-3" />
                        آخر مزامنة: {format(integration.lastSync, "hh:mm a", { locale: ar })}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      {integration.status === "connected" ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIntegration(integration);
                              setShowSettingsDialog(true);
                            }}
                          >
                            <Settings className="w-4 h-4 ml-2" />
                            الإعدادات
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIntegrationToConnect(integration);
                            setShowConnectDialog(true);
                          }}
                        >
                          <Link2 className="w-4 h-4 ml-2" />
                          ربط الآن
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  طلبات تطبيقات التوصيل
                </CardTitle>
                <CardDescription className="text-white/60">
                  جميع الطلبات الواردة من التطبيقات المتصلة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60 text-right">رقم الطلب</TableHead>
                      <TableHead className="text-white/60 text-right">المنصة</TableHead>
                      <TableHead className="text-white/60 text-right">العميل</TableHead>
                      <TableHead className="text-white/60 text-right">المنتجات</TableHead>
                      <TableHead className="text-white/60 text-right">المبلغ</TableHead>
                      <TableHead className="text-white/60 text-right">الحالة</TableHead>
                      <TableHead className="text-white/60 text-right">الوقت</TableHead>
                      <TableHead className="text-white/60 text-right">السائق</TableHead>
                      <TableHead className="text-white/60 text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((order) => {
                      const status = statusConfig[order.status];
                      const StatusIcon = status.icon;
                      const platform = mockIntegrations.find(i => i.id === order.platform);
                      
                      return (
                        <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white font-mono">{order.platformId}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{platform?.logo}</span>
                              <span className="text-white/80">{platform?.nameAr}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{order.customerName}</TableCell>
                          <TableCell className="text-white/60">{order.items} منتج</TableCell>
                          <TableCell className="text-white font-medium">{order.total} ر.س</TableCell>
                          <TableCell>
                            <Badge className={`${status.color} text-white`}>
                              <StatusIcon className="w-3 h-3 ml-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/60">
                            {format(order.createdAt, "hh:mm a", { locale: ar })}
                          </TableCell>
                          <TableCell className="text-white/60">
                            {order.driverName || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {order.status === "new" && (
                                <>
                                  <Button size="sm" className="bg-green-500 hover:bg-green-600 h-7 px-2">
                                    قبول
                                  </Button>
                                  <Button size="sm" variant="destructive" className="h-7 px-2">
                                    رفض
                                  </Button>
                                </>
                              )}
                              {order.status === "preparing" && (
                                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 h-7 px-2">
                                  جاهز
                                </Button>
                              )}
                              {order.status === "ready" && (
                                <Button size="sm" className="bg-purple-500 hover:bg-purple-600 h-7 px-2">
                                  تم الاستلام
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">أداء التطبيقات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connectedIntegrations.map((integration) => {
                    const percentage = totalOrders > 0 ? (integration.ordersToday / totalOrders) * 100 : 0;
                    return (
                      <div key={integration.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{integration.logo}</span>
                            <span className="text-white">{integration.nameAr}</span>
                          </div>
                          <span className="text-white/60">{integration.ordersToday} طلب</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">توزيع الإيرادات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connectedIntegrations.map((integration) => {
                    const percentage = totalRevenue > 0 ? (integration.revenueToday / totalRevenue) * 100 : 0;
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{integration.logo}</span>
                          <div>
                            <p className="text-white font-medium">{integration.nameAr}</p>
                            <p className="text-white/60 text-sm">{percentage.toFixed(1)}% من الإجمالي</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold">{integration.revenueToday} ر.س</p>
                          <p className="text-red-400 text-sm">-{(integration.revenueToday * integration.commission / 100).toFixed(0)} عمولة</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">ملخص العمولات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-sm">إجمالي الإيرادات</p>
                      <p className="text-3xl font-bold text-white mt-2">{totalRevenue} ر.س</p>
                    </div>
                    <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-white/60 text-sm">إجمالي العمولات</p>
                      <p className="text-3xl font-bold text-red-400 mt-2">
                        -{connectedIntegrations.reduce((sum, i) => sum + (i.revenueToday * i.commission / 100), 0).toFixed(0)} ر.س
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-white/60 text-sm">صافي الإيرادات</p>
                      <p className="text-3xl font-bold text-green-400 mt-2">
                        {(totalRevenue - connectedIntegrations.reduce((sum, i) => sum + (i.revenueToday * i.commission / 100), 0)).toFixed(0)} ر.س
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  سجل الأحداث
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: "منذ 2 دقيقة", event: "طلب جديد من هنقرستيشن #HS-78236", type: "info" },
                    { time: "منذ 5 دقائق", event: "تم مزامنة القائمة مع مرسول", type: "success" },
                    { time: "منذ 12 دقيقة", event: "تم توصيل الطلب #MS-45620", type: "success" },
                    { time: "منذ 18 دقيقة", event: "تحديث حالة الطلب #HS-78234 إلى قيد التحضير", type: "info" },
                    { time: "منذ 25 دقيقة", event: "تم استلام الطلب #MS-45621 من السائق", type: "success" },
                    { time: "منذ 30 دقيقة", event: "فشل في مزامنة المخزون مع هنقرستيشن", type: "error" },
                    { time: "منذ 45 دقيقة", event: "إعادة المحاولة: مزامنة المخزون نجحت", type: "success" },
                  ].map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        log.type === "success" ? "bg-green-500" :
                        log.type === "error" ? "bg-red-500" : "bg-blue-500"
                      }`} />
                      <div className="flex-1">
                        <p className="text-white">{log.event}</p>
                        <p className="text-white/40 text-sm">{log.time}</p>
                      </div>
                      {log.type === "error" && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{selectedIntegration?.logo}</span>
              إعدادات {selectedIntegration?.nameAr}
            </DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">القبول التلقائي للطلبات</Label>
                    <p className="text-white/60 text-sm">قبول الطلبات الجديدة تلقائياً</p>
                  </div>
                  <Switch checked={selectedIntegration.settings.autoAccept} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">التعيين التلقائي للسائق</Label>
                    <p className="text-white/60 text-sm">تعيين السائق عند جهوزية الطلب</p>
                  </div>
                  <Switch checked={selectedIntegration.settings.autoAssign} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">مزامنة المخزون</Label>
                    <p className="text-white/60 text-sm">تحديث المنتجات غير المتوفرة</p>
                  </div>
                  <Switch checked={selectedIntegration.settings.syncInventory} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">مزامنة القائمة</Label>
                    <p className="text-white/60 text-sm">تحديث الأسعار والمنتجات الجديدة</p>
                  </div>
                  <Switch checked={selectedIntegration.settings.syncMenu} />
                </div>
              </div>

              <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 text-white/60">
                  <Key className="w-4 h-4" />
                  <span className="text-sm">مفتاح API: {selectedIntegration.apiKey}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm truncate">Webhook: {selectedIntegration.webhookUrl}</span>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  variant="destructive"
                  onClick={() => setShowSettingsDialog(false)}
                >
                  فصل التكامل
                </Button>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-amber-600"
                  onClick={() => setShowSettingsDialog(false)}
                >
                  حفظ التغييرات
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{integrationToConnect?.logo}</span>
              ربط {integrationToConnect?.nameAr}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>مفتاح API</Label>
              <Input 
                placeholder="أدخل مفتاح API الخاص بك"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>معرف المتجر</Label>
              <Input 
                placeholder="أدخل معرف المتجر"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">بيانات آمنة</p>
                  <p className="text-white/60 text-sm">جميع البيانات مشفرة ومحمية</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConnectDialog(false)}
              className="border-white/20 text-white"
            >
              إلغاء
            </Button>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600">
              <Link2 className="w-4 h-4 ml-2" />
              ربط الآن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
