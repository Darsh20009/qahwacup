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

export default function EmployeeLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const qrScannerRef = useRef<Html5QrcodeScanner | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/employees/login", {
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
      setError("اسم المستخدم أو كلمة المرور غير صحيحة ");
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

  // Handle QR code scan result
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
          // Parse QR code data: expecting format like "username:password"
          const [scannedUsername, scannedPassword] = decodedText.split(":");
          if (scannedUsername && scannedPassword) {
            setUsername(scannedUsername);
            setPassword(scannedPassword);
            setError("");
            scanner.clear();
            setShowQRScanner(false);
            // Auto-login after a short delay
            setTimeout(() => {
              loginMutation.mutate({
                username: scannedUsername,
                password: scannedPassword,
              });
            }, 500);
          } else {
            setError("صيغة QR غير صحيحة");
          }
        } catch (err) {
          setError("خطأ في قراءة QR الكود");
        }
      },
      (error) => {
        // Only log errors, don't display them to avoid spam
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full mb-4">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-amber-500 mb-2">قهوة كوب</h1>
          <p className="text-gray-400">تسجيل دخول الموظف</p>
        </div>

        {showQRScanner ? (
          <Card className="bg-[#2d1f1a] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-amber-500">
                مسح بطاقة الموظف
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                وجه الكاميرا نحو QR الكود الموجود على بطاقتك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div id="qr-reader" className="w-full" />
              {error && (
                <p className="text-red-500 text-sm text-center" data-testid="text-qr-error">
                  {error}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleQRScanner}
                className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                data-testid="button-cancel-qr"
              >
                إلغاء
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#2d1f1a] border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-amber-500">
                تسجيل الدخول
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                أدخل بيانات حسابك للوصول
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-5 w-5 text-amber-500" />
                    <Input
                      type="text"
                      placeholder="اسم المستخدم"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pr-10 bg-[#1a1410] border-amber-500/30 text-white placeholder:text-gray-500 text-right"
                      data-testid="input-username"
                      autoFocus
                      disabled={loginMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-amber-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 pl-10 bg-[#1a1410] border-amber-500/30 text-white placeholder:text-gray-500 text-right"
                      data-testid="input-password"
                      disabled={loginMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-amber-500 hover:text-amber-400"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setLocation("/employee/forgot-password")}
                      className="text-xs text-amber-500 hover:text-amber-400 underline"
                      data-testid="link-forgot-password"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm text-right" data-testid="text-error">
                      {error}
                    </p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold"
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    "دخول"
                  )}
                </Button>

                <div className="pt-4 border-t border-amber-500/20 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleToggleQRScanner}
                    className="w-full border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                    data-testid="button-scan-qr"
                  >
                    <QrCode className="w-4 h-4 ml-2" />
                    مسح بطاقة الموظف
                  </Button>

                  <p className="text-sm text-gray-400 text-center">موظف جديد؟</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/employee/activate")}
                    className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
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
            className="text-amber-500 hover:text-amber-400"
            data-testid="link-back"
          >
            رجوع
          </Button>
        </div>
      </div>
    </div>
  );
}
