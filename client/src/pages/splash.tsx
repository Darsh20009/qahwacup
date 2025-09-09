import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import CoffeeSteam from "@/components/coffee-steam";
import { ArrowLeft, Coffee, Sparkles, Star } from "lucide-react";
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
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center z-50 overflow-hidden" data-testid="splash-screen">
      {/* Sparkle Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="sparkle" style={{top: '15%', left: '10%', animationDelay: '0s'}}></div>
        <div className="sparkle" style={{top: '25%', right: '15%', animationDelay: '0.5s'}}></div>
        <div className="sparkle" style={{top: '45%', left: '20%', animationDelay: '1s'}}></div>
        <div className="sparkle" style={{top: '65%', right: '25%', animationDelay: '1.5s'}}></div>
        <div className="sparkle" style={{top: '80%', left: '30%', animationDelay: '0.8s'}}></div>
        <div className="sparkle" style={{top: '35%', right: '40%', animationDelay: '1.2s'}}></div>
        <div className="sparkle" style={{top: '55%', left: '60%', animationDelay: '0.3s'}}></div>
        <div className="sparkle" style={{top: '75%', right: '50%', animationDelay: '1.8s'}}></div>
      </div>
      
      {/* Floating Golden Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute w-4 h-4 text-yellow-400 animate-pulse" style={{top: '20%', left: '5%', animationDelay: '0s'}} />
        <Sparkles className="absolute w-3 h-3 text-yellow-300 animate-bounce" style={{top: '30%', right: '10%', animationDelay: '1s'}} />
        <Star className="absolute w-5 h-5 text-yellow-500 animate-pulse" style={{top: '70%', left: '8%', animationDelay: '2s'}} />
        <Sparkles className="absolute w-4 h-4 text-yellow-400 animate-bounce" style={{top: '80%', right: '12%', animationDelay: '0.5s'}} />
      </div>

      <div className="text-center relative z-10">
        {/* Creative Coffee Animation Container */}
        <div className="relative mb-12 h-40 w-40 mx-auto">
          {/* Main Coffee Cup with 3D effect */}
          <div className="relative coffee-pour coffee-fill breath glow-effect">
            <Coffee className="w-32 h-32 text-primary mx-auto coffee-3d" data-testid="logo-coffee-icon" />
          </div>
          
          {/* Steam Animation */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <CoffeeSteam />
          </div>
          
          {/* Floating Sparkles around the cup */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
          </div>
        </div>
        
        {/* Animated Arabic Logo Text */}
        <div className={`transition-all duration-1000 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="font-amiri text-7xl font-bold golden-gradient mb-4 text-reveal shimmer" data-testid="text-logo-arabic">
            قهوة كوب
          </h1>
          <p className="text-yellow-200 text-2xl mb-16 font-cairo font-medium animate-pulse" data-testid="text-tagline">
            ✨ لكل لحظة قهوة، لحظة إبداع ✨
          </p>
        </div>
        
        {/* Animated Enter Button */}
        <div className={`transition-all duration-1000 ${showButton ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}`}>
          <Button 
            onClick={handleEnterMenu}
            size="lg"
            className="btn-primary text-accent-foreground px-16 py-8 text-2xl font-bold shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transform transition-all duration-300 glow-effect border-2 border-yellow-400/50"
            data-testid="button-enter-menu"
          >
            <ArrowLeft className="w-8 h-8 ml-4" />
            ادخل إلى عالم القهوة
            <Sparkles className="w-6 h-6 mr-4 animate-spin" />
          </Button>
        </div>
      </div>
      
      {/* Cinematic Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-yellow-900/20 to-transparent pointer-events-none"></div>
    </div>
  );
}
