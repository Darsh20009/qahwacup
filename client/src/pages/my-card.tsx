import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Download, Coffee, Check, Gift, Sparkles, Star } from "lucide-react";
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
 dark: "#92400E",
 light: "#FFFBEB",
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
 const response = await apiRequest("POST", "/api/loyalty/redeem-code", {
 code,
 cardId: card.id,
 });
 return await response.json();
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
 title: "🎉 مبروك! قهو� مجاني� !",
 description: "لقد حصلت على 6 أ� تام! است� دم قهوتك المجاني� في طلبك القادم",
 duration: 5000,
 });
 } else if (updatedCard.stamps === 5) {
 toast({
 title: "🎉 تم فتح � صم 10%!",
 description: "� تم واحد فقط لقهو� مجاني� !",
 duration: 5000,
 });
 } else {
 toast({
 title: "✅ تم إضاف� ال� تم بنجاح!",
 description: `لديك الآن ${updatedCard.stamps} أ� تام من ${totalStamps}`,
 });
 }
 
 setRedeemCode("");
 queryClient.invalidateQueries({ queryKey: ["/api/loyalty/cards"] });
 },
 onError: (error: any) => {
 toast({
 title: "❌ � طأ في است� دام الكود",
 description: error.message || "الكود غير صالح أو مست� دم مسبقاً",
 variant: "destructive",
 });
 },
 });

 const handleRedeemCode = () => {
 if (!redeemCode.trim()) {
 toast({
 title: "� طأ",
 description: "الرجاء إد� ال الكود",
 variant: "destructive",
 });
 return;
 }
 redeemMutation.mutate(redeemCode.trim());
 };

 const createOrRetrieveCard = async () => {
 if (!customerName.trim() || !phoneNumber.trim()) {
 toast({
 title: "� طأ",
 description: "الرجاء إد� ال الاسم ورقم الهاتف",
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
 description: `مرحباً مجدداً ${existingCard.customerName}! لديك ${existingCard.stamps} � تم`,
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
 title: "تم إصدار البطاق� بنجاح! 🎉",
 description: "احفظ بطاقتك كصور� أو است� دم QR للوصول إليها",
 });
 }
 } catch (error) {
 console.error("Error creating/retrieving card:", error);
 toast({
 title: "� طأ",
 description: "حدث � طأ في إصدار أو استرجاع البطاق� ",
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
 link.download = `بطاق� -ولاء-قهو� -كوب-${card.customerName}.png`;
 link.href = canvas.toDataURL();
 link.click();

 toast({
 title: "تم تحميل البطاق� بنجاح! 📥",
 description: "تم حفظ البطاق� في جهازك",
 });
 } catch (error) {
 console.error("Error downloading card:", error);
 toast({
 title: "� طأ في التحميل",
 description: "حدث � طأ أثناء تحميل البطاق� ",
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
 <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 overflow-hidden relative" data-testid="page-my-card">
 {/* � لفي� فا� ر� مع عناصر متحرك� */}
 <div className="absolute inset-0 pointer-events-none">
 <div className="absolute top-20 left-20 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl animate-pulse"></div>
 <div className="absolute bottom-32 right-16 w-32 h-32 bg-orange-300/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
 <div className="absolute top-1/2 left-10 w-28 h-28 bg-amber-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
 <div className="absolute top-32 right-32 w-24 h-24 bg-orange-400/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '0.5s'}}></div>
 </div>

 {/* تأثير Confetti */}
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

 <div className="max-w-2xl mx-auto p-4 relative z-10">
 {/* شريط التنقل */}
 <motion.div 
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center justify-between mb-6"
 >
 <Button
 variant="ghost"
 onClick={() => setLocation("/menu")}
 className="text-amber-800 hover:text-amber-900 hover:bg-amber-100/50 backdrop-blur-sm"
 data-testid="button-back"
 >
 <ArrowRight className="ml-2 h-5 w-5" />
 العود� للقائم� 
 </Button>
 
 {hasCard && (
 <Button
 variant="ghost"
 onClick={resetCard}
 className="text-red-600 hover:text-red-700 hover:bg-red-50/50 backdrop-blur-sm"
 data-testid="button-reset"
 >
 إصدار بطاق� جديد� 
 </Button>
 )}
 </motion.div>

 {!hasCard ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5 }}
 >
 <Card className="p-8 bg-white/90 backdrop-blur-lg shadow-2xl border-2 border-amber-200/50" data-testid="card-form">
 <div className="text-center mb-6">
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: "spring", delay: 0.2 }}
 className="inline-block mb-4"
 >
 <div className="relative">
 <Coffee className="h-20 w-20 text-amber-600 mx-auto" />
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
 className="absolute -top-2 -right-2"
 >
 <Sparkles className="h-8 w-8 text-orange-500" />
 </motion.div>
 </div>
 </motion.div>
 
 <h2 className="text-3xl font-amiri font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-3">
 بطاق� الولاء الذهبي� 
 </h2>
 <p className="text-amber-700 font-cairo text-lg">
 أد� ل اسمك ورقم جوالك لإصدار بطاق� جديد� أو استرجاع بطاقتك الحالي� 
 </p>
 </div>

 <div className="space-y-5 mb-6">
 <div>
 <label className="block text-sm font-cairo font-semibold text-amber-900 mb-2">
 الاسم الكامل
 </label>
 <Input
 type="text"
 value={customerName}
 onChange={(e) => setCustomerName(e.target.value)}
 placeholder="أد� ل اسمك الكامل"
 className="text-right border-amber-300 focus:border-amber-500 bg-amber-50/50 focus:bg-white transition-all"
 data-testid="input-customer-name"
 />
 </div>

 <div>
 <label className="block text-sm font-cairo font-semibold text-amber-900 mb-2">
 رقم الجوال (9 أرقام تبدأ بـ 5)
 </label>
 <Input
 type="tel"
 value={phoneNumber}
 onChange={(e) => setPhoneNumber(e.target.value)}
 placeholder="5xxxxxxxx"
 className="text-right border-amber-300 focus:border-amber-500 bg-amber-50/50 focus:bg-white transition-all"
 data-testid="input-phone-number"
 />
 </div>

 <Button
 onClick={createOrRetrieveCard}
 disabled={isLoading}
 className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-cairo text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300"
 data-testid="button-create-card"
 >
 {isLoading ? "جاري البحث..." : "إصدار أو استرجاع البطاق� 🎉"}
 </Button>
 </div>

 <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-inner">
 <h3 className="font-cairo font-bold text-amber-900 mb-3 flex items-center justify-center gap-2 text-lg">
 <Star className="h-6 w-6 text-amber-600" />
 مميزات البطاق� الذهبي� 
 </h3>
 <ul className="space-y-3 text-amber-800 font-cairo">
 <li className="flex items-center gap-3 bg-white/60 p-3 rounded-lg">
 <Coffee className="h-5 w-5 text-amber-600 flex-shrink-0" />
 <span>احصل على � تم مع كل عملي� شراء</span>
 </li>
 <li className="flex items-center gap-3 bg-white/60 p-3 rounded-lg">
 <Sparkles className="h-5 w-5 text-orange-600 flex-shrink-0" />
 <span className="font-bold">6 أ� تام = قهو� مجاني� ! ☕</span>
 </li>
 <li className="flex items-center gap-3 bg-white/60 p-3 rounded-lg">
 <Gift className="h-5 w-5 text-amber-600 flex-shrink-0" />
 <span>� صم 10% عند 5 أ� تام</span>
 </li>
 </ul>
 </div>
 </Card>
 </motion.div>
 ) : (
 <div className="space-y-6">
 {/* بانر ال� صم 10% */}
 {filledStamps === 5 && (
 <motion.div
 initial={{ opacity: 0, y: -20, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ type: "spring", stiffness: 200 }}
 className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white p-5 rounded-2xl text-center font-cairo font-bold text-xl shadow-2xl"
 data-testid="banner-discount"
 >
 <motion.div
 animate={{ x: ["0%", "100%"] }}
 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
 />
 <span className="relative z-10">🎉 تم فتح � صم 10%! � تم واحد للقهو� المجاني� !</span>
 </motion.div>
 )}

 {/* بانر القهو� المجاني� */}
 {filledStamps === 6 && (
 <motion.div
 initial={{ opacity: 0, y: -20, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ type: "spring", stiffness: 200 }}
 className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white p-5 rounded-2xl text-center font-cairo font-bold text-xl shadow-2xl"
 data-testid="banner-free-coffee"
 >
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
 className="absolute top-2 left-2"
 >
 <Sparkles className="h-6 w-6" />
 </motion.div>
 <motion.div
 animate={{ rotate: -360 }}
 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
 className="absolute bottom-2 right-2"
 >
 <Star className="h-6 w-6" />
 </motion.div>
 <span className="relative z-10">🎁 قهو� مجاني� ! است� دمها في طلبك القادم</span>
 </motion.div>
 )}

 {/* قسم استرداد الكود */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 >
 <Card className="p-6 bg-white/90 backdrop-blur-lg shadow-xl border-2 border-amber-200/50" data-testid="card-redeem-section">
 <h3 className="text-2xl font-amiri font-bold text-amber-900 mb-4 text-center flex items-center justify-center gap-2">
 <Gift className="h-7 w-7 text-amber-600" />
 أضف � تم جديد 🎁
 </h3>
 <div className="flex gap-2">
 <Input
 type="text"
 value={redeemCode}
 onChange={(e) => setRedeemCode(e.target.value)}
 placeholder="أد� ل الكود هنا"
 className="text-right border-amber-300 focus:border-amber-500 bg-amber-50/50 focus:bg-white text-lg"
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
 className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-cairo whitespace-nowrap px-6 shadow-lg"
 data-testid="button-redeem-code"
 >
 {redeemMutation.isPending ? "⏳" : "است� دام"}
 </Button>
 </div>
 </Card>
 </motion.div>

 {/* البطاق� الرئيسي� */}
 <motion.div
 ref={cardRef}
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.2 }}
 className="relative"
 data-testid="loyalty-card-display"
 >
 <div className="bg-[#F5E6D3] rounded-3xl shadow-2xl overflow-hidden border-4 border-[#8B5A3C]/20 backdrop-blur-sm">
 {/* رأس البطاق� */}
 <div className="relative bg-[#F5E6D3] p-8 text-center overflow-hidden">
 {/* شعار فنجان القهو� */}
 <div className="flex justify-center mb-4">
 <img 
 src="/qahwa-cup-logo.png" 
 alt="قهو� كوب" 
 className="w-32 h-32 object-contain"
 />
 </div>
 
 <h1 className="text-4xl font-bold text-[#6B4423] mb-2 relative z-10" data-testid="text-card-header" style={{fontFamily: 'Cairo, sans-serif'}}>
 قهو� كوب
 </h1>
 <p className="text-2xl font-semibold text-[#6B4423] mb-3 relative z-10" style={{fontFamily: 'Arial, sans-serif'}}>
 QahwaCup
 </p>
 <p className="text-sm text-[#8B5A3C] relative z-10" style={{fontFamily: 'Cairo, sans-serif'}}>
 يوسف درويش - صاحب المشروع
 </p>
 <div className="text-xl font-bold text-[#6B4423] font-cairo mt-4 relative z-10" data-testid="text-card-number">
 {card?.cardNumber}
 </div>
 </div>

 {/* محتوى البطاق� */}
 <div className="p-6">
 {/* عداد الأ� تام */}
 <div className="text-center mb-6">
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: "spring", stiffness: 200 }}
 className="text-4xl font-bold text-[#6B4423]"
 data-testid="text-stamps-progress"
 style={{fontFamily: 'Cairo, sans-serif'}}
 >
 � تم {filledStamps}/{totalStamps}
 </motion.div>
 {availableFreeCups > 0 && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-lg font-cairo text-green-600 mt-2 flex items-center justify-center gap-2"
 data-testid="text-available-cups"
 >
 <Gift className="h-5 w-5" />
 <span className="font-bold">لديك {availableFreeCups} قهو� مجاني� متاح� !</span>
 </motion.div>
 )}
 </div>

 {/* شبك� الأ� تام */}
 <div className="grid grid-cols-3 gap-4 mb-6">
 {[...Array(totalStamps)].map((_, index) => {
 const isFilled = index < filledStamps;
 return (
 <motion.div
 key={index}
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: index * 0.1, type: "spring" }}
 className={`aspect-square rounded-2xl flex items-center justify-center relative transform transition-all duration-300 ${
 isFilled
 ? "bg-gradient-to-br from-[#A0522D] via-[#8B4513] to-[#6B4423] border-4 border-[#6B4423] shadow-2xl hover:scale-105"
 : "bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-dashed border-[#8B5A3C]/30 hover:border-[#8B5A3C]/50"
 }`}
 data-testid={`stamp-slot-${index}`}
 >
 <Coffee
 className={`h-12 w-12 ${
 isFilled ? "text-white drop-shadow-lg" : "text-gray-400"
 }`}
 />
 {isFilled && (
 <motion.div
 initial={{ scale: 0, rotate: -180 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ delay: 0.2, type: "spring" }}
 className="absolute -top-2 -right-2 bg-gradient-to-br from-green-400 to-green-600 rounded-full p-1.5 shadow-lg"
 >
 <Check className="h-5 w-5 text-white font-bold" />
 </motion.div>
 )}
 </motion.div>
 );
 })}
 </div>

 {/* معلومات العميل */}
 <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200/50">
 <div className="text-right">
 <div className="text-sm text-amber-700 font-cairo mb-1 font-semibold">الاسم</div>
 <div className="text-lg font-bold text-amber-900 font-cairo" data-testid="text-card-name">
 {card?.customerName}
 </div>
 </div>
 <div className="text-right">
 <div className="text-sm text-amber-700 font-cairo mb-1 font-semibold">رقم الجوال</div>
 <div className="text-lg font-bold text-amber-900 font-cairo" data-testid="text-phone-number">
 {card?.phoneNumber}
 </div>
 </div>
 </div>

 {/* كود QR */}
 {qrDataUrl && (
 <div className="flex flex-col items-center mt-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 shadow-inner">
 <motion.img
 initial={{ scale: 0, rotate: -180 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ type: "spring" }}
 src={qrDataUrl}
 alt="QR Code"
 className="w-40 h-40 border-4 border-amber-400 rounded-2xl shadow-lg"
 data-testid="img-qr-code"
 />
 <div className="text-center mt-3 text-sm text-amber-800 font-cairo font-semibold">
 اعرض هذا الكود للكاشير
 </div>
 </div>
 )}
 </div>
 </div>
 </motion.div>

 {/* زر التحميل */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 >
 <Button
 onClick={downloadCardImage}
 className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-cairo text-lg py-6 shadow-xl"
 data-testid="button-download"
 >
 <Download className="ml-2 h-6 w-6" />
 تحميل البطاق� كصور� 
 </Button>
 </motion.div>

 {/* التعليمات */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 >
 <Card className="p-5 bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-lg">
 <h3 className="font-cairo font-bold text-amber-900 mb-3 text-lg flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-amber-600" />
 كيف تست� دم بطاقتك:
 </h3>
 <ul className="space-y-2.5 text-sm text-amber-800 font-cairo">
 <li className="flex items-start gap-2 bg-white/60 p-2 rounded-lg">
 <span className="text-amber-600 font-bold flex-shrink-0">1.</span>
 <span>احصل على كود مع كل عملي� شراء من الكاشير</span>
 </li>
 <li className="flex items-start gap-2 bg-white/60 p-2 rounded-lg">
 <span className="text-amber-600 font-bold flex-shrink-0">2.</span>
 <span>أد� ل الكود في الحقل أعلاه للحصول على � تم</span>
 </li>
 <li className="flex items-start gap-2 bg-white/60 p-2 rounded-lg">
 <span className="text-orange-600 font-bold flex-shrink-0">3.</span>
 <span className="font-semibold">عند 5 أ� تام، احصل على � صم 10%</span>
 </li>
 <li className="flex items-start gap-2 bg-white/60 p-2 rounded-lg">
 <span className="text-green-600 font-bold flex-shrink-0">4.</span>
 <span className="font-bold">عند 6 أ� تام، احصل على قهو� مجاني� !</span>
 </li>
 <li className="flex items-start gap-2 bg-white/60 p-2 rounded-lg">
 <span className="text-amber-600 font-bold flex-shrink-0">5.</span>
 <span>اعرض QR للكاشير لاست� دام قهوتك المجاني� </span>
 </li>
 </ul>
 </Card>
 </motion.div>
 </div>
 )}
 </div>
 </div>
 );
}
