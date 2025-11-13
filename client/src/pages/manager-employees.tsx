import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Coffee, Plus, User, Phone, Clock, Percent, LogOut, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Employee } from "@shared/schema";

export default function ManagerEmployees() {
 const [, setLocation] = useLocation();
 const { toast } = useToast();
 const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
 const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

 const { data: employees = [], isLoading } = useQuery<Employee[]>({
 queryKey: ["/api/employees"],
 });

 const createEmployeeMutation = useMutation({
 mutationFn: async (data: any) => {
 const res = await apiRequest("POST", "/api/employees", data);
 return await res.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
 setIsAddDialogOpen(false);
 toast({
 title: "تم إضافة الموظف",
 description: "تم إضافة الموظف بنجاح. يمكنه الآن إنشاء كلمة المرور الخاصةبه.",
 });
 },
 onError: (error: any) => {
 toast({
 variant: "destructive",
 title: "فشل إضافة الموظف",
 description: error.message || "حدث خطأ أثناء إضافة الموظف",
 });
 },
 });

 const updateEmployeeMutation = useMutation({
 mutationFn: async ({ id, data }: { id: string; data: any }) => {
 const res = await apiRequest("PUT", `/api/employees/${id}`, data);
 return await res.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
 setEditingEmployee(null);
 toast({
 title: "تم تحديث الموظف",
 description: "تم تحديث بيانات الموظف بنجاح",
 });
 },
 onError: (error: any) => {
 toast({
 variant: "destructive",
 title: "فشل التحديث",
 description: error.message || "حدث خطأ أثناء تحديث الموظف",
 });
 },
 });

 const handleLogout = () => {
 localStorage.removeItem("currentEmployee");
 setLocation("/employee/gateway");
 };

 const handleSubmitNew = (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 const formData = new FormData(e.currentTarget);
 
 const username = formData.get("username") as string;
 const employeeData = {
 username: username,
 fullName: formData.get("fullName") as string,
 phone: formData.get("phone") as string,
 jobTitle: formData.get("jobTitle") as string,
 role: "cashier",
 shiftTime: formData.get("shiftTime") as string,
 commissionPercentage: parseFloat(formData.get("commissionPercentage") as string) || 0,
 imageUrl: formData.get("imageUrl") as string || undefined,
 };

 createEmployeeMutation.mutate(employeeData);
 };

 const handleSubmitEdit = (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 if (!editingEmployee) return;

 const formData = new FormData(e.currentTarget);
 const employeeData = {
 fullName: formData.get("fullName") as string,
 phone: formData.get("phone") as string,
 jobTitle: formData.get("jobTitle") as string,
 shiftTime: formData.get("shiftTime") as string,
 commissionPercentage: parseFloat(formData.get("commissionPercentage") as string) || 0,
 imageUrl: formData.get("imageUrl") as string || undefined,
 };

 updateEmployeeMutation.mutate({ id: editingEmployee.id || '', data: employeeData });
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4">
 <div className="max-w-7xl mx-auto">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
 <Coffee className="w-6 h-6 text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-amber-500">إدارةالموظفين</h1>
 <p className="text-gray-400 text-sm">لوحةتحكم المدير</p>
 </div>
 </div>
 <div className="flex gap-2">
 <Button
 onClick={() => setLocation("/employee/dashboard")}
 variant="outline"
 className="border-amber-500/50 text-amber-500"
 data-testid="button-dashboard"
 >
 لوحةالتحكم
 </Button>
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

 <div className="mb-6">
 <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
 <DialogTrigger asChild>
 <Button
 className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
 data-testid="button-add-employee"
 >
 <Plus className="w-4 h-4 ml-2" />
 إضافة موظف جديد
 </Button>
 </DialogTrigger>
 <DialogContent className="bg-[#2d1f1a] border-amber-500/20 text-white max-w-2xl">
 <DialogHeader>
 <DialogTitle className="text-amber-500">إضافة موظف جديد</DialogTitle>
 </DialogHeader>
 <form onSubmit={handleSubmitNew} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="fullName" className="text-gray-300">الاسم الكامل *</Label>
 <Input
 id="fullName"
 name="fullName"
 required
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-fullname"
 />
 </div>
 <div>
 <Label htmlFor="username" className="text-gray-300">اسم المستخدم *</Label>
 <Input
 id="username"
 name="username"
 required
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-username"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="phone" className="text-gray-300">رقم الهاتف *</Label>
 <Input
 id="phone"
 name="phone"
 type="tel"
 required
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-phone"
 />
 </div>
 <div>
 <Label htmlFor="jobTitle" className="text-gray-300">الوظيفة*</Label>
 <Select name="jobTitle" required>
 <SelectTrigger className="bg-[#1a1410] border-amber-500/30 text-white" data-testid="select-jobtitle">
 <SelectValue placeholder="اختر الوظيفة" />
 </SelectTrigger>
 <SelectContent className="bg-[#2d1f1a] border-amber-500/20 text-white">
 <SelectItem value="كاشير">كاشير</SelectItem>
 <SelectItem value="محاسب">محاسب</SelectItem>
 <SelectItem value="بائع">بائع</SelectItem>
 <SelectItem value="عارض">عارض</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="shiftTime" className="text-gray-300">وقت الدوام</Label>
 <Input
 id="shiftTime"
 name="shiftTime"
 placeholder="مثال: 8:00 ص - 4:00 م"
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-shifttime"
 />
 </div>
 <div>
 <Label htmlFor="commissionPercentage" className="text-gray-300">نسبةالعمولة(%)</Label>
 <Input
 id="commissionPercentage"
 name="commissionPercentage"
 type="number"
 step="0.1"
 min="0"
 max="100"
 defaultValue="0"
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-commission"
 />
 </div>
 </div>

 <div>
 <Label htmlFor="imageUrl" className="text-gray-300">رابط الصورة </Label>
 <Input
 id="imageUrl"
 name="imageUrl"
 type="url"
 placeholder="https://example.com/image.jpg"
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-imageurl"
 />
 </div>

 <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
 <p className="text-sm text-amber-500/90">
  سيتم إنشاء الموظف بدون كلمة مرور. يجب على الموظف الذهاب إلى صفحة "موظف جديد" لإنشاء كلمة المرور الخاصةبه.
 </p>
 </div>

 <div className="flex justify-end gap-2">
 <Button
 type="button"
 variant="outline"
 onClick={() => setIsAddDialogOpen(false)}
 className="border-gray-600 text-gray-300"
 data-testid="button-cancel-add"
 >
 إلغاء
 </Button>
 <Button
 type="submit"
 disabled={createEmployeeMutation.isPending}
 className="bg-gradient-to-r from-amber-500 to-amber-700"
 data-testid="button-submit-add"
 >
 {createEmployeeMutation.isPending ? "جاري الإضافة..." : "إضافة الموظف"}
 </Button>
 </div>
 </form>
 </DialogContent>
 </Dialog>
 </div>

 {isLoading ? (
 <div className="text-center text-amber-500 py-12">جاري تحميل الموظفين...</div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {employees.map((employee) => (
 <Card
 key={employee.id}
 className="bg-gradient-to-br from-[#2d1f1a] to-[#1a1410] border-amber-500/20 overflow-hidden"
 data-testid={`card-employee-${employee.id}`}
 >
 <CardHeader className="bg-gradient-to-r from-amber-500/20 to-amber-700/20">
 <div className="flex items-center justify-between">
 <CardTitle className="text-amber-500 flex items-center gap-2">
 {employee.imageUrl ? (
 <img
 src={employee.imageUrl}
 alt={employee.fullName}
 className="w-10 h-10 rounded-full object-cover"
 />
 ) : (
 <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
 <User className="w-6 h-6 text-white" />
 </div>
 )}
 <span>{employee.fullName}</span>
 </CardTitle>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => setEditingEmployee(employee)}
 className="text-amber-500 hover:bg-amber-500/10"
 data-testid={`button-edit-${employee.id}`}
 >
 <Edit className="w-4 h-4" />
 </Button>
 </div>
 </CardHeader>
 <CardContent className="pt-4 space-y-3">
 <div className="flex items-center gap-2 text-gray-300">
 <User className="w-4 h-4 text-amber-500" />
 <span className="text-sm">{employee.jobTitle}</span>
 <Badge
 className={employee.isActivated ? "bg-green-500" : "bg-orange-500"}
 data-testid={`badge-status-${employee.id}`}
 >
 {employee.isActivated ? "مفعّل" : "غير مفعّل"}
 </Badge>
 </div>

 <div className="flex items-center gap-2 text-gray-300">
 <Phone className="w-4 h-4 text-amber-500" />
 <span className="text-sm">{employee.phone}</span>
 </div>

 {employee.shiftTime && (
 <div className="flex items-center gap-2 text-gray-300">
 <Clock className="w-4 h-4 text-amber-500" />
 <span className="text-sm">{employee.shiftTime}</span>
 </div>
 )}

 {employee.commissionPercentage !== undefined && employee.commissionPercentage > 0 && (
 <div className="flex items-center gap-2 text-gray-300">
 <Percent className="w-4 h-4 text-amber-500" />
 <span className="text-sm">عمولة: {employee.commissionPercentage}%</span>
 </div>
 )}

 <div className="pt-2 border-t border-amber-500/20">
 <p className="text-xs text-gray-400">اسم المستخدم: {employee.username}</p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 )}

 {editingEmployee && (
 <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
 <DialogContent className="bg-[#2d1f1a] border-amber-500/20 text-white max-w-2xl">
 <DialogHeader>
 <DialogTitle className="text-amber-500">تعديل بيانات الموظف</DialogTitle>
 </DialogHeader>
 <form onSubmit={handleSubmitEdit} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="edit-fullName" className="text-gray-300">الاسم الكامل *</Label>
 <Input
 id="edit-fullName"
 name="fullName"
 required
 defaultValue={editingEmployee.fullName}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-fullname"
 />
 </div>
 <div>
 <Label htmlFor="edit-phone" className="text-gray-300">رقم الهاتف *</Label>
 <Input
 id="edit-phone"
 name="phone"
 type="tel"
 required
 defaultValue={editingEmployee.phone}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-phone"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="edit-jobTitle" className="text-gray-300">الوظيفة*</Label>
 <Select name="jobTitle" defaultValue={editingEmployee.jobTitle} required>
 <SelectTrigger className="bg-[#1a1410] border-amber-500/30 text-white" data-testid="select-edit-jobtitle">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="bg-[#2d1f1a] border-amber-500/20 text-white">
 <SelectItem value="كاشير">كاشير</SelectItem>
 <SelectItem value="محاسب">محاسب</SelectItem>
 <SelectItem value="بائع">بائع</SelectItem>
 <SelectItem value="عارض">عارض</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="edit-shiftTime" className="text-gray-300">وقت الدوام</Label>
 <Input
 id="edit-shiftTime"
 name="shiftTime"
 defaultValue={editingEmployee.shiftTime}
 placeholder="مثال: 8:00 ص - 4:00 م"
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-shifttime"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="edit-commissionPercentage" className="text-gray-300">نسبةالعمولة(%)</Label>
 <Input
 id="edit-commissionPercentage"
 name="commissionPercentage"
 type="number"
 step="0.1"
 min="0"
 max="100"
 defaultValue={editingEmployee.commissionPercentage || 0}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-commission"
 />
 </div>
 <div>
 <Label htmlFor="edit-imageUrl" className="text-gray-300">رابط الصورة </Label>
 <Input
 id="edit-imageUrl"
 name="imageUrl"
 type="url"
 defaultValue={editingEmployee.imageUrl}
 placeholder="https://example.com/image.jpg"
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-imageurl"
 />
 </div>
 </div>

 <div className="flex justify-end gap-2">
 <Button
 type="button"
 variant="outline"
 onClick={() => setEditingEmployee(null)}
 className="border-gray-600 text-gray-300"
 data-testid="button-cancel-edit"
 >
 إلغاء
 </Button>
 <Button
 type="submit"
 disabled={updateEmployeeMutation.isPending}
 className="bg-gradient-to-r from-amber-500 to-amber-700"
 data-testid="button-submit-edit"
 >
 {updateEmployeeMutation.isPending ? "جاري التحديث..." : "حفظ التغييرات"}
 </Button>
 </div>
 </form>
 </DialogContent>
 </Dialog>
 )}
 </div>
 </div>
 );
}
