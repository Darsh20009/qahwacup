import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import logoImage from "@assets/Elegant Coffee Culture Design_1757441959827.png";

export default function EmployeeSplash() {
  const [, setLocation] = useLocation();
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    const textTimer = setTimeout(() => setShowText(true), 800);
    const subtextTimer = setTimeout(() => setShowSubtext(true), 1200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 200);

    const autoNavigateTimer = setTimeout(() => {
      setLocation("/employee/gateway");
    }, 4000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(subtextTimer);
      clearTimeout(autoNavigateTimer);
      clearInterval(progressInterval);
    };
  }, [setLocation]);

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#0d0a08] flex flex-col items-center justify-center z-50 overflow-hidden px-4"
      data-testid="employee-splash-screen"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top left glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl animate-pulse"></div>
        {/* Bottom right glow */}
        <div
          className="absolute -bottom-32 -right-32 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        {/* Center glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.75s" }}
        ></div>

        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400 rounded-full opacity-30 animate-float" style={{ animationDuration: "6s" }}></div>
        <div
          className="absolute top-40 right-32 w-1.5 h-1.5 bg-orange-400 rounded-full opacity-20 animate-float"
          style={{ animationDuration: "8s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-2 h-2 bg-amber-500 rounded-full opacity-25 animate-float"
          style={{ animationDuration: "7s", animationDelay: "2s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <div
          className={`mb-8 transition-all duration-1000 transform ${
            showLogo
              ? "opacity-100 scale-100"
              : "opacity-0 scale-50"
          }`}
        >
          <div className="relative">
            <img
              src={logoImage}
              alt="قهوة جاري"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-cover rounded-2xl shadow-2xl animate-bounce"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-500/30 blur-xl"></div>
          </div>
        </div>

        {/* Main Text */}
        <div
          className={`text-center mb-8 transition-all duration-1000 transform ${
            showText
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-amber-500 mb-2 drop-shadow-lg">
            قهوة جاري
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Subtext */}
        <div
          className={`text-center mb-12 transition-all duration-1000 transform ${
            showSubtext
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-lg sm:text-xl text-gray-400 mb-2">
            نظام إدارة الموظفين
          </p>
          <p className="text-sm sm:text-base text-gray-500">
            جاري التحميل...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden shadow-lg">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0a08] to-transparent pointer-events-none"></div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
