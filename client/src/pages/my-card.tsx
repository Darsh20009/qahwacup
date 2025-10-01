import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Download, Coffee, QrCode, Trophy, Gift } from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";

interface LoyaltyCard {
  customerName: string;
  phoneNumber: string;
  stamps: number; // 0-7
  freeRewards: number;
  cardId: string;
  createdAt: string;
}

export default function MyCard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [hasCard, setHasCard] = useState(false);
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // Form for creating/retrieving card
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      // Encode card data in QR
      const qrData = btoa(JSON.stringify(cardData));
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

    // Create unique card ID
    const cardId = `CUP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const newCard: LoyaltyCard = {
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      stamps: 0,
      freeRewards: 0,
      cardId,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem("qahwa-loyalty-card", JSON.stringify(newCard));
    setCard(newCard);
    setHasCard(true);
    await generateQRCode(newCard);

    // Send WhatsApp message
    const message = `🎉 *تم إصدار بطاقة ولاء جديدة*\n\n` +
      `👤 الاسم: ${newCard.customerName}\n` +
      `📱 الجوال: ${newCard.phoneNumber}\n` +
      `🎫 رقم البطاقة: ${newCard.cardId}\n\n` +
      `مبروك! احصل على ختم مع كل قهوة، وعند 7 أختام تحصل على قهوة مجانية! ☕`;
    
    const whatsappUrl = `https://wa.me/966532441566?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    toast({
      title: "تم إصدار البطاقة بنجاح! 🎉",
      description: "احفظ بطاقتك كصورة أو استخدم QR للوصول إليها",
    });

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

  // Calculate stamps for display
  const totalCups = 7;
  const filledCups = card?.stamps || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4" data-testid="page-my-card">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/menu")}
            className="text-amber-800 hover:text-amber-900"
            data-testid="button-back"
          >
            <ArrowRight className="ml-2 h-5 w-5" />
            العودة للقائمة
          </Button>
          
          {hasCard && (
            <Button
              variant="ghost"
              onClick={resetCard}
              className="text-red-600 hover:text-red-700"
              data-testid="button-reset"
            >
              إصدار بطاقة جديدة
            </Button>
          )}
        </div>

        <h1 className="text-3xl font-cairo font-bold text-amber-900 text-center mb-8" data-testid="text-title">
          بطاقتي - قهوة كوب
        </h1>

        {!hasCard ? (
          /* Create/Retrieve Card Form */
          <Card className="p-6 bg-white/90 backdrop-blur-sm" data-testid="card-form">
            <h2 className="text-xl font-cairo font-semibold text-amber-900 mb-4">
              إصدار أو استرجاع بطاقة الولاء
            </h2>
            <p className="text-amber-700 mb-6 font-cairo">
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
                  className="text-right"
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
                  className="text-right"
                  data-testid="input-phone-number"
                />
              </div>

              <Button
                onClick={createOrRetrieveCard}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-cairo"
                data-testid="button-create-card"
              >
                {isLoading ? "جاري الإصدار..." : "إصدار البطاقة 🎉"}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
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
                  <Trophy className="h-4 w-4 text-amber-600" />
                  7 أختام = قهوة مجانية! ☕
                </li>
                <li className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-amber-600" />
                  استخدم QR للوصول السريع لبطاقتك
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-amber-600" />
                  حمّل بطاقتك كصورة واحفظها في جهازك
                </li>
              </ul>
            </div>
          </Card>
        ) : (
          /* Display Loyalty Card */
          <div className="space-y-6">
            {/* Card Display */}
            <div ref={cardRef} className="relative" data-testid="loyalty-card-display">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with Logo */}
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 text-center border-b-2 border-amber-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-8 w-8 text-amber-800" />
                      <h2 className="text-2xl font-cairo font-bold text-amber-900">
                        قهوة كوب
                      </h2>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-amber-700 font-cairo">أختام</div>
                      <div className="text-3xl font-bold text-amber-900 font-cairo">
                        {filledCups}/{totalCups}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coffee Cups Display */}
                <div className="p-6 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
                  {/* Coffee beans background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-4 bg-amber-400 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative grid grid-cols-4 gap-4 mb-4">
                    {[...Array(totalCups)].map((_, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-center transition-all duration-300 ${
                          index < filledCups ? "scale-110" : "scale-100 opacity-50"
                        }`}
                      >
                        <div
                          className={`w-16 h-20 rounded-lg flex items-center justify-center ${
                            index < filledCups
                              ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg"
                              : "bg-gray-600"
                          }`}
                        >
                          <Coffee
                            className={`h-8 w-8 ${
                              index < filledCups ? "text-white" : "text-gray-400"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-right">
                      <div className="text-sm text-amber-700 font-cairo mb-1">الاسم</div>
                      <div className="text-xl font-bold text-amber-900 font-cairo" data-testid="text-card-name">
                        {card?.customerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-amber-700 font-cairo mb-1">قسائم مجانية</div>
                      <div className="text-xl font-bold text-green-600 font-cairo" data-testid="text-free-rewards">
                        {card?.freeRewards}
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {qrDataUrl && (
                    <div className="flex flex-col items-center mt-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-40 h-40 border-4 border-amber-300 rounded-lg"
                        data-testid="img-qr-code"
                      />
                      <div className="text-center mt-2 text-sm text-amber-800 font-cairo" data-testid="text-phone-number">
                        {card?.phoneNumber}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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

            {/* Info Card */}
            <Card className="p-4 bg-amber-50/80 backdrop-blur-sm">
              <h3 className="font-cairo font-semibold text-amber-900 mb-2">
                💡 نصائح للاستفادة من بطاقتك:
              </h3>
              <ul className="space-y-2 text-sm text-amber-800 font-cairo">
                <li>• حمّل البطاقة واحفظها في الصور في جهازك</li>
                <li>• اعرض البطاقة للكاشير عند كل عملية شراء للحصول على ختم</li>
                <li>• عند 7 أختام، احصل على قهوتك المفضلة مجاناً!</li>
                <li>• يمكنك مشاركة QR مع أصدقائك</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
