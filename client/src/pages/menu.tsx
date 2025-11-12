import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CoffeeCard from "@/components/coffee-card";
import { useCartStore } from "@/lib/cart-store";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLocation } from "wouter";
import { Coffee, ShoppingCart, Flame, Snowflake, Star, Filter, CreditCard, User, Cake, Sprout, Zap } from "lucide-react";
import { COFFEE_STRENGTH_CONFIG, getCoffeeStrengthConfig, filterCoffeeByStrength, type CoffeeStrengthType } from "@/lib/utils";
import type { CoffeeItem } from "@shared/schema";
import CurrentOrderBanner from "@/components/current-order-banner";

export default function MenuPage() {
  const { cartItems } = useCartStore();
  const { isAuthenticated } = useCustomer();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStrength, setSelectedStrength] = useState<CoffeeStrengthType | "all">("all");

  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    { id: "all", nameAr: "الكل", nameEn: "All", icon: Coffee },
    { id: "basic", nameAr: "قهوة أساسية", nameEn: "Basic Coffee", icon: Coffee },
    { id: "hot", nameAr: "قهوة ساخنة", nameEn: "Hot Coffee", icon: Flame },
    { id: "cold", nameAr: "قهوة باردة", nameEn: "Cold Coffee", icon: Snowflake },
    { id: "specialty", nameAr: "المشروبات الإضافية", nameEn: "Specialty Drinks", icon: Star },
    { id: "desserts", nameAr: "الحلويات", nameEn: "Desserts", icon: Cake },
  ];

  // Coffee strength filter options
  const strengthOptions = [
    { id: "all" as const, labelAr: "جميع الأنواع", icon: Star },
    { id: "mild" as const, labelAr: "خفيف (1-4)", icon: Sprout },
    { id: "medium" as const, labelAr: "متوسط (4-8)", icon: Zap },
    { id: "strong" as const, labelAr: "قوي (8-12)", icon: Flame },
    { id: "classic" as const, labelAr: "العادي/الكلاسيك", icon: Coffee },
  ];

  // Filter by both category and strength
  let filteredItems = selectedCategory === "all" 
    ? coffeeItems 
    : coffeeItems.filter(item => item.category === selectedCategory);
  
  filteredItems = filterCoffeeByStrength(filteredItems, selectedStrength);

  const getCategoryItems = (category: string) => {
    let items = coffeeItems.filter(item => item.category === category);
    return filterCoffeeByStrength(items, selectedStrength);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
        {/* Elegant Loading Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.8s'}}></div>
        </div>
        
        <div className="text-center relative z-10">
          {/* Elegant Loading Animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <Coffee className="w-20 h-20 text-primary mx-auto relative z-10 coffee-steam" />
          </div>
          
          <h3 className="font-amiri text-3xl font-bold text-primary mb-4 golden-gradient">
            جاري تحضير المنيو
          </h3>
          <p className="text-muted-foreground text-xl">أفضل ما لدينا من القهوة الطازجة</p>
          
          {/* Elegant Loading Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Current Order Banner */}
      <CurrentOrderBanner />
      
      {/* Soft Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-indigo-200/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-slate-200/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      {/* Clean Header - Mobile Optimized */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 shadow-sm" data-testid="header-menu">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" data-testid="icon-header-coffee" />
              <div>
                <h1 className="font-amiri text-lg sm:text-2xl font-bold text-slate-700" data-testid="text-header-title">
                  قهوة كوب
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">تجربة قهوة استثنائية</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                onClick={() => setLocation(isAuthenticated ? "/copy-card" : "/auth")}
                variant="outline"
                size="sm"
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 transition-all duration-300 px-2 sm:px-4 py-1.5 sm:py-2 shadow-sm hover:shadow-md rounded-lg text-xs sm:text-sm"
                data-testid="button-my-card"
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 sm:ml-2" />
                <span className="hidden sm:inline">
                  {isAuthenticated ? "بطاقة كوبي" : "تسجيل الدخول"}
                </span>
              </Button>
              
              <Button 
                onClick={() => setLocation("/cart")}
                variant="default"
                size="sm"
                className="relative bg-slate-600 hover:bg-slate-700 text-white transition-all duration-300 px-3 sm:px-6 py-1.5 sm:py-3 text-sm sm:text-lg font-semibold shadow-md hover:shadow-lg rounded-lg"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 sm:ml-2" />
                <span className="hidden sm:inline">السلة</span>
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1.5 sm:-top-2 -left-1.5 sm:-left-2 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center p-0 text-xs sm:text-sm font-bold bg-blue-500"
                    data-testid="badge-cart-count"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 relative z-10">

        {/* Elegant Menu Section - Mobile Optimized */}
        <section className="mb-12 sm:mb-16 md:mb-20" data-testid="section-menu">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
            <div className="relative inline-block mb-4 sm:mb-6">
              <h2 className="font-amiri text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 mb-2 sm:mb-4" data-testid="text-menu-title">
                منيو قهوة كوب
              </h2>
              <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-slate-300 rounded-full"></div>
            </div>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-500 px-4" data-testid="text-menu-description">
              انطلق في رحلة قهوة استثنائية مع تشكيلتنا المختارة بعناية من أجود حبوب القهوة العربية الأصيلة، 
              محضرة بحرفية عالية لتقدم لك تجربة لا تُنسى مع كل رشفة
            </p>
            
            {/* Simple Coffee Elements */}
            <div className="flex justify-center space-x-4 mt-6">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            </div>
          </div>

          {/* Elegant Category Filter - Mobile Optimized */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-6 mb-6 sm:mb-8 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-700" data-testid="filter-categories">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                  className={`
                    transition-all duration-300 px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base lg:text-lg font-semibold rounded-full shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transform hover:-translate-y-0.5 sm:hover:-translate-y-1
                    ${selectedCategory === category.id 
                      ? "bg-primary text-primary-foreground btn-primary glow-effect" 
                      : "bg-card/80 border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                    }
                  `}
                  data-testid={`button-category-${category.id}`}
                  style={{animationDelay: `${index * 0.1 + 0.8}s`}}
                >
                  <Icon className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1 sm:ml-2" />
                  <span className="text-xs sm:text-sm md:text-base">{category.nameAr}</span>
                </Button>
              );
            })}
          </div>

          {/* Coffee Strength Filter - Mobile Optimized */}
          <div className="mb-8 sm:mb-10 md:mb-12 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-900" data-testid="filter-strength">
            {/* Filter Title */}
            <div className="text-center mb-4 sm:mb-6 px-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                <h3 className="font-amiri text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary">
                  فلتر حسب نسبة القهوة
                </h3>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                اختر نسبة القوة المفضلة لديك
              </p>
            </div>

            {/* Strength Filter Buttons - Mobile Friendly */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-2">
              {strengthOptions.map((strength, index) => {
                const config = strength.id === "all" ? null : getCoffeeStrengthConfig(strength.id);
                const isSelected = selectedStrength === strength.id;
                const StrengthIcon = strength.icon;
                
                return (
                  <Button
                    key={strength.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelectedStrength(strength.id)}
                    size="sm"
                    className={`
                      transition-all duration-300 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-full shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg transform hover:-translate-y-0.5
                      ${isSelected 
                        ? "bg-primary text-primary-foreground glow-effect" 
                        : config 
                          ? `${config.bgColor} ${config.textColor} ${config.borderColor} border-2 hover:scale-105`
                          : "bg-slate-100 text-slate-700 border-2 border-slate-300 hover:bg-slate-200"
                      }
                    `}
                    data-testid={`button-strength-${strength.id}`}
                    style={{animationDelay: `${index * 0.1 + 1.1}s`}}
                  >
                    <StrengthIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    <span className="text-xs sm:text-sm md:text-base">{strength.labelAr}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Elegant Coffee Grid */}
          {selectedCategory === "all" ? (
            // Show all categories separately with luxury design
            (<div className="space-y-16">
              {categories.filter(cat => cat.id !== "all").map((category, categoryIndex) => {
                const categoryItems = getCategoryItems(category.id);
                if (categoryItems.length === 0) return null;

                const Icon = category.icon;
                return (
                  <div 
                    key={category.id} 
                    className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl sm:shadow-2xl border border-card-border hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000"
                    style={{animationDelay: `${categoryIndex * 0.2 + 1}s`}}
                  >
                    {/* Category Header - Mobile Optimized */}
                    <div className="text-center mb-6 sm:mb-8 md:mb-12">
                      <div className="inline-flex items-center justify-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4">
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ml-2 sm:ml-3 md:ml-4 text-primary" />
                        <h3 className="font-amiri text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary golden-gradient">
                          {category.nameAr}
                        </h3>
                      </div>
                      <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full"></div>
                    </div>
                    
                    {/* Coffee Items Grid - Mobile First */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                      {categoryItems.map((item, itemIndex) => (
                        <div 
                          key={item.id}
                          className="animate-in fade-in-0 slide-in-from-bottom-10 duration-700"
                          style={{animationDelay: `${(categoryIndex * 0.2 + itemIndex * 0.1 + 1.5)}s`}}
                        >
                          <CoffeeCard item={item} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>)
          ) : (
            // Show filtered items with elegant layout - Mobile Optimized
            (<div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl sm:shadow-2xl border border-card-border animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {filteredItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-10 duration-700"
                    style={{animationDelay: `${index * 0.1 + 0.5}s`}}
                  >
                    <CoffeeCard item={item} />
                  </div>
                ))}
              </div>
              {filteredItems.length === 0 && (
                <div className="text-center py-16">
                  <div className="relative inline-block mb-6">
                    <Coffee className="w-20 h-20 text-muted-foreground mx-auto coffee-steam" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/30 rounded-full animate-ping"></div>
                  </div>
                  <h4 className="font-amiri text-2xl font-bold text-primary mb-2">لا توجد منتجات</h4>
                  <p className="text-muted-foreground text-lg" data-testid="text-no-items">
                    لم نجد أي منتجات في هذه الفئة حالياً
                  </p>
                </div>
              )}
            </div>)
          )}
        </section>
      </main>
    </div>
  );
}
