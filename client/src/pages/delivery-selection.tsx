import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore } from '@/lib/cart-store';
import { useToast } from '@/hooks/use-toast';
import { Store, Truck, MapPin, ArrowRight, ExternalLink, Phone, Map } from 'lucide-react';

interface Branch {
  _id: string;
  nameAr: string;
  nameEn?: string;
  address: string;
  phone: string;
  city: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  isActive: number;
  mapsUrl?: string;
}

export default function DeliverySelectionPage() {
  const [, setLocation] = useLocation();
  const { setDeliveryInfo, cartItems } = useCartStore();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Fetch branches
  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const activeBranches = branches.filter(b => b.isActive === 1);

  const handleContinue = () => {
    // Validate cart is not empty
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: 'السلة فارغة',
        description: 'الرجاء إضافة منتجات إلى السلة أولاً',
        variant: 'destructive',
      });
      setLocation('/menu');
      return;
    }

    if (selectedType === 'pickup') {
      if (!selectedBranchId) {
        toast({
          title: 'تنبيه',
          description: 'الرجاء اختيار الفرع',
          variant: 'destructive',
        });
        return;
      }
      
      const branch = activeBranches.find(b => b._id === selectedBranchId);
      if (!branch) return;

      setDeliveryInfo({
        type: 'pickup',
        branchId: branch._id,
        branchName: branch.nameAr,
        branchAddress: branch.address,
        deliveryFee: 0,
      });
      
      setLocation('/checkout');
    } else {
      // Navigate to map page for address selection
      setLocation('/delivery/map');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2" dir="rtl">اختر طريقة الاستلام</h1>
          <p className="text-muted-foreground" dir="rtl">
            يرجى تحديد طريقة استلام الطلب
          </p>
        </div>

        {/* Delivery Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card
            className={`cursor-pointer transition-all ${
              selectedType === 'pickup'
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border hover:border-primary/50 hover-elevate'
            }`}
            onClick={() => setSelectedType('pickup')}
            data-testid="card-delivery-type-pickup"
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Store className="w-12 h-12 mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-1" dir="rtl">استلام من الفرع</h3>
              <p className="text-sm text-muted-foreground text-center" dir="rtl">
                اختر الفرع المناسب للاستلام
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              selectedType === 'delivery'
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border hover:border-primary/50 hover-elevate'
            }`}
            onClick={() => setSelectedType('delivery')}
            data-testid="card-delivery-type-delivery"
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Truck className="w-12 h-12 mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-1" dir="rtl">توصيل</h3>
              <p className="text-sm text-muted-foreground text-center" dir="rtl">
                أدخل عنوان التوصيل من الخريطة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Branch Selection for Pickup */}
        {selectedType === 'pickup' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <Label htmlFor="branch-select" className="text-base font-semibold mb-4 block" dir="rtl">
                <MapPin className="w-4 h-4 inline-block ml-2" />
                اختر الفرع
              </Label>
              
              {isLoading ? (
                <p className="text-muted-foreground" dir="rtl">جارٍ التحميل...</p>
              ) : activeBranches.length === 0 ? (
                <p className="text-muted-foreground" dir="rtl">لا توجد فروع متاحة حالياً</p>
              ) : (
                <>
                  <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                    <SelectTrigger className="w-full" data-testid="select-branch">
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeBranches.map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          <div className="flex flex-col items-start gap-1" dir="rtl">
                            <span className="font-semibold">{branch.nameAr}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{branch.address}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span dir="ltr">{branch.phone}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Selected Branch Details */}
                  {selectedBranchId && (() => {
                    const selectedBranch = activeBranches.find(b => b._id === selectedBranchId);
                    if (!selectedBranch) return null;
                    
                    return (
                      <div className="mt-4 space-y-3">
                        {/* Branch Info Card */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2" dir="rtl">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-1 text-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium">العنوان</p>
                              <p className="text-sm text-muted-foreground">{selectedBranch.address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 mt-1 text-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium">رقم الهاتف</p>
                              <p className="text-sm text-muted-foreground" dir="ltr">{selectedBranch.phone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Map Preview Link */}
                        {selectedBranch.location && (
                          <a
                            href={`https://www.google.com/maps?q=${selectedBranch.location.latitude},${selectedBranch.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden border bg-muted/30 hover-elevate"
                            data-testid="link-branch-map-preview"
                          >
                            <div className="flex flex-col items-center justify-center p-8 gap-3">
                              <div className="p-4 rounded-full bg-primary/10">
                                <Map className="w-8 h-8 text-primary" />
                              </div>
                              <div className="text-center" dir="rtl">
                                <p className="font-medium">عرض الموقع على الخريطة</p>
                                <p className="text-sm text-muted-foreground">اضغط لفتح في خرائط جوجل</p>
                              </div>
                            </div>
                          </a>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {selectedBranch.location && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              asChild
                              data-testid="button-navigate-to-branch"
                            >
                              <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.location.latitude},${selectedBranch.location.longitude}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Map className="w-4 h-4 ml-2" />
                                <span dir="rtl">التوجيه إلى الفرع</span>
                              </a>
                            </Button>
                          )}
                          {selectedBranch.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              asChild
                              data-testid="button-call-branch"
                            >
                              <a href={`tel:+966${selectedBranch.phone}`}>
                                <Phone className="w-4 h-4 ml-2" />
                                <span dir="rtl">الاتصال بالفرع</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delivery Info Card */}
        {selectedType === 'delivery' && (
          <Card className="mb-6 bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3" dir="rtl">
                <MapPin className="w-5 h-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-semibold mb-2">معلومات التوصيل</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• التوصيل متاح داخل مدينة الرياض</li>
                    <li>• التوصيل مجاني للأحياء: السويدي، البديعة، ظهرة البديعة</li>
                    <li>• رسوم التوصيل 10 ريال للأحياء الأخرى داخل الرياض</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full"
          size="lg"
          disabled={(selectedType === 'pickup' && !selectedBranchId) || isLoading}
          data-testid="button-continue"
        >
          <span dir="rtl">متابعة</span>
          <ArrowRight className="w-5 h-5 mr-2" />
        </Button>
      </div>
    </div>
  );
}
