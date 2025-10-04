import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, LogOut, ShoppingCart, ClipboardList, User, Award, Gift, Sparkles, Download, IdCard } from "lucide-react";
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
      
      // Generate QR code with employee info
      const employeeData = {
        id: emp.id,
        username: emp.username,
        fullName: emp.fullName,
        role: emp.role,
        title: emp.title
      };
      
      QRCode.toDataURL(JSON.stringify(employeeData), {
        width: 200,
        margin: 1,
        color: {
          dark: '#1a1410',
          light: '#f59e0b'
        }
      }).then(url => {
        setQrCodeUrl(url);
      });
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

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

  const roleArabic = employee.role === "manager" ? "مدير" : "كاشير";
  const roleColor = employee.role === "manager" ? "bg-amber-500" : "bg-blue-500";

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
              <p className="text-gray-400 text-sm">لوحة تحكم الموظف</p>
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
                      <p>معرف الموظف: {employee.id.slice(0, 8)}</p>
                      <p className="mt-1">اسم المستخدم: {employee.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="card">
              <div className="space-y-4">
                {/* Employee Card - Downloadable */}
                <div ref={cardRef} className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-2 border-amber-500/30 rounded-xl overflow-hidden" data-testid="employee-card">
                  {/* Card Header */}
                  <div className="h-20 bg-gradient-to-r from-amber-500 to-amber-700 flex items-center justify-center relative">
                    <Coffee className="w-8 h-8 text-white absolute left-4" />
                    <div className="text-center">
                      <h3 className="text-white font-bold text-xl">قهوة كوب</h3>
                      <p className="text-white/90 text-sm">بطاقة موظف</p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Employee Info */}
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-amber-500 font-bold text-xl">{employee.fullName}</h3>
                      <Badge className={`${roleColor} text-white`}>
                        {roleArabic}
                      </Badge>
                      {employee.title && (
                        <p className="text-gray-300 text-sm">{employee.title}</p>
                      )}
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      {qrCodeUrl && (
                        <img src={qrCodeUrl} alt="Employee QR Code" className="w-40 h-40" data-testid="img-qr-code" />
                      )}
                    </div>

                    {/* Employee Details */}
                    <div className="bg-[#1a1410] rounded-lg p-3 text-center space-y-1">
                      <p className="text-gray-400 text-sm">اسم المستخدم</p>
                      <p className="text-amber-500 font-mono font-bold">{employee.username}</p>
                      <p className="text-gray-400 text-xs mt-2">ID: {employee.id.slice(0, 12)}</p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  onClick={downloadCard}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-6"
                  data-testid="button-download-card"
                >
                  <Download className="w-5 h-5 ml-2" />
                  تحميل بطاقة الموظف
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
                className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white relative overflow-hidden group"
                onClick={() => setLocation("/employee/loyalty")}
                data-testid="button-loyalty"
              >
                <div className="relative flex flex-col items-center gap-3">
                  <div className="relative">
                    <Gift className="w-10 h-10" />
                    <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-amber-400 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">بطاقات الولاء</div>
                    <div className="text-sm opacity-90">إصدار وإدارة البطاقات</div>
                  </div>
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
                  <div className="font-bold text-lg">إدارة الطلبات</div>
                  <div className="text-sm opacity-90">عرض وتحديث الطلبات</div>
                </div>
              </Button>
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
                يمكنك استخدام نظام الكاشير لإضافة طلبات جديدة للعملاء
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
                يمكنك متابعة حالة الطلبات وتحديثها من صفحة إدارة الطلبات
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
