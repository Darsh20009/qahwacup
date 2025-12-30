import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Phone, User, Store, ArrowRight, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AdminBranches() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    address: '',
    phone: '',
    location: { lat: 24.7136, lng: 46.6753 }
  });

  const { data: branches, isLoading } = useQuery({
    queryKey: ['/api/branches'],
    queryFn: async () => {
      const res = await fetch('/api/branches');
      if (!res.ok) throw new Error('Failed to fetch branches');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create branch');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "تم إنشاء الفرع بنجاح",
        description: data.manager?.message || "تم إنشاء الفرع وتعيين المدير.",
      });
      setShowAddForm(false);
      setFormData({ nameAr: '', nameEn: '', address: '', phone: '', location: { lat: 24.7136, lng: 46.6753 } });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء الفرع",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr) return;
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
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة فرع جديد
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10">
          <CardHeader>
            <CardTitle>بيانات الفرع الجديد</CardTitle>
            <CardDescription>سيتم إنشاء حساب مدير للفرع تلقائياً عند الحفظ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم الفرع (بالعربية)</label>
                  <Input 
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    placeholder="فرع المربع"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم الفرع (بالإنجليزي)</label>
                  <Input 
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                    placeholder="Al-Murabba Branch"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">العنوان</label>
                  <Input 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="الرياض، طريق الملك فهد"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف</label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0501234567"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                  حفظ الفرع
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
            <p className="mt-2 text-muted-foreground">جاري تحميل الفروع...</p>
          </div>
        ) : branches?.length > 0 ? (
          branches.map((branch: any) => (
            <Card key={branch.id} className="hover:shadow-md transition-shadow border-orange-100 dark:border-orange-900/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">{branch.nameAr}</CardTitle>
                  <Store className="w-5 h-5 text-orange-600" />
                </div>
                <CardDescription>{branch.nameEn}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {branch.address || 'لا يوجد عنوان'}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {branch.phone || 'لا يوجد هاتف'}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  المدير: {branch.managerName || 'غير معين'}
                </div>
              </CardContent>
            </Card>
          ))
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
