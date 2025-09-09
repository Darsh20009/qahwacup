import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CoffeeCard from "@/components/coffee-card";
import { useCartStore } from "@/lib/cart-store";
import { useLocation } from "wouter";
import { Coffee, ShoppingCart, Flame, Snowflake } from "lucide-react";
import type { CoffeeItem } from "@shared/schema";

export default function MenuPage() {
  const { cartItems } = useCartStore();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    { id: "all", nameAr: "الكل", nameEn: "All", icon: Coffee },
    { id: "basic", nameAr: "قهوة أساسية", nameEn: "Basic Coffee", icon: Coffee },
    { id: "hot", nameAr: "قهوة ساخنة", nameEn: "Hot Coffee", icon: Flame },
    { id: "cold", nameAr: "قهوة باردة", nameEn: "Cold Coffee", icon: Snowflake },
  ];

  const filteredItems = selectedCategory === "all" 
    ? coffeeItems 
    : coffeeItems.filter(item => item.category === selectedCategory);

  const getCategoryItems = (category: string) => 
    coffeeItems.filter(item => item.category === category);

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
            جاري تحضير المنيو الخاص
          </h3>
          <p className="text-muted-foreground text-xl">أفضل ما لدينا من القهوة الفاخرة</p>
          
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
    <div className="min-h-screen bg-background">
      {/* Elegant Beige Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-16 left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl float-animation"></div>
        <div className="absolute top-40 right-24 w-36 h-36 bg-secondary/8 rounded-full blur-2xl float-animation" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-24 left-32 w-56 h-56 bg-accent/12 rounded-full blur-3xl float-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-16 w-40 h-40 bg-primary/8 rounded-full blur-2xl float-animation" style={{animationDelay: '0.5s'}}></div>
        
        {/* Subtle Coffee Bean Pattern */}
        <div className="absolute top-32 right-1/3 w-8 h-8 bg-primary/5 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-secondary/6 rounded-full"></div>
        <div className="absolute top-1/2 right-1/5 w-4 h-4 bg-accent/7 rounded-full"></div>
      </div>
      {/* Elegant Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-card-border z-40 shadow-xl" data-testid="header-menu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <Coffee className="w-10 h-10 text-primary coffee-steam" data-testid="icon-header-coffee" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="font-amiri text-3xl font-bold text-primary golden-gradient" data-testid="text-header-title">
                  قهوة كوب
                </h1>
                <p className="text-sm text-muted-foreground">تجربة قهوة استثنائية</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setLocation("/cart")}
              variant="default"
              className="relative bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl btn-primary"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              السلة
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -left-2 h-7 w-7 flex items-center justify-center p-0 text-sm font-bold animate-pulse"
                  data-testid="badge-cart-count"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

        {/* Elegant Menu Section */}
        <section className="mb-20" data-testid="section-menu">
          <div className="text-center mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
            <div className="relative inline-block mb-6">
              <h2 className="font-amiri text-5xl md:text-6xl font-bold text-primary mb-4 text-reveal" data-testid="text-menu-title">
                منيو قهوة كوب الفاخر
              </h2>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full"></div>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-500" data-testid="text-menu-description">
              انطلق في رحلة قهوة استثنائية مع تشكيلتنا المختارة بعناية من أجود حبوب القهوة العربية الأصيلة، 
              محضرة بحرفية عالية لتقدم لك تجربة لا تُنسى مع كل رشفة
            </p>
            
            {/* Decorative Coffee Beans */}
            <div className="flex justify-center space-x-8 mt-8">
              <div className="w-4 h-4 bg-primary/40 rounded-full animate-pulse"></div>
              <div className="w-6 h-6 bg-primary/60 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
              <div className="w-4 h-4 bg-primary/40 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
            </div>
          </div>

          {/* Elegant Category Filter */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-700" data-testid="filter-categories">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1
                    ${selectedCategory === category.id 
                      ? "bg-primary text-primary-foreground btn-primary glow-effect" 
                      : "bg-card/80 border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                    }
                  `}
                  data-testid={`button-category-${category.id}`}
                  style={{animationDelay: `${index * 0.1 + 0.8}s`}}
                >
                  <Icon className="w-5 h-5 ml-2" />
                  {category.nameAr}
                </Button>
              );
            })}
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
                    className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-card-border hover:shadow-3xl transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000"
                    style={{animationDelay: `${categoryIndex * 0.2 + 1}s`}}
                  >
                    {/* Category Header */}
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center justify-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-8 py-4 mb-4">
                        <Icon className="w-10 h-10 ml-4 text-primary" />
                        <h3 className="font-amiri text-4xl font-bold text-primary golden-gradient">
                          {category.nameAr}
                        </h3>
                      </div>
                      <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full"></div>
                    </div>
                    
                    {/* Coffee Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
            // Show filtered items with elegant layout
            (<div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-card-border animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
