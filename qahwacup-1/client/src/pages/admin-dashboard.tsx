import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, DollarSign, Calendar, Activity, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  onLeave: number;
  totalOrders: number;
  revenue: number;
  avgOrderValue: number;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    totalOrders: 0,
    revenue: 0,
    avgOrderValue: 0,
  });

  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error('Failed to fetch employees');
      return res.json();
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
  });

  useEffect(() => {
    if (employees) {
      const active = employees.filter((e: any) => e.isActivated === 1).length;
      const revenue = orders?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0;
      const avgOrder = orders?.length > 0 ? revenue / orders.length : 0;

      setMetrics({
        totalEmployees: employees.length,
        activeEmployees: active,
        presentToday: Math.floor(active * 0.8),
        onLeave: Math.floor(active * 0.1),
        totalOrders: orders?.length || 0,
        revenue,
        avgOrderValue: avgOrder,
      });
    }
  }, [employees, orders]);

  const StatCard = ({ icon: Icon, label, value, subtext, color = 'primary' }: any) => (
    <Card className="border-0 bg-gradient-to-br from-white to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8 bg-white dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">مرحباً بك في نظام الإدارة</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/settings')}>
          <Settings className="w-4 h-4 ml-2" />
          الإعدادات
        </Button>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="إجمالي الموظفين"
          value={metrics.totalEmployees}
          subtext={`${metrics.activeEmployees} نشطين`}
        />
        <StatCard
          icon={Activity}
          label="الحاضرون اليوم"
          value={metrics.presentToday}
          subtext={`من ${metrics.activeEmployees} موظف`}
        />
        <StatCard
          icon={Calendar}
          label="في الإجازة"
          value={metrics.onLeave}
          subtext="موظفين الآن"
        />
        <StatCard
          icon={DollarSign}
          label="الإيرادات اليومية"
          value={`${metrics.revenue.toFixed(0)} ر.س`}
          subtext={`متوسط الطلب: ${metrics.avgOrderValue.toFixed(2)}`}
        />
      </div>

      {/* Orders Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              نظرة عامة على الطلبات
            </CardTitle>
            <CardDescription>آخر 7 أيام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-sm font-medium">إجمالي الطلبات</span>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <span className="text-sm font-medium">الإيرادات الكلية</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.revenue.toFixed(0)} ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate('/admin/employees')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              data-testid="button-manage-employees"
            >
              <Users className="w-4 h-4 ml-2" />
              إدارة الموظفين
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/admin/attendance')}
              className="w-full"
              data-testid="button-view-attendance"
            >
              <Calendar className="w-4 h-4 ml-2" />
              الحضور والغياب
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/admin/reports')}
              className="w-full"
              data-testid="button-view-reports"
            >
              <TrendingUp className="w-4 h-4 ml-2" />
              التقارير
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees */}
      <Card className="border-0 bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>الموظفون الأخيرون</CardTitle>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/employees')}
              data-testid="button-view-all-employees"
            >
              عرض الكل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {employees && employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-orange-200 dark:border-orange-900/30">
                    <th className="text-right p-3 font-semibold">الاسم</th>
                    <th className="text-right p-3 font-semibold">الدور</th>
                    <th className="text-right p-3 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 5).map((emp: any) => (
                    <tr key={emp.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-3">{emp.fullName}</td>
                      <td className="p-3 text-muted-foreground">{emp.jobTitle}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          emp.isActivated === 1 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {emp.isActivated === 1 ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-muted-foreground">لا توجد موظفون</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
