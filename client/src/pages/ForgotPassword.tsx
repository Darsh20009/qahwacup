import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Mail, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "خطأ",
        description: "البريد الإلكتروني غير صحيح",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await apiRequest("POST", "/api/customers/forgot-password", { email });
      
      setSent(true);
      toast({
        title: "تم الإرسال!",
        description: "إذا كان البريد الإلكتروني مسجلاً لدينا، ستتلقى رابط إعادة تعيين كلمة المرور",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال الطلب",
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
      dir="rtl"
    >
      <Card className="w-full max-w-md border-amber-900/30 bg-gradient-to-br from-stone-900/95 to-stone-950/95 backdrop-blur shadow-2xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-900/50">
              <Coffee className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-amber-100">
            نسيت كلمة المرور؟
          </CardTitle>
          <CardDescription className="text-amber-200/70 text-lg">
            {sent ? "تم إرسال الرابط" : "أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-100 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-stone-800/50 border-amber-900/50 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-600 focus:ring-amber-600/30"
                  dir="ltr"
                  data-testid="input-email"
                  required
                />
                <p className="text-xs text-amber-200/50 mt-1">
                  أدخل البريد الإلكتروني الذي استخدمته عند إنشاء الحساب
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
                    <span>جارٍ الإرسال...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>إرسال رابط إعادة التعيين</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-700/30">
                <p className="text-green-300 text-sm">
                  إذا كان البريد الإلكتروني مسجلاً لدينا، ستتلقى رابط إعادة تعيين كلمة المرور قريباً.
                </p>
              </div>
              <p className="text-amber-200/70 text-sm">
                لم تتلق الرسالة؟ تحقق من مجلد البريد المزعج أو حاول مرة أخرى.
              </p>
            </div>
          )}

          <div className="pt-4 text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="text-amber-300/70 hover:text-amber-200 transition-colors text-sm underline-offset-4 hover:underline"
              data-testid="link-back"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
