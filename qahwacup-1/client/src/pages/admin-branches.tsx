import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, MapPin, Phone, User, Store, ArrowRight, Loader2, Edit2 } from 'lucide-react';
import { useLocation } from 'wouter';

interface Branch {
  id?: string;
  _id?: string;
  nameAr: string;
  nameEn?: string;
  address?: string;
  phone?: string;
  managerName?: string;
}

export default function AdminBranches() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    address: '',
    phone: '',
  });

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/branches', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم إنشاء الفرع بنجاح",
        description: "تم إنشاء الفرع وتعيين المدير.",
      });
      setIsAddDialogOpen(false);
      setFormData({ nameAr: '', nameEn: '', address: '', phone: '' });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء الفرع",
        description: error?.message || "حدث خطأ عند إنشاء الفرع",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم الفرع بالعربية",
        variant: "destructive"
      });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-slate-950 min-h-screen" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">إدارة الفروع</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل فروع المقهى</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة فرع جديد
        </Button>
      </div>

      {/* Add Branch Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة فرع جديد</DialogTitle>
            <DialogDescription>
              سيتم إنشاء حساب مدير للفرع تلقائياً عند الحفظ
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم الفرع (بالعربية) *</Label>
                <Input 
                  id="nameAr"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                  placeholder="فرع المربع"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">اسم الفرع (بالإنجليزي)</Label>
                <Input 
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                  placeholder="Al-Murabba Branch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input 
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="الرياض، طريق الملك فهد"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input 
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="0501234567"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 ml-2" />
                    حفظ الفرع
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
            <p className="mt-2 text-muted-foreground">جاري تحميل الفروع...</p>
          </div>
        ) : branches && branches.length > 0 ? (
          branches.map((branch) => {
            const branchId = branch.id || branch._id;
            return (
              <Card key={branchId} className="hover:shadow-md transition-shadow border-orange-100 dark:border-orange-900/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{branch.nameAr}</CardTitle>
                    <Store className="w-5 h-5 text-orange-600" />
                  </div>
                  {branch.nameEn && <CardDescription>{branch.nameEn}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-3">
                  {branch.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {branch.address}
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {branch.phone}
                    </div>
                  )}
                  {branch.managerName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      المدير: {branch.managerName}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-800">
            <Store className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold">لا توجد فروع مضافة</h3>
            <p className="text-muted-foreground">ابدأ بإضافة أول فرع للمقهى الخاص بك</p>
          </div>
        )}
      </div>
    </div>
  );
}
