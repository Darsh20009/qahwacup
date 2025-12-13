import { ReactNode, useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  Home, 
  ShoppingBag, 
  Users, 
  Coffee, 
  LogOut,
  ChefHat,
  CreditCard,
  TableIcon,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface Employee {
  id: string;
  nameAr: string;
  role: string;
  branchId?: string;
}

interface EmployeeLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backPath?: string;
}

export function EmployeeLayout({ 
  children, 
  title,
  showBack = false,
  backPath = "/employee/dashboard"
}: EmployeeLayoutProps) {
  const [location, setLocation] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentEmployee");
    setLocation("/employee/gateway");
  };

  const navItems = [
    { path: "/employee/dashboard", icon: Home, label: "الرئيسية", roles: ["all"] },
    { path: "/employee/orders", icon: ShoppingBag, label: "الطلبات", roles: ["all"] },
    { path: "/employee/pos", icon: CreditCard, label: "نقطة البيع", roles: ["cashier", "manager", "admin"] },
    { path: "/employee/kitchen", icon: ChefHat, label: "المطبخ", roles: ["barista", "manager", "admin"] },
    { path: "/employee/tables", icon: TableIcon, label: "الطاولات", roles: ["all"] },
    { path: "/employee/menu-management", icon: Coffee, label: "القائمة", roles: ["manager", "admin"] },
    { path: "/employee/loyalty", icon: Users, label: "الولاء", roles: ["all"] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes("all") || (employee?.role && item.roles.includes(employee.role))
  );

  const roleLabels: Record<string, string> = {
    admin: "مدير النظام",
    manager: "مدير",
    cashier: "كاشير",
    barista: "باريستا",
    driver: "سائق",
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full" dir="rtl">
        <Sidebar side="right" collapsible="icon">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {employee?.nameAr?.charAt(0) || "م"}
                </AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="font-medium text-sm">{employee?.nameAr || "موظف"}</p>
                <Badge variant="secondary" className="text-xs">
                  {roleLabels[employee?.role || ""] || employee?.role}
                </Badge>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavItems.map((item) => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          data-testid={`nav-${item.path.split('/').pop()}`}
                        >
                          <Link href={item.path}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="text-destructive"
                  data-testid="button-logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span>تسجيل الخروج</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <div className="flex items-center gap-2">
              {showBack ? (
                <Button 
                  asChild 
                  variant="ghost" 
                  size="icon" 
                  data-testid="button-back"
                >
                  <Link href={backPath}>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              )}
              {title && <h1 className="text-lg font-semibold">{title}</h1>}
            </div>
            {employee && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {employee.nameAr}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {employee.nameAr?.charAt(0) || "م"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
