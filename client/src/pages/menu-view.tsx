import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, EyeOff, Play, Pause, SkipForward, SkipBack, Settings, Star, 
  Grid3X3, List, Layers, Zap, Heart, Coffee, Sparkles, 
  RotateCcw, Shuffle, Filter, Search, LayoutGrid, Menu as MenuIcon,
  Circle, Square, Triangle, Crown, Gem, Flame, Snowflake
} from "lucide-react";
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

type ViewMode = 'slideshow' | 'grid' | 'cards' | 'carousel' | 'mosaic' | 'magazine';

export default function MenuView() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('slideshow');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [animationStyle, setAnimationStyle] = useState('fade');

  // Fetch coffee items
  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
    enabled: isAuthenticated,
  });

  const filteredItems = coffeeItems.filter(item => {
    const matchesSearch = item.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.nameEn && item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", nameAr: "الكل", icon: Coffee },
    { id: "basic", nameAr: "قهوة أساسية", icon: Circle },
    { id: "hot", nameAr: "مشروبات ساخنة", icon: Flame },
    { id: "cold", nameAr: "مشروبات باردة", icon: Snowflake }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || filteredItems.length === 0 || viewMode !== 'slideshow') return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, filteredItems.length, viewMode]);

  const handleLogin = () => {
    if (password === "182009") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("كلمة المرور غير صحيحة");
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const getAnimationClass = (index: number) => {
    if (animationStyle === 'slide') return 'animate-in slide-in-from-right duration-500';
    if (animationStyle === 'zoom') return 'animate-in zoom-in duration-300';
    if (animationStyle === 'flip') return 'animate-in fade-in-0 duration-700';
    return 'animate-in fade-in-0 duration-500';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-dots-pattern opacity-30"></div>
        
        <Card className="w-full max-w-md p-8 bg-card/10 backdrop-blur-2xl border-2 border-primary/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
              <h1 className="relative text-4xl font-bold text-primary font-amiri mb-2 bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
                عرض القائمة الإبداعي
              </h1>
              <div className="flex justify-center items-center space-x-2 space-x-reverse mt-2">
                <Coffee className="w-5 h-5 text-primary animate-bounce" />
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <Coffee className="w-5 h-5 text-primary animate-bounce delay-100" />
              </div>
            </div>
            <p className="text-muted-foreground text-lg">
              قسم خاص بالموظفين - تجربة بصرية مذهلة
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center space-x-2 space-x-reverse">
                <Crown className="w-4 h-4 text-primary" />
                <span>كلمة المرور</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10 bg-background/20 border-primary/30 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/60"
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-0 h-full px-3 hover:bg-primary/20"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-400 flex items-center space-x-2 space-x-reverse" data-testid="text-error">
                  <Zap className="w-4 h-4" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            <div className="flex space-x-4 space-x-reverse">
              <Button 
                onClick={handleLogin} 
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-primary/25"
                data-testid="button-login"
              >
                <Crown className="w-4 h-4 ml-2" />
                دخول
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")}
                className="border-primary/30 hover:bg-primary/10"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Coffee className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-foreground text-xl font-medium">جاري تحميل التجربة الإبداعية...</p>
          <div className="flex justify-center space-x-1 space-x-reverse mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = filteredItems[currentIndex];

  const renderSlideshow = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/10 rounded-full filter blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        {currentItem && (
          <div 
            key={currentItem.id}
            className={`max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${getAnimationClass(currentIndex)}`}
          >
            {/* Enhanced Image Section */}
            <div className="relative group">
              {/* Multi-layer Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/30 rounded-3xl blur-3xl animate-pulse opacity-60"></div>
              <div className="absolute inset-4 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl animate-pulse delay-1000 opacity-80"></div>
              <div className="absolute inset-8 bg-gradient-to-bl from-accent/20 to-transparent rounded-3xl blur-xl animate-pulse delay-500 opacity-60"></div>
              
              <div className="relative bg-gradient-to-br from-card/20 via-card/10 to-card/20 backdrop-blur-2xl rounded-3xl p-8 border-2 border-primary/30 shadow-2xl group-hover:shadow-primary/40 transition-all duration-1000">
                {/* Image Container with Advanced Effects */}
                <div className="relative overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <img 
                    src={currentItem.imageUrl || "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png"}
                    alt={currentItem.nameAr}
                    className="w-full h-96 object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-110"
                    data-testid="img-current-drink"
                  />
                  
                  {/* Floating Particles */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce opacity-80"></div>
                  </div>
                  <div className="absolute top-8 right-8 z-20">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-200 opacity-60"></div>
                  </div>
                  <div className="absolute top-6 right-12 z-20">
                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce delay-400 opacity-70"></div>
                  </div>
                  <div className="absolute bottom-8 left-6 z-20">
                    <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce delay-600 opacity-50"></div>
                  </div>
                  
                  {/* Magical Sparkles */}
                  <div className="absolute top-12 left-8 z-20">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse opacity-70" />
                  </div>
                  <div className="absolute bottom-12 right-12 z-20">
                    <Gem className="w-4 h-4 text-primary animate-pulse delay-300 opacity-60" />
                  </div>
                </div>

                {/* Enhanced Price Display */}
                <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-primary via-primary to-primary/80 backdrop-blur-md rounded-3xl px-8 py-6 border-2 border-primary/50 shadow-2xl group-hover:scale-110 transition-all duration-700">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Crown className="w-6 h-6 text-primary-foreground animate-pulse" />
                    <div className="text-right">
                      <span className="text-primary-foreground font-bold text-2xl block">
                        {currentItem.price}
                      </span>
                      <span className="text-primary-foreground/80 text-sm">ريال سعودي</span>
                    </div>
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
                </div>

                {/* Enhanced Category Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/40 shadow-lg">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {currentItem.category === "basic" && <Circle className="w-4 h-4 text-primary-foreground" />}
                    {currentItem.category === "hot" && <Flame className="w-4 h-4 text-primary-foreground" />}
                    {currentItem.category === "cold" && <Snowflake className="w-4 h-4 text-primary-foreground" />}
                    <span className="text-primary-foreground text-sm font-semibold">
                      {currentItem.category === "basic" ? "قهوة أساسية" :
                       currentItem.category === "hot" ? "مشروبات ساخنة" :
                       currentItem.category === "cold" ? "مشروبات باردة" : 
                       currentItem.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Content Section */}
            <div className="space-y-8">
              {/* Brand Header */}
              <div className="text-center animate-in fade-in-0 slide-in-from-top-10 duration-1000 delay-300">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-yellow-400/20 to-primary/30 blur-3xl rounded-full animate-pulse"></div>
                  <h1 className="relative text-7xl font-bold font-amiri mb-3 bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
                    قهوة كوب
                  </h1>
                  <div className="flex justify-center items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
                    <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
                  </div>
                </div>
                <p className="text-3xl text-muted-foreground font-medium mb-6 leading-relaxed">
                  لكل لحظة قهوة ، لحظة نجاح
                </p>
                <div className="flex justify-center items-center space-x-3 space-x-reverse text-sm text-muted-foreground/80">
                  <Coffee className="w-4 h-4 text-primary animate-bounce" />
                  <span>qahwacup.ma3k.online</span>
                  <Coffee className="w-4 h-4 text-primary animate-bounce delay-100" />
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-10 duration-1000 delay-500">
                {/* Title Section */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-card/30 to-transparent p-8 rounded-2xl border border-primary/20 backdrop-blur-sm">
                    <h2 className="text-6xl font-bold text-foreground font-amiri mb-4 leading-tight">
                      {currentItem.nameAr}
                    </h2>
                    {currentItem.nameEn && (
                      <h3 className="text-3xl text-primary/80 mb-4 font-medium italic">
                        {currentItem.nameEn}
                      </h3>
                    )}
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-20 h-1 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gradient-to-br from-card/20 to-card/5 p-8 rounded-2xl border border-primary/10 backdrop-blur-sm">
                  <p className="text-xl text-muted-foreground leading-loose font-medium">
                    {currentItem.description}
                  </p>
                </div>

                {/* Enhanced Pricing */}
                <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 rounded-2xl border-2 border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 space-x-reverse">
                      <span className="text-5xl font-bold text-primary">
                        {currentItem.price}
                      </span>
                      <span className="text-2xl text-primary/80">ريال</span>
                      {currentItem.oldPrice && (
                        <>
                          <span className="text-3xl text-muted-foreground line-through opacity-60">
                            {currentItem.oldPrice}
                          </span>
                          <Badge className="bg-red-500 text-white px-4 py-2 text-lg font-semibold">
                            خصم {Math.round(((parseFloat(currentItem.oldPrice) - parseFloat(currentItem.price)) / parseFloat(currentItem.oldPrice)) * 100)}%
                          </Badge>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-4">
                <div className="flex justify-between text-lg text-muted-foreground">
                  <span>{currentIndex + 1} من {filteredItems.length}</span>
                  <span className="flex items-center space-x-2 space-x-reverse">
                    {isAutoPlay ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    <span>عرض تلقائي: {isAutoPlay ? "مُفعل" : "معطل"}</span>
                  </span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${((currentIndex + 1) / filteredItems.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {filteredItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 ${
              index === currentIndex 
                ? "w-4 h-4 bg-primary scale-125 rounded-full shadow-lg shadow-primary/50" 
                : "w-3 h-3 bg-muted hover:bg-primary/50 rounded-full"
            }`}
            data-testid={`dot-${index}`}
          />
        ))}
      </div>
    </div>
  );

  const renderGrid = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item, index) => (
            <Card key={item.id} className={`bg-gradient-to-br from-card/20 to-card/5 backdrop-blur-xl border border-primary/20 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 ${getAnimationClass(index)}`}>
              <div className="relative">
                <img 
                  src={item.imageUrl || "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png"}
                  alt={item.nameAr}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  {item.category === "basic" && <Circle className="w-5 h-5 text-white" />}
                  {item.category === "hot" && <Flame className="w-5 h-5 text-orange-400" />}
                  {item.category === "cold" && <Snowflake className="w-5 h-5 text-blue-400" />}
                </div>
                {item.oldPrice && (
                  <Badge className="absolute top-3 left-3 bg-red-500">
                    خصم {Math.round(((parseFloat(item.oldPrice) - parseFloat(item.price)) / parseFloat(item.oldPrice)) * 100)}%
                  </Badge>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2 font-amiri">{item.nameAr}</h3>
                {item.nameEn && (
                  <h4 className="text-sm text-primary/80 mb-3 italic">{item.nameEn}</h4>
                )}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-2xl font-bold text-primary">{item.price}</span>
                    <span className="text-sm text-primary/80">ريال</span>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {filteredItems.map((item, index) => (
          <Card key={item.id} className={`bg-gradient-to-r from-card/20 to-card/10 backdrop-blur-xl border border-primary/20 rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-700 hover:shadow-2xl hover:shadow-primary/20 ${getAnimationClass(index)}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative overflow-hidden">
                <img 
                  src={item.imageUrl || "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png"}
                  alt={item.nameAr}
                  className="w-full h-80 lg:h-full object-cover hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                {item.oldPrice && (
                  <Badge className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 text-lg">
                    خصم {Math.round(((parseFloat(item.oldPrice) - parseFloat(item.price)) / parseFloat(item.oldPrice)) * 100)}%
                  </Badge>
                )}
              </div>
              <div className="p-12">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  {item.category === "basic" && <Circle className="w-6 h-6 text-primary" />}
                  {item.category === "hot" && <Flame className="w-6 h-6 text-orange-400" />}
                  {item.category === "cold" && <Snowflake className="w-6 h-6 text-blue-400" />}
                  <span className="text-sm text-muted-foreground">
                    {item.category === "basic" ? "قهوة أساسية" :
                     item.category === "hot" ? "مشروبات ساخنة" :
                     "مشروبات باردة"}
                  </span>
                </div>
                <h3 className="text-4xl font-bold text-foreground mb-3 font-amiri">{item.nameAr}</h3>
                {item.nameEn && (
                  <h4 className="text-xl text-primary/80 mb-6 italic">{item.nameEn}</h4>
                )}
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{item.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <span className="text-4xl font-bold text-primary">{item.price}</span>
                    <span className="text-xl text-primary/80">ريال</span>
                    {item.oldPrice && (
                      <span className="text-2xl text-muted-foreground line-through opacity-60">
                        {item.oldPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCarousel = () => {
    const itemsPerView = 3;
    const totalSlides = Math.ceil(filteredItems.length / itemsPerView);
    const currentSlide = Math.floor(currentIndex / itemsPerView);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.slice(currentSlide * itemsPerView, (currentSlide + 1) * itemsPerView).map((item, index) => (
              <Card key={item.id} className={`bg-gradient-to-br from-card/30 to-card/10 backdrop-blur-xl border border-primary/30 rounded-3xl overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 ${getAnimationClass(index)}`}>
                <div className="relative">
                  <img 
                    src={item.imageUrl || "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png"}
                    alt={item.nameAr}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1 font-amiri">{item.nameAr}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-bold text-primary">{item.price} ريال</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  {item.oldPrice && (
                    <Badge className="absolute top-4 right-4 bg-red-500">
                      خصم {Math.round(((parseFloat(item.oldPrice) - parseFloat(item.price)) / parseFloat(item.oldPrice)) * 100)}%
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
          
          {/* Carousel Navigation */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerView)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-primary scale-125" : "bg-muted hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMosaic = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-4 auto-rows-[200px]">
          {filteredItems.map((item, index) => {
            const sizes = [
              "col-span-6 row-span-2", // Large
              "col-span-3 row-span-1", // Small
              "col-span-3 row-span-1", // Small
              "col-span-4 row-span-2", // Medium
              "col-span-4 row-span-1", // Wide
              "col-span-4 row-span-1", // Wide
            ];
            const sizeClass = sizes[index % sizes.length];
            
            return (
              <Card key={item.id} className={`${sizeClass} bg-gradient-to-br from-card/30 to-card/10 backdrop-blur-xl border border-primary/20 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 ${getAnimationClass(index)}`}>
                <div className="relative w-full h-full">
                  <img 
                    src={item.imageUrl || "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png"}
                    alt={item.nameAr}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold mb-1 font-amiri">{item.nameAr}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">{item.price} ريال</span>
                      {item.category === "basic" && <Circle className="w-4 h-4" />}
                      {item.category === "hot" && <Flame className="w-4 h-4 text-orange-400" />}
                      {item.category === "cold" && <Snowflake className="w-4 h-4 text-blue-400" />}
                    </div>
                  </div>
                  {item.oldPrice && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-xs">
                      -{Math.round(((parseFloat(item.oldPrice) - parseFloat(item.price)) / parseFloat(item.oldPrice)) * 100)}%
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderMagazine = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {filteredItems.map((item, index) => (
          <div key={item.id} className={`${index % 2 === 0 ? 'text-right' : 'text-left'} ${getAnimationClass(index)}`}>
            <Card className="bg-gradient-to-br from-card/20 to-card/5 backdrop-blur-xl border border-primary/20 rounded-3xl overflow-hidden hover:scale-[1.01] transition-all duration-700 hover:shadow-2xl hover:shadow-primary/20">
              <div className={`grid grid-cols-1 lg:grid-cols-5 gap-0 ${index % 2 === 0 ? '' : 'lg:grid-flow-col-dense'}`}>
                <div className={`relative overflow-hidden ${index % 2 === 0 ? 'lg:col-span-3' : 'lg:col-span-3 lg:col-start-3'}`}>
                  <img 
                    src={item.imageUrl || "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png"}
                    alt={item.nameAr}
                    className="w-full h-80 lg:h-96 object-cover hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  {item.oldPrice && (
                    <Badge className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 text-lg">
                      خصم {Math.round(((parseFloat(item.oldPrice) - parseFloat(item.price)) / parseFloat(item.oldPrice)) * 100)}%
                    </Badge>
                  )}
                </div>
                <div className={`p-12 lg:col-span-2 flex flex-col justify-center ${index % 2 === 0 ? '' : 'lg:col-start-1'}`}>
                  <div className="flex items-center space-x-3 space-x-reverse mb-6">
                    {item.category === "basic" && <Circle className="w-8 h-8 text-primary" />}
                    {item.category === "hot" && <Flame className="w-8 h-8 text-orange-400" />}
                    {item.category === "cold" && <Snowflake className="w-8 h-8 text-blue-400" />}
                    <span className="text-lg text-muted-foreground">
                      {item.category === "basic" ? "قهوة أساسية" :
                       item.category === "hot" ? "مشروبات ساخنة" :
                       "مشروبات باردة"}
                    </span>
                  </div>
                  <h3 className="text-5xl font-bold text-foreground mb-4 font-amiri leading-tight">{item.nameAr}</h3>
                  {item.nameEn && (
                    <h4 className="text-2xl text-primary/80 mb-6 italic">{item.nameEn}</h4>
                  )}
                  <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <span className="text-4xl font-bold text-primary">{item.price}</span>
                      <span className="text-xl text-primary/80">ريال</span>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'grid': return renderGrid();
      case 'cards': return renderCards();
      case 'carousel': return renderCarousel();
      case 'mosaic': return renderMosaic();
      case 'magazine': return renderMagazine();
      default: return renderSlideshow();
    }
  };

  return (
    <div className="relative">
      {/* Enhanced Controls Bar */}
      {showControls && (
        <div className="fixed top-4 left-4 right-4 z-50 flex flex-wrap justify-between items-center gap-4">
          {/* Left Controls */}
          <div className="flex items-center space-x-3 space-x-reverse bg-card/10 backdrop-blur-2xl rounded-2xl px-6 py-3 border border-primary/20 shadow-2xl">
            {viewMode === 'slideshow' && (
              <>
                <Button variant="ghost" size="icon" onClick={handlePrevious} className="hover:bg-primary/20" data-testid="button-previous">
                  <SkipBack className="h-5 w-5 text-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsAutoPlay(!isAutoPlay)} className="hover:bg-primary/20" data-testid="button-autoplay">
                  {isAutoPlay ? <Pause className="h-5 w-5 text-foreground" /> : <Play className="h-5 w-5 text-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNext} className="hover:bg-primary/20" data-testid="button-next">
                  <SkipForward className="h-5 w-5 text-foreground" />
                </Button>
                <div className="w-px h-6 bg-primary/20"></div>
              </>
            )}
            
            {/* Animation Style Selector */}
            <select 
              value={animationStyle} 
              onChange={(e) => setAnimationStyle(e.target.value)}
              className="bg-transparent text-foreground text-sm border-none outline-none cursor-pointer"
            >
              <option value="fade">تلاشي</option>
              <option value="slide">انزلاق</option>
              <option value="zoom">تكبير</option>
              <option value="flip">دوران</option>
            </select>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-3 space-x-reverse bg-card/10 backdrop-blur-2xl rounded-2xl px-6 py-3 border border-primary/20 shadow-2xl">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 pl-4 bg-background/20 border-primary/20 text-sm w-40"
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-background/20 border border-primary/20 rounded-lg px-3 py-2 text-foreground text-sm outline-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
              ))}
            </select>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center space-x-2 space-x-reverse bg-card/10 backdrop-blur-2xl rounded-2xl px-4 py-3 border border-primary/20 shadow-2xl">
            <Button
              variant={viewMode === 'slideshow' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('slideshow')}
              className="hover:bg-primary/20"
              title="عرض الشرائح"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="hover:bg-primary/20"
              title="الشبكة"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('cards')}
              className="hover:bg-primary/20"
              title="البطاقات"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'carousel' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('carousel')}
              className="hover:bg-primary/20"
              title="الكاروسيل"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'mosaic' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('mosaic')}
              className="hover:bg-primary/20"
              title="الفسيفساء"
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'magazine' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('magazine')}
              className="hover:bg-primary/20"
              title="المجلة"
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3 space-x-reverse bg-card/10 backdrop-blur-2xl rounded-2xl px-6 py-3 border border-primary/20 shadow-2xl">
            <Button variant="ghost" size="icon" onClick={() => setShowControls(!showControls)} className="hover:bg-primary/20">
              <Settings className="h-5 w-5 text-foreground" />
            </Button>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="border-primary/30 hover:bg-primary/10 text-foreground" data-testid="button-logout">
              خروج
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-20">
        {renderCurrentView()}
      </div>

      {/* Floating Hide/Show Controls Button */}
      {!showControls && (
        <Button
          onClick={() => setShowControls(true)}
          className="fixed top-4 right-4 z-50 bg-primary/80 backdrop-blur-sm hover:bg-primary text-primary-foreground shadow-2xl"
          size="icon"
        >
          <Settings className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}