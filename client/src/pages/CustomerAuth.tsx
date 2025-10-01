import { useState } from "react";
import { useLocation } from "wouter";
import { useCustomer } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Phone, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerAuth() {
  const [, navigate] = useLocation();
  const { setCustomer } = useCustomer();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم جوال صحيح",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest("POST", "/api/customers/auth", {
        phone: phone.replace(/\s/g, ''),
        name: name.trim() || undefined
      });
      
      const customer = await res.json();
      setCustomer(customer);
      
      toast({
        title: "مرحباً بك!",
        description: name ? `أهلاً ${name}، تم تسجيل دخولك بنجاح` : "تم تسجيل دخولك بنجاح",
      });

      navigate("/");
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #1a1410 100%)",
      }}
    >
      <Card className="w-full max-w-md border-amber-900/30 bg-gradient-to-br from-stone-900/95 to-stone-950/95 backdrop-blur shadow-2xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-900/50">
              <Coffee className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-amber-100">
            مرحباً بك في كوب
          </CardTitle>
          <CardDescription className="text-amber-200/70 text-lg">
            سجل دخولك للحصول على بطاقة كوبي الخاصة بك
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-amber-100 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الجوال
              </Label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/70 font-semibold">
                  +966
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="5xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pr-16 bg-stone-800/50 border-amber-900/50 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-600 focus:ring-amber-600/30"
                  dir="ltr"
                  data-testid="input-phone"
                  required
                />
              </div>
              <p className="text-xs text-amber-200/50 mt-1">
                ابدأ بـ 5 ثم باقي الأرقام (9 أرقام)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-amber-100 flex items-center gap-2">
                <User className="w-4 h-4" />
                الاسم (اختياري)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="أدخل اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-stone-800/50 border-amber-900/50 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-600 focus:ring-amber-600/30"
                data-testid="input-name"
              />
              <p className="text-xs text-amber-200/50 mt-1">
                يساعدنا على تخصيص تجربتك
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg shadow-amber-900/50 transition-all duration-300 hover:scale-[1.02]"
              data-testid="button-submit"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جارٍ التسجيل...</span>
                </div>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>

            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-amber-300/70 hover:text-amber-200 transition-colors text-sm underline-offset-4 hover:underline"
                data-testid="link-skip"
              >
                تخطي وتصفح القائمة
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
