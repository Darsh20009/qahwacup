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
    <div className="fixed inset-0 bg-gradient-to-b from-black to-gray-900 flex flex-col items-center justify-center z-50" data-testid="splash-screen">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl"></div>
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
