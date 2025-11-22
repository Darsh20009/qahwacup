import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Table as TableIcon, Plus, Trash2, Download, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TableQRCard, downloadQRCard } from "@/components/table-qr-card";

interface ITable {
  _id: string;
  tableNumber: string;
  qrToken: string;
  branchId?: string;
  isActive: number;
  isOccupied: number;
  currentOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IBranch {
  _id: string;
  nameAr: string;
  nameEn?: string;
  address: string;
  city: string;
  isActive: number;
}

export default function ManagerTables() {
  const { toast } = useToast();
  const [bulkCount, setBulkCount] = useState("10");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<ITable | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const qrCardRef = useRef<HTMLCanvasElement>(null);

  // Fetch branches
  const { data: branches } = useQuery<IBranch[]>({
    queryKey: ["/api/branches"],
  });

  // Fetch tables
  const { data: tables, isLoading } = useQuery<ITable[]>({
    queryKey: ["/api/tables"],
  });

  // Create single table mutation
  const createTableMutation = useMutation({
    mutationFn: async (tableNumber: string) => {
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber }),
      });
      if (!response.ok) throw new Error("Failed to create table");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      toast({
        title: "تم إنشاء الطاولة",
        description: "تم إنشاء الطاولة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل إنشاء الطاولة",
        variant: "destructive",
      });
    },
  });

  // Bulk create tables mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async ({ count, branchId }: { count: number; branchId: string }) => {
      const response = await fetch("/api/tables/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, branchId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to bulk create tables");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      const createdCount = data.results?.created?.length || data.details?.created?.length || 0;
      toast({
        title: "تم إنشاء الطاولات",
        description: `تم إنشاء ${createdCount} طاولة بنجاح`,
      });
      setBulkCount("10");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل إنشاء الطاولات",
        variant: "destructive",
      });
    },
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tables/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete table");
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      toast({
        title: "تم حذف الطاولة",
        description: "تم حذف الطاولة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل حذف الطاولة",
        variant: "destructive",
      });
    },
  });

  // Get QR code for table
  const getQRCodeMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const response = await fetch(`/api/tables/${tableId}/qr-code`);
      if (!response.ok) throw new Error("Failed to get QR code");
      return response.json();
    },
    onSuccess: (data) => {
      setQrCodeData(data);
      setQrDialogOpen(true);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحميل رمز QR",
        variant: "destructive",
      });
    },
  });

  const handleBulkCreate = () => {
    const count = parseInt(bulkCount);
    if (isNaN(count) || count < 1 || count > 100) {
      toast({
        title: "خطأ",
        description: "يجب أن يكون العدد بين 1 و 100",
        variant: "destructive",
      });
      return;
    }
    if (!selectedBranch) {
      toast({
        title: "خطأ",
        description: "يجب اختيار الفرع أولاً",
        variant: "destructive",
      });
      return;
    }
    bulkCreateMutation.mutate({ count, branchId: selectedBranch });
  };

  const handleViewQR = (table: ITable) => {
    setSelectedTable(table);
    getQRCodeMutation.mutate(table._id);
  };

  const handleDownloadQRCode = () => {
    if (!selectedTable || !qrCardRef.current) return;
    downloadQRCard(qrCardRef.current, selectedTable.tableNumber);
  };

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TableIcon className="w-8 h-8" />
              إدارة الطاولات
            </h1>
            <p className="text-muted-foreground">إدارة طاولات المقهى وإنشاء رموز QR</p>
          </div>
        </div>

        {/* Bulk Create Section */}
        <Card>
          <CardHeader>
            <CardTitle>إنشاء طاولات جديدة</CardTitle>
            <CardDescription>أنشئ طاولات متعددة دفعة واحدة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="branch">اختر الفرع</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="bulkCount">عدد الطاولات</Label>
                <Input
                  id="bulkCount"
                  type="number"
                  min="1"
                  max="100"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  placeholder="مثال: 10"
                  data-testid="input-bulk-count"
                />
              </div>
              <Button
                onClick={handleBulkCreate}
                disabled={bulkCreateMutation.isPending || !selectedBranch}
                data-testid="button-bulk-create"
              >
                <Plus className="w-4 h-4 ml-2" />
                إنشاء الطاولات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tables List */}
        <Card>
          <CardHeader>
            <CardTitle>الطاولات الحالية ({tables?.length || 0})</CardTitle>
            <CardDescription>جميع الطاولات المتاحة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : !tables || tables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد طاولات. أنشئ طاولات جديدة للبدء.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الطاولة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">حالة الإشغال</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table._id}>
                      <TableCell className="font-medium">
                        طاولة {table.tableNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${table.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {table.isActive ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">نشطة</Badge>
                          ) : (
                            <Badge variant="secondary">غير نشطة</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${table.isOccupied ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          {table.isOccupied ? (
                            <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">محجوزة</Badge>
                          ) : (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">متاحة</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewQR(table)}
                            data-testid={`button-qr-${table.tableNumber}`}
                          >
                            <QrCode className="w-4 h-4 ml-1" />
                            عرض QR
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTableMutation.mutate(table._id)}
                            disabled={table.isOccupied === 1}
                            data-testid={`button-delete-${table.tableNumber}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                بطاقة QR للطاولة {selectedTable?.tableNumber}
              </DialogTitle>
              <DialogDescription>
                اطبع أو احفظ هذه البطاقة لوضعها على الطاولة
              </DialogDescription>
            </DialogHeader>
            {qrCodeData && selectedTable && (
              <div className="space-y-4">
                <TableQRCard
                  tableNumber={selectedTable.tableNumber}
                  qrToken={qrCodeData.qrToken}
                  branchName={qrCodeData.branchName}
                  tableUrl={qrCodeData.tableUrl}
                />
                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground break-all">
                    {qrCodeData.tableUrl}
                  </p>
                </div>
                <Button
                  onClick={handleDownloadQRCode}
                  className="w-full"
                  data-testid="button-download-qr"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل البطاقة
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
