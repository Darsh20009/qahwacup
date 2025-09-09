import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import CoffeeSteam from "@/components/coffee-steam";
import { ArrowLeft, Coffee } from "lucide-react";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Fast, elegant animations
    const textTimer = setTimeout(() => setShowText(true), 800);
    const buttonTimer = setTimeout(() => setShowButton(true), 1200);
    
    return () => {
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleEnterMenu = () => {
    setLocation("/menu");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center z-50 overflow-hidden" data-testid="splash-screen">
      {/* Soft Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-indigo-200/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-slate-200/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="text-center relative z-10">
        {/* Simple Coffee Cup */}
        <div className="relative mb-12">
          <div className="relative">
            <Coffee className="w-24 h-24 text-slate-600 mx-auto mb-4 relative z-10" data-testid="logo-coffee-icon" />
          </div>
          <CoffeeSteam />
        </div>
        
        {/* Clean Arabic Logo */}
        <div className={`transition-all duration-700 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="font-amiri text-6xl font-bold text-slate-700 mb-6" data-testid="text-logo-arabic">
            قهوة كوب
          </h1>
          <p className="text-slate-500 text-xl mb-12 font-cairo font-light" data-testid="text-tagline">
            تجربة قهوة استثنائية
          </p>
        </div>
        
        {/* Simple Enter Button */}
        <div className={`transition-all duration-700 ${showButton ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <Button 
            onClick={handleEnterMenu}
            size="lg"
            className="bg-slate-600 hover:bg-slate-700 text-white px-12 py-6 text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
            data-testid="button-enter-menu"
          >
            <ArrowLeft className="w-6 h-6 ml-3" />
            ابدأ رحلة القهوة
          </Button>
        </div>
      </div>
    </div>
  );
}
