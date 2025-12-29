import { useState } from "react";
import { useLocation } from "wouter";
import { useCustomer } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneInput } from "@/components/phone-input";
import { SmartIdentifierInput } from "@/components/smart-identifier-input";
import { Coffee, Phone, User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerAuth() {
 const [, navigate] = useLocation();
 const { setCustomer } = useCustomer();
 const { toast } = useToast();
 const [identifier, setIdentifier] = useState("");
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [mode, setMode] = useState<"login" | "register">("login");

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 
 const cleanIdentifier = identifier.replace(/\s/g, '').trim();
 
 if (!cleanIdentifier) {
 toast({
 title: "خطأ",
 description: "يرجى إدخال رقم الجوال أو البريد الإلكتروني",
 variant: "destructive"
 });
 return;
 }

 if (!password || password.length < 4) {
 toast({
 title: "خطأ",
 description: "كلمة المرور يجب أن تكون على الأقل 4 أحرف",
 variant: "destructive"
 });
 return;
 }

 setLoading(true);

 try {
 const res = await apiRequest("POST", "/api/customers/login", {
 identifier: cleanIdentifier,
 password
 });
 
 const customer = await res.json();
 setCustomer(customer);
 
 toast({
 title: "مرحباً بك!",
 description: `أهلاً ${customer.name}، تم تسجيل دخولك بنجاح`,
 });

 navigate("/");
 } catch (error: any) {
 console.error("Login error:", error);
 toast({
 title: "خطأ",
 description: error.message || "رقم الهاتف/البريد الإلكتروني أو كلمة المرور غير صحيحة ",
 variant: "destructive"
 });
 } finally {
 setLoading(false);
 }
 };

 const handleRegister = async (e: React.FormEvent) => {
 e.preventDefault();
 
 const cleanPhone = identifier.replace(/\s/g, '').trim();
 
 if (!cleanPhone || cleanPhone.length !== 9) {
 toast({
 title: "خطأ",
 description: "يرجى إدخال رقم جوال مكون من 9 أرقام",
 variant: "destructive"
 });
 return;
 }

 if (!cleanPhone.startsWith('5')) {
 toast({
 title: "خطأ",
 description: "رقم الجوال يجب أن يبدأ بالرقم 5",
 variant: "destructive"
 });
 return;
 }

 if (!name || name.trim().length < 2) {
 toast({
 title: "خطأ",
 description: "الاسم يجب أن يكون على الأقل حرفين",
 variant: "destructive"
 });
 return;
 }

 if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
 toast({
 title: "خطأ",
 description: "البريد الإلكتروني مطلوب وصيغته غير صحيحة",
 variant: "destructive"
 });
 return;
 }

 if (!password || password.length < 4) {
 toast({
 title: "خطأ",
 description: "كلمة المرور يجب أن تكون على الأقل 4 أحرف",
 variant: "destructive"
 });
 return;
 }

 setLoading(true);

 try {
 const res = await apiRequest("POST", "/api/customers/register", {
 phone: cleanPhone,
 name: name.trim(),
 email: email.trim(),
 password
 });
 
 const customer = await res.json();
 setCustomer(customer);
 
 toast({
 title: "مرحباً بك!",
 description: `أهلاً ${customer.name}، تم إنشاء حسابك بنجاح`,
 });

 navigate("/");
 } catch (error: any) {
 console.error("Registration error:", error);
 toast({
 title: "خطأ",
 description: error.message || "حدث خطأ أثناء إنشاء الحساب",
 variant: "destructive"
 });
 } finally {
 setLoading(false);
 }
 };

 return (
 <div 
 className="min-h-screen flex items-center justify-center p-4"
 style={{
 background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #1a1410 100%)",
 }}
 dir="rtl"
 >
 <Card className="w-full max-w-md border-amber-900/30 bg-gradient-to-br from-stone-900/95 to-stone-950/95 backdrop-blur shadow-2xl">
 <CardHeader className="space-y-3 text-center pb-6">
 <div className="flex justify-center">
 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-900/50">
 <Coffee className="w-10 h-10 text-white" />
 </div>
 </div>
 <CardTitle className="text-3xl font-bold text-amber-100">
 مرحباً بك في كوب
 </CardTitle>
 <CardDescription className="text-amber-200/70 text-lg">
 سجل دخولك للحصول على بطاقة كوبي الخاصةبك
 </CardDescription>
 </CardHeader>

 <CardContent>
 <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")} className="w-full">
 <TabsList className="h-10 items-center justify-center rounded-md p-1 grid w-full grid-cols-2 bg-stone-800/50 text-[#d37107]">
 <TabsTrigger value="login" data-testid="tab-login">تسجيل دخول</TabsTrigger>
 <TabsTrigger value="register" data-testid="tab-register">حساب جديد</TabsTrigger>
 </TabsList>

 <TabsContent value="login" className="space-y-5 mt-5">
 <form onSubmit={handleLogin} className="space-y-5">
 <div className="space-y-2">
 <Label htmlFor="login-identifier" className="text-amber-100 flex items-center gap-2">
 <Mail className="w-4 h-4" />
 رقم الجوال أو البريد الإلكتروني
 </Label>
 <SmartIdentifierInput
 id="login-identifier"
 value={identifier}
 onChange={(e) => setIdentifier(e)}
 placeholder="5xxxxxxxx أو email@example.com"
 data-testid="input-identifier"
 required
 />
 <p className="text-xs text-amber-200/50 mt-1">
 يمكنك تسجيل الدخول بالجوال (9 أرقام يبدأ بـ 5) أو البريد الإلكتروني
 </p>
 </div>

 <div className="space-y-2">
 <Label htmlFor="login-password" className="text-amber-100 flex items-center gap-2">
 <Lock className="w-4 h-4" />
 كلمة المرور
 </Label>
 <div className="relative">
 <Input
 id="login-password"
 type={showPassword ? "text" : "password"}
 placeholder="أدخل كلمة المرور"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="bg-stone-800/50 border-amber-900/50 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-600 focus:ring-amber-600/30 pl-10"
 data-testid="input-password"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute left-3 top-2.5 text-amber-400 hover:text-amber-300"
 data-testid="button-toggle-password"
 >
 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 </div>
 <button
 type="button"
 onClick={() => navigate("/forgot-password")}
 className="text-xs text-amber-400/80 hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
 data-testid="link-forgot-password"
 >
 نسيت كلمة المرور؟
 </button>
 </div>

 <Button
 type="submit"
 disabled={loading}
 className="w-full h-12 text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg shadow-amber-900/50 transition-all duration-300 hover:scale-[1.02]"
 data-testid="button-login"
 >
 {loading ? (
 <div className="flex items-center gap-2">
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 <span>جارٍ تسجيل الدخول...</span>
 </div>
 ) : (
 "تسجيل الدخول"
 )}
 </Button>
 </form>
 </TabsContent>

 <TabsContent value="register" className="space-y-5 mt-5">
 <form onSubmit={handleRegister} className="space-y-5">
 <div className="space-y-2">
 <Label htmlFor="register-name" className="text-amber-100 flex items-center gap-2">
 <User className="w-4 h-4" />
 الاسم
 </Label>
 <Input
 id="register-name"
 type="text"
 placeholder="أدخل اسمك"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="bg-stone-800/50 border-amber-900/50 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-600 focus:ring-amber-600/30"
 data-testid="input-name"
 required
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="register-phone" className="text-amber-100 flex items-center gap-2">
 <Phone className="w-4 h-4" />
 رقم الجوال
 </Label>
 <PhoneInput
 id="register-phone"
 value={identifier}
 onChange={(e) => setIdentifier(e)}
 placeholder="5xxxxxxxx"
 data-testid="input-phone-register"
 required
 />
 <p className="text-xs text-amber-200/50 mt-1">
 ابدأ بـ 5 ثم باقي الأرقام (9 أرقام)
 </p>
 </div>

 <div className="space-y-2">
 <Label htmlFor="register-email" className="text-amber-100 flex items-center gap-2">
 <Mail className="w-4 h-4" />
 البريد الإلكتروني
 </Label>
 <Input
 id="register-email"
 type="email"
 placeholder="example@email.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="bg-stone-800/50 border-amber-900/50 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-600 focus:ring-amber-600/30"
 data-testid="input-email"
 dir="ltr"
 required
 />
 <p className="text-xs text-amber-200/50 mt-1">
 مطلوب لاستعادةكلمة المرور إذا نسيتها
 </p>
 </div>

 <div className="space-y-2">
 <Label htmlFor="register-password" className="text-amber-100 flex items-center gap-2">
 <Lock className="w-4 h-4" />
 كلمة المرور
 </Label>
 <div className="relative">
 <Input
 id="register-password"
 type={showPassword ? "text" : "password"}
 placeholder="أدخل كلمة المرور (4 أحرف على الأقل)"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="bg-stone-800/50 border-amber-900/50 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-600 focus:ring-amber-600/30 pl-10"
 data-testid="input-password-register"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute left-3 top-2.5 text-amber-400 hover:text-amber-300"
 data-testid="button-toggle-password-register"
 >
 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 </div>
 </div>

 <Button
 type="submit"
 disabled={loading}
 className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-900/50 transition-all duration-300 hover:scale-[1.02]"
 data-testid="button-register"
 >
 {loading ? (
 <div className="flex items-center gap-2">
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 <span>جارٍ إنشاء الحساب...</span>
 </div>
 ) : (
 "إنشاء حساب"
 )}
 </Button>
 </form>
 </TabsContent>
 </Tabs>

 <div className="pt-6 text-center">
 <button
 type="button"
 onClick={() => navigate("/")}
 className="text-amber-300/70 hover:text-amber-200 transition-colors text-sm underline-offset-4 hover:underline"
 data-testid="link-skip"
 >
 تخطي وتصفح القائمة
 </button>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
