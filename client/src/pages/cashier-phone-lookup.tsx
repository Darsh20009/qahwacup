import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, User, Mail, CreditCard, ShoppingBag, Gift, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { LoyaltyCard, Order } from "@shared/schema";

interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
}

export default function CashierPhoneLookup() {
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const { toast } = useToast();

  const { data: loyaltyCard, isLoading: isLoadingCard, error: cardError } = useQuery<LoyaltyCard>({
    queryKey: [`/api/loyalty/cards/phone/${searchPhone}`],
    enabled: !!searchPhone && searchPhone.length >= 10,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: false,
  });

  const handleSearch = () => {
    if (phoneNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "رقم هاتف غير صحيح",
        description: "يرجى إدخال رقم هاتف صحيح (10 أرقام على الأقل)",
      });
      return;
    }
    setSearchPhone(phoneNumber);
  };

  const handleClear = () => {
    setPhoneNumber("");
    setSearchPhone("");
  };

  const stampsNeeded = 8;
  const currentStamps = loyaltyCard?.stamps || 0;
  const progress = (currentStamps / stampsNeeded) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-500">البحث برقم الهاتف</h1>
              <p className="text-gray-400 text-sm">البحث عن العميل وبطاقة الولاء</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/employee/cashier")}
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
            data-testid="button-back"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
        </div>
      </div>

      {/* Search Box */}
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-[#2d1f1a] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-500 text-right">بحث عن عميل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                <Input
                  type="tel"
                  placeholder="أدخل رقم الهاتف (05xxxxxxxx)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-[#1a1410] border-amber-500/30 text-white pr-10 text-right"
                  dir="ltr"
                  data-testid="input-phone"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoadingCard}
                className="bg-gradient-to-r from-amber-500 to-amber-700"
                data-testid="button-search"
              >
                <Search className="w-4 h-4 ml-2" />
                {isLoadingCard ? "جاري البحث..." : "بحث"}
              </Button>
              {searchPhone && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="border-gray-600 text-gray-300"
                  data-testid="button-clear"
                >
                  مسح
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searchPhone && (
          <>
            {isLoadingCard ? (
              <Card className="bg-[#2d1f1a] border-amber-500/20">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 animate-pulse mx-auto mb-4 text-amber-500" />
                  <p className="text-gray-400">جاري البحث...</p>
                </CardContent>
              </Card>
            ) : cardError ? (
              <Card className="bg-[#2d1f1a] border-red-500/20">
                <CardContent className="p-12 text-center">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <p className="text-red-400 font-semibold mb-2">لم يتم العثور على عميل</p>
                  <p className="text-gray-400 text-sm">
                    لا يوجد حساب مسجل بهذا الرقم
                  </p>
                </CardContent>
              </Card>
            ) : loyaltyCard ? (
              <>
                {/* Customer Info Card */}
                <Card className="bg-[#2d1f1a] border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-amber-500 text-right flex items-center gap-2">
                      <User className="w-5 h-5" />
                      معلومات العميل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[#1a1410] rounded-lg">
                      <User className="w-5 h-5 text-amber-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">الاسم</p>
                        <p className="text-white font-semibold" data-testid="text-customer-name">
                          {loyaltyCard.customerName || "غير محدد"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#1a1410] rounded-lg">
                      <Phone className="w-5 h-5 text-amber-500" />
                      <div className="flex-1" dir="ltr">
                        <p className="text-xs text-gray-400 text-right">رقم الهاتف</p>
                        <p className="text-white font-semibold text-right" data-testid="text-customer-phone">
                          {loyaltyCard.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#1a1410] rounded-lg">
                      <CreditCard className="w-5 h-5 text-amber-500" />
                      <div className="flex-1" dir="ltr">
                        <p className="text-xs text-gray-400 text-right">رقم البطاقة</p>
                        <p className="text-white font-semibold text-right font-mono" data-testid="text-card-number">
                          {loyaltyCard.cardNumber}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Loyalty Card Info */}
                <Card className="bg-gradient-to-br from-amber-900/40 to-amber-950/40 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-amber-400 text-right flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        بطاقة كوب نسخة
                      </span>
                      <Badge
                        className={
                          loyaltyCard.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }
                        data-testid="badge-card-status"
                      >
                        {loyaltyCard.status === "active" ? "نشطة" : "غير نشطة"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Stamps Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-amber-400" data-testid="text-stamps-count">
                          {currentStamps} / {stampsNeeded}
                        </span>
                        <span className="text-gray-400 text-sm">الأختام</span>
                      </div>
                      <div className="w-full bg-[#1a1410] rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                          data-testid="progress-stamps"
                        />
                      </div>
                      <div className="text-center">
                        {currentStamps >= stampsNeeded ? (
                          <Badge className="bg-gradient-to-r from-green-500 to-green-700 text-white text-lg px-6 py-2">
                            🎉 مؤهل للحصول على قهوة مجانية!
                          </Badge>
                        ) : (
                          <p className="text-gray-400 text-sm">
                            متبقي {stampsNeeded - currentStamps} ختم للحصول على قهوة مجانية
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Visual Stamps */}
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: stampsNeeded }).map((_, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-lg flex items-center justify-center ${
                            index < currentStamps
                              ? "bg-gradient-to-br from-amber-500 to-amber-700"
                              : "bg-[#1a1410] border-2 border-amber-500/20"
                          }`}
                          data-testid={`stamp-${index + 1}`}
                        >
                          {index < currentStamps ? (
                            <Gift className="w-8 h-8 text-white" />
                          ) : (
                            <span className="text-gray-600 text-lg">{index + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Card Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-500/20">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-400" data-testid="text-free-earned">
                          {loyaltyCard.freeCupsEarned || 0}
                        </p>
                        <p className="text-gray-400 text-sm">قهوة مجانية مكتسبة</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-400" data-testid="text-free-redeemed">
                          {loyaltyCard.freeCupsRedeemed || 0}
                        </p>
                        <p className="text-gray-400 text-sm">قهوة مجانية مستردة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
