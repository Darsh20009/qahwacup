import { useState } from "react";
import EmployeeDashboard from "./employee-dashboard";
import MenuView from "./menu-view";
import { Button } from "@/components/ui/button";
import { Layout, Coffee, Users, Maximize2, Minimize2 } from "lucide-react";

export default function UnifiedHub() {
  const [activeView, setActiveView] = useState<"both" | "employee" | "menu">("both");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950">
      {/* Header Controls */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-amber-500/20 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <Layout className="w-5 h-5" />
                <span className="font-bold text-sm">مركز التحكم الموحد</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={activeView === "both" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("both")}
                className="gap-2"
                data-testid="button-view-both"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">عرض مزدوج</span>
              </Button>
              
              <Button
                variant={activeView === "employee" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("employee")}
                className="gap-2"
                data-testid="button-view-employee"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">الموظفين</span>
              </Button>
              
              <Button
                variant={activeView === "menu" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("menu")}
                className="gap-2"
                data-testid="button-view-menu"
              >
                <Coffee className="w-4 h-4" />
                <span className="hidden sm:inline">المنيو</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        {activeView === "both" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employee Dashboard Panel */}
            <div className="bg-slate-900/50 rounded-xl border border-amber-500/20 shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                <h2 className="text-white font-bold">لوحة الموظفين</h2>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <EmployeeDashboard />
              </div>
            </div>

            {/* Menu View Panel */}
            <div className="bg-slate-900/50 rounded-xl border border-amber-500/20 shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-white" />
                <h2 className="text-white font-bold">منيو العرض</h2>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <MenuView />
              </div>
            </div>
          </div>
        )}

        {activeView === "employee" && (
          <div className="bg-slate-900/50 rounded-xl border border-amber-500/20 shadow-2xl p-6 backdrop-blur-sm">
            <EmployeeDashboard />
          </div>
        )}

        {activeView === "menu" && (
          <div className="bg-slate-900/50 rounded-xl border border-amber-500/20 shadow-2xl p-6 backdrop-blur-sm">
            <MenuView />
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
