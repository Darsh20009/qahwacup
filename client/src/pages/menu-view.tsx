import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Play, Pause, SkipForward, SkipBack, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CoffeeItem {
  id: string;
  nameAr: string;
  nameEn: string | null;
  description: string;
  price: string;
  oldPrice: string | null;
  category: string;
  imageUrl: string | null;
  isAvailable: number;
}

export default function MenuView() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Fetch coffee items
  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
    enabled: isAuthenticated,
  });

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || coffeeItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % coffeeItems.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, coffeeItems.length]);

  const handleLogin = () => {
    if (password === "182009") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("كلمة المرور غير صحيحة");
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % coffeeItems.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + coffeeItems.length) % coffeeItems.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <Card className="w-full max-w-md p-8 bg-card/90 backdrop-blur-md border-2 border-primary/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary font-amiri mb-2">
              عرض القائمة
            </h1>
            <p className="text-muted-foreground">
              قسم خاص بالموظفين
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                كلمة المرور
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10 bg-background/50 border-primary/30"
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500" data-testid="text-error">
                  {error}
                </p>
              )}
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={handleLogin} 
                className="flex-1"
                data-testid="button-login"
              >
                دخول
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")}
                data-testid="button-back"
              >
                رجوع
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">جاري تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  const currentItem = coffeeItems[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
      
      {/* Controls Bar */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
          <div className="flex items-center space-x-4 bg-card/80 backdrop-blur-md rounded-xl px-4 py-2 border border-primary/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              data-testid="button-previous"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAutoPlay}
              data-testid="button-autoplay"
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              data-testid="button-next"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-4 bg-card/80 backdrop-blur-md rounded-xl px-4 py-2 border border-primary/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAuthenticated(false)}
              data-testid="button-logout"
            >
              خروج
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-8">
        {currentItem && (
          <div 
            key={currentItem.id}
            className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-in fade-in-0 slide-in-from-bottom-10 duration-1000"
          >
            {/* Image Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-xl"></div>
              <div className="relative bg-card/90 backdrop-blur-md rounded-3xl p-8 border-2 border-primary/30 shadow-2xl">
                <img 
                  src={currentItem.imageUrl || "/api/placeholder/400/400"}
                  alt={currentItem.nameAr}
                  className="w-full h-80 object-cover rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-105"
                  data-testid="img-current-drink"
                />
                <div className="absolute -bottom-4 -right-4 bg-primary/90 backdrop-blur-md rounded-full px-6 py-3 border border-primary/50">
                  <span className="text-primary-foreground font-bold text-lg">
                    {currentItem.price} ريال
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-8">
              {/* Brand Message Animation */}
              <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-10 duration-1000 delay-500">
                <h1 className="text-5xl font-bold text-primary font-amiri mb-4 typing-animation">
                  قهوة كوب
                </h1>
                <p className="text-xl text-muted-foreground font-medium typing-animation-delay">
                  لكل لحظة قهوة ، لحظة نجاح
                </p>
              </div>

              {/* Drink Information */}
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-10 duration-1000 delay-700">
                <div>
                  <h2 className="text-4xl font-bold text-foreground font-amiri mb-2">
                    {currentItem.nameAr}
                  </h2>
                  {currentItem.nameEn && (
                    <h3 className="text-2xl text-muted-foreground mb-4">
                      {currentItem.nameEn}
                    </h3>
                  )}
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentItem.description}
                </p>

                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-primary">
                    {currentItem.price} ريال
                  </span>
                  {currentItem.oldPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {currentItem.oldPrice} ريال
                    </span>
                  )}
                </div>

                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">الفئة:</span> {
                      currentItem.category === "basic" ? "قهوة أساسية" :
                      currentItem.category === "hot" ? "مشروبات ساخنة" :
                      currentItem.category === "cold" ? "مشروبات باردة" : 
                      currentItem.category
                    }
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{currentIndex + 1} من {coffeeItems.length}</span>
                  <span>عرض تلقائي: {isAutoPlay ? "مُفعل" : "معطل"}</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / coffeeItems.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {coffeeItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "bg-primary scale-125" 
                : "bg-muted hover:bg-primary/50"
            }`}
            data-testid={`dot-${index}`}
          />
        ))}
      </div>
    </div>
  );
}