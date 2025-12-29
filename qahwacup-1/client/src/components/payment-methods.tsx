import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, CreditCard, University, Zap, Building, Banknote, Gift, Truck, Plus, Phone, Search, Coffee, Check } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useCustomer } from "@/contexts/CustomerContext";

interface PaymentMethodsProps {
 paymentMethods: PaymentMethodInfo[];
 selectedMethod: PaymentMethod | null;
 onSelectMethod: (method: PaymentMethod) => void;
 customerPhone?: string;
 loyaltyCard?: any;
}

export default function PaymentMethods({
 paymentMethods,
 selectedMethod,
 onSelectMethod,
 customerPhone: propCustomerPhone,
 loyaltyCard: initialLoyaltyCard,
}: PaymentMethodsProps) {
 const { toast } = useToast();
 const { customer } = useCustomer();
 const [cardMode, setCardMode] = useState<'use' | 'add' | null>(null);
 const [searchPhone, setSearchPhone] = useState("");
 const [searchCardNumber, setSearchCardNumber] = useState("");
 const [isSearching, setIsSearching] = useState(false);
 const [foundCard, setFoundCard] = useState<any>(initialLoyaltyCard || null);
 
 // Use provided phone or customer phone
 const activePhone = propCustomerPhone || customer?.phone;
 
 // Fetch loyalty card automatically if customer has phone
 const { data: autoFetchedCard } = useQuery({
   queryKey: ["/api/loyalty/cards/phone", activePhone],
   queryFn: async () => {
     if (!activePhone) return null;
     const res = await fetch(`/api/loyalty/cards/phone/${activePhone}`);
     if (!res.ok) return null;
     return res.json();
   },
   enabled: !!activePhone && !foundCard,
   staleTime: 0,
   refetchOnWindowFocus: true,
   refetchInterval: 5000,
 });
 
 // Update foundCard when auto-fetched card arrives
 useEffect(() => {
   if (autoFetchedCard && !foundCard) {
     setFoundCard(autoFetchedCard);
   }
 }, [autoFetchedCard, foundCard]);

 const getIcon = (iconName: string) => {
  switch (iconName) {
  case 'fas fa-gift':
  return <Gift className="w-6 h-6 text-primary" />;
  case 'fas fa-money-bill-wave':
  return <Banknote className="w-6 h-6 text-primary" />;
  case 'fas fa-truck':
  return <Truck className="w-6 h-6 text-primary" />;
  case 'fas fa-mobile-alt':
  return <Smartphone className="w-6 h-6 text-primary" />;
  case 'fas fa-credit-card':
  return <CreditCard className="w-6 h-6 text-primary" />;
  case 'fas fa-university':
  return <University className="w-6 h-6 text-primary" />;
  case 'fas fa-bolt':
  return <Zap className="w-6 h-6 text-primary" />;
  case 'fas fa-building-columns':
  return <Building className="w-6 h-6 text-primary" />;
  default:
  return <CreditCard className="w-6 h-6 text-primary" />;
  }
 };

 const handleSearchCard = async () => {
  if (!searchPhone && !searchCardNumber) {
   toast({
    variant: "destructive",
    title: "خطأ",
    description: "يرجى إدخال رقم الجوال أو رقم البطاقة",
   });
   return;
  }

  setIsSearching(true);
  try {
   let url = "";
   if (searchPhone) {
    url = `/api/loyalty/cards/phone/${searchPhone}`;
   } else {
    url = `/api/loyalty/cards/number/${searchCardNumber}`;
   }

   const res = await fetch(url);
   if (!res.ok) throw new Error("البطاقة غير موجودة");
   const card = await res.json();
   setFoundCard(card);
   setIsAddingCard(false);
   toast({
    title: "تم العثور على البطاقة",
    description: `أهلاً ${card.customerName || 'عميلنا العزيز'}`,
   });
  } catch (error) {
   toast({
    variant: "destructive",
    title: "خطأ",
    description: "لم يتم العثور على بطاقة مرتبطة بهذه البيانات",
   });
  } finally {
   setIsSearching(false);
  }
 };

 return (
   <div className="space-y-4" data-testid="section-payment-methods">
     <h3 className="text-lg font-semibold text-foreground mb-4">اختر طريقة الدفع</h3>
     <div className="space-y-4">
     {paymentMethods.map((method) => {
     const isQahwaCard = method.id === 'qahwa-card';
     const isSelected = selectedMethod === method.id;
     
     return (
       <div key={method.id} className="relative group">
         {isQahwaCard && (
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-yellow-500/30 to-orange-500/30 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
         )}
         <Card
          className={`cursor-pointer transition-all duration-500 relative overflow-hidden rounded-2xl ${
           isQahwaCard
           ? isSelected
            ? 'border-2 border-amber-400 shadow-2xl scale-[1.02] bg-white'
            : 'border-2 border-amber-200/50 hover:border-amber-400/80 shadow-lg hover:scale-[1.01] bg-white/80'
           : isSelected
            ? 'border-primary bg-primary/5 shadow-md'
            : 'border-border/50 hover:border-primary/30 hover:bg-primary/5 bg-white/50'
          }`}
          onClick={() => onSelectMethod(method.id)}
          data-testid={`payment-method-${method.id}`}
         >
          <CardContent className="p-0">
            {isQahwaCard && isSelected ? (
              <div className="space-y-4">
                <div className="min-h-80 relative overflow-visible rounded-3xl shadow-2xl border border-white/10" 
                  style={{
                    background: `linear-gradient(135deg, #B8860B 0%, #D4A017 25%, #C4880F 50%, #8B6914 75%, #5C3D2E 100%)`,
                  }}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-white" />
                  </div>

                  <div className="relative flex flex-col justify-between text-white h-full py-8 px-8">
                    <div className="flex justify-between items-start flex-shrink-0">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest opacity-75">قهوة كوب</p>
                        <h4 className="text-2xl font-black">بطاقة الولاء</h4>
                      </div>
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
                        <Coffee className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {cardMode === null ? (
                      <div className="flex flex-col items-center justify-center my-auto">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-4 space-y-3 text-center w-full">
                          <p className="text-sm opacity-90">كيف تريد استخدام بطاقتك؟</p>
                          <div className="space-y-2">
                            {foundCard && (
                              <Button 
                                size="sm"
                                className="w-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur border-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardMode('use');
                                }}
                              >
                                <Check className="w-4 h-4 ml-2" />
                                استخدام البطاقة المربوطة
                              </Button>
                            )}
                            <Button 
                              size="sm"
                              className="w-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardMode('add');
                              }}
                            >
                              <Plus className="w-4 h-4 ml-2" />
                              إضافة بطاقة أخرى
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : cardMode === 'use' && foundCard ? (
                      <div className="space-y-3 flex-1 flex flex-col justify-center">
                        <div className="space-y-1">
                          <p className="text-xs opacity-75">رقم البطاقة</p>
                          <p className="text-lg font-mono tracking-widest font-bold">
                            {foundCard.cardNumber.replace(/(.{4})/g, '$1 ')}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
                            <p className="text-xs opacity-70">صاحب</p>
                            <p className="font-bold">{foundCard.customerName?.split(' ')[0] || 'عضو'}</p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
                            <p className="text-xs opacity-70">مجاني</p>
                            <p className="font-bold text-base">{(foundCard.freeCupsEarned || 0) - (foundCard.freeCupsRedeemed || 0)}</p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-2 backdrop-blur">
                            <p className="text-xs opacity-70">نقاط</p>
                            <p className="font-bold text-base">{foundCard.points || 0}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          className="w-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur border-0 mt-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCardMode(null);
                          }}
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          تغيير البطاقة
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {cardMode === 'add' && (
                  <div className="p-6 bg-white border-t border-amber-100 animate-in slide-in-from-top-4 duration-300" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-4">
                      <h4 className="font-bold text-amber-900 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        البحث عن بطاقتك
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-amber-800">رقم الجوال</Label>
                          <div className="relative">
                            <Phone className="absolute right-3 top-2.5 w-4 h-4 text-amber-400" />
                            <Input 
                              placeholder="5XXXXXXXX" 
                              className="pr-9 border-amber-100 focus:ring-amber-400"
                              value={searchPhone}
                              onChange={(e) => setSearchPhone(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-amber-800">رقم البطاقة</Label>
                          <div className="relative">
                            <CreditCard className="absolute right-3 top-2.5 w-4 h-4 text-amber-400" />
                            <Input 
                              placeholder="رقم البطاقة" 
                              className="pr-9 border-amber-100 focus:ring-amber-400"
                              value={searchCardNumber}
                              onChange={(e) => setSearchCardNumber(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={handleSearchCard}
                          disabled={isSearching}
                        >
                          {isSearching ? "جاري البحث..." : "تأكيد الإضافة"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-amber-700 hover:bg-amber-50"
                          onClick={() => setCardMode(null)}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    isQahwaCard 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg group-hover:scale-110' 
                      : 'bg-muted text-primary'
                  }`}>
                    {getIcon(method.icon)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold transition-colors ${
                        isQahwaCard 
                          ? 'font-amiri text-xl text-amber-900' 
                          : 'text-foreground group-hover:text-primary'
                      }`}>
                        {method.nameAr}
                      </h4>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-300">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm mt-0.5 line-clamp-1 text-[#222429]">
                      {method.details}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
         </Card>
       </div>
     );
     })}
     </div>
   </div>
 );
}
