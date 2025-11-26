import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, LogOut, ShoppingCart, ClipboardList, User, Award, Gift, Sparkles, Download, IdCard, Settings, BarChart3, Table, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import type { Employee } from "@shared/schema";

export default function EmployeeDashboard() {
 const [, setLocation] = useLocation();
 const [employee, setEmployee] = useState<Employee | null>(null);
 const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
 const cardRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const storedEmployee = localStorage.getItem("currentEmployee");
 if (storedEmployee) {
 const emp = JSON.parse(storedEmployee);
 setEmployee(emp);
 // Generate QR with username only (one-time, never changes)
 generateQRCode(emp.username);
 } else {
 setLocation("/employee/gateway");
 }
 }, [setLocation]);

 // Generate QR code with username only (permanent, never changes)
 const generateQRCode = (username: string) => {
 QRCode.toDataURL(username, {
 width: 200,
 margin: 1,
 color: {
 dark: '#1a1410',
 light: '#f59e0b'
 }
 }).then(url => {
 setQrCodeUrl(url);
 }).catch(err => console.error('QR generation error:', err));
 };

 const handleLogout = () => {
 localStorage.removeItem("currentEmployee");
 setLocation("/employee/gateway");
 };

 const downloadCard = async () => {
 if (!cardRef.current) return;
 
 try {
 const canvas = await html2canvas(cardRef.current, {
 backgroundColor: '#1a1410',
 scale: 2
 });
 
 const link = document.createElement('a');
 link.download = `employee-card-${employee?.username}.png`;
 link.href = canvas.toDataURL();
 link.click();
 } catch (error) {
 console.error('Error downloading card:', error);
 }
 };

 if (!employee) {
 return null;
 }

 const getRoleArabic = (role: string) => {
   switch(role) {
     case "owner": return "صاحب الكافيه";
     case "admin": return "مدير النظام";
     case "manager": return "مدير فرع";
     case "driver": return "سائق";
     default: return "كاشير";
   }
 };

 const getRoleColor = (role: string) => {
   switch(role) {
     case "owner": return "bg-red-600";
     case "admin": return "bg-purple-600";
     case "manager": return "bg-amber-500";
     case "driver": return "bg-green-600";
     default: return "bg-blue-500";
   }
 };

 const roleArabic = getRoleArabic(employee.role || "cashier");
 const roleColor = getRoleColor(employee.role || "cashier");

 return (
 <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4">
 {/* Header */}
 <div className="max-w-7xl mx-auto mb-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
 <Coffee className="w-6 h-6 text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-amber-500">قهوة كوب</h1>
 <p className="text-gray-400 text-sm">لوحةتحكم الموظف</p>
 </div>
 </div>
 <Button
 variant="outline"
 onClick={handleLogout}
 className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
 data-testid="button-logout"
 >
 <LogOut className="w-4 h-4 ml-2" />
 تسجيل الخروج
 </Button>
 </div>
 </div>

 <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Employee Card */}
 <div className="lg:col-span-1">
 <Tabs defaultValue="profile" className="w-full">
 <TabsList className="grid w-full grid-cols-2 bg-[#2d1f1a] border-amber-500/20">
 <TabsTrigger value="profile" data-testid="tab-profile">
 <User className="w-4 h-4 ml-2" />
 الملف الشخصي
 </TabsTrigger>
 <TabsTrigger value="card" data-testid="tab-card">
 <IdCard className="w-4 h-4 ml-2" />
 بطاقة الموظف
 </TabsTrigger>
 </TabsList>

 <TabsContent value="profile">
 <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20 overflow-hidden">
 <div className="h-24 bg-gradient-to-r from-amber-500 to-amber-700"></div>
 <CardContent className="pt-0 -mt-12">
 <div className="flex flex-col items-center">
 <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center border-4 border-[#2d1f1a] mb-4">
 <User className="w-12 h-12 text-white" />
 </div>
 
 <h2 className="text-2xl font-bold text-amber-500 mb-2 text-center" data-testid="text-employee-name">
 {employee.fullName}
 </h2>
 
 <Badge className={`${roleColor} text-white mb-2`} data-testid="badge-role">
 {roleArabic}
 </Badge>
 
 {employee.title && (
 <div className="flex items-center gap-2 mb-4">
 <Award className="w-4 h-4 text-amber-500" />
 <span className="text-gray-300" data-testid="text-title">{employee.title}</span>
 </div>
 )}
 
 <div className="text-center text-gray-400 text-sm">
 <p>معرف الموظف: {employee.id?.slice(0, 8) || 'غير متوفر'}</p>
 <p className="mt-1">اسم المستخدم: {employee.username}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="card">
 <div className="space-y-4">
 {/* Badge Information */}
 <Card className="bg-[#2d1f1a] border-amber-500/20">
 <CardContent className="pt-6">
 <p className="text-amber-500 text-sm font-bold mb-2 block">📋 معلومات البطاقة الثابتة:</p>
 <p className="text-gray-400 text-xs mb-3">QR الكود الموجود على البطاقة ثابت طول العمر ولا يتغير أبداً. عند تغيير كلمة المرور، النظام يعدّل كلمة المرور فقط لكن QR يبقى نفسه.</p>
 <div className="bg-[#1a1410] border border-amber-500/20 rounded p-3 mt-3">
 <p className="text-amber-500 font-bold text-center text-lg">{employee?.username}</p>
 <p className="text-gray-500 text-xs text-center mt-1">QR يحتوي على اسم المستخدم فقط</p>
 </div>
 </CardContent>
 </Card>

 {/* Employee Card - Landscape Format */}
 <div ref={cardRef} className="space-y-4">
 {/* Front Side - Employee Info */}
 <div className="bg-gradient-to-br from-[#f5e6d3] via-[#edd9c3] to-[#e8ccb5] border-4 border-amber-700/40 rounded-2xl overflow-hidden shadow-2xl relative" data-testid="employee-card-front">
 {/* Decorative Corner Accent */}
 <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 opacity-20 rounded-bl-3xl pointer-events-none"></div>
 <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-amber-700 to-amber-800 opacity-15 rounded-tr-3xl pointer-events-none"></div>

 {/* Header with Logo */}
 <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-6 relative">
 <div className="flex items-center justify-center gap-3 mb-2">
 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
 <Coffee className="w-7 h-7 text-amber-600" />
 </div>
 <div className="text-white text-right">
 <h3 className="text-2xl font-bold">قهوة كوب</h3>
 <p className="text-white/80 text-xs">Qahwa Crib</p>
 </div>
 </div>
 <div className="absolute top-2 left-4 text-white/20">
 <Coffee className="w-8 h-8 opacity-40" />
 </div>
 </div>

 {/* Main Content */}
 <div className="p-8 relative">
 <div className="grid grid-cols-3 gap-8 items-center">
 {/* Left Section - Photo */}
 <div className="flex flex-col items-center">
 {employee.imageUrl ? (
 <img
 src={employee.imageUrl}
 alt={employee.fullName}
 className="w-32 h-32 rounded-full object-cover border-4 border-amber-600/40 shadow-lg"
 />
 ) : (
 <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg border-4 border-amber-600/30">
 <User className="w-16 h-16 text-white" />
 </div>
 )}
 <div className="mt-3 text-center">
 <p className="text-amber-900 text-xs font-bold">بطاقة رسمية</p>
 <p className="text-amber-700/60 text-xs">Official Card</p>
 </div>
 </div>

 {/* Middle Section - Personal Info */}
 <div className="text-center space-y-3 border-r-2 border-l-2 border-amber-600/20 px-6">
 <div>
 <h2 className="text-2xl font-bold text-amber-900">{employee.fullName}</h2>
 <p className="text-amber-700 text-sm mt-1 font-semibold">{employee.jobTitle || roleArabic}</p>
 </div>
 
 <div className="flex justify-center gap-2">
 <Badge className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs">
 {roleArabic}
 </Badge>
 </div>

 <div className="space-y-1 text-xs">
 <p className="text-amber-900/80">
 <span className="font-bold">ID:</span> {employee.id?.slice(0, 8) || 'N/A'}
 </p>
 <p className="text-amber-700/70 font-mono">{employee.username}</p>
 </div>
 </div>

 {/* Right Section - QR Code */}
 <div className="flex flex-col items-center space-y-2">
 <div className="bg-white p-3 rounded-xl shadow-md border-2 border-amber-600/30">
 {qrCodeUrl && (
 <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" data-testid="img-qr-code" />
 )}
 </div>
 <p className="text-amber-900 text-xs font-bold">امسح لتسجيل الدخول</p>
 <p className="text-amber-700/60 text-xs">Scan Login</p>
 </div>
 </div>

 {/* Bottom Section - Details */}
 <div className="mt-8 pt-6 border-t-2 border-amber-600/20 grid grid-cols-3 gap-4 text-center text-xs">
 <div className="space-y-1">
 <p className="text-amber-700 font-bold">الهاتف</p>
 <p className="text-amber-900 font-mono text-sm">{employee.phone || 'N/A'}</p>
 </div>
 <div className="space-y-1 border-r border-l border-amber-600/20">
 <p className="text-amber-700 font-bold">الدور</p>
 <p className="text-amber-900 font-semibold">{roleArabic}</p>
 </div>
 <div className="space-y-1">
 <p className="text-amber-700 font-bold">الحالة</p>
 <p className={`font-bold ${employee.isActivated ? 'text-green-700' : 'text-red-600'}`}>
 {employee.isActivated ? 'نشط' : 'معطّل'}
 </p>
 </div>
 </div>
 </div>

 {/* Decorative Bottom Border */}
 <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600"></div>
 </div>

 {/* Back Side - Information */}
 <div className="bg-gradient-to-br from-[#f5e6d3] via-[#edd9c3] to-[#e8ccb5] border-4 border-amber-700/40 rounded-2xl overflow-hidden shadow-2xl p-8 relative" data-testid="employee-card-back">
 <div className="absolute top-4 right-4 text-amber-600 opacity-20 pointer-events-none">
 <Coffee className="w-12 h-12 opacity-30" />
 </div>
 
 <div className="max-w-2xl mx-auto space-y-6 relative">
 <div className="text-center space-y-2 mb-6">
 <h3 className="text-amber-900 text-lg font-bold">شروط الاستخدام</h3>
 <p className="text-amber-700/60 text-xs">Terms of Use</p>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-2 text-right">
 <h4 className="text-amber-900 font-bold text-sm flex items-center justify-end gap-2">
 <span>المسؤوليات</span>
 </h4>
 <ul className="text-amber-800 text-xs space-y-1 leading-relaxed">
 <li>• استقبال الطلبات</li>
 <li>• معالجة الدفعات</li>
 <li>• إدارة الجودة</li>
 <li>• خدمة العملاء</li>
 </ul>
 </div>
 
 <div className="space-y-2 text-right">
 <h4 className="text-amber-900 font-bold text-sm flex items-center justify-end gap-2">
 <span>المزايا</span>
 </h4>
 <ul className="text-amber-800 text-xs space-y-1 leading-relaxed">
 <li>- بطاقة تعريف رسمية</li>
 <li>- نسبة عمولة عادلة</li>
 <li>- دعم فني 24/7</li>
 <li>- بيئة عمل محترفة</li>
 </ul>
 </div>
 </div>

 <div className="border-t-2 border-amber-600/20 pt-6 mt-6 space-y-2 text-right">
 <p className="text-amber-900 text-xs"><span className="font-bold">الموقع:</span> qahwa.ma3k.online</p>
 <p className="text-amber-700/60 text-xs">جميع الحقوق محفوظة © 2025</p>
 </div>
 </div>
 </div>
 </div>

 {/* Download Button */}
 <Button
 onClick={downloadCard}
 className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-6 text-lg shadow-lg"
 data-testid="button-download-card"
 >
 <Download className="w-5 h-5 ml-2" />
 تحميل بطاقة الموظف (كارت الموظف)
 </Button>
 </div>
 </TabsContent>
 </Tabs>
 </div>

 {/* Actions */}
 <div className="lg:col-span-2 space-y-6">
 <Card className="bg-[#2d1f1a] border-amber-500/20">
 <CardHeader>
 <CardTitle className="text-amber-500 text-right">الخدمات المتاحة</CardTitle>
 </CardHeader>
 <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Button
 size="lg"
 className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white"
 onClick={() => setLocation("/employee/cashier")}
 data-testid="button-cashier"
 >
 <ShoppingCart className="w-10 h-10" />
 <div className="text-center">
 <div className="font-bold text-lg">نظام الكاشير</div>
 <div className="text-sm opacity-90">إضافة طلب جديد</div>
 </div>
 </Button>

 <Button
 size="lg"
 className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
 onClick={() => setLocation("/employee/orders")}
 data-testid="button-orders"
 >
 <ClipboardList className="w-10 h-10" />
 <div className="text-center">
 <div className="font-bold text-lg">إدارةالطلبات</div>
 <div className="text-sm opacity-90">عرض وتحديث الطلبات</div>
 </div>
 </Button>

 <Button
 size="lg"
 className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white"
 onClick={() => setLocation("/employee/menu-management")}
 data-testid="button-menu-management"
 >
 <Settings className="w-10 h-10" />
 <div className="text-center">
 <div className="font-bold text-lg">إدارةالمشروبات</div>
 <div className="text-sm opacity-90">تحديث حالةالتوفر</div>
 </div>
 </Button>

 <Button
 size="lg"
 className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white"
 onClick={() => setLocation("/employee/table-orders")}
 data-testid="button-table-orders"
 >
 <Coffee className="w-10 h-10" />
 <div className="text-center">
 <div className="font-bold text-lg">طلبات الطاولات</div>
 <div className="text-sm opacity-90">استلام وإدارة طلبات الطاولات</div>
 </div>
 </Button>

 <Button
 size="lg"
 className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white"
 onClick={() => setLocation("/employee/tables")}
 data-testid="button-tables"
 >
 <Table className="w-10 h-10" />
 <div className="text-center">
 <div className="font-bold text-lg">تخصيص الطاولات</div>
 <div className="text-sm opacity-90">حجز طاولة لعميل</div>
 </div>
 </Button>

 {(employee.role === "manager" || employee.role === "owner" || employee.role === "admin") && (
 <>
 <Button
 size="lg"
 className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
 onClick={() => setLocation("/manager/dashboard")}
 data-testid="button-manager-dashboard"
 >
 <BarChart3 className="w-10 h-10" />
 <div className="text-center">
 <div className="font-bold text-lg">لوحةالتحكم</div>
 <div className="text-sm opacity-90">إحصائيات شاملة</div>
 </div>
 </Button>
 
 <Button
 size="lg"
 className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white md:col-span-2"
 onClick={() => setLocation("/manager/employees")}
 data-testid="button-manager-employees"
 >
 <User className="w-10 h-10" />
 <div className="text-center">
 <div className="font-bold text-lg">إدارةالموظفين</div>
 <div className="text-sm opacity-90">إضافة وتعديل الموظفين</div>
 </div>
 </Button>
 </>
 )}
 </CardContent>
 </Card>

 {/* Info Card */}
 <Card className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20 shadow-xl">
 <CardHeader>
 <CardTitle className="text-amber-500 text-right flex items-center gap-2">
 <Sparkles className="w-5 h-5" />
 معلومات مهمة
 </CardTitle>
 </CardHeader>
 <CardContent className="text-gray-300 text-right space-y-2">
 <p className="flex items-center gap-2">
 <span className="w-2 h-2 bg-amber-500 rounded-full" />
 يمكنك استخدام نظام الكاشير لإضافة طلبات جديدةللعملاء
 </p>
 <p className="flex items-center gap-2">
 <span className="w-2 h-2 bg-green-500 rounded-full" />
 بطاقات الولاء تمنح خصم 10% تلقائي عند المسح
 </p>
 <p className="flex items-center gap-2">
 <span className="w-2 h-2 bg-blue-500 rounded-full" />
 يتم إرسال الفاتورة تلقائياً للعميل عبر واتساب
 </p>
 <p className="flex items-center gap-2">
 <span className="w-2 h-2 bg-purple-500 rounded-full" />
 يمكنك متابعة حالة الطلبات وتحديثها من صفحة إدارةالطلبات
 </p>
 <p className="flex items-center gap-2">
 <span className="w-2 h-2 bg-amber-500 rounded-full" />
 رمز QR الخاص بك يمكن استخدامه للتعريف أو تسجيل الحضور
 </p>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
}
