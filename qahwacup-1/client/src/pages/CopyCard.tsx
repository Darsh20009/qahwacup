import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useCustomer } from "@/contexts/CustomerContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Coffee, ShoppingBag, LogOut, User, Award, Download, CreditCard, Palette, Smartphone } from "lucide-react";
import CardCarousel from "@/components/CardCarousel";
import type { Order, LoyaltyCard } from "@shared/schema";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import JsBarcode from "jsbarcode";
import { apiRequest } from "@/lib/queryClient";
import { customerStorage, type CardDesignPreference } from "@/lib/customer-storage";

export default function CopyCard() {
  const [, navigate] = useLocation();
  const { customer, logout, isAuthenticated } = useCustomer();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const barcodeSvgRef = useRef<SVGSVGElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [cardDesign, setCardDesign] = useState<CardDesignPreference | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
    const savedDesign = customerStorage.getCardDesign();
    if (savedDesign) {
      setCardDesign(savedDesign);
    }
  }, [isAuthenticated, navigate]);

  const { data: allCards = [], refetch: refetchCards } = useQuery<LoyaltyCard[]>({
    queryKey: ["/api/loyalty/cards/phone", customer?.phone],
    queryFn: async () => {
      if (!customer?.phone) return [];
      try {
        const res = await fetch(`/api/loyalty/cards/phone/${customer.phone}`);
        if (!res.ok) {
          console.error("Failed to fetch loyalty card:", res.status);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [data];
      } catch (error) {
        console.error("Error fetching loyalty card:", error);
        return [];
      }
    },
    enabled: !!customer?.phone,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds to get updated stamp data
  });

  const [activeCard, setActiveCard] = useState<LoyaltyCard | null>(null);
  
  useEffect(() => {
    if (allCards.length > 0) {
      const active = allCards.find(c => c.isActive) || allCards[0];
      setActiveCard(active);
    }
  }, [allCards]);

  const loyaltyCard = activeCard || (allCards.length > 0 ? allCards[0] : null);

  const { data: orders = [], refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ["/api/customers", customer?.id, "orders"],
    enabled: !!customer?.id,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds to get updated order data
  });

  useEffect(() => {
    const barcodeValue = loyaltyCard?.cardNumber || loyaltyCard?.qrToken || customer?.phone;
    if (barcodeSvgRef.current && barcodeValue) {
      try {
        JsBarcode(barcodeSvgRef.current, barcodeValue, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 10,
          background: "#ffffff",
          lineColor: "#1a1410",
        });
      } catch (error) {
        console.error("Barcode generation error:", error);
      }
    }
  }, [loyaltyCard?.cardNumber, loyaltyCard?.qrToken, customer?.phone]);

  useEffect(() => {
    const qrValue = loyaltyCard?.qrToken || loyaltyCard?.cardNumber || customer?.phone;
    if (qrCanvasRef.current && qrValue) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        qrValue,
        {
          width: 140,
          margin: 1,
          color: {
            dark: "#1a1410",
            light: "#ffffff",
          },
          errorCorrectionLevel: 'H',
        },
        (error: any) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );

      QRCode.toDataURL(qrValue, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
      }).then((url: string) => {
        setQrDataUrl(url);
      }).catch(console.error);
    }
  }, [loyaltyCard?.qrToken, loyaltyCard?.cardNumber, customer?.phone]);

  const [showSecureInfo, setShowSecureInfo] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showReissueDialog, setShowReissueDialog] = useState(false);
  const [newCardPin, setNewCardPin] = useState("");
  const [selectedDesign, setSelectedDesign] = useState("classic");
  const [isReissuingCard, setIsReissuingCard] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelPhone, setCancelPhone] = useState("");
  const [cancelEmail, setCancelEmail] = useState("");
  const [cancelPassword, setCancelPassword] = useState("");
  const [isCancelingCard, setIsCancelingCard] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      setShowSecureInfo(false);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const verifyPassword = async () => {
    if (!password) return;
    setIsVerifying(true);
    try {
      const response = await apiRequest("POST", "/api/customers/verify-password", { password });
      if (response.ok) {
        setShowSecureInfo(true);
        setShowPasswordDialog(false);
        setTimeLeft(60);
      } else {
        alert("كلمة المرور غير صحيحة");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("حدث خطأ أثناء التحقق");
    } finally {
      setIsVerifying(false);
      setPassword("");
    }
  };

  if (!customer) return null;

  const totalOrders = orders.length;
  
  // حساب الأختام من جميع الطلبات (ما عدا الملغاة)
  // كل طلب = عدد المشروبات في الطلب × ختم واحد
  const stamps = orders
    .filter((order: any) => order.status !== 'cancelled')
    .reduce((total: number, order: any) => {
      const items = Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items) : []);
      const drinksCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      return total + drinksCount;
    }, 0);
  
  // Total stamps progress for display
  const stampsProgress = stamps; // عرض جميع الأختام وليس فقط الباقي من آخر 6
  
  // Calculate free cups earned from TOTAL stamps (from all orders), not just the remainder
  const freeCupsEarned = Math.floor(stampsProgress / 6);
  const freeCupsRedeemed = loyaltyCard?.freeCupsRedeemed || 0;
  const availableFreeDrinks = Math.max(0, freeCupsEarned - freeCupsRedeemed);
  const tier = loyaltyCard?.tier || 'bronze';
  const points = loyaltyCard?.points || customer.points || 0;

  const tierNames: Record<string, string> = {
    bronze: 'برونزي',
    silver: 'فضي',
    gold: 'ذهبي',
    platinum: 'بلاتيني'
  };

  // Calculate actual average price per drink from completed orders (including all non-cancelled orders)
  const completedOrders = orders.filter((order: any) => order.status !== 'cancelled');
  const totalSpentAmount = completedOrders.reduce((sum: number, order: any) => {
    return sum + (parseFloat(order.totalAmount?.toString() || '0'));
  }, 0);
  
  const totalDrinksCount = completedOrders.reduce((total: number, order: any) => {
    const items = Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items) : []);
    const drinksCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    return total + drinksCount;
  }, 0);

  // Calculate average price per drink, or use default if no completed orders
  const actualAveragePricePerDrink = totalDrinksCount > 0 ? Math.round((totalSpentAmount / totalDrinksCount) * 10) / 10 : 20;
  const savingsFromFreeDrinks = availableFreeDrinks * actualAveragePricePerDrink;
  const totalSavings = Math.round(savingsFromFreeDrinks * 100) / 100;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('CopyCard Debug:', {
      loyaltyCard: loyaltyCard ? { freeCupsEarned, freeCupsRedeemed, stamps: loyaltyCard.stamps } : 'null',
      availableFreeDrinks,
      totalDrinksCount,
      totalSpentAmount,
      actualAveragePricePerDrink,
      totalSavings
    });
  }

  const downloadCard = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 900;
    canvas.height = 1000;
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#d4a574');
    gradient.addColorStop(0.5, '#c8956c');
    gradient.addColorStop(1, '#a67c52');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.arc(-50, -50, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width + 50, canvas.height + 50, 250, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#4a3728';
    ctx.font = 'bold 48px Cairo, Arial';
    ctx.textAlign = 'right';
    ctx.fillText('قهوة كوب', canvas.width - 50, 70);
    ctx.font = '24px Georgia, serif';
    ctx.fillStyle = '#6b4f3c';
    ctx.fillText('QahwaCup Loyalty', canvas.width - 50, 105);
    
    const tierColor: Record<string, string> = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' };
    ctx.fillStyle = tierColor[tier] || tierColor.bronze;
    ctx.beginPath();
    ctx.roundRect(canvas.width - 150, 120, 100, 35, 17);
    ctx.fill();
    ctx.fillStyle = '#4a3728';
    ctx.font = 'bold 16px Cairo, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tierNames[tier] || 'برونزي', canvas.width - 100, 145);
    
    ctx.fillStyle = '#4a3728';
    ctx.font = 'bold 32px Cairo, Arial';
    ctx.textAlign = 'right';
    ctx.fillText(customer.name || 'عميل مميز', canvas.width - 50, 200);
    ctx.font = '20px Arial';
    ctx.fillStyle = '#6b4f3c';
    ctx.fillText(customer.phone, canvas.width - 50, 235);
    
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(50, 280, 800, 280, 15);
    ctx.fill();
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4a3728';
    ctx.font = 'bold 18px Cairo, Arial';
    ctx.fillText('الاختام', 400, 330);
    ctx.font = '24px Arial';
    ctx.fillText(stampsProgress + '/6', 400, 360);
    ctx.font = 'bold 18px Cairo, Arial';
    ctx.fillText('المشروبات المجانية', 600, 330);
    ctx.font = '24px Arial';
    ctx.fillText(String(availableFreeDrinks), 600, 360);
    ctx.font = 'bold 18px Cairo, Arial';
    ctx.fillText('النقاط', 800, 330);
    ctx.font = '24px Arial';
    ctx.fillText(String(points), 800, 360);
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(50, 600, 800, 320, 15);
    ctx.fill();
    
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4a3728';
    ctx.font = 'bold 20px Cairo, Arial';
    ctx.fillText('استخدم البطاقة', canvas.width / 2, 640);
    
    if (qrCanvasRef.current) {
      const qrImage = qrCanvasRef.current.toDataURL('image/png');
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, canvas.width / 2 - 70, 660, 140, 140);
        
        if (barcodeSvgRef.current) {
          const svgData = new XMLSerializer().serializeToString(barcodeSvgRef.current);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
          const svgUrl = URL.createObjectURL(svgBlob);
          const barcodeImg = new Image();
          barcodeImg.onload = () => {
            ctx.drawImage(barcodeImg, 50, 820, 800, 140);
            
            ctx.font = '14px Cairo, Arial';
            ctx.fillStyle = '#6b4f3c';
            ctx.fillText('اعرض الباركود أو QR كود على الكاشير للحصول على نقاطك', canvas.width / 2, 980);
            
            const link = document.createElement('a');
            link.download = 'qahwacup-loyalty-' + (customer?.phone || 'card') + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            URL.revokeObjectURL(svgUrl);
          };
          barcodeImg.src = svgUrl;
        }
      };
      qrImg.src = qrImage;
    }
  };

  return (
    <div 
      className="min-h-screen p-3 pb-24 md:p-6"
      style={{
        background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #1a1410 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/menu")}
          className="text-amber-100 hover:text-amber-50 hover:bg-amber-900/20 px-2 h-9"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 ml-1.5" />
          <span className="text-sm">القائمة</span>
        </Button>

        <h1 className="text-xl md:text-2xl font-bold text-amber-100 text-center flex-1">حسابك</h1>

        <div className="flex gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/card-customization")}
            className="text-amber-100 hover:text-amber-50 hover:bg-amber-900/20 px-2 h-9"
            data-testid="button-customize-card"
          >
            <Palette className="w-4 h-4 ml-1.5" />
            <span className="hidden sm:inline text-sm">تخصيص</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2 h-9"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 ml-1.5" />
            <span className="hidden sm:inline text-sm">خروج</span>
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-5 md:space-y-6">
        {/* Creative Luxury Card - Credit Card Style */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full aspect-[1.586/1] max-w-[340px] perspective group">
            <div className="relative w-full h-full rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500" 
              style={{
                background: cardDesign?.preview?.bg || `linear-gradient(135deg, #120e0b 0%, #2a1d15 50%, #120e0b 100%)`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 60px rgba(0,0,0,0.3)'
              }}>
              <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" 
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none z-10" />
              <div className="relative h-full p-4 md:p-5 flex flex-col justify-between text-white z-20">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg border border-white/20">
                        <Coffee className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base md:text-lg font-black tracking-tighter text-amber-50 leading-none">قهوة كوب</span>
                        <span className="text-[6px] md:text-[7px] uppercase tracking-[0.3em] text-amber-400/90 font-bold">LOYALTY PREMIUM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 md:gap-1.5">
                    <div className="w-8 h-6 md:w-10 md:h-7 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 rounded shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.3)] relative overflow-hidden border border-black/10">
                      <div className="absolute inset-0 opacity-40">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-black/40 mt-1.5" />
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-black/40 mt-3.5" />
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-black/40 mt-5.5" />
                        <div className="absolute top-0 left-0 w-[1px] h-full bg-black/40 ml-3" />
                        <div className="absolute top-0 left-0 w-[1px] h-full bg-black/40 ml-6.5" />
                      </div>
                    </div>
                    <Badge className={`text-[7px] md:text-[8px] px-1.5 py-0 border-none font-black tracking-widest uppercase shadow-sm h-4 ${
                      tier === 'platinum' ? 'bg-purple-600 text-white' :
                      tier === 'gold' ? 'bg-yellow-500 text-black' :
                      tier === 'silver' ? 'bg-gray-400 text-black' :
                      'bg-amber-800 text-white'
                    }`}>
                      {tierNames[tier]}
                    </Badge>
                  </div>
                </div>
                <div className="mt-1">
                  <div className="flex items-center gap-2 mb-0.5 opacity-30">
                    <span className="text-[5px] md:text-[6px] uppercase tracking-[0.4em] font-bold">MEMBER ID</span>
                    <div className="h-[0.5px] flex-1 bg-white/20" />
                  </div>
                  <p className="text-lg md:text-xl font-mono tracking-[0.2em] font-bold text-amber-50 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
                    {loyaltyCard?.cardNumber ? (
                      <>
                        <span>{loyaltyCard.cardNumber.substring(0, 4)}</span>
                        <span className="mx-1 opacity-20">••••</span>
                        <span className="mx-1 opacity-20">••••</span>
                        <span>{loyaltyCard.cardNumber.slice(-4)}</span>
                      </>
                    ) : (
                      <>
                        <span className="opacity-20">••••</span>
                        <span className="mx-1 opacity-20">••••</span>
                        <span className="mx-1 opacity-20">••••</span>
                        <span>{customer.phone?.slice(-4) || '0000'}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex-1">
                    <p className="text-[6px] md:text-[7px] text-white/40 uppercase tracking-[0.2em] font-bold mb-0.5">CARD MEMBER</p>
                    <p className="text-sm md:text-base font-bold tracking-widest uppercase text-white drop-shadow-sm leading-tight">
                      {customer.name || "VALUED CUSTOMER"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-right">
                    <div className="hidden sm:block">
                      <p className="text-[5px] md:text-[6px] text-white/40 uppercase tracking-[0.1em]">EXPIRY</p>
                      <p className="text-[8px] md:text-[10px] font-black text-amber-400">PERPETUAL</p>
                    </div>
                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 via-purple-400/30 to-blue-400/30 rounded-full animate-[pulse_3s_infinite] mix-blend-screen" />
                      <div className="absolute inset-0 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner">
                        <Coffee className="w-4 h-4 md:w-5 md:h-5 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Carousel */}
        {allCards.length > 0 && activeCard && (
          <CardCarousel 
            cards={allCards} 
            activeCard={activeCard}
            onSelectCard={(card) => {
              setActiveCard(card);
              if (card.id && customer?.id) {
                apiRequest("POST", `/api/loyalty/cards/${card.id}/activate`, { customerId: customer.id });
              }
            }}
          />
        )}

        {/* Card Controls */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6">
          <Button
            variant="outline"
            className="h-14 md:h-16 flex flex-col items-center justify-center gap-1 border-amber-600/20 bg-stone-900/40 text-amber-100 hover:bg-amber-900/30 active:scale-95 transition-transform"
            onClick={() => {
              if (timeLeft > 0) {
                setShowSecureInfo(true);
              } else {
                setShowPasswordDialog(true);
              }
            }}
            data-testid="button-show-card-info"
          >
            <User className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            <span className="text-[10px] md:text-xs font-bold">معلومات البطاقة</span>
          </Button>

          <Button
            variant="outline"
            className="h-14 md:h-16 flex flex-col items-center justify-center gap-1 border-amber-600/20 bg-stone-900/40 text-amber-100 hover:bg-amber-900/30 active:scale-95 transition-transform"
            onClick={() => navigate("/reset-password")}
            data-testid="button-change-password"
          >
            <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            <span className="text-[10px] md:text-xs font-bold">تغيير كلمة المرور</span>
          </Button>

          <Button
            variant="outline"
            className="h-14 md:h-16 flex flex-col items-center justify-center gap-1 border-red-600/20 bg-red-950/10 text-red-200 hover:bg-red-900/20 active:scale-95 transition-transform disabled:opacity-50"
            disabled={!loyaltyCard}
            onClick={() => {
              if (loyaltyCard && loyaltyCard.reissuanceCount < 2) {
                alert("لا يمكنك إلغاء البطاقة إلا إذا كان لديك فرصة لإنشاء بطاقة جديدة");
              } else {
                setShowCancelDialog(true);
                setCancelPhone(customer?.phone || "");
              }
            }}
            data-testid="button-cancel-card"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
            <span className="text-[10px] md:text-xs font-bold text-red-400">إلغاء البطاقة</span>
          </Button>

          <Button
            variant="outline"
            className="h-14 md:h-16 flex flex-col items-center justify-center gap-1 border-green-600/20 bg-green-950/10 text-green-200 hover:bg-green-900/20 active:scale-95 transition-transform"
            onClick={() => {
              if (loyaltyCard && loyaltyCard.reissuanceCount >= 2) {
                alert("لقد وصلت إلى الحد الأقصى لإصدار بطاقة جديدة (مرتين فقط)");
              } else {
                setShowReissueDialog(true);
              }
            }}
            data-testid="button-issue-new-card"
          >
            <Award className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            <span className="text-[10px] md:text-xs font-bold text-green-400">إصدار بطاقة جديدة</span>
          </Button>
        </div>

        {/* Cancel Card Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="w-[90%] max-w-[425px] bg-stone-950 border-red-500/30 text-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-black text-red-400">إلغاء البطاقة</DialogTitle>
              <DialogDescription className="text-white/60 text-sm">
                أدخل بيانات حسابك للتحقق من الهوية قبل إلغاء البطاقة
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <div className="grid gap-2">
                <Label htmlFor="cancel-phone" className="text-white/70 text-sm">رقم الهاتف</Label>
                <Input
                  id="cancel-phone"
                  type="tel"
                  value={cancelPhone}
                  onChange={(e) => setCancelPhone(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-red-500 h-11"
                  placeholder="رقم الهاتف"
                  data-testid="input-cancel-phone"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cancel-email" className="text-white/70 text-sm">البريد الإلكتروني</Label>
                <Input
                  id="cancel-email"
                  type="email"
                  value={cancelEmail}
                  onChange={(e) => setCancelEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-red-500 h-11"
                  placeholder="البريد الإلكتروني"
                  data-testid="input-cancel-email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cancel-password" className="text-white/70 text-sm">كلمة المرور</Label>
                <Input
                  id="cancel-password"
                  type="password"
                  value={cancelPassword}
                  onChange={(e) => setCancelPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-red-500 h-11"
                  placeholder="••••••••"
                  data-testid="input-cancel-password"
                />
              </div>
            </div>
            <DialogFooter className="flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelPhone("");
                  setCancelEmail("");
                  setCancelPassword("");
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                disabled={isCancelingCard || !cancelPhone || !cancelEmail || !cancelPassword}
                onClick={async () => {
                  const cardId = loyaltyCard?.id || (loyaltyCard as any)?._id;
                  if (!cardId) {
                    alert("لا توجد بطاقة لإلغائها");
                    return;
                  }
                  setIsCancelingCard(true);
                  try {
                    const response = await apiRequest("POST", `/api/loyalty/cards/${cardId}/cancel`, {
                      phone: cancelPhone,
                      email: cancelEmail,
                      password: cancelPassword
                    });
                    if (response.ok) {
                      alert("تم إلغاء البطاقة بنجاح!");
                      setShowCancelDialog(false);
                      setCancelPhone("");
                      setCancelEmail("");
                      setCancelPassword("");
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error("Error canceling card:", error);
                    alert("فشل في إلغاء البطاقة. تأكد من صحة البيانات");
                  } finally {
                    setIsCancelingCard(false);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isCancelingCard ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reissue Card Dialog */}
        <Dialog open={showReissueDialog} onOpenChange={setShowReissueDialog}>
          <DialogContent className="w-[90%] max-w-[425px] bg-stone-950 border-amber-500/30 text-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-black text-amber-50">إصدار بطاقة جديدة</DialogTitle>
              <DialogDescription className="text-white/60 text-sm">
                اختر تصميماً جديداً وحدد رمز PIN للبطاقة الجديدة (متبقي: {loyaltyCard?.reissuanceCount ? 2 - loyaltyCard.reissuanceCount : 2}/2)
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <div className="grid gap-2">
                <Label className="text-white/70 text-sm">اختر التصميم</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'classic', label: 'كلاسيكي', color: 'bg-amber-700' },
                    { id: 'modern', label: 'عصري', color: 'bg-blue-700' },
                    { id: 'dark', label: 'داكن', color: 'bg-slate-800' },
                    { id: 'gold', label: 'ذهبي', color: 'bg-yellow-600' }
                  ].map((design) => (
                    <button
                      key={design.id}
                      onClick={() => setSelectedDesign(design.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedDesign === design.id
                          ? 'border-amber-500 ring-2 ring-amber-400'
                          : 'border-white/20'
                      } ${design.color}`}
                    >
                      <span className="text-sm font-bold text-white">{design.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-pin" className="text-white/70 text-sm">رمز PIN الجديد</Label>
                <Input
                  id="new-pin"
                  type="password"
                  value={newCardPin}
                  onChange={(e) => setNewCardPin(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-amber-500 h-11"
                  placeholder="أدخل رمز PIN (4 أرقام على الأقل)"
                  data-testid="input-new-card-pin"
                />
              </div>
            </div>
            <DialogFooter className="flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReissueDialog(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                disabled={isReissuingCard || newCardPin.length < 4}
                onClick={async () => {
                  setIsReissuingCard(true);
                  try {
                    const cardId = loyaltyCard?.id || (loyaltyCard as any)?._id;
                    if (cardId) {
                      await apiRequest("POST", `/api/loyalty/cards/${cardId}/reissue`, {
                        newPin: newCardPin,
                        cardDesign: selectedDesign
                      });
                    } else {
                      await apiRequest("POST", "/api/loyalty/cards", {
                        customerName: customer.name || "عميل",
                        phoneNumber: customer.phone,
                        cardPin: newCardPin,
                        cardDesign: selectedDesign
                      });
                    }
                    alert(loyaltyCard ? "تم إصدار بطاقة جديدة بنجاح!" : "تم إنشاء بطاقة ولاء جديدة بنجاح!");
                    setShowReissueDialog(false);
                    setNewCardPin("");
                    setSelectedDesign("classic");
                    window.location.reload();
                  } catch (error) {
                    console.error("Error issuing card:", error);
                    alert("فشل في إصدار البطاقة");
                  } finally {
                    setIsReissuingCard(false);
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isReissuingCard ? "جاري الإصدار..." : (loyaltyCard ? "إعادة إصدار" : "إصدار الآن")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Verification Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="w-[90%] max-w-[425px] bg-stone-950 border-amber-500/30 text-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-black text-amber-50">تحقق من الهوية</DialogTitle>
              <DialogDescription className="text-white/60 text-sm">
                الرجاء إدخال كلمة مرور حسابك لعرض بيانات البطاقة الحساسة.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <div className="grid gap-2">
                <Label htmlFor="password" title="كلمة المرور" className="text-white/70 text-sm">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-amber-500 h-11"
                  placeholder="••••••••"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                />
              </div>
            </div>
            <DialogFooter className="flex-row gap-2">
              <Button
                disabled={isVerifying || !password}
                onClick={verifyPassword}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black h-11"
              >
                {isVerifying ? "جاري التحقق..." : "تأكيد"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Secure Info Modal */}
        {showSecureInfo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-sm bg-stone-950 border-amber-500/30 text-white overflow-hidden shadow-2xl ring-1 ring-white/10 rounded-2xl">
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-black tracking-tight text-amber-50">بيانات البطاقة</h3>
                  </div>
                  <Badge variant="outline" className="text-amber-400 border-amber-400 animate-pulse">
                    {timeLeft} ثانية
                  </Badge>
                </div>
                <div className="space-y-4 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Card Number</p>
                    <p className="text-xl font-mono tracking-wider text-amber-100 font-bold select-all">
                      {loyaltyCard?.cardNumber ? (
                        loyaltyCard.cardNumber.replace(/(.{4})/g, '$1 ').trim()
                      ) : "جاري التحميل..."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Tier</p>
                      <p className="text-sm font-black text-amber-400 uppercase">{tierNames[tier]}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Points</p>
                      <p className="text-sm font-black text-yellow-400">{points}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black h-11 shadow-lg shadow-amber-900/20"
                  onClick={() => setShowSecureInfo(false)}
                >
                  إغلاق آمن
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Stats Section */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30 rounded-2xl p-3 md:p-4 text-center border border-amber-200/50 dark:border-amber-700/50">
              <p className="text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-300 mb-0.5">{stampsProgress}</p>
              <p className="text-[10px] md:text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider">اختام</p>
              <p className="text-[9px] md:text-[10px] text-amber-600 dark:text-amber-500 opacity-60">إجمالي</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 rounded-2xl p-3 md:p-4 text-center border border-green-200/50 dark:border-green-700/50">
              <p className="text-xl md:text-2xl font-bold text-green-900 dark:text-green-300 mb-0.5">{availableFreeDrinks}</p>
              <p className="text-[10px] md:text-xs text-green-700 dark:text-green-400 font-semibold uppercase tracking-wider">مجاني</p>
              <p className="text-[9px] md:text-[10px] text-green-600 dark:text-green-500 opacity-60">مشروب</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/30 rounded-2xl p-3 md:p-4 text-center border border-yellow-200/50 dark:border-yellow-700/50">
              <p className="text-xl md:text-2xl font-bold text-yellow-900 dark:text-yellow-300 mb-0.5">{points}</p>
              <p className="text-[10px] md:text-xs text-yellow-700 dark:text-yellow-400 font-semibold uppercase tracking-wider">نقاط</p>
              <p className="text-[9px] md:text-[10px] text-yellow-600 dark:text-yellow-500 opacity-60">رصيد</p>
            </div>
          </div>

          {/* Total Savings Card */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/30 rounded-2xl p-4 md:p-5 text-center border border-rose-200/50 dark:border-rose-700/50">
            <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold uppercase tracking-wider mb-1">إجمالي التوفير</p>
            <p className="text-2xl md:text-3xl font-bold text-rose-900 dark:text-rose-300">{totalSavings.toLocaleString('ar-SA')} <span className="text-sm">ر.س</span></p>
            <p className="text-[9px] md:text-[10px] text-rose-600 dark:text-rose-500 opacity-60 mt-1">من المشروبات المجانية</p>
          </div>
        </div>

        {/* Stamp Progress */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-amber-200/10">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-bold text-amber-100 tracking-wide">تقدم الاختام (من 6 لمشروب مجاني)</p>
            <Badge variant="outline" className="text-[10px] font-black border-amber-500/30 text-amber-400">
              {stampsProgress % 6 || (stampsProgress > 0 ? 6 : 0)}/6
            </Badge>
          </div>
          <div className="flex gap-1.5 md:gap-2">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className={`h-2 md:h-2.5 flex-1 rounded-full transition-all duration-700 ${
                  i < (stampsProgress % 6 || (stampsProgress > 0 ? 6 : 0))
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(251,191,36,0.4)]' 
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          {stampsProgress >= 6 && (
            <p className="text-xs text-amber-300 mt-3 text-center">
              أكملت {Math.floor(stampsProgress / 6)} مشروب مجاني و {stampsProgress % 6} ختم إضافي
            </p>
          )}
        </div>

        {/* QR & Barcode Section */}
        <div className="bg-white dark:bg-stone-900/40 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-amber-200/10 text-center">
          <h3 className="font-bold text-amber-100 mb-5 text-sm md:text-base">استخدم البطاقة</h3>
          <div className="flex flex-col items-center gap-5">
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-xl ring-4 ring-amber-500/10">
              <canvas ref={qrCanvasRef} className="rounded-lg w-32 h-32 md:w-36 md:h-36" data-testid="qr-code" />
            </div>
            <div className="w-full bg-white p-3 rounded-xl flex justify-center overflow-hidden shadow-lg ring-1 ring-black/5">
              <svg ref={barcodeSvgRef} className="h-12 md:h-14 w-full" data-testid="barcode" />
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-amber-300/60 mt-5 font-medium leading-relaxed">
            اعرض الباركود أو QR كود على الكاشير لجمع النقاط والاختام
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={downloadCard}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black h-12 md:h-13 rounded-xl shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-all text-sm md:text-base"
            data-testid="button-download-card"
          >
            <Download className="w-4 h-4 ml-2" />
            تحميل البطاقة الرقمية
          </Button>
        </div>

        {/* Recent Orders */}
        {totalOrders > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-bold text-amber-100">طلباتك الأخيرة</h3>
              <Badge variant="secondary" className="bg-amber-950/40 text-amber-400 border-amber-700/20 px-2.5">{totalOrders} طلب</Badge>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
              {orders.slice(0, 5).map((order, index) => (
                <Card 
                  key={order.id || index}
                  className="bg-stone-900/30 border border-white/5 rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => navigate("/my-orders")}
                >
                  <div className="p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-amber-100">الطلب #{order.orderNumber || index + 1}</p>
                      <Badge variant="outline" className="text-[9px] font-black h-5">
                        {order.status === 'completed' ? 'مكتمل' : order.status === 'cancelled' ? 'ملغى' : 'قيد التنفيذ'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-300/70">{Array.isArray(order.items) ? order.items.length : 0} أصناف</span>
                      <span className="text-amber-400 font-black">{order.totalAmount || 0} ر.س</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button onClick={() => navigate("/my-orders")} className="w-full h-11 bg-white/5 text-amber-100 font-bold rounded-xl text-sm">
              <ShoppingBag className="w-4 h-4 ml-2" />عرض جميع الطلبات
            </Button>
          </div>
        )}

        <Button onClick={() => navigate("/menu")} variant="outline" className="w-full h-12 md:h-13 border-amber-500/20 bg-amber-500/5 text-amber-400 font-bold rounded-xl text-sm md:text-base mt-4 mb-8">
          <Coffee className="w-4 h-4 ml-2" />تصفح القائمة والطلب الآن
        </Button>
      </div>
    </div>
  );
}
