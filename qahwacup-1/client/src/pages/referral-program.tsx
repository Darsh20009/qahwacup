import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Share2, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReferralProgram() {
  const { toast } = useToast();
  const [referralPhone, setReferralPhone] = useState("");
  const [referralEmail, setReferralEmail] = useState("");

  const { data: referrals } = useQuery({
    queryKey: ["/api/referrals"],
    queryFn: async () => {
      const res = await fetch("/api/referrals");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async () =>
      apiRequest("POST", "/api/referrals/invite", {
        referredPhone: referralPhone,
        referredEmail: referralEmail,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      setReferralPhone("");
      setReferralEmail("");
      toast({
        title: "تم إرسال الدعوة",
        description: "تم إرسال رمز الإحالة بنجاح",
      });
    },
  });

  const referralCode = referrals?.code || "LOAD";
  const completedCount = referrals?.completed || 0;
  const totalPoints = referrals?.points || 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: "تم النسخ", description: "تم نسخ الرمز إلى الحافظة" });
  };

  const handleShare = () => {
    const text = `هيا تابعني واستخدم رمزي ${referralCode} واحصل على 50 نقطة!`;
    if (navigator.share) {
      navigator.share({ text, title: "برنامج الإحالات" });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "تم النسخ", description: "تم نسخ رسالة المشاركة" });
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">برنامج الإحالات</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4" data-testid="card-referral-stats">
          <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-sm text-muted-foreground">الإحالات الناجحة</p>
          <p className="text-2xl font-bold">{completedCount}</p>
        </Card>
        <Card className="p-4" data-testid="card-referral-points">
          <Users className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm text-muted-foreground">النقاط المكتسبة</p>
          <p className="text-2xl font-bold">{totalPoints}</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" data-testid="card-referral-code">
        <h3 className="font-semibold mb-3">رمز الإحالة الفريد</h3>
        <div className="flex gap-2 mb-4">
          <Input
            value={referralCode}
            readOnly
            data-testid="input-referral-code"
            className="text-lg font-mono font-bold"
          />
          <Button
            onClick={handleCopyCode}
            size="icon"
            variant="default"
            data-testid="button-copy-code"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={handleShare}
          variant="outline"
          className="w-full"
          data-testid="button-share-referral"
        >
          <Share2 className="w-4 h-4 ml-2" />
          شارك الرمز
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">إحالة صديق جديد</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm mb-2 block">رقم الهاتف</label>
            <Input
              type="tel"
              value={referralPhone}
              onChange={(e) => setReferralPhone(e.target.value)}
              placeholder="رقم الهاتف"
              data-testid="input-referral-phone"
            />
          </div>
          <div>
            <label className="text-sm mb-2 block">البريد الإلكتروني (اختياري)</label>
            <Input
              type="email"
              value={referralEmail}
              onChange={(e) => setReferralEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              data-testid="input-referral-email"
            />
          </div>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!referralPhone || mutation.isPending}
            className="w-full"
            data-testid="button-send-referral"
          >
            {mutation.isPending ? "جاري الإرسال..." : "إرسال الدعوة"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-amber-50 dark:bg-amber-900/20">
        <h3 className="font-semibold mb-3">كيفية برنامج الإحالات</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>شارك رمزك مع الأصدقاء</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>احصل على 50 نقطة لكل إحالة ناجحة</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>الحد الأقصى للنقاط غير محدود</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>استخدم النقاط للحصول على خصومات وعروض</span>
          </li>
        </ul>
      </Card>

      {referrals?.list && referrals.list.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">الإحالات الأخيرة</h3>
          <div className="space-y-2">
            {referrals.list.map((ref: any) => (
              <div
                key={ref.id}
                className="flex justify-between items-center p-3 bg-muted rounded"
                data-testid={`item-referral-${ref.id}`}
              >
                <span>{ref.referredPhone}</span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    ref.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                  }`}
                >
                  {ref.status === "completed" ? "مكتملة" : "قيد الانتظار"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
