import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import CoffeeSteam from "@/components/coffee-steam";
import { ArrowLeft, Coffee } from "lucide-react";

export default function SplashScreen() {
  const [, setLocation] = useLocation();

  const handleEnterMenu = () => {
    setLocation("/menu");
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 fade-in" data-testid="splash-screen">
      <div className="text-center">
        {/* Coffee Cup Logo with Steam Animation */}
        <div className="relative mb-8">
          <div className="text-8xl mb-4">
            <Coffee className="w-24 h-24 text-primary mx-auto" data-testid="logo-coffee-icon" />
          </div>
          <CoffeeSteam />
        </div>
        
        {/* Logo Text in Arabic */}
        <h1 className="font-amiri text-6xl font-bold text-primary mb-2" data-testid="text-logo-arabic">
          قهوة كوب
        </h1>
        <p className="text-muted-foreground text-xl mb-12" data-testid="text-tagline">
          تجربة قهوة استثنائية
        </p>
        
        {/* Enter Button */}
        <Button 
          onClick={handleEnterMenu}
          size="lg"
          className="btn-primary text-accent-foreground px-12 py-6 text-xl font-semibold shadow-lg hover:shadow-xl"
          data-testid="button-enter-menu"
        >
          <ArrowLeft className="w-6 h-6 ml-3" />
          تصفح المنيو
        </Button>
      </div>
    </div>
  );
}
