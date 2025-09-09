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
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden" data-testid="splash-screen">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-56 h-56 bg-gradient-radial from-yellow-500/15 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-radial from-yellow-400/12 to-transparent rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute top-1/2 left-10 w-40 h-40 bg-gradient-radial from-yellow-600/10 to-transparent rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-44 h-44 bg-gradient-radial from-yellow-300/8 to-transparent rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        
        {/* Floating Coffee Beans */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-yellow-600 rounded-full animate-bounce opacity-60" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-bounce opacity-50" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-40" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="text-center relative z-10">
        {/* Premium Coffee Cup with Effects */}
        <div className="relative mb-12">
          <div className="relative transform hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl animate-pulse"></div>
            <Coffee className="w-32 h-32 text-yellow-400 mx-auto mb-4 relative z-10 drop-shadow-2xl animate-pulse" data-testid="logo-coffee-icon" />
          </div>
          <CoffeeSteam />
        </div>
        
        {/* Luxurious Arabic Logo Text */}
        <div className={`transition-all duration-700 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="font-amiri text-7xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-6 animate-pulse drop-shadow-2xl" data-testid="text-logo-arabic">
            قهوة كوب
          </h1>
          <p className="text-yellow-200 text-2xl mb-12 font-cairo font-light tracking-wider opacity-80" data-testid="text-tagline">
            ✨ تجربة قهوة استثنائية ✨
          </p>
        </div>
        
        {/* Premium Enter Button */}
        <div className={`transition-all duration-700 ${showButton ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <Button 
            onClick={handleEnterMenu}
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-16 py-8 text-2xl font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 border-2 border-yellow-400/50"
            data-testid="button-enter-menu"
          >
            <ArrowLeft className="w-8 h-8 ml-4" />
            ابدأ رحلة القهوة
          </Button>
        </div>
      </div>
    </div>
  );
}
