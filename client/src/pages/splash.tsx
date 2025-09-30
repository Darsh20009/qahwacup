import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import CoffeeSteam from "@/components/coffee-steam";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import qahwaLogo from "@/assets/qahwa-cup-logo.png";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Luxury progressive animations
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    const textTimer = setTimeout(() => setShowText(true), 1000);
    const buttonTimer = setTimeout(() => setShowButton(true), 1500);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    
    // Auto-navigate to menu after 5 seconds
    const autoNavigateTimer = setTimeout(() => {
      setLocation("/menu");
    }, 5000);
    
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
      clearTimeout(autoNavigateTimer);
      clearInterval(progressInterval);
    };
  }, [setLocation]);

  const handleEnterMenu = () => {
    setLocation("/menu");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col items-center justify-center z-50 overflow-hidden" data-testid="splash-screen">
      {/* Employee Gateway Access - Subtle */}
      <Button
        variant="ghost"
        onClick={() => setLocation("/employee/gateway")}
        className="absolute bottom-4 left-4 text-amber-600 hover:text-amber-800 opacity-50 hover:opacity-100 transition-all"
        data-testid="button-employee-access"
      >
        <span className="text-xs">دخول الموظفين</span>
      </Button>
      {/* Luxury Background Elements with Coffee Theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-amber-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-orange-300/25 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-10 w-28 h-28 bg-amber-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-32 right-32 w-24 h-24 bg-orange-400/15 rounded-full blur-lg animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Floating Coffee Beans Animation */}
        <div className="absolute top-1/4 left-1/4 w-2 h-3 bg-amber-800 rounded-full opacity-40 animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-3 bg-amber-900 rounded-full opacity-30 animate-bounce" style={{animationDelay: '2s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-3 bg-orange-800 rounded-full opacity-35 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
      </div>

      <div className="text-center relative z-10">
        {/* Luxury QahwaCup Logo */}
        <div className={`relative mb-8 transition-all duration-1000 ${showLogo ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-12'}`}>
          <div className="relative">
            <img 
              src={qahwaLogo} 
              alt="QahwaCup Logo" 
              className="w-48 h-48 mx-auto mb-4 relative z-10 drop-shadow-2xl" 
              data-testid="logo-qahwa-cup" 
            />
            {/* Glow Effect */}
            <div className="absolute inset-0 w-48 h-48 mx-auto rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 blur-xl animate-pulse"></div>
          </div>
          <CoffeeSteam />
        </div>
        
        {/* Elegant Welcome Text */}
        <div className={`transition-all duration-1000 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-cairo text-3xl font-light text-amber-800 mb-4" data-testid="text-welcome">
            أهلاً وسهلاً
          </h2>
          <p className="text-amber-700 text-lg mb-8 font-cairo font-light leading-relaxed" data-testid="text-tagline">
            تجربة قهوة فاخرة وأصيلة
          </p>
        </div>
        
        {/* Creative Loading Progress */}
        <div className={`mb-8 transition-all duration-700 ${showButton ? 'opacity-100' : 'opacity-70'}`}>
          <div className="w-64 h-2 bg-amber-200 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300 ease-out"
              style={{width: `${progress}%`}}
            ></div>
          </div>
          <p className="text-amber-600 text-sm mt-2 font-cairo">جاري التحضير... {Math.round(progress)}%</p>
        </div>
        
        {/* Luxury Enter Button */}
        <div className={`transition-all duration-1000 ${showButton ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <Button 
            onClick={handleEnterMenu}
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-16 py-4 text-xl font-semibold transition-all duration-500 shadow-2xl hover:shadow-3xl rounded-2xl border-2 border-amber-400/30 hover:border-amber-300/50 backdrop-blur-sm"
            data-testid="button-enter-menu"
          >
            <ArrowLeft className="w-6 h-6 ml-3" />
            ادخل إلى عالم القهوة
          </Button>
          <p className="text-amber-600 text-sm mt-3 font-cairo opacity-75">
            سيتم الانتقال تلقائياً خلال ثوانٍ...
          </p>
        </div>
      </div>
    </div>
  );
}
