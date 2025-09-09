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
    <div className="fixed inset-0 bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center z-50 overflow-hidden" data-testid="splash-screen">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-xl animate-spin" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-to-r from-cyan-400/25 to-blue-500/25 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-gradient-to-r from-green-400/20 to-teal-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-r from-yellow-400/15 to-red-500/15 rounded-full blur-2xl animate-spin" style={{animationDuration: '12s', animationDirection: 'reverse'}}></div>
        
        {/* Dynamic Coffee Elements */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-orange-400 rounded-full animate-bounce opacity-70" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-3/4 left-1/4 w-3 h-3 bg-pink-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-bounce opacity-50" style={{animationDelay: '1.5s'}}></div>
        
        {/* Magical Sparkles */}
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
      </div>

      <div className="text-center relative z-10">
        {/* Creative Coffee Cup with 3D Effect */}
        <div className="relative mb-16">
          <div className="relative transform coffee-3d">
            <div className="absolute inset-0 bg-gradient-conic from-pink-500 via-yellow-400 to-cyan-500 rounded-full blur-3xl animate-pulse opacity-40"></div>
            <Coffee className="w-40 h-40 text-white mx-auto mb-4 relative z-10 drop-shadow-2xl filter brightness-110" data-testid="logo-coffee-icon" />
          </div>
          <CoffeeSteam />
        </div>
        
        {/* Creative Arabic Logo with Rainbow Effect */}
        <div className={`transition-all duration-1000 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h1 className="font-amiri text-8xl font-black bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent mb-8 animate-pulse drop-shadow-2xl shimmer" data-testid="text-logo-arabic">
            قهوة كوب
          </h1>
          <div className="relative">
            <p className="text-white text-3xl mb-16 font-cairo font-light tracking-widest opacity-90 text-shadow-lg" data-testid="text-tagline">
              🌟 حيث تلتقي النكهة بالإبداع 🌟
            </p>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
          </div>
        </div>
        
        {/* Futuristic Enter Button */}
        <div className={`transition-all duration-1000 ${showButton ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'}`}>
          <Button 
            onClick={handleEnterMenu}
            size="lg"
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-20 py-10 text-3xl font-bold hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 border-2 border-white/20 rounded-full backdrop-blur-sm glow-effect"
            data-testid="button-enter-menu"
          >
            <ArrowLeft className="w-10 h-10 ml-4" />
            استكشف عالم القهوة
          </Button>
        </div>
      </div>
    </div>
  );
}
