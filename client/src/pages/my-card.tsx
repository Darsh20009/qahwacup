import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Download, Coffee, Check, Gift, Sparkles } from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

interface LoyaltyCard {
  id: string;
  customerName: string;
  phoneNumber: string;
  stamps: number;
  freeCupsEarned: number;
  freeCupsRedeemed: number;
  cardNumber: string;
  qrToken: string;
  createdAt: string;
}

export default function MyCard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [hasCard, setHasCard] = useState(false);
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const totalStamps = 6;

  useEffect(() => {
    // Check if card exists in localStorage
    const savedCard = localStorage.getItem("qahwa-loyalty-card");
    if (savedCard) {
      try {
        const cardData = JSON.parse(savedCard);
        setCard(cardData);
        setHasCard(true);
        generateQRCode(cardData);
      } catch (error) {
        console.error("Error loading card:", error);
      }
    }
  }, []);

  const generateQRCode = async (cardData: LoyaltyCard) => {
    try {
      const qrData = cardData.qrToken || btoa(JSON.stringify(cardData));
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(qrUrl);
    } catch (error) {
      console.error("Error generating QR:", error);
    }
  };

  const redeemMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!card) throw new Error("No card found");
      return await apiRequest("POST", "/api/loyalty/redeem-code", {
        code,
        cardId: card.id,
      });
    },
    onSuccess: (data: any) => {
      const updatedCard = data.card;
      setCard(updatedCard);
      localStorage.setItem("qahwa-loyalty-card", JSON.stringify(updatedCard));
      generateQRCode(updatedCard);
      
      if (updatedCard.stamps === 6) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast({
          title: "🎉 مبروك! قهوة مجانية!",
          description: "لقد حصلت على 6 أختام! استخدم قهوتك المجانية في طلبك القادم",
          duration: 5000,
        });
      } else if (updatedCard.stamps === 5) {
        toast({
          title: "🎉 تم فتح خصم 10%!",
          description: "ختم واحد فقط لقهوة مجانية!",
          duration: 5000,
        });
      } else {
        toast({
          title: "✅ تم إضافة الختم بنجاح!",
          description: `لديك الآن ${updatedCard.stamps} أختام من ${totalStamps}`,
        });
      }
      
      setRedeemCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/cards"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في استخدام الكود",
        description: error.message || "الكود غير صالح أو مستخدم مسبقاً",
        variant: "destructive",
      });
    },
  });

  const handleRedeemCode = () => {
    if (!redeemCode.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الكود",
        variant: "destructive",
      });
      return;
    }
    redeemMutation.mutate(redeemCode.trim());
  };

  const createOrRetrieveCard = async () => {
    if (!customerName.trim() || !phoneNumber.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الاسم ورقم الهاتف",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/loyalty/cards/phone/${phoneNumber.trim()}`);
      
      if (response.ok) {
        const existingCard = await response.json();
        localStorage.setItem("qahwa-loyalty-card", JSON.stringify(existingCard));
        setCard(existingCard);
        setHasCard(true);
        await generateQRCode(existingCard);
        
        toast({
          title: "تم استرجاع بطاقتك! 🎉",
          description: `مرحباً مجدداً ${existingCard.customerName}! لديك ${existingCard.stamps} ختم`,
        });
      } else {
        const newCardResponse = await fetch("/api/loyalty/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: customerName.trim(),
            phoneNumber: phoneNumber.trim(),
          }),
        });

        if (!newCardResponse.ok) {
          throw new Error("Failed to create card");
        }

        const newCard = await newCardResponse.json();
        localStorage.setItem("qahwa-loyalty-card", JSON.stringify(newCard));
        setCard(newCard);
        setHasCard(true);
        await generateQRCode(newCard);

        toast({
          title: "تم إصدار البطاقة بنجاح! 🎉",
          description: "احفظ بطاقتك كصورة أو استخدم QR للوصول إليها",
        });
      }
    } catch (error) {
      console.error("Error creating/retrieving card:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إصدار أو استرجاع البطاقة",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const downloadCardImage = async () => {
    if (!cardRef.current || !card) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#FFFFFF",
        scale: 2,
      });
      
      const link = document.createElement("a");
      link.download = `بطاقة-ولاء-قهوة-كوب-${card.customerName}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "تم تحميل البطاقة بنجاح! 📥",
        description: "تم حفظ البطاقة في جهازك",
      });
    } catch (error) {
      console.error("Error downloading card:", error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل البطاقة",
        variant: "destructive",
      });
    }
  };

  const resetCard = () => {
    localStorage.removeItem("qahwa-loyalty-card");
    setCard(null);
    setHasCard(false);
    setCustomerName("");
    setPhoneNumber("");
    setQrDataUrl("");
  };

  const filledStamps = card?.stamps || 0;
  const availableFreeCups = (card?.freeCupsEarned || 0) - (card?.freeCupsRedeemed || 0);

  return (
    <div className="min-h-screen bg-[#F5EFE7] p-4" data-testid="page-my-card">
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 0 
                }}
                animate={{
                  x: (Math.random() - 0.5) * 1000,
                  y: Math.random() * 1000,
                  opacity: 0,
                  scale: 1,
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut",
                  delay: Math.random() * 0.3
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#D4AF37', '#F59E0B', '#EAB308', '#FCD34D'][Math.floor(Math.random() * 4)]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/menu")}
            className="text-amber-800 hover:text-amber-900 hover:bg-amber-100"
            data-testid="button-back"
          >
            <ArrowRight className="ml-2 h-5 w-5" />
            العودة للقائمة
          </Button>
          
          {hasCard && (
            <Button
              variant="ghost"
              onClick={resetCard}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="button-reset"
            >
              إصدار بطاقة جديدة
            </Button>
          )}
        </div>

        {!hasCard ? (
          <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg" data-testid="card-form">
            <h2 className="text-2xl font-amiri font-bold text-amber-900 mb-4 text-center">
              إصدار أو استرجاع بطاقة الولاء
            </h2>
            <p className="text-amber-700 mb-6 font-cairo text-center">
              أدخل اسمك ورقم جوالك لإصدار بطاقة جديدة أو استرجاع بطاقتك الحالية
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-cairo text-amber-900 mb-2">
                  الاسم الكامل
                </label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="text-right border-amber-300 focus:border-amber-500"
                  data-testid="input-customer-name"
                />
              </div>

              <div>
                <label className="block text-sm font-cairo text-amber-900 mb-2">
                  رقم الجوال
                </label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="text-right border-amber-300 focus:border-amber-500"
                  data-testid="input-phone-number"
                />
              </div>

              <Button
                onClick={createOrRetrieveCard}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-cairo"
                data-testid="button-create-card"
              >
                {isLoading ? "جاري البحث..." : "إصدار أو استرجاع البطاقة 🎉"}
              </Button>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-cairo font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  مميزات البطاقة:
                </h3>
                <ul className="space-y-2 text-sm text-amber-800 font-cairo">
                  <li className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-amber-600" />
                    احصل على ختم مع كل عملية شراء
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    6 أختام = قهوة مجانية! ☕
                  </li>
                  <li className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-amber-600" />
                    خصم 10% عند 5 أختام
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {filledStamps === 5 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-lg text-center font-cairo font-bold text-lg shadow-lg"
                data-testid="banner-discount"
              >
                🎉 تم فتح خصم 10%!
              </motion.div>
            )}

            {filledStamps === 6 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg text-center font-cairo font-bold text-lg shadow-lg"
                data-testid="banner-free-coffee"
              >
                🎁 قهوة مجانية! استخدمها في طلبك القادم
              </motion.div>
            )}

            <Card className="p-6 bg-white shadow-lg" data-testid="card-redeem-section">
              <h3 className="text-xl font-amiri font-bold text-amber-900 mb-4 text-center flex items-center justify-center gap-2">
                <Gift className="h-6 w-6 text-amber-600" />
                أضف ختم جديد 🎁
              </h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                  placeholder="أدخل الكود هنا"
                  className="text-right border-amber-300 focus:border-amber-500"
                  data-testid="input-redeem-code"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRedeemCode();
                    }
                  }}
                />
                <Button
                  onClick={handleRedeemCode}
                  disabled={redeemMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-cairo whitespace-nowrap"
                  data-testid="button-redeem-code"
                >
                  {redeemMutation.isPending ? "جاري التحقق..." : "استخدام الكود"}
                </Button>
              </div>
            </Card>

            <div ref={cardRef} className="relative" data-testid="loyalty-card-display">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-200">
                <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 p-6 text-center border-b-2 border-amber-300">
                  <h1 className="text-4xl font-amiri font-bold text-amber-900 mb-2" data-testid="text-card-header">
                    بطاقتي ☕ قهوة كوب
                  </h1>
                  <div className="text-2xl font-bold text-amber-800 font-cairo" data-testid="text-card-number">
                    {card?.cardNumber}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-b from-[#F5EFE7] to-white">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-amiri font-bold text-amber-900" data-testid="text-stamps-progress">
                      ختم {filledStamps}/{totalStamps}
                    </div>
                    {availableFreeCups > 0 && (
                      <div className="text-lg font-cairo text-green-600 mt-2 flex items-center justify-center gap-2" data-testid="text-available-cups">
                        <Gift className="h-5 w-5" />
                        لديك {availableFreeCups} قهوة مجانية متاحة!
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[...Array(totalStamps)].map((_, index) => {
                      const isFilled = index < filledStamps;
                      return (
                        <motion.div
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`aspect-square rounded-xl flex items-center justify-center relative ${
                            isFilled
                              ? "bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-amber-600 shadow-lg"
                              : "bg-gray-100 border-2 border-dashed border-gray-300"
                          }`}
                          data-testid={`stamp-slot-${index}`}
                        >
                          <Coffee
                            className={`h-12 w-12 ${
                              isFilled ? "text-white" : "text-gray-400"
                            }`}
                          />
                          {isFilled && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                            >
                              <Check className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-right">
                      <div className="text-sm text-amber-700 font-cairo mb-1">الاسم</div>
                      <div className="text-lg font-bold text-amber-900 font-cairo" data-testid="text-card-name">
                        {card?.customerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-amber-700 font-cairo mb-1">رقم الجوال</div>
                      <div className="text-lg font-bold text-amber-900 font-cairo" data-testid="text-phone-number">
                        {card?.phoneNumber}
                      </div>
                    </div>
                  </div>

                  {qrDataUrl && (
                    <div className="flex flex-col items-center mt-4 p-4 bg-gray-50 rounded-lg border border-amber-200">
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-40 h-40 border-4 border-amber-300 rounded-lg"
                        data-testid="img-qr-code"
                      />
                      <div className="text-center mt-2 text-sm text-amber-800 font-cairo">
                        اعرض هذا الكود للكاشير
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={downloadCardImage}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-cairo"
                data-testid="button-download"
              >
                <Download className="ml-2 h-5 w-5" />
                تحميل البطاقة كصورة
              </Button>
            </div>

            <Card className="p-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200">
              <h3 className="font-cairo font-semibold text-amber-900 mb-2">
                💡 كيف تستخدم بطاقتك:
              </h3>
              <ul className="space-y-2 text-sm text-amber-800 font-cairo">
                <li>• احصل على كود مع كل عملية شراء من الكاشير</li>
                <li>• أدخل الكود في الحقل أعلاه للحصول على ختم</li>
                <li>• عند 5 أختام، احصل على خصم 10%</li>
                <li>• عند 6 أختام، احصل على قهوة مجانية!</li>
                <li>• اعرض QR للكاشير لاستخدام قهوتك المجانية</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
