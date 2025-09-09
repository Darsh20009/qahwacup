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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">جاري تحميل المنيو...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Creative Dark Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-48 h-48 bg-yellow-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-24 w-36 h-36 bg-yellow-400/6 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-24 left-32 w-56 h-56 bg-yellow-600/7 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-16 w-40 h-40 bg-yellow-300/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 shadow-lg" data-testid="header-menu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Coffee className="w-8 h-8 text-yellow-400" data-testid="icon-header-coffee" />
              <h1 className="font-amiri text-2xl font-bold text-yellow-400" data-testid="text-header-title">
                قهوة كوب
              </h1>
            </div>
            
            <Button 
              onClick={() => setLocation("/cart")}
              variant="default"
              className="relative bg-yellow-500 text-black hover:bg-yellow-400 transition-colors duration-300"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              السلة
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -left-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 text-[#9ea0a7]">

        {/* Menu Section */}
        <section className="mb-16" data-testid="section-menu">
          <div className="text-center mb-12">
            <h2 className="font-amiri text-4xl md:text-5xl font-bold text-yellow-400 mb-4" data-testid="text-menu-title">
              منيو قهوة كوب
            </h2>
            <p className="text-xl text-yellow-200 max-w-2xl mx-auto" data-testid="text-menu-description">
              تشكيلة متنوعة من أجود أنواع القهوة بأسعار مميزة
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8" data-testid="filter-categories">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`transition-colors duration-300 ${selectedCategory === category.id ? "bg-primary text-accent-foreground" : ""}`}
                  data-testid={`button-category-${category.id}`}
                >
                  <Icon className="w-4 h-4 ml-2" />
                  {category.nameAr}
                </Button>
              );
            })}
          </div>

          {/* Coffee Grid */}
          {selectedCategory === "all" ? (
            // Show all categories separately
            (<div className="space-y-12">
              {categories.filter(cat => cat.id !== "all").map((category) => {
                const categoryItems = getCategoryItems(category.id);
                if (categoryItems.length === 0) return null;

                const Icon = category.icon;
                return (
                  <div key={category.id} className="bg-card rounded-2xl p-8 shadow-lg">
                    <h3 className="font-amiri text-3xl font-bold text-primary mb-8 text-center flex items-center justify-center">
                      <Icon className="w-8 h-8 ml-3" />
                      {category.nameAr}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryItems.map((item) => (
                        <CoffeeCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>)
          ) : (
            // Show filtered items
            (<div className="bg-card rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <CoffeeCard key={item.id} item={item} />
                ))}
              </div>
              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg" data-testid="text-no-items">
                    لا توجد عناصر في هذه الفئة
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
