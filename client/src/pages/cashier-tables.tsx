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
  const [employeeBranchId, setEmployeeBranchId] = useState<string>("");

  // Get current employee info from localStorage
  useEffect(() => {
    const employeeData = localStorage.getItem("currentEmployee");
    if (employeeData) {
      const employee = JSON.parse(employeeData);
      setEmployeeBranchId(employee.branchId || "");
    }
  }, []);

  // Fetch tables for the cashier's branch
  const { data: tables = [], isLoading } = useQuery<ITable[]>({
    queryKey: ["/api/tables", employeeBranchId],
    queryFn: async () => {
      const url = employeeBranchId 
        ? `/api/tables?branchId=${employeeBranchId}`
        : "/api/tables";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch tables");
      return response.json();
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
    mutationFn: async ({ tableId, customerName, customerPhone }: { 
      tableId: string; 
      customerName: string; 
      customerPhone: string;
    }) => {
      const employeeData = localStorage.getItem("currentEmployee");
      const employee = employeeData ? JSON.parse(employeeData) : null;
      
      const response = await fetch(`/api/tables/${tableId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
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
      const response = await fetch(`/api/tables/${tableId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee?._id }),
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

    reserveTableMutation.mutate({
      tableId: selectedTable._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
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
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">متاحة</Badge>
                <span className="text-sm text-muted-foreground">جاهزة للحجز</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">محجوزة</Badge>
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
                className={`hover-elevate cursor-pointer transition-all ${
                  table.isOccupied
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
                data-testid={`card-table-${table.tableNumber}`}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-3xl font-bold text-amber-900">
                    {table.tableNumber}
                  </div>
                  
                  {table.isOccupied && table.reservedFor ? (
                    <div className="space-y-2">
                      <Badge variant="destructive" className="text-xs">
                        محجوزة
                      </Badge>
                      <div className="text-xs space-y-1 bg-white/50 rounded-md p-2">
                        <div className="flex items-center justify-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="font-medium">{table.reservedFor.customerName}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span dir="ltr">{table.reservedFor.customerPhone}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReleaseTable(table)}
                        className="w-full"
                        data-testid={`button-release-${table.tableNumber}`}
                      >
                        <XCircle className="w-3 h-3 ml-1" />
                        تحرير
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                        متاحة
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleReserveTable(table)}
                        className="w-full bg-green-600 hover:bg-green-700"
                        data-testid={`button-reserve-${table.tableNumber}`}
                      >
                        <CheckCircle2 className="w-3 h-3 ml-1" />
                        حجز
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
