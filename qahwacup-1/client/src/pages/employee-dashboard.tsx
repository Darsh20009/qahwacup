import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, LogOut, ShoppingCart, ClipboardList, User, Award, Gift, Sparkles, Download, IdCard, Settings, BarChart3, Table, Lock, Clock, MonitorSmartphone, ChefHat, Wallet, Warehouse, Eye, Bell, CheckCircle, AlertCircle, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/states";
import { EmployeeSidebar } from "@/components/employee-sidebar";
import html2canvas from "html2canvas";
import type { Employee } from "@shared/schema";

interface LeaveRequest {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  numberOfDays: number;
  rejectionReason?: string;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items?: number;
  customerName?: string;
  createdAt: string;
}

interface Notification {
  id: string;
  type: 'leave' | 'order' | 'kitchen' | 'manager' | 'alert';
  title: string;
  message: string;
  status?: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  icon?: string;
  actionLink?: string;
}

export default function EmployeeDashboard() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      setEmployee(emp);
      fetchAllNotifications();
    } else {
      setLocation("/employee/gateway");
    }
    setIsLoading(false);
  }, [setLocation]);

  const fetchAllNotifications = async () => {
    await Promise.all([
      fetchLeaveRequests(),
      fetchPendingOrders(),
      fetchKitchenOrders()
    ]);
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch("/api/leave-requests", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
    return [];
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch("/api/orders?status=pending", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setPendingOrders(data || []);
        return data;
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
    return [];
  };

  const fetchKitchenOrders = async () => {
    try {
      const response = await fetch("/api/orders?status=preparing", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setKitchenOrders(data || []);
        return data;
      }
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
    }
    return [];
  };

  useEffect(() => {
    if (employee?.id) {
      generateQRCode(employee.id);
    }
  }, [employee?.id]);

  useEffect(() => {
    if (leaveRequests.length > 0 || pendingOrders.length > 0 || kitchenOrders.length > 0) {
      const allNotifications: Notification[] = [];

      // Leave request notifications
      leaveRequests.forEach((request) => {
        allNotifications.push({
          id: request._id,
          type: 'leave',
          title: 'طلب إجازة',
          message: `${request.status === 'pending' ? 'قيد الانتظار' : request.status === 'approved' ? 'تمت الموافقة على' : 'تم رفض'} طلب الإجازة من ${new Date(request.startDate).toLocaleDateString('ar-SA')} إلى ${new Date(request.endDate).toLocaleDateString('ar-SA')}`,
          status: request.status,
          timestamp: new Date(request.createdAt)
        });
      });

      // Pending orders notifications
      if (pendingOrders.length > 0) {
        allNotifications.push({
          id: 'pending-orders-' + Date.now(),
          type: 'order',
          title: 'طلبات عملاء قيد الانتظار',
          message: `هناك ${pendingOrders.length} طلب من العملاء بانتظار المعالجة`,
          timestamp: new Date(),
          actionLink: '/employee/orders'
        });
      }

      // Kitchen orders notifications
      if (kitchenOrders.length > 0) {
        allNotifications.push({
          id: 'kitchen-orders-' + Date.now(),
          type: 'kitchen',
          title: 'طلبات المطبخ',
          message: `هناك ${kitchenOrders.length} طلب في المطبخ بحاجة إلى تحضير`,
          timestamp: new Date(),
          actionLink: '/employee/kitchen'
        });
      }

      // Manager alerts for managers
      if (employee?.role === 'manager' || employee?.role === 'admin' || employee?.role === 'owner') {
        const totalPending = pendingOrders.length + kitchenOrders.length;
        if (totalPending > 0) {
          allNotifications.push({
            id: 'manager-alert-' + Date.now(),
            type: 'manager',
            title: 'تنبيه لوحة التحكم',
            message: `لديك ${totalPending} طلب يحتاج متابعة في النظام`,
            timestamp: new Date(),
            actionLink: '/manager/dashboard'
          });
        }
      }

      setNotifications(allNotifications);
    } else {
      setNotifications([]);
    }
  }, [leaveRequests, pendingOrders, kitchenOrders, employee?.role]);

  const generateQRCode = async (employeeId: string) => {
    try {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(employeeId, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('QR generation error:', err);
    }
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

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="جاري تحميل البيانات..." />
      </div>
    );
  }

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

  const getRoleVariant = (role: string): "default" | "destructive" | "secondary" | "outline" => {
    switch(role) {
      case "owner": return "destructive";
      case "admin": return "secondary";
      case "manager": return "default";
      case "driver": return "outline";
      default: return "secondary";
    }
  };

  const roleArabic = getRoleArabic(employee.role || "cashier");
  const roleVariant = getRoleVariant(employee.role || "cashier");

  return (
    <div dir="rtl" className="flex h-screen bg-white dark:bg-slate-950">
      <EmployeeSidebar employee={employee} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">لوحة تحكم الموظف</h1>
                <p className="text-muted-foreground mt-1">أهلاً {employee?.fullName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
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
              <Card>
                <div className="h-24 bg-primary"></div>
                <CardContent className="pt-0 -mt-12">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center border-4 border-card mb-4">
                      <User className="w-12 h-12 text-primary-foreground" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-primary mb-2 text-center" data-testid="text-employee-name">
                      {employee.fullName}
                    </h2>
                    
                    <Badge variant={roleVariant} className="mb-2" data-testid="badge-role">
                      {roleArabic}
                    </Badge>
                    
                    {employee.title && (
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground" data-testid="text-title">{employee.title}</span>
                      </div>
                    )}
                    
                    <div className="text-center text-muted-foreground text-sm">
                      <p>معرف الموظف: {employee.id?.slice(0, 8) || 'غير متوفر'}</p>
                      <p className="mt-1">اسم المستخدم: {employee.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="card">
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-primary text-sm font-bold mb-2 block">معلومات البطاقة الثابتة:</p>
                    <p className="text-muted-foreground text-xs mb-3">QR الكود الموجود على البطاقة ثابت طول العمر ولا يتغير أبداً. المسح التلقائي للبطاقة يسجل دخول الموظف مباشرة.</p>
                    <div className="bg-muted border border-border rounded p-3 mt-3">
                      <p className="text-primary font-bold text-center text-lg">{employee?.id?.slice(0, 8) || 'N/A'}</p>
                      <p className="text-muted-foreground text-xs text-center mt-1">معرّف الموظف (Employee ID)</p>
                    </div>
                  </CardContent>
                </Card>

                <div ref={cardRef} className="space-y-4">
                  <div className="bg-gradient-to-br from-[#f5e6d3] via-[#edd9c3] to-[#e8ccb5] border-4 border-amber-700/40 rounded-2xl overflow-hidden shadow-2xl relative" data-testid="employee-card-front">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 opacity-20 rounded-bl-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-amber-700 to-amber-800 opacity-15 rounded-tr-3xl pointer-events-none"></div>

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

                    <div className="p-8 relative">
                      <div className="grid grid-cols-3 gap-8 items-center">
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

                        <div className="flex flex-col items-center space-y-2">
                          <div className="bg-white p-3 rounded-xl shadow-md border-2 border-amber-600/30">
                            {qrCodeUrl ? (
                              <img 
                                src={qrCodeUrl}
                                alt="QR Code"
                                data-testid="img-qr-code"
                                className="w-32 h-32"
                              />
                            ) : (
                              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded">
                                <p className="text-xs text-gray-500">جاري التحميل...</p>
                              </div>
                            )}
                          </div>
                          <p className="text-amber-900 text-xs font-bold">امسح لتسجيل الدخول</p>
                          <p className="text-amber-700/60 text-xs">Scan Login</p>
                        </div>
                      </div>

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

                    <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600"></div>
                  </div>

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

                <Button
                  onClick={downloadCard}
                  className="w-full"
                  size="lg"
                  data-testid="button-download-card"
                >
                  <Download className="w-5 h-5 ml-2" />
                  تحميل بطاقة الموظف (كارت الموظف)
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary text-right">الخدمات المتاحة</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                size="lg"
                className="h-32 flex flex-col items-center justify-center gap-3"
                onClick={() => setLocation("/employee/cashier")}
                data-testid="button-cashier"
              >
                <ShoppingCart className="w-10 h-10" />
                <div className="text-center">
                  <div className="font-bold text-lg">نظام الكاشير</div>
                  <div className="text-sm opacity-90">للكاشير المتنقل</div>
                </div>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="h-32 flex flex-col items-center justify-center gap-3"
                onClick={() => setLocation("/employee/pos")}
                data-testid="button-pos-system"
              >
                <MonitorSmartphone className="w-10 h-10" />
                <div className="text-center">
                  <div className="font-bold text-lg">نظام نقاط البيع</div>
                  <div className="text-sm opacity-90">POS </div>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3"
                onClick={() => setLocation("/employee/orders")}
                data-testid="button-orders"
              >
                <ClipboardList className="w-10 h-10" />
                <div className="text-center">
                  <div className="font-bold text-lg">إدارة الطلبات</div>
                  <div className="text-sm opacity-90">عرض وتحديث الطلبات</div>
                </div>
              </Button>

              <Button
                size="lg"
                className="h-32 flex flex-col items-center justify-center gap-3"
                onClick={() => setLocation("/employee/orders-display")}
                data-testid="button-orders-display"
              >
                <MonitorSmartphone className="w-10 h-10" />
                <div className="text-center">
                  <div className="font-bold text-lg">عرض الطلبات</div>
                  <div className="text-sm opacity-90">شاشة عرض الطلبات الحية</div>
                </div>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="h-32 flex flex-col items-center justify-center gap-3"
                onClick={() => setLocation("/employee/kitchen")}
                data-testid="button-kitchen-display"
              >
                <ChefHat className="w-10 h-10" />
                <div className="text-center">
                  <div className="font-bold text-lg">شاشة المطبخ</div>
                  <div className="text-sm opacity-90">متابعة وتحضير الطلبات</div>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3"
                onClick={() => setLocation("/employee/attendance")}
                data-testid="button-attendance"
              >
                <Clock className="w-10 h-10" />
                <div className="text-center">
                  <div className="font-bold text-lg">الحضور والانصراف</div>
                  <div className="text-sm opacity-90">نظام الحضور و الانصراف</div>
                </div>
              </Button>

              <Button
                size="lg"
                className="h-32 flex flex-col items-center justify-center gap-3"
                onClick={() => setLocation("/employee/menu-management")}
                data-testid="button-menu-management"
              >
                <Settings className="w-10 h-10" />
                <div className="text-center">
                  <div className="font-bold text-lg">إدارة المشروبات</div>
                  <div className="text-sm opacity-90">تحديث حالة التوفر</div>
                </div>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="h-32 flex flex-col items-center justify-center gap-3"
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
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3"
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
                    className="h-32 flex flex-col items-center justify-center gap-3"
                    onClick={() => setLocation("/manager/dashboard")}
                    data-testid="button-manager-dashboard"
                  >
                    <BarChart3 className="w-10 h-10" />
                    <div className="text-center">
                      <div className="font-bold text-lg">لوحة التحكم</div>
                      <div className="text-sm opacity-90">إحصائيات شاملة</div>
                    </div>
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-32 flex flex-col items-center justify-center gap-3"
                    onClick={() => setLocation("/manager/employees")}
                    data-testid="button-manager-employees"
                  >
                    <User className="w-10 h-10" />
                    <div className="text-center">
                      <div className="font-bold text-lg">إدارة الموظفين</div>
                      <div className="text-sm opacity-90">إضافة وتعديل الموظفين</div>
                    </div>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-3"
                    onClick={() => setLocation("/manager/accounting")}
                    data-testid="button-accounting"
                  >
                    <Wallet className="w-10 h-10" />
                    <div className="text-center">
                      <div className="font-bold text-lg">المحاسبة والفواتير</div>
                      <div className="text-sm opacity-90">إدارة المصروفات والإيرادات</div>
                    </div>
                  </Button>

                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-32 flex flex-col items-center justify-center gap-3"
                    onClick={() => setLocation("/manager/inventory")}
                    data-testid="button-inventory"
                  >
                    <Warehouse className="w-10 h-10" />
                    <div className="text-center">
                      <div className="font-bold text-lg">إدارة المخزون</div>
                      <div className="text-sm opacity-90">المواد الخام والوصفات</div>
                    </div>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-3"
                    onClick={() => setLocation("/menu-view")}
                    data-testid="button-menu-view"
                  >
                    <Eye className="w-10 h-10" />
                    <div className="text-center">
                      <div className="font-bold text-lg">عرض المنيو</div>
                      <div className="text-sm opacity-90">شاشات العرض والتلفزيون</div>
                    </div>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary text-right flex items-center gap-2 flex-wrap">
                <Bell className="w-5 h-5" />
                الإشعارات والطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">لا توجد إشعارات أو طلبات جديدة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border border-border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => notification.actionLink && setLocation(notification.actionLink)}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Leave notification icon */}
                        {notification.type === 'leave' && (
                          <>
                            {notification.status === 'approved' && (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            )}
                            {notification.status === 'rejected' && (
                              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                            {notification.status === 'pending' && (
                              <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            )}
                          </>
                        )}

                        {/* Order notification icon */}
                        {notification.type === 'order' && (
                          <ShoppingCart className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        )}

                        {/* Kitchen notification icon */}
                        {notification.type === 'kitchen' && (
                          <ChefHat className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        )}

                        {/* Manager notification icon */}
                        {notification.type === 'manager' && (
                          <BarChart3 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-primary">{notification.title}</h3>
                            {notification.status && (
                              <Badge
                                variant={
                                  notification.status === 'approved'
                                    ? 'default'
                                    : notification.status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                                data-testid={`badge-status-${notification.id}`}
                              >
                                {notification.status === 'approved'
                                  ? 'موافق عليه'
                                  : notification.status === 'rejected'
                                  ? 'مرفوض'
                                  : 'قيد الانتظار'}
                              </Badge>
                            )}
                            {(notification.type === 'order' || notification.type === 'kitchen' || notification.type === 'manager') && (
                              <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950">
                                جديد
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {notification.actionLink && (
                            <p className="text-xs text-primary mt-2 font-semibold">
                              انقر للذهاب إلى الصفحة →
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {leaveRequests.some(r => r.status === 'pending') && (
                <Button
                  variant="outline"
                  onClick={() => setLocation("/employee/leave-request")}
                  className="w-full mt-4"
                  data-testid="button-view-leave-requests"
                >
                  <FileText className="w-4 h-4 ml-2" />
                  عرض طلبات الجازة الكاملة
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary text-right flex items-center gap-2 flex-wrap">
                <Sparkles className="w-5 h-5" />
                معلومات مهمة
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-right space-y-2">
              <p className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 bg-primary rounded-full" />
                يمكنك استخدام نظام الكاشير لإضافة طلبات جديدة للعملاء
              </p>
              <p className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                بطاقات الولاء تمنح خصم 10% تلقائي عند المسح
              </p>
              <p className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                يتم إرسال الفاتورة تلقائياً للعميل عبر واتساب
              </p>
              <p className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                يمكنك متابعة حالة الطلبات وتحديثها من صفحة إدارة الطلبات
              </p>
              <p className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 bg-primary rounded-full" />
                رمز QR الخاص بك يمكن استخدامه للتعريف أو تسجيل الحضور
              </p>
            </CardContent>
          </Card>
        </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
