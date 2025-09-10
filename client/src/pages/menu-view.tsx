import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Play, Pause, SkipForward, SkipBack, Settings, Star, Coffee, Sparkles, Zap, Flame, Snowflake, QrCode, Tablet, Grid3X3, Layers, Maximize } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Coffee image mapping function - each drink gets its unique image
const getCoffeeImage = (coffeeId: string): string => {
  const imageMap: Record<string, string> = {
    "espresso-single": "/images/espresso-single.png",
    "espresso-double": "/images/espresso-double.png", 
    "americano": "/images/americano.png",
    "ristretto": "/images/ristretto.png",
    "cafe-latte": "/images/cafe-latte.png",
    "cappuccino": "/images/cappuccino.png",
    "vanilla-latte": "/images/vanilla-latte.png",
    "mocha": "/images/mocha.png",
    "con-panna": "/images/con-panna.png",
    "coffee-day-hot": "/images/golden-latte.png",
    "iced-latte": "/images/iced-latte.png",
    "iced-mocha": "/images/iced-mocha-drink.png",
    "iced-cappuccino": "/images/iced-cappuccino.png",
    "iced-condensed": "/images/iced-chocolate.png",
    "vanilla-cold-brew": "/images/vanilla-cold-brew.png",
    "coffee-day-cold": "/images/signature-qahwa.png"
  };
  
  return imageMap[coffeeId] || "/images/default-coffee.png";
};

// Get category info with colors and effects
const getCategoryStyle = (category: string) => {
  switch (category) {
    case "basic":
      return {
        gradient: "from-amber-600/30 via-yellow-500/20 to-orange-600/30",
        icon: Coffee,
        color: "text-amber-600",
        bg: "bg-amber-100/20 dark:bg-amber-900/20"
      };
    case "hot":
      return {
        gradient: "from-red-600/30 via-orange-500/20 to-pink-600/30",
        icon: Flame,
        color: "text-red-600",
        bg: "bg-red-100/20 dark:bg-red-900/20"
      };
    case "cold":
      return {
        gradient: "from-blue-600/30 via-cyan-500/20 to-indigo-600/30",
        icon: Snowflake,
        color: "text-blue-600",
        bg: "bg-blue-100/20 dark:bg-blue-900/20"
      };
    default:
      return {
        gradient: "from-primary/30 via-accent/20 to-primary/30",
        icon: Sparkles,
        color: "text-primary",
        bg: "bg-primary/10"
      };
  }
};

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
  const [viewMode, setViewMode] = useState<'slideshow' | 'split' | 'artistic' | 'grid' | 'showcase' | 'tablet'>('slideshow');
  const [showAnimatedBg, setShowAnimatedBg] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const qrRef = useRef<HTMLCanvasElement>(null);

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

  // QR Code generation
  useEffect(() => {
    const generateQRCode = async () => {
      if (typeof window !== 'undefined' && qrRef.current) {
        try {
          const QRCode = (await import('qrcode')).default;
          await QRCode.toCanvas(qrRef.current, 'https://qahwa.ma3k.online', {
            width: 200,
            margin: 2,
            color: {
              dark: '#8B4513',
              light: '#FFFFFF'
            }
          });
        } catch (error) {
          console.error('QR Code generation failed:', error);
        }
      }
    };
    
    if (showQRCode) {
      generateQRCode();
    }
  }, [showQRCode]);

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
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
      showAnimatedBg 
        ? getCategoryStyle(currentItem?.category || 'basic').gradient.includes('amber') 
          ? 'bg-gradient-to-br from-amber-900/20 via-yellow-800/10 to-orange-900/20 dark:from-amber-900/40 dark:via-yellow-800/30 dark:to-orange-900/40'
          : getCategoryStyle(currentItem?.category || 'basic').gradient.includes('red')
          ? 'bg-gradient-to-br from-red-900/20 via-orange-800/10 to-pink-900/20 dark:from-red-900/40 dark:via-orange-800/30 dark:to-pink-900/40'
          : 'bg-gradient-to-br from-blue-900/20 via-cyan-800/10 to-indigo-900/20 dark:from-blue-900/40 dark:via-cyan-800/30 dark:to-indigo-900/40'
        : 'bg-gradient-to-br from-background via-card to-background'
    }`}>
      {/* Enhanced Dynamic Background Effects */}
      <div className={`absolute inset-0 transition-all duration-2000 ${
        showAnimatedBg ? getCategoryStyle(currentItem?.category || 'basic').gradient.replace('30', '15').replace('20', '10').replace('30', '15') : 'bg-gradient-to-br from-primary/5 via-transparent to-primary/10'
      }`}></div>
      
      {/* Floating animated particles based on category */}
      {showAnimatedBg && currentItem && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => {
            const categoryInfo = getCategoryStyle(currentItem.category);
            const Icon = categoryInfo.icon;
            return (
              <div
                key={i}
                className={`absolute opacity-20 ${categoryInfo.color} animate-bounce`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + (i % 2) * 30}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`
                }}
              >
                <Icon className="w-8 h-8" />
              </div>
            );
          })}
        </div>
      )}
      
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
            {/* Enhanced View Mode Controls for iPad */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant={viewMode === 'slideshow' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('slideshow')}
                data-testid="button-slideshow"
                className="text-xs flex items-center space-x-1 space-x-reverse"
              >
                <Layers className="w-3 h-3" />
                <span>عرض شرائح</span>
              </Button>
              <Button
                variant={viewMode === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('split')}
                data-testid="button-split"
                className="text-xs flex items-center space-x-1 space-x-reverse"
              >
                <Grid3X3 className="w-3 h-3" />
                <span>عرض مقسم</span>
              </Button>
              <Button
                variant={viewMode === 'artistic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('artistic')}
                data-testid="button-artistic"
                className="text-xs flex items-center space-x-1 space-x-reverse"
              >
                <Sparkles className="w-3 h-3" />
                <span>عرض فني</span>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                data-testid="button-grid"
                className="text-xs flex items-center space-x-1 space-x-reverse"
              >
                <Grid3X3 className="w-3 h-3" />
                <span>شبكة</span>
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tablet')}
                data-testid="button-tablet"
                className="text-xs flex items-center space-x-1 space-x-reverse"
              >
                <Tablet className="w-3 h-3" />
                <span>آيباد</span>
              </Button>
              <Button
                variant={viewMode === 'showcase' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('showcase')}
                data-testid="button-showcase"
                className="text-xs flex items-center space-x-1 space-x-reverse"
              >
                <Maximize className="w-3 h-3" />
                <span>عرض مميز</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAnimatedBg(!showAnimatedBg)}
              data-testid="button-effects"
              title="تأثيرات بصرية"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant={showQRCode ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setShowQRCode(!showQRCode)}
              data-testid="button-qr"
              title="QR كود للطلب"
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowControls(!showControls)}
              title="إعدادات"
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
            key={`${currentItem.id}-${viewMode}`}
            className={`w-full transition-all duration-1000 animate-in fade-in-0 slide-in-from-bottom-10 ${
              viewMode === 'slideshow' ? 'max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center' :
              viewMode === 'split' ? 'max-w-7xl grid grid-cols-1 xl:grid-cols-3 gap-8 items-start' :
              viewMode === 'grid' ? 'max-w-7xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start' :
              viewMode === 'tablet' ? 'max-w-8xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-center' :
              viewMode === 'showcase' ? 'max-w-5xl flex flex-col items-center space-y-12' :
              'max-w-4xl flex flex-col items-center space-y-8'
            }`}
          >
            {/* Enhanced Image Section */}
            {/* Main Content Based on View Mode */}
            {(viewMode === 'grid' || viewMode === 'tablet') ? (
              // Grid and Tablet View - Show All Items
              coffeeItems.slice(0, viewMode === 'tablet' ? 8 : 12).map((item, index) => (
                <div 
                  key={item.id}
                  className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                    index === currentIndex ? 'ring-2 ring-primary shadow-2xl shadow-primary/25' : ''
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className={`bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    index === currentIndex ? 'border-primary/60' : 'border-primary/20 hover:border-primary/40'
                  }`}>
                    <div className="relative overflow-hidden">
                      <img 
                        src={getCoffeeImage(item.id)}
                        alt={item.nameAr}
                        className={`w-full object-cover transition-all duration-300 group-hover:scale-110 ${
                          viewMode === 'tablet' ? 'h-48' : 'h-40'
                        }`}
                        onError={(e) => {
                          e.currentTarget.src = "/images/default-coffee.png";
                        }}
                      />
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full animate-pulse ${
                        getCategoryStyle(item.category).color.replace('text-', 'bg-')
                      }`}></div>
                      {item.oldPrice && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          خصم {Math.round(((parseFloat(item.oldPrice) - parseFloat(item.price)) / parseFloat(item.oldPrice)) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className={`p-4 space-y-3 ${viewMode === 'tablet' ? 'p-6 space-y-4' : ''}`}>
                      <h4 className={`font-amiri font-bold text-primary line-clamp-1 ${
                        viewMode === 'tablet' ? 'text-xl' : 'text-lg'
                      }`}>
                        {item.nameAr}
                      </h4>
                      <p className={`text-muted-foreground line-clamp-2 ${
                        viewMode === 'tablet' ? 'text-base' : 'text-sm'
                      }`}>
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        <div className="text-right">
                          {item.oldPrice && (
                            <div className="text-xs text-muted-foreground line-through">
                              {item.oldPrice} ريال
                            </div>
                          )}
                          <div className={`text-primary font-bold font-amiri ${
                            viewMode === 'tablet' ? 'text-xl' : 'text-lg'
                          }`}>
                            {item.price} ريال
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs">
                          عرض
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Original single item view for other modes
              <div className={`relative group ${
                viewMode === 'slideshow' ? '' :
                viewMode === 'split' ? 'xl:col-span-2' :
                viewMode === 'showcase' ? 'order-2 w-full max-w-2xl' :
                'order-2'
              }`}>
              {/* Multiple animated background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-tr from-primary/10 to-transparent rounded-3xl blur-xl animate-pulse delay-1000"></div>
              
              <div className="relative bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-md rounded-3xl p-8 border-2 border-primary/40 shadow-2xl group-hover:shadow-primary/25 transition-all duration-700">
                {/* Image with enhanced effects */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'artistic' ? 'rounded-full w-80 h-80 mx-auto' : 
                  viewMode === 'split' ? 'rounded-xl' :
                  'rounded-2xl'
                }`}>
                  <div className={`absolute inset-0 z-10 ${
                    viewMode === 'artistic' ? 'bg-gradient-radial from-transparent via-primary/10 to-primary/30' :
                    'bg-gradient-to-t from-primary/20 via-transparent to-transparent'
                  }`}></div>
                  <img 
                    src={getCoffeeImage(currentItem.id)}
                    alt={currentItem.nameAr}
                    className={`object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 filter drop-shadow-2xl ${
                      viewMode === 'artistic' ? 'w-80 h-80 rounded-full group-hover:rotate-6' :
                      viewMode === 'split' ? 'w-full h-64' :
                      'w-full h-80'
                    }`}
                    data-testid="img-current-drink"
                    onError={(e) => {
                      e.currentTarget.src = "/images/default-coffee.png";
                    }}
                  />
                  
                  {/* Floating elements */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                  </div>
                  <div className="absolute top-8 right-8 z-20">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200"></div>
                  </div>
                  <div className="absolute top-6 right-12 z-20">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-400"></div>
                  </div>
                </div>

                {/* Enhanced price tag */}
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-primary via-primary to-primary/80 backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-primary/30 shadow-xl group-hover:scale-110 transition-all duration-500">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-primary-foreground font-bold text-xl">
                      {currentItem.price}
                    </span>
                    <span className="text-primary-foreground/80 text-sm">ريال</span>
                  </div>
                  <div className="absolute -top-1 -left-1 w-4 h-4 bg-accent rounded-full animate-ping"></div>
                </div>

                {/* Category badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/40">
                  <span className="text-primary-foreground text-sm font-semibold">
                    {currentItem.category === "basic" ? "قهوة أساسية" :
                     currentItem.category === "hot" ? "مشروبات ساخنة" :
                     currentItem.category === "cold" ? "مشروبات باردة" : 
                     currentItem.category}
                  </span>
                </div>
              </div>
            </div>

            )}

            {/* Content Section */}
            {!(viewMode === 'grid' || viewMode === 'tablet') && (
            <div className={`space-y-8 ${
              viewMode === 'slideshow' ? '' :
              viewMode === 'split' ? 'xl:col-span-1' :
              viewMode === 'showcase' ? 'order-1 text-center max-w-3xl' :
              'order-1 text-center max-w-2xl'
            }`}>
              {/* Enhanced Brand Message Animation */}
              <div className={`mb-8 animate-in fade-in-0 slide-in-from-top-10 duration-1000 delay-500 ${
                viewMode === 'artistic' ? 'text-center' : 
                viewMode === 'split' ? 'text-right' :
                'text-center'
              }`}>
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                  <h1 className={`relative font-bold text-primary font-amiri mb-2 typing-animation bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent ${
                    viewMode === 'artistic' ? 'text-8xl' :
                    viewMode === 'split' ? 'text-4xl' :
                    'text-6xl'
                  }`}>
                    قهوة كوب
                  </h1>
                  <div className={`h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full ${
                    viewMode === 'artistic' ? 'w-32 mx-auto' :
                    viewMode === 'split' ? 'w-16 mr-auto' :
                    'w-24 mx-auto'
                  }`}></div>
                </div>
                <p className={`text-muted-foreground font-medium typing-animation-delay mb-4 leading-relaxed ${
                  viewMode === 'artistic' ? 'text-3xl' :
                  viewMode === 'split' ? 'text-lg' :
                  'text-2xl'
                }`}>
                  لكل لحظة قهوة ، لحظة نجاح
                </p>
                <div className={`flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground/80 ${
                  viewMode === 'artistic' ? 'justify-center' :
                  viewMode === 'split' ? 'justify-start' :
                  'justify-center'
                }`}>
                  <div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce"></div>
                  <span>qahwacup.ma3k.online</span>
                  <div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce delay-100"></div>
                </div>
              </div>

              {/* Enhanced Drink Information */}
              <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-10 duration-1000 delay-700">
                {/* Title Section */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-lg blur-sm"></div>
                  <div className="relative bg-gradient-to-br from-card/50 to-transparent p-6 rounded-xl border border-primary/20">
                    <h2 className="text-5xl font-bold text-foreground font-amiri mb-3 leading-tight">
                      {currentItem.nameAr}
                    </h2>
                    {currentItem.nameEn && (
                      <h3 className="text-2xl text-primary/80 mb-4 font-medium italic">
                        {currentItem.nameEn}
                      </h3>
                    )}
                    <div className="w-16 h-1 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-gradient-to-br from-card/30 to-card/10 p-6 rounded-xl border border-primary/10 backdrop-blur-sm">
                  <p className="text-lg text-muted-foreground leading-loose font-medium">
                    {currentItem.description}
                  </p>
                </div>

                {/* Pricing Section */}
                <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 rounded-xl border-2 border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <span className="text-4xl font-bold text-primary">
                        {currentItem.price}
                      </span>
                      <span className="text-xl text-primary/80">ريال</span>
                      {currentItem.oldPrice && (
                        <>
                          <span className="text-2xl text-muted-foreground line-through opacity-60">
                            {currentItem.oldPrice}
                          </span>
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            خصم {Math.round(((parseFloat(currentItem.oldPrice) - parseFloat(currentItem.price)) / parseFloat(currentItem.oldPrice)) * 100)}%
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Category Info */}
                <div className="bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      <span className="font-semibold text-foreground">التصنيف:</span>
                      <span className="text-primary font-semibold">
                        {currentItem.category === "basic" ? "قهوة أساسية" :
                         currentItem.category === "hot" ? "مشروبات ساخنة" :
                         currentItem.category === "cold" ? "مشروبات باردة" : 
                         currentItem.category}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
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
            )}
          </div>
        )}
        
        {/* Split View Additional Items */}
        {viewMode === 'split' && coffeeItems.length > 1 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-300">
            {coffeeItems.slice(0, 6).filter(item => item.id !== currentItem?.id).map((item, index) => (
              <div 
                key={item.id}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                onClick={() => setCurrentIndex(coffeeItems.findIndex(i => i.id === item.id))}
              >
                <div className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm rounded-xl p-4 border border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <img 
                      src={getCoffeeImage(item.id)}
                      alt={item.nameAr}
                      className="w-full h-32 object-cover transition-all duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-coffee.png";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        getCategoryStyle(item.category).color.replace('text-', 'bg-')
                      }`}></div>
                    </div>
                  </div>
                  <h4 className="font-amiri text-lg font-bold text-primary mb-1 line-clamp-1">
                    {item.nameAr}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-bold font-amiri">
                      {item.price} ريال
                    </span>
                    <Button size="sm" variant="ghost" className="text-xs">
                      عرض
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Artistic View Floating Elements */}
        {viewMode === 'artistic' && currentItem && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Floating coffee beans */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute opacity-10 dark:opacity-20"
                style={{
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 90}%`,
                  animation: `bounce ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                <Coffee className={`w-6 h-6 ${getCategoryStyle(currentItem.category).color} transform rotate-${Math.floor(Math.random() * 4) * 45}`} />
              </div>
            ))}
            
            {/* Floating steam effect */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 opacity-30">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-8 bg-gradient-to-t from-gray-400 to-transparent rounded-full animate-pulse"
                  style={{
                    left: `${i * 4 - 8}px`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center space-y-4">
          {/* Progress bar for artistic mode */}
          {viewMode === 'artistic' && (
            <div className="w-64 bg-muted/30 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / coffeeItems.length) * 100}%` }}
              ></div>
            </div>
          )}
          
          {/* Navigation Dots */}
          <div className="flex space-x-2">
            {coffeeItems.map((_, index) => {
              const categoryInfo = getCategoryStyle(coffeeItems[index]?.category || 'basic');
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-300 group relative ${
                    index === currentIndex 
                      ? `w-4 h-4 ${categoryInfo.color.replace('text-', 'bg-')} scale-125 shadow-lg` 
                      : "w-3 h-3 bg-muted hover:bg-primary/50"
                  }`}
                  data-testid={`dot-${index}`}
                >
                  {index === currentIndex && (
                    <div className={`absolute inset-0 rounded-full ${categoryInfo.color.replace('text-', 'bg-')} animate-ping opacity-75`}></div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Category indicator */}
          {currentItem && (
            <div className={`text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
              getCategoryStyle(currentItem.category).bg
            } ${getCategoryStyle(currentItem.category).color} border-current/30`}>
              {currentItem.category === "basic" ? "قهوة أساسية" :
               currentItem.category === "hot" ? "مشروبات ساخنة" :
               currentItem.category === "cold" ? "مشروبات باردة" : 
               currentItem.category}
            </div>
          )}
        </div>
      </div>
      
      {/* Creative QR Code Display */}
      {showQRCode && (
        <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50 animate-in slide-in-from-right-10 duration-500">
          <div className="bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-md rounded-3xl p-6 border-2 border-primary/40 shadow-2xl">
            <div className="text-center mb-4">
              <h3 className="font-amiri text-xl font-bold text-primary mb-2">
                اطلب من الموقع
              </h3>
              <p className="text-sm text-muted-foreground">
                امسح رمز QR للطلب مباشرة
              </p>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
              <div className="relative bg-white rounded-xl p-4 border-2 border-primary/30">
                <canvas ref={qrRef} className="mx-auto" />
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                qahwa.ma3k.online
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowQRCode(false)}
              className="absolute top-2 left-2 opacity-70 hover:opacity-100"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* iPad/Tablet Enhanced Floating QR Code */}
      {(viewMode === 'tablet' || viewMode === 'showcase') && (
        <div className="fixed bottom-8 right-8 z-40">
          <div className="group relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg animate-pulse group-hover:bg-primary/50 transition-all duration-300"></div>
            <Button 
              variant={showQRCode ? 'default' : 'secondary'}
              size="lg"
              onClick={() => setShowQRCode(!showQRCode)}
              className="relative bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-2xl hover:shadow-primary/50 transition-all duration-300 rounded-full w-16 h-16 flex items-center justify-center"
            >
              <QrCode className="w-8 h-8" />
            </Button>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
              !
            </div>
          </div>
        </div>
      )}
    </div>
  );
}