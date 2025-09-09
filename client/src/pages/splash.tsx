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
    // Sequence the animations
    const textTimer = setTimeout(() => setShowText(true), 2000);
    const buttonTimer = setTimeout(() => setShowButton(true), 4000);
    
    return () => {
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleEnterMenu = () => {
    setLocation("/menu");
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50" data-testid="splash-screen">
      {/* Creative Dark Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-yellow-400/8 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-yellow-600/6 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-yellow-300/7 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="text-center relative z-10">
        {/* Elegant Coffee Cup */}
        <div className="relative mb-12">
          <div className="relative">
            <Coffee className="w-24 h-24 text-yellow-400 mx-auto mb-4" data-testid="logo-coffee-icon" />
          </div>
          <CoffeeSteam />
        </div>
        
        {/* Elegant Arabic Logo Text */}
        <div className={`transition-all duration-1000 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="font-amiri text-6xl font-bold text-yellow-400 mb-4" data-testid="text-logo-arabic">
            قهوة كوب
          </h1>
          <p className="text-yellow-200 text-xl mb-12 font-cairo" data-testid="text-tagline">
            لكل لحظة قهوة، لحظة مميزة
          </p>
        </div>
        
        {/* Elegant Enter Button */}
        <div className={`transition-all duration-1000 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Button 
            onClick={handleEnterMenu}
            size="lg"
            className="bg-yellow-500 text-black px-12 py-6 text-xl font-semibold hover:bg-yellow-400 transition-all duration-300 shadow-lg"
            data-testid="button-enter-menu"
          >
            <ArrowLeft className="w-6 h-6 ml-3" />
            تصفح المنيو
          </Button>
        </div>
      </div>
    </div>
  );
}
