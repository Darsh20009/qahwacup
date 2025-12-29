import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Lock, Eye, EyeOff } from "lucide-react";
import logoImg from "@assets/Elegant Coffee Culture Design_1757428233689.png";

export default function EmployeeGateway() {
 const [, setLocation] = useLocation();
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState("");

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 
 if (password === "1802009") {
 setLocation("/employee/login");
 } else {
 setError("كلمة المرور غير صحيحة ");
 setPassword("");
 }
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] flex items-center justify-center p-4">
 <div className="w-full max-w-md">
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
 <img src={logoImg} alt="قهوة كوب" className="w-full h-full object-contain" />
 </div>
 <h1 className="text-3xl font-bold text-amber-500 mb-2">قهوة كوب</h1>
 <p className="text-gray-400">بوابةالموظفين</p>
 </div>

 <Card className="bg-[#2d1f1a] border-amber-500/20">
 <CardHeader>
 <CardTitle className="text-2xl text-center text-amber-500">
 دخول الموظفين
 </CardTitle>
 <CardDescription className="text-center text-gray-400">
 أدخل كلمة المرور العامةللوصول
 </CardDescription>
 </CardHeader>
 <CardContent>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-2">
 <div className="relative">
 <Lock className="absolute right-3 top-3 h-5 w-5 text-amber-500" />
 <Input
 type={showPassword ? "text" : "password"}
 placeholder="كلمة المرور العامة"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="pr-10 pl-10 bg-[#1a1410] border-amber-500/30 text-white placeholder:text-gray-500 text-right"
 data-testid="input-gateway-password"
 autoFocus
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute left-3 top-3 text-amber-500 hover:text-amber-400"
 data-testid="button-toggle-password"
 >
 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
 </button>
 </div>
 {error && (
 <p className="text-red-500 text-sm text-right" data-testid="text-error">
 {error}
 </p>
 )}
 </div>
 
 <Button
 type="submit"
 className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold"
 data-testid="button-gateway-submit"
 >
 دخول
 </Button>
 </form>
 </CardContent>
 </Card>

 <div className="mt-6 text-center">
 <Button
 variant="ghost"
 onClick={() => setLocation("/")}
 className="text-amber-500 hover:text-amber-400"
 data-testid="link-back-home"
 >
 العودة للصفحة الرئيسية
 </Button>
 </div>
 </div>
 </div>
 );
}
