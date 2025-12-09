import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, User, Phone, UserX } from "lucide-react";
import { customerStorage } from "@/lib/customer-storage";
import { useToast } from "@/hooks/use-toast";

export default function CustomerLogin() {
 const [, setLocation] = useLocation();
 const { toast } = useToast();
 const [mode, setMode] = useState<'choice' | 'register' | 'guest'>('choice');
 const [name, setName] = useState("");
 const [phone, setPhone] = useState("");

 const handleRegister = () => {
 if (!name.trim() || !phone.trim()) {
 toast({
 title: "خطأ",
 description: "الرجاء إدخال الاسم ورقم الجوال",
 variant: "destructive"
 });
 return;
 }

 customerStorage.registerCustomer(name, phone);
 toast({
 title: "مرحباً بك!",
 description: `تم تسجيل الدخول بنجاح. تم إنشاء بطاقتك الخاصة`,
 });
 setLocation("/menu");
 };

 const handleGuestMode = () => {
 customerStorage.setGuestMode(true);
 toast({
 title: "وضع الضيف",
 description: "يمكنك الآن تصفح القائمةوإضافة طلبك",
 });
 setLocation("/menu");
 };

 if (mode === 'choice') {
 return (
 <div className="min-h-screen bg-gradient-to-b from-[#2d1810] via-[#3d2418] to-[#2d1810] flex flex-col items-center justify-center p-4" dir="rtl">
 <div className="text-center mb-8">
 <div className="flex items-center justify-center gap-2 mb-2">
 <Coffee className="w-12 h-12 text-amber-500" />
 <h1 className="text-4xl font-bold text-amber-50">قهوة كوب</h1>
 </div>
 <p className="text-amber-200/80 text-lg">لكل لحظة قهوة ، لحظة نجاح</p>
 </div>

 <div className="w-full max-w-md space-y-4">
 <Card className="bg-amber-900/20 border-amber-700/30 backdrop-blur">
 <CardHeader className="text-center">
 <CardTitle className="text-2xl text-amber-50">مرحباً بك</CardTitle>
 <CardDescription className="text-amber-200/70">
 اختر طريقة المتابعة 
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 <Button 
 onClick={() => setMode('register')}
 className="w-full h-16 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-lg"
 data-testid="button-login"
 >
 <User className="ml-2" />
 تسجيل دخول
 </Button>
 
 <Button 
 onClick={() => setMode('guest')}
 variant="outline"
 className="w-full h-16 border-amber-600/50 text-amber-100 hover:bg-amber-800/30 text-lg"
 data-testid="button-guest"
 >
 <UserX className="ml-2" />
 متابعة كضيف
 </Button>
 </CardContent>
 </Card>

 <div className="text-center">
 <p className="text-amber-300/60 text-sm">
 تسجيل الدخول يتيح لك: بطاقة ولاء • طوابع مجانية • متابعة طلباتك
 </p>
 </div>
 </div>
 </div>
 );
 }

 if (mode === 'register') {
 return (
 <div className="min-h-screen bg-gradient-to-b from-[#2d1810] via-[#3d2418] to-[#2d1810] flex flex-col items-center justify-center p-4" dir="rtl">
 <Card className="w-full max-w-md bg-amber-900/20 border-amber-700/30 backdrop-blur">
 <CardHeader className="text-center">
 <div className="flex items-center justify-center gap-2 mb-2">
 <Coffee className="w-8 h-8 text-amber-500" />
 <CardTitle className="text-2xl text-amber-50">تسجيل الدخول</CardTitle>
 </div>
 <CardDescription className="text-amber-200/70">
 أدخل بياناتك للحصول على بطاقة ولاء خاصة
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <Label htmlFor="name" className="text-amber-100">الاسم</Label>
 <Input
 id="name"
 type="text"
 placeholder="أدخل اسمك"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="bg-amber-950/30 border-amber-700/50 text-amber-50 placeholder:text-amber-300/50"
 data-testid="input-name"
 />
 </div>

 <div>
 <Label htmlFor="phone" className="text-amber-100">رقم الجوال (9 أرقام تبدأ بـ 5)</Label>
 <div className="relative">
 <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
 <Input
 id="phone"
 type="tel"
 placeholder="5xxxxxxxx"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 className="bg-amber-950/30 border-amber-700/50 text-amber-50 placeholder:text-amber-300/50 pr-10"
 data-testid="input-phone"
 />
 </div>
 </div>

 <div className="space-y-2 pt-2">
 <Button
 onClick={handleRegister}
 className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
 data-testid="button-submit"
 >
 تسجيل الدخول
 </Button>

 <Button
 onClick={() => setMode('choice')}
 variant="ghost"
 className="w-full text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
 data-testid="button-back"
 >
 رجوع
 </Button>
 </div>
 </CardContent>
 </Card>
 </div>
 );
 }

 // Guest mode confirmation
 return (
 <div className="min-h-screen bg-gradient-to-b from-[#2d1810] via-[#3d2418] to-[#2d1810] flex flex-col items-center justify-center p-4" dir="rtl">
 <Card className="w-full max-w-md bg-amber-900/20 border-amber-700/30 backdrop-blur">
 <CardHeader className="text-center">
 <CardTitle className="text-2xl text-amber-50">وضع الضيف</CardTitle>
 <CardDescription className="text-amber-200/70">
 في وضع الضيف، لن تحصل على بطاقة ولاء أو طوابع مجانية 
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 <Button
 onClick={handleGuestMode}
 className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
 data-testid="button-confirm-guest"
 >
 متابعة كضيف
 </Button>

 <Button
 onClick={() => setMode('choice')}
 variant="outline"
 className="w-full border-amber-600/50 text-amber-100 hover:bg-amber-800/30"
 data-testid="button-cancel-guest"
 >
 رجوع
 </Button>
 </CardContent>
 </Card>
 </div>
 );
}
