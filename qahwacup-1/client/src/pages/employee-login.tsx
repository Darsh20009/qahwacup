import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, User, Lock, Loader2, Eye, EyeOff, QrCode } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Employee } from "@shared/schema";
import { Html5QrcodeScanner } from "html5-qrcode";

import logoImg from "@assets/Elegant Coffee Culture Design_1757428233689.png";

export default function EmployeeLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const qrScannerRef = useRef<Html5QrcodeScanner | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username?: string; employeeId?: string; password?: string }) => {
      const isQRLogin = !!credentials.employeeId && !credentials.username;
      const endpoint = isQRLogin ? "/api/employees/login-qr" : "/api/employees/login";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }
      
      return response.json() as Promise<Employee>;
    },
    onSuccess: (employee) => {
      localStorage.setItem("currentEmployee", JSON.stringify(employee));
      setLocation("/employee/dashboard");
    },
    onError: () => {
      setError("بيانات تسجيل الدخول غير صحيحة");
      setPassword("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("الرجاء إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    loginMutation.mutate({ username, password });
  };

  useEffect(() => {
    if (!showQRScanner) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        try {
          const scannedEmployeeId = decodedText.trim();
          if (scannedEmployeeId) {
            setError("");
            scanner.clear();
            setShowQRScanner(false);
            loginMutation.mutate({
              employeeId: scannedEmployeeId,
            });
          } else {
            setError("صيغة QR غير صحيحة");
          }
        } catch (err) {
          setError("خطأ في قراءة QR الكود");
        }
      },
      (error) => {
        console.debug("QR scan error:", error);
      }
    );

    qrScannerRef.current = scanner;

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().catch(() => {});
      }
    };
  }, [showQRScanner, loginMutation]);

  const handleToggleQRScanner = () => {
    setError("");
    setShowQRScanner(!showQRScanner);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
            <img src={logoImg} alt="قهوة كوب" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">قهوة كوب</h1>
          <p className="text-muted-foreground">تسجيل دخول الموظف</p>
        </div>

        {showQRScanner ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                مسح بطاقة الموظف
              </CardTitle>
              <CardDescription className="text-center">
                وجه الكاميرا نحو QR الكود الموجود على بطاقتك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div id="qr-reader" className="w-full" />
              {error && (
                <p className="text-destructive text-sm text-center" data-testid="text-qr-error">
                  {error}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleQRScanner}
                className="w-full"
                data-testid="button-cancel-qr"
              >
                إلغاء
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                تسجيل الدخول
              </CardTitle>
              <CardDescription className="text-center">
                أدخل بيانات حسابك للوصول
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="اسم المستخدم"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pr-10"
                      data-testid="input-username"
                      autoFocus
                      disabled={loginMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 pl-10"
                      data-testid="input-password"
                      disabled={loginMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setLocation("/employee/forgot-password")}
                      className="text-xs text-primary hover:text-primary/80 underline"
                      data-testid="link-forgot-password"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  {error && (
                    <p className="text-destructive text-sm text-right" data-testid="text-error">
                      {error}
                    </p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full"
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    "دخول"
                  )}
                </Button>

                <div className="pt-4 border-t border-border space-y-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleToggleQRScanner}
                    className="w-full"
                    data-testid="button-scan-qr"
                  >
                    <QrCode className="w-4 h-4 ml-2" />
                    مسح بطاقة الموظف
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">موظف جديد؟</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/employee/activate")}
                    className="w-full"
                    data-testid="button-activate"
                  >
                    تفعيل حساب جديد
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation("/employee/gateway")}
            data-testid="link-back"
          >
            رجوع
          </Button>
        </div>
      </div>
    </div>
  );
}
