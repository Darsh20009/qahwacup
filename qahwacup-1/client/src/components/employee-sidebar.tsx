import { useLocation } from 'wouter';
import { LayoutDashboard, ShoppingCart, ClipboardList, Settings, LogOut, User, BarChart3, Warehouse, Wallet, ChefHat, Table, Eye, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Employee } from '@shared/schema';

interface EmployeeSidebarProps {
  employee: Employee | null;
  onLogout: () => void;
}

export function EmployeeSidebar({ employee, onLogout }: EmployeeSidebarProps) {
  const [location, navigate] = useLocation();

  const baseMenuItems = [
    { label: 'لوحة التحكم', icon: LayoutDashboard, path: '/employee/dashboard' },
    { label: 'الكاشير', icon: ShoppingCart, path: '/employee/cashier' },
    { label: 'نقاط البيع', icon: BarChart3, path: '/employee/pos' },
    { label: 'الطلبات', icon: ClipboardList, path: '/employee/orders' },
    { label: 'عرض الطلبات', icon: Eye, path: '/employee/orders-display' },
    { label: 'المطبخ', icon: ChefHat, path: '/employee/kitchen' },
    { label: 'الطاولات', icon: Table, path: '/employee/table-orders' },
  ];

  const managerMenuItems = [
    { label: 'إدارة الموظفين', icon: User, path: '/admin/employees' },
    { label: 'التقارير', icon: BarChart3, path: '/admin/reports' },
    { label: 'المحاسبة', icon: Wallet, path: '/manager/accounting' },
    { label: 'المخزون', icon: Warehouse, path: '/manager/inventory' },
  ];

  const menuItems = baseMenuItems;
  const showManagerItems = ['manager', 'owner', 'admin'].includes(employee?.role || '');

  return (
    <div className="hidden lg:flex w-64 bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 border-l border-orange-200 dark:border-orange-900/30 flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-orange-200 dark:border-orange-900/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400">قهوة كوب</h2>
        </div>
        <p className="text-xs text-muted-foreground">الموظف: {employee?.fullName || 'جاري التحميل...'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                isActive
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
              }`}
              data-testid={`sidebar-link-${item.label}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}

        {showManagerItems && (
          <>
            <div className="my-4 border-t border-orange-200 dark:border-orange-900/30 pt-4">
              <p className="px-4 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">القائمة الإدارية</p>
            </div>
            {managerMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                  data-testid={`sidebar-link-${item.label}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-orange-200 dark:border-orange-900/30 space-y-2">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start text-sm"
          data-testid="button-logout-sidebar"
        >
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}
