import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Play, Pause, SkipForward, SkipBack, Settings, Star } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-orange-100/40"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-amber-200/10 to-transparent"></div>
      
      {/* Floating coffee beans decoration */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute top-32 right-16 w-6 h-6 bg-gradient-to-br from-yellow-600 to-amber-700 rounded-full opacity-15 animate-bounce delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-10 animate-bounce delay-2000"></div>
      <div className="absolute bottom-40 right-32 w-4 h-4 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full opacity-25 animate-bounce delay-500"></div>
    </div>
      
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
            className="maxm-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-in fade-in-0 slide-in-from-bottom-10 duration-1000"
          >
            {/* Enhanced Image Section */}
            <div className="relative group">
              {/* Multiple animated background layers with enhanced colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/40 via-orange-300/30 to-amber-600/35 rounded-3xl blur-3xl animate-pulse"></div>
              <div className="absolute inset-2 bg-gradient-to-tr from-yellow-400/20 via-amber-300/15 to-orange-400/25 rounded-3xl blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute inset-4 bg-gradient-to-bl from-amber-200/10 to-transparent rounded-3xl blur-xl animate-pulse delay-2000"></div>
              
              <div className="relative bg-gradient-to-br from-white/95 via-amber-50/90 to-orange-50/95 backdrop-blur-md rounded-3xl p-8 border-2 border-amber-300/50 shadow-2xl group-hover:shadow-amber-400/40 transition-all duration-700">
                {/* Image with enhanced effects */}
                <div className="relative overflow-hidden rounded-2xl shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-100/20 z-10"></div>
                  <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-amber-200/20 z-10"></div>
                  <img 
                    src={`/images/${currentItem.id}.png`}
                    alt={currentItem.nameAr}
                    className="w-full h-80 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 filter saturate-110"
                    onError={(e) => {
                      e.currentTarget.src = "/images/default-coffee.png";
                    }}
                    data-testid="img-current-drink"
                  />
                  
                  {/* Enhanced floating coffee steam elements */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-bounce shadow-lg"></div>
                  </div>
                  <div className="absolute top-8 right-8 z-20">
                    <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full animate-bounce delay-200 shadow-md"></div>
                  </div>
                  <div className="absolute top-6 right-12 z-20">
                    <div className="w-2 h-2 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full animate-bounce delay-400 shadow-sm"></div>
                  </div>
                  
                  {/* Coffee steam animation */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 opacity-60 group-hover:opacity-80 transition-opacity duration-500">
                    <div className="flex space-x-1">
                      <div className="w-1 h-8 bg-gradient-to-t from-transparent via-white/60 to-transparent rounded-full animate-pulse"></div>
                      <div className="w-1 h-6 bg-gradient-to-t from-transparent via-white/50 to-transparent rounded-full animate-pulse delay-300"></div>
                      <div className="w-1 h-7 bg-gradient-to-t from-transparent via-white/40 to-transparent rounded-full animate-pulse delay-500"></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced price tag with premium design */}
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-amber-300/50 shadow-2xl group-hover:scale-110 transition-all duration-500 rotate-2 group-hover:rotate-0">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-white font-bold text-xl drop-shadow-lg">
                      {currentItem.price}
                    </span>
                    <span className="text-white/90 text-sm font-medium drop-shadow">ريال</span>
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full animate-ping shadow-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-400 to-red-400 rounded-full animate-pulse delay-500"></div>
                </div>

                {/* Enhanced category badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500/95 via-teal-500/90 to-cyan-500/95 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-300/50 shadow-lg">
                  <span className="text-white text-sm font-semibold drop-shadow">
                    {currentItem.category === "basic" ? "قهوة أساسية" :
                     currentItem.category === "hot" ? "مشروبات ساخنة" :
                     currentItem.category === "cold" ? "مشروبات باردة" : 
                     currentItem.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-8">
              {/* Enhanced Brand Message Animation */}
              <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-10 duration-1000 delay-500">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 via-orange-400/20 to-yellow-400/25 blur-3xl rounded-full animate-pulse"></div>
                  <h1 className="relative text-6xl font-bold font-amiri mb-2 typing-animation bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent drop-shadow-lg">
                    قهوة كوب
                  </h1>
                  <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full shadow-sm"></div>
                </div>
                <p className="text-2xl text-amber-800/90 font-medium typing-animation-delay mb-4 leading-relaxed drop-shadow-sm">
                  لكل لحظة قهوة ، لحظة نجاح
                </p>
                <div className="flex justify-center items-center space-x-2 space-x-reverse text-sm text-amber-700/70">
                  <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-bounce shadow-sm"></div>
                  <span className="font-medium">qahwacup.ma3k.online</span>
                  <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full animate-bounce delay-100 shadow-sm"></div>
                </div>
              </div>

              {/* Enhanced Drink Information */}
              <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-10 duration-1000 delay-700">
                {/* Title Section */}
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-amber-300/25 via-orange-200/20 to-yellow-300/25 rounded-2xl blur-lg"></div>
                  <div className="relative bg-gradient-to-br from-white/80 via-amber-50/70 to-orange-50/60 backdrop-blur-sm p-8 rounded-2xl border border-amber-200/40 shadow-lg">
                    <h2 className="text-5xl font-bold text-amber-900 font-amiri mb-3 leading-tight drop-shadow-sm">
                      {currentItem.nameAr}
                    </h2>
                    {currentItem.nameEn && (
                      <h3 className="text-2xl text-amber-700/90 mb-4 font-medium italic">
                        {currentItem.nameEn}
                      </h3>
                    )}
                    <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 rounded-full shadow-sm"></div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-gradient-to-br from-slate-50/90 via-gray-50/80 to-stone-50/90 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 shadow-md">
                  <p className="text-lg text-slate-700 leading-loose font-medium">
                    {currentItem.description}
                  </p>
                </div>

                {/* Pricing Section */}
                <div className="bg-gradient-to-br from-amber-100/90 via-orange-50/80 to-yellow-100/90 backdrop-blur-sm p-8 rounded-2xl border-2 border-amber-300/40 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <span className="text-4xl font-bold text-amber-700 drop-shadow-sm">
                        {currentItem.price}
                      </span>
                      <span className="text-xl text-amber-600/90 font-medium">ريال</span>
                      {currentItem.oldPrice && (
                        <>
                          <span className="text-2xl text-slate-500 line-through opacity-70">
                            {currentItem.oldPrice}
                          </span>
                          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                            خصم {Math.round(((parseFloat(currentItem.oldPrice) - parseFloat(currentItem.price)) / parseFloat(currentItem.oldPrice)) * 100)}%
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-sm" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Category Info */}
                <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-cyan-50/90 border border-emerald-200/50 rounded-2xl p-8 shadow-md backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-pulse shadow-sm"></div>
                      <span className="font-semibold text-slate-700">التصنيف:</span>
                      <span className="text-emerald-600 font-bold">
                        {currentItem.category === "basic" ? "قهوة أساسية" :
                         currentItem.category === "hot" ? "مشروبات ساخنة" :
                         currentItem.category === "cold" ? "مشروبات باردة" : 
                         currentItem.category}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      متوفر الآن ✨
                    </div>
                  </div>
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