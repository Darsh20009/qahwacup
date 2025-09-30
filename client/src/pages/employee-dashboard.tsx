import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, LogOut, ShoppingCart, ClipboardList, User, Award } from "lucide-react";
import QRCodeComponent from "@/components/qr-code";
import type { Employee } from "@shared/schema";

export default function EmployeeDashboard() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("currentEmployee");
    setLocation("/employee/gateway");
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
                
                <div className="w-full bg-[#1a1410] rounded-lg p-4 mb-4">
                  <QRCodeComponent 
                    url={`EMPLOYEE:${employee.id}`}
                    title="معرف الموظف"
                    size="md"
                    showURL={false}
                  />
                </div>
                
                <div className="text-center text-gray-400 text-sm">
                  <p>معرف الموظف: {employee.id.slice(0, 8)}</p>
                  <p className="mt-1">اسم المستخدم: {employee.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#2d1f1a] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-500 text-right">الخدمات المتاحة</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="font-bold text-lg">إدارة الطلبات</div>
                  <div className="text-sm opacity-90">عرض وتحديث الطلبات</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-[#2d1f1a] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-500 text-right">معلومات مهمة</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 text-right space-y-2">
              <p>• يمكنك استخدام نظام الكاشير لإضافة طلبات جديدة للعملاء</p>
              <p>• يتم إرسال الفاتورة تلقائياً للعميل عبر واتساب</p>
              <p>• يمكنك متابعة حالة الطلبات وتحديثها من صفحة إدارة الطلبات</p>
              <p>• رمز QR الخاص بك يمكن استخدامه للتعريف أو تسجيل الحضور</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
