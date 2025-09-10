import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Coffee, Star, Sparkles, Grid3X3, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Coffee image mapping function
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
  const [viewMode, setViewMode] = useState<'elegant' | 'showcase' | 'grid'>('elegant');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Fetch coffee items
  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  // Auto-play functionality for elegant view
  useEffect(() => {
    if (!isAutoPlay || coffeeItems.length === 0 || viewMode !== 'elegant') return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % coffeeItems.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlay, coffeeItems.length, viewMode]);


  // Group coffee items by category for organized display
  const groupedItems = coffeeItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CoffeeItem[]>);

  const categoryTitles: Record<string, string> = {
    "basic": "القهوة الأساسية",
    "hot": "المشروبات الساخنة", 
    "cold": "المشروبات الباردة"
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-primary text-xl font-semibold">جاري تحميل القائمة الفخمة...</p>
        </div>
      </div>
    );
  }

  const currentItem = coffeeItems[currentIndex];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Luxury Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300/15 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-300/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200/5 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header Controls */}
      <div className="relative z-50 flex justify-between items-center p-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="bg-card/90 backdrop-blur-xl rounded-2xl px-6 py-3 border border-primary/20 shadow-xl">
            <h1 className="font-amiri text-2xl font-bold text-primary">قائمة القهوة الفخمة</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          {/* View Mode Selector */}
          <div className="flex items-center bg-card/90 backdrop-blur-xl rounded-2xl p-2 border border-primary/20 shadow-xl space-x-2 space-x-reverse">
            <Button
              variant={viewMode === 'elegant' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {setViewMode('elegant'); setCurrentIndex(0);}}
              className="flex items-center space-x-1 space-x-reverse"
              data-testid="button-elegant"
            >
              <Sparkles className="w-4 h-4" />
              <span>عرض أنيق</span>
            </Button>
            <Button
              variant={viewMode === 'showcase' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('showcase')}
              className="flex items-center space-x-1 space-x-reverse"
              data-testid="button-showcase"
            >
              <Layers className="w-4 h-4" />
              <span>عرض شامل</span>
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center space-x-1 space-x-reverse"
              data-testid="button-grid"
            >
              <Grid3X3 className="w-4 h-4" />
              <span>شبكة</span>
            </Button>
          </div>

          <Button 
            onClick={() => setLocation("/menu")} 
            variant="outline"
            className="bg-card/90 backdrop-blur-xl border-primary/20 hover:bg-primary/10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            العودة
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pb-20">
        {viewMode === 'elegant' && currentItem && (
          <div className="flex items-center justify-center min-h-[80vh] px-6">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Coffee Image Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-600/20 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="relative bg-card/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-primary/30 shadow-2xl group-hover:shadow-primary/20 transition-all duration-700">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img 
                      src={getCoffeeImage(currentItem.id)}
                      alt={currentItem.nameAr}
                      className="w-full h-96 object-cover transition-all duration-700 group-hover:scale-105"
                      data-testid="img-current-drink"
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-coffee.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Coffee Details Section */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-amiri text-5xl font-bold text-primary mb-4 leading-tight">
                    {currentItem.nameAr}
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {currentItem.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-4xl font-bold text-primary">{currentItem.price}</span>
                      <span className="text-2xl text-muted-foreground">ريال</span>
                      {currentItem.oldPrice && (
                        <span className="text-xl text-red-500 line-through">{currentItem.oldPrice}</span>
                      )}
                    </div>
                    {currentItem.oldPrice && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold inline-block">
                        خصم {Math.round(((parseFloat(currentItem.oldPrice) - parseFloat(currentItem.price)) / parseFloat(currentItem.oldPrice)) * 100)}%
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    {Array.from({length: 5}).map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="inline-flex items-center px-6 py-3 bg-primary/10 border border-primary/30 rounded-full">
                  <Coffee className="w-5 h-5 text-primary ml-2" />
                  <span className="text-primary font-semibold">
                    {categoryTitles[currentItem.category] || currentItem.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'showcase' && currentItem && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
            <div className="max-w-4xl w-full text-center space-y-12">
              {/* Featured Item */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-orange-600/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative bg-card/95 backdrop-blur-xl rounded-full p-12 border-2 border-primary/40 shadow-2xl">
                  <img 
                    src={getCoffeeImage(currentItem.id)}
                    alt={currentItem.nameAr}
                    className="w-80 h-80 object-cover rounded-full mx-auto group-hover:scale-105 transition-all duration-700"
                    data-testid="img-showcase-drink"
                    onError={(e) => {
                      e.currentTarget.src = "/images/default-coffee.png";
                    }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="font-amiri text-6xl font-bold text-primary">
                  {currentItem.nameAr}
                </h2>
                <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {currentItem.description}
                </p>
                <div className="text-5xl font-bold text-primary">
                  {currentItem.price} <span className="text-3xl">ريال</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="px-6">
            <div className="max-w-8xl mx-auto">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-16">
                  <h2 className="font-amiri text-4xl font-bold text-primary mb-8 text-center">
                    {categoryTitles[category] || category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {items.map((item, index) => (
                      <Card key={item.id} className="group cursor-pointer transform transition-all duration-500 hover:scale-105 bg-card/95 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl">
                        <div className="relative overflow-hidden">
                          <img 
                            src={getCoffeeImage(item.id)}
                            alt={item.nameAr}
                            className="w-full h-64 object-cover transition-all duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = "/images/default-coffee.png";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
                          {item.oldPrice && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold">
                              خصم {Math.round(((parseFloat(item.oldPrice) - parseFloat(item.price)) / parseFloat(item.oldPrice)) * 100)}%
                            </div>
                          )}
                        </div>
                        <div className="p-6 space-y-4">
                          <h3 className="font-amiri text-2xl font-bold text-primary line-clamp-1">
                            {item.nameAr}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="text-2xl font-bold text-primary">{item.price}</span>
                                <span className="text-lg text-muted-foreground">ريال</span>
                                {item.oldPrice && (
                                  <span className="text-lg text-red-500 line-through">{item.oldPrice}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              {Array.from({length: 5}).map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation for Elegant Mode */}
      {viewMode === 'elegant' && coffeeItems.length > 1 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center space-x-4 space-x-reverse bg-card/95 backdrop-blur-xl rounded-2xl px-8 py-4 border border-primary/30 shadow-2xl">
            <div className="flex space-x-3 space-x-reverse">
              {coffeeItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "w-4 h-4 bg-primary scale-125 shadow-lg" 
                      : "w-3 h-3 bg-muted hover:bg-primary/50"
                  }`}
                  data-testid={`dot-${index}`}
                />
              ))}
            </div>
            
            <div className="h-6 w-px bg-primary/30"></div>
            
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} / {coffeeItems.length}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`${isAutoPlay ? 'text-primary' : 'text-muted-foreground'}`}
              data-testid="button-autoplay"
            >
              {isAutoPlay ? 'إيقاف التلقائي' : 'تشغيل تلقائي'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}