import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/cart-store';
import { useToast } from '@/hooks/use-toast';
import { Store, MapPin, ArrowRight, Phone, Map, Coffee, AlertCircle, Loader2, Navigation, Clock, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface Table {
  id?: string;
  _id?: string;
  tableNumber: string;
  capacity: number;
  branchId: string;
  isActive: number;
  isAvailable?: boolean;
  isOccupied?: boolean | number;
}

export default function DeliverySelectionPage() {
  const [, setLocation] = useLocation();
  const { setDeliveryInfo, cartItems } = useCartStore();
  const { toast } = useToast();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [dineIn, setDineIn] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{withinRange: boolean; distance: number; message: string} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [arrivalTime, setArrivalTime] = useState<string>('');
  const [loadingTables, setLoadingTables] = useState(false);
  const [bookedTable, setBookedTable] = useState<{ tableNumber: string; bookingId: string } | null>(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationError('');
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('يرجى السماح بالوصول للموقع للتحقق من قربك من الفرع');
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
    }
  }, []);

  // Check distance when branch is selected and we have user location
  useEffect(() => {
    if (selectedBranchId && userLocation) {
      checkLocationProximity();
    } else {
      setLocationStatus(null);
    }
  }, [selectedBranchId, userLocation]);

  // Fetch all tables when dine-in is selected
  useEffect(() => {
    if (dineIn && selectedBranchId) {
      fetchAvailableTables();
    } else {
      setAvailableTables([]);
      setSelectedTableId('');
      setBookedTable(null);
    }
  }, [dineIn, selectedBranchId]);

  // Book table when both table and arrival time are selected (only if not already booked)
  useEffect(() => {
    if (selectedTableId && arrivalTime && dineIn && !bookedTable) {
      bookTable();
    }
  }, [selectedTableId, arrivalTime, dineIn, bookedTable]);

  const fetchAvailableTables = async () => {
    setLoadingTables(true);
    try {
      const response = await fetch(`/api/tables/status?branchId=${selectedBranchId}`);
      const data = await response.json();
      
    const tables = Array.isArray(data) ? data : [];
    
    // Process tables to ensure they have the expected structure and filter active ones
    const processedTables = tables
      .filter((t: any) => t && (t.isActive === 1 || t.isActive === true || t.isActive === undefined))
      .map((t: any) => {
        // Handle MongoDB document structure (sometimes data is nested in $__)
        // We look for _doc or use the object itself
        const actualData = t._doc || t;
        
        // Ensure id is present
        const id = actualData.id || actualData._id || (t._id ? t._id.toString() : null);
        
        // Debug each table
        
        return {
          ...actualData,
          id: id,
          _id: id,
          // Correct availability check supporting both boolean and number formats
          isAvailable: actualData.isAvailable === true || (typeof actualData.isOccupied === 'number' ? actualData.isOccupied === 0 : actualData.isOccupied === false)
        };
      })
      .filter((t: any) => t.id); // Ensure only tables with valid IDs are shown
    
    setAvailableTables(processedTables);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الطاولات',
        variant: 'destructive',
      });
    } finally {
      setLoadingTables(false);
    }
  };

  const bookTable = async () => {
    try {
      const response = await fetch('/api/tables/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableId,
          arrivalTime: arrivalTime,
          branchId: selectedBranchId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل حجز الطاولة',
          variant: 'destructive',
        });
        // Don't clear selections on error - user can try again or adjust arrival time
        return;
      }

      // Update booked table state with the response
      setBookedTable({
        tableNumber: data.tableNumber,
        bookingId: data.bookingId
      });

      toast({
        title: 'نجح',
        description: data.message || 'تم حجز الطاولة بنجاح',
      });
    } catch (error) {
      // Keep selections - allow retry with same selections
    }
  };

  const checkLocationProximity = async () => {
    if (!selectedBranchId || !userLocation) return;

    setIsCheckingLocation(true);
    try {
      const response = await fetch(`/api/branches/${selectedBranchId}/check-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        })
      });
      
      const data = await response.json();
      setLocationStatus(data);
    } catch (error) {
      console.error('Error checking location:', error);
      setLocationStatus(null);
    } finally {
      setIsCheckingLocation(false);
    }
  };

  const refreshLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      setLocationError('');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationError('');
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('يرجى السماح بالوصول للموقع للتحقق من قربك من الفرع');
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  // Fetch branches (already filtered by backend to only active branches)
  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

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

    if (!selectedBranchId) {
      toast({
        title: 'تنبيه',
        description: 'الرجاء اختيار الفرع',
        variant: 'destructive',
      });
      return;
    }

    // Distance check removed per user request to allow all orders
    console.log("Allowing order regardless of distance");

    // If location couldn't be checked (no GPS or error), show warning but allow proceed
    if (!userLocation && locationError) {
      toast({
        title: 'تنبيه',
        description: 'لم نتمكن من التحقق من موقعك. يرجى التأكد من قربك من الفرع',
        variant: 'default',
      });
    }
    
    const branch = branches.find(b => b._id === selectedBranchId);
    if (!branch) return;

    // Validate dine-in reservation if selected
    if (dineIn) {
      // Check if table is selected OR already booked
      const hasTableSelection = selectedTableId || (bookedTable && bookedTable.tableNumber);

      if (!hasTableSelection) {
        toast({
          title: 'تنبيه',
          description: 'الرجاء اختيار طاولة',
          variant: 'destructive',
        });
        return;
      }

      if (!arrivalTime) {
        toast({
          title: 'تنبيه',
          description: 'الرجاء إدخال وقت الوصول',
          variant: 'destructive',
        });
        return;
      }
    }

    setDeliveryInfo({
      type: dineIn ? 'dine-in' : 'pickup',
      branchId: branch._id,
      branchName: branch.nameAr,
      branchAddress: branch.address,
      dineIn: dineIn,
      tableId: selectedTableId || undefined,
      tableNumber: bookedTable?.tableNumber || undefined,
      arrivalTime: arrivalTime || undefined,
      deliveryFee: 0,
    });
    
    setLocation('/checkout');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2" dir="rtl">اختر فرع الاستلام</h1>
          <p className="text-muted-foreground" dir="rtl">
            يرجى اختيار الفرع المناسب لاستلام طلبك
          </p>
        </div>

        {/* Branch Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
              <Label htmlFor="branch-select" className="text-base font-semibold mb-4 block" dir="rtl">
                <MapPin className="w-4 h-4 inline-block ml-2" />
                اختر الفرع
              </Label>
              
              {isLoading ? (
                <p className="text-muted-foreground" dir="rtl">جارٍ التحميل...</p>
              ) : branches.length === 0 ? (
                <p className="text-muted-foreground" dir="rtl">لا توجد فروع متاحة حالياً</p>
              ) : (
                <>
                  <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                    <SelectTrigger className="w-full" data-testid="select-branch">
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
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
                    const selectedBranch = branches.find(b => b._id === selectedBranchId);
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

                        {/* Location Status */}
                        {isCheckingLocation || isGettingLocation ? (
                          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <AlertDescription className="text-blue-800 dark:text-blue-200" dir="rtl">
                              جارٍ التحقق من موقعك...
                            </AlertDescription>
                          </Alert>
                        ) : locationError ? (
                          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <AlertDescription dir="rtl" className="flex items-center justify-between gap-2">
                              <span className="text-yellow-800 dark:text-yellow-200">{locationError}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshLocation}
                                data-testid="button-refresh-location"
                              >
                                <Navigation className="w-4 h-4 ml-1" />
                                تحديث الموقع
                              </Button>
                            </AlertDescription>
                          </Alert>
                        ) : locationStatus ? (
                          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <AlertDescription dir="rtl" className="text-blue-800 dark:text-blue-200">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span>
                                  {locationStatus.withinRange 
                                    ? `أنت ضمن نطاق الفرع (${locationStatus.distance} متر)`
                                    : `أنت على بعد مسافة ${locationStatus.distance} متر من الفرع`}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={refreshLocation}
                                  data-testid="button-refresh-location-2"
                                >
                                  <Navigation className="w-4 h-4 ml-1" />
                                  تحديث
                                </Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ) : null}

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

                        {/* Dine-In Option */}
                        <Card className="bg-accent/5">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                                  <Coffee className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1" dir="rtl">
                                  <Label htmlFor="dine-in" className="text-base font-semibold cursor-pointer">
                                    الجلوس في الكافيه
                                  </Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    احصل على طلبك واستمتع به في الكافيه
                                  </p>
                                </div>
                              </div>
                              <Checkbox 
                                id="dine-in"
                                checked={dineIn} 
                                onCheckedChange={(checked) => setDineIn(checked as boolean)}
                                data-testid="checkbox-dine-in"
                                className="ml-2"
                              />
                            </div>

                            {/* Table Selection */}
                            {dineIn && (
                              <div className="space-y-3 pt-3 border-t">
                                {loadingTables ? (
                                  <div className="text-center py-6">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">جارٍ تحميل الطاولات...</p>
                                  </div>
                                ) : availableTables.length === 0 ? (
                                  <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800 dark:text-yellow-200" dir="rtl">
                                      لا توجد طاولات في هذا الفرع حالياً
                                    </AlertDescription>
                                  </Alert>
                                ) : (
                                  <>
                                    <div dir="rtl">
                                      <Label className="text-sm font-semibold">اختر الطاولة</Label>
                                      <Select 
                                        value={selectedTableId} 
                                        onValueChange={(value) => {
                                          setSelectedTableId(value);
                                        }}
                                      >
                                        <SelectTrigger className="w-full mt-2" data-testid="select-table">
                                          <SelectValue placeholder="اختر طاولة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableTables.map((table) => {
                                            const tableId = table.id || table._id;
                                            if (!tableId) {
                                              console.error('[ERROR] Table missing id:', table);
                                              return null;
                                            }
                                            // Handle both possible status field names and values
                                            const isAvailable = table.isAvailable === true || (typeof table.isOccupied === 'number' ? table.isOccupied === 0 : table.isOccupied === false);
                                            const statusText = isAvailable ? '(متاحة)' : '(مشغولة)';
                                            return (
                                              <SelectItem key={tableId} value={tableId} disabled={!isAvailable} data-testid={`table-option-${table.tableNumber}`}>
                                                <span dir="rtl">طاولة {table.tableNumber} (السعة: {table.capacity || 4} أشخاص) {statusText}</span>
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                      {selectedTableId && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                          تم اختيار الطاولة بنجاح
                                        </p>
                                      )}
                                    </div>

                                    <div dir="rtl">
                                      <Label htmlFor="arrival-time" className="text-sm font-semibold">
                                        وقت الوصول المتوقع
                                      </Label>
                                      <Input
                                        id="arrival-time"
                                        type="time"
                                        value={arrivalTime}
                                        onChange={(e) => setArrivalTime(e.target.value)}
                                        data-testid="input-arrival-time"
                                        className="mt-2"
                                      />
                                    </div>

                                    {bookedTable && (
                                      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <AlertDescription className="text-green-800 dark:text-green-200" dir="rtl">
                                          تم حجز الطاولة {bookedTable.tableNumber} بنجاح
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>

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

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full"
          size="lg"
          disabled={!selectedBranchId || isLoading || isCheckingLocation}
          data-testid="button-continue"
        >
          <span dir="rtl">
            {isCheckingLocation ? 'جارٍ التحقق من الموقع...' : 'متابعة'}
          </span>
          {!isCheckingLocation && <ArrowRight className="w-5 h-5 mr-2" />}
          {isCheckingLocation && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        </Button>
      </div>
    </div>
  );
}
