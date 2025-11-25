import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User, Phone, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ITable {
  _id: string;
  tableNumber: string;
  branchId: string;
  isActive: number;
  isOccupied: number;
  currentOrderId?: string;
  reservedFor?: {
    customerName: string;
    customerPhone: string;
    reservedAt: Date;
    reservedBy: string;
  };
}

interface IBranch {
  _id: string;
  nameAr: string;
}

export default function CashierTables() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<ITable | null>(null);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState("2");
  const [employeeBranchId, setEmployeeBranchId] = useState<string>("");

  // Get current employee info from localStorage or API
  useEffect(() => {
    const employeeData = localStorage.getItem("currentEmployee");
    if (employeeData) {
      const employee = JSON.parse(employeeData);
      if (employee.branchId) {
        setEmployeeBranchId(employee.branchId);
      } else if (employee._id || employee.id) {
        // If branchId is not in localStorage, fetch employee data from API
        fetch(`/api/employees/${employee._id || employee.id}`, {
          credentials: "include"
        })
          .then(res => res.json())
          .then(data => {
            if (data.branchId) {
              setEmployeeBranchId(data.branchId);
              // Update localStorage with branchId
              const updated = { ...employee, branchId: data.branchId };
              localStorage.setItem("currentEmployee", JSON.stringify(updated));
            }
          })
          .catch(error => console.error("Failed to fetch employee:", error));
      }
    }
  }, []);

  // Fetch tables for the cashier's branch
  const { data: tables = [], isLoading } = useQuery<ITable[]>({
    queryKey: ["/api/tables", employeeBranchId],
    queryFn: async () => {
      const response = await fetch(`/api/tables?branchId=${employeeBranchId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tables");
      const data = await response.json();
      // Filter by branchId as additional safety check
      return Array.isArray(data) ? data.filter((t: ITable) => t.branchId === employeeBranchId) : [];
    },
    enabled: !!employeeBranchId,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Get branch info
  const { data: branch } = useQuery<IBranch>({
    queryKey: ["/api/branches", employeeBranchId],
    queryFn: async () => {
      const response = await fetch(`/api/branches/${employeeBranchId}`);
      if (!response.ok) throw new Error("Failed to fetch branch");
      return response.json();
    },
    enabled: !!employeeBranchId,
  });

  // Reserve table mutation
  const reserveTableMutation = useMutation({
    mutationFn: async ({ tableId, customerName, customerPhone, numberOfGuests }: { 
      tableId: string; 
      customerName: string; 
      customerPhone: string;
      numberOfGuests: number;
    }) => {
      const employeeData = localStorage.getItem("currentEmployee");
      const employee = employeeData ? JSON.parse(employeeData) : null;
      
      // For immediate reservations, send current date/time explicitly
      const now = new Date();
      const reservationDate = now.toISOString();
      const reservationTime = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      
      const response = await fetch(`/api/tables/${tableId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          numberOfGuests,
          reservationDate,
          reservationTime,
          employeeId: employee?._id || employee?.id,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reserve table");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables", employeeBranchId] });
      toast({
        title: "تم حجز الطاولة",
        description: "تم حجز الطاولة بنجاح",
      });
      setReserveDialogOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setNumberOfGuests("2");
      setSelectedTable(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل حجز الطاولة",
        variant: "destructive",
      });
    },
  });

  // Release table mutation
  const releaseTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const employeeData = localStorage.getItem("currentEmployee");
      const employee = employeeData ? JSON.parse(employeeData) : null;
      
      const response = await fetch(`/api/tables/${tableId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee?._id || employee?.id }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to release table");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables", employeeBranchId] });
      toast({
        title: "تم تحرير الطاولة",
        description: "الطاولة متاحة الآن",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحرير الطاولة",
        variant: "destructive",
      });
    },
  });

  const handleReserveTable = (table: ITable) => {
    setSelectedTable(table);
    setReserveDialogOpen(true);
  };

  const handleReleaseTable = (table: ITable) => {
    if (window.confirm(`هل أنت متأكد من تحرير الطاولة ${table.tableNumber}؟`)) {
      releaseTableMutation.mutate(table._id);
    }
  };

  const handleSubmitReservation = () => {
    if (!selectedTable) return;
    
    if (!customerName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم العميل",
        variant: "destructive",
      });
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 9) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم جوال صحيح",
        variant: "destructive",
      });
      return;
    }

    const guests = parseInt(numberOfGuests);
    if (isNaN(guests) || guests < 1 || guests > 20) {
      toast({
        title: "عدد غير صحيح",
        description: "الرجاء إدخال عدد صحيح من الضيوف (1-20)",
        variant: "destructive",
      });
      return;
    }

    reserveTableMutation.mutate({
      tableId: selectedTable._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      numberOfGuests: guests,
    });
  };

  if (!employeeBranchId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لم يتم تعيينك لفرع معين. يرجى التواصل مع المدير.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">إدارة الطاولات</h1>
            <p className="text-amber-700">
              {branch?.nameAr || "تحميل..."} • {tables.length} طاولة
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setLocation("/employee/dashboard")}
            data-testid="button-back"
          >
            <ArrowRight className="ml-2 h-5 w-5" />
            العودة
          </Button>
        </div>

        {/* Legend */}
        <Card className="bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">متاحة</Badge>
                <span className="text-sm text-muted-foreground">جاهزة للحجز</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">محجوزة</Badge>
                <span className="text-sm text-muted-foreground">بها عميل حالياً</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-amber-900">جاري التحميل...</div>
          </div>
        ) : tables.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                لا توجد طاولات في هذا الفرع. يرجى التواصل مع المدير.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((table) => (
              <Card
                key={table._id}
                className={`hover-elevate cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  table.isOccupied
                    ? "bg-gradient-to-br from-red-100 via-red-50 to-orange-100 border-2 border-red-400 shadow-lg shadow-red-200/50 dark:from-red-900 dark:via-red-950 dark:to-orange-900"
                    : "bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 border-2 border-emerald-400 shadow-lg shadow-emerald-200/50 dark:from-emerald-900 dark:via-green-950 dark:to-teal-900"
                }`}
                data-testid={`card-table-${table.tableNumber}`}
              >
                <CardContent className="p-4 sm:p-6 text-center space-y-3">
                  {/* Table Number - Large and Bold */}
                  <div className="relative">
                    <div className={`text-4xl sm:text-5xl font-bold ${
                      table.isOccupied 
                        ? "text-red-700 dark:text-red-300" 
                        : "text-emerald-700 dark:text-emerald-300"
                    }`}>
                      {table.tableNumber}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">الطاولة</div>
                  </div>
                  
                  {table.isOccupied && table.reservedFor ? (
                    <div className="space-y-3">
                      {/* Reserved Badge */}
                      <div className="flex justify-center">
                        <Badge className="bg-red-600 hover:bg-red-700 text-white animate-pulse px-3 py-1">
                          محجوزة حالياً
                        </Badge>
                      </div>
                      
                      {/* Customer Info */}
                      <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 space-y-2 backdrop-blur">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <User className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{table.reservedFor.customerName}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Phone className="w-3 h-3 text-red-600" />
                          <span className="font-mono" dir="ltr">{table.reservedFor.customerPhone}</span>
                        </div>
                      </div>
                      
                      {/* Release Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReleaseTable(table)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white transition-all"
                        data-testid={`button-release-${table.tableNumber}`}
                      >
                        <XCircle className="w-3 h-3 ml-1" />
                        تحرير الطاولة
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Available Badge */}
                      <div className="flex justify-center">
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1">
                          متاحة الآن
                        </Badge>
                      </div>
                      
                      {/* Empty State Info */}
                      <div className="text-xs text-muted-foreground py-2">
                        جاهزة للحجز
                      </div>
                      
                      {/* Reserve Button */}
                      <Button
                        size="sm"
                        onClick={() => handleReserveTable(table)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-md hover:shadow-lg"
                        data-testid={`button-reserve-${table.tableNumber}`}
                      >
                        <CheckCircle2 className="w-4 h-4 ml-1" />
                        حجز الطاولة
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reserve Dialog */}
        <Dialog open={reserveDialogOpen} onOpenChange={setReserveDialogOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                حجز طاولة {selectedTable?.tableNumber}
              </DialogTitle>
              <DialogDescription>
                أدخل معلومات العميل لحجز الطاولة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">اسم العميل *</Label>
                <Input
                  id="customer-name"
                  placeholder="محمد أحمد"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  data-testid="input-customer-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">رقم الجوال *</Label>
                <Input
                  id="customer-phone"
                  placeholder="5xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  maxLength={9}
                  data-testid="input-customer-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number-of-guests">عدد الضيوف *</Label>
                <Input
                  id="number-of-guests"
                  type="number"
                  placeholder="2"
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(e.target.value)}
                  min="1"
                  max="20"
                  data-testid="input-number-of-guests"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReservation}
                  disabled={reserveTableMutation.isPending}
                  className="flex-1"
                  data-testid="button-confirm-reserve"
                >
                  تأكيد الحجز
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setReserveDialogOpen(false);
                    setCustomerName("");
                    setCustomerPhone("");
                    setNumberOfGuests("2");
                  }}
                  className="flex-1"
                  data-testid="button-cancel-reserve"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
