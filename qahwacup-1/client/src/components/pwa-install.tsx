import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Bell, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    // Set initial notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast({
        title: "تم التثبيت بنجاح",
        description: "يمكنك فتح التطبيق من قائمة تطبيقاتك",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [toast]);

  const getDeviceType = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    if (/mac os/.test(ua)) return "macos";
    return "windows";
  };

  const requestAllPermissions = async () => {
    try {
      // Request notifications
      if ("Notification" in window && Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === "granted") {
          toast({
            title: "تم تفعيل الإشعارات",
            description: "ستصلك إشعارات بحالة طلباتك",
          });
        }
      }

      // Request geolocation
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {},
          () => {},
          { timeout: 3000 }
        );
      }
    } catch (error) {
      // Continue anyway
    }
  };

  const handleInstall = async () => {
    const deviceType = getDeviceType();

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setIsInstalled(true);
        }
      } catch (error) {
        console.error("PWA Installation failed:", error);
      }
    } else {
      // Fallback for when deferredPrompt is not available (e.g., manually triggered or already shown)
      if (deviceType === "ios" || deviceType === "macos") {
        toast({
          title: "تثبيت التطبيق على iPhone/iPad",
          description: "اضغط على زر المشاركة (Share) في الأسفل ثم اختر 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen)",
        });
      } else if (deviceType === "android") {
        toast({
          title: "تثبيت تطبيق أندرويد",
          description: "اضغط على قائمة المتصفح (⋮) في الأعلى ثم اختر 'تثبيت التطبيق' (Install App)",
        });
      } else {
        toast({
          title: "تثبيت التطبيق",
          description: deviceType === "windows" 
            ? "اضغط على أيقونة التثبيت في شريط العنوان (Address Bar) لتثبيت نسخة EXE."
            : "يرجى استخدام متصفح Chrome أو Safari لتثبيت التطبيق.",
        });
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "غير مدعوم",
        description: "متصفحك لا يدعم الإشعارات",
        variant: "destructive",
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      toast({
        title: "تم تفعيل الإشعارات",
        description: "ستصلك تحديثات حول طلباتك",
      });
    } else {
      toast({
        title: "تم رفض الإشعارات",
        description: "يمكنك تفعيلها من إعدادات المتصفح لاحقاً",
        variant: "destructive",
      });
    }
  };

  // Only show install button if not already installed
  if (isInstalled) {
    return null;
  }

  const getButtonText = () => {
    const deviceType = getDeviceType();
    if (deviceType === "windows") return "تحميل نسخة اللابتوب (EXE)";
    if (deviceType === "android") return "تثبيت تطبيق أندرويد";
    if (deviceType === "ios") return "تثبيت على iPhone";
    return "تثبيت التطبيق";
  };

  return null;
}
