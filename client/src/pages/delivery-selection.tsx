import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore, DeliveryInfo } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { Store, Truck, MapPin, ArrowRight, Check, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import MapAddressSelector from "@/components/map-address-selector";

interface Branch {
  id: string;
  nameAr: string;
  address: string;
  phone: string;
  city: string;
}

export default function DeliverySelectionPage() {
  const [, setLocation] = useLocation();
  const { deliveryInfo, setDeliveryInfo, cartItems } = useCartStore();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'pickup' | 'delivery'>(
    deliveryInfo?.type || 'pickup'
  );
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
    deliveryInfo?.branchId
  );
  const [showAddressMap, setShowAddressMap] = useState(false);

  const { data: branches = [], isLoading: loadingBranches } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const handleContinue = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات إلى السلة أولاً",
      });
      return;
    }

    if (selectedType === 'pickup') {
      if (!selectedBranch) {
        toast({
          variant: "destructive",
          title: "يرجى اختيار الفرع",
          description: "اختر الفرع الذي ترغب بالاستلام منه",
        });
        return;
      }

      const branch = branches.find(b => b.id === selectedBranch);
      const info: DeliveryInfo = {
        type: 'pickup',
        branchId: selectedBranch,
        branchName: branch?.nameAr,
        branchAddress: branch?.address,
        deliveryFee: 0,
      };
      setDeliveryInfo(info);
      setLocation('/checkout');
    } else {
      setShowAddressMap(true);
    }
  };

  const handleAddressSelected = (address: DeliveryInfo['address']) => {
    if (!address) return;

    const info: DeliveryInfo = {
      type: 'delivery',
      address,
      deliveryFee: 10,
    };
    setDeliveryInfo(info);
    setLocation('/checkout');
  };

  if (showAddressMap) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">اختر عنوان التوصيل</CardTitle>
            </CardHeader>
            <CardContent>
              <MapAddressSelector
                onAddressSelected={handleAddressSelected}
                onCancel={() => setShowAddressMap(false)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">اختر طريقة الاستلام</h1>
          <p className="text-muted-foreground">
            كيف تفضل استلام طلبك؟
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card
            key="pickup"
            className={`cursor-pointer transition-all ${
              selectedType === 'pickup'
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border hover:border-primary/50 hover-elevate'
            }`}
            onClick={() => setSelectedType('pickup')}
            data-testid="card-delivery-type-pickup"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">استلام من الفرع</CardTitle>
                </div>
                {selectedType === 'pickup' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                استلم طلبك من أحد فروعنا
              </p>
              <p className="text-sm font-semibold text-primary">
                مجاناً - بدون رسوم توصيل
              </p>
            </CardContent>
          </Card>

          <Card
            key="delivery"
            className={`cursor-pointer transition-all ${
              selectedType === 'delivery'
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border hover:border-primary/50 hover-elevate'
            }`}
            onClick={() => setSelectedType('delivery')}
            data-testid="card-delivery-type-delivery"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">توصيل للمنزل</CardTitle>
                </div>
                {selectedType === 'delivery' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                توصيل سريع إلى عنوانك
              </p>
              <p className="text-sm font-semibold text-orange-600">
                10 ريال - داخل البديعة فقط
              </p>
            </CardContent>
          </Card>
        </div>

        {selectedType === 'pickup' && (
          <Card>
            <CardHeader>
              <CardTitle>اختر الفرع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingBranches ? (
                <p className="text-center text-muted-foreground">جاري التحميل...</p>
              ) : branches.length === 0 ? (
                <p className="text-center text-muted-foreground">لا توجد فروع متاحة</p>
              ) : (
                branches.map((branch) => (
                  <Card
                    key={branch.id}
                    className={`cursor-pointer transition-all ${
                      selectedBranch === branch.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover-elevate'
                    }`}
                    onClick={() => setSelectedBranch(branch.id)}
                    data-testid={`card-branch-${branch.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{branch.nameAr}</h3>
                          <p className="text-sm text-muted-foreground">
                            {branch.address}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {branch.phone}
                          </p>
                        </div>
                        {selectedBranch === branch.id && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setLocation('/cart')}
            className="flex-1"
            data-testid="button-back-to-cart"
          >
            رجوع للسلة
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 gap-2"
            data-testid="button-continue-to-checkout"
          >
            متابعة
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
