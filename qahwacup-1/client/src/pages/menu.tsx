import { useState, memo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PWAInstallButton } from "@/components/pwa-install";
import CoffeeCard from "@/components/coffee-card";
import { useCartStore } from "@/lib/cart-store";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLocation } from "wouter";
import { Coffee, ShoppingCart, Flame, Snowflake, Star, Filter, CreditCard, Cake, Sprout, Zap, LogOut, User, MapPin, MoreVertical, Download, Info } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import qahwaLogo from "@/assets/qahwacup-logo.png";
import { COFFEE_STRENGTH_CONFIG, getCoffeeStrengthConfig, filterCoffeeByStrength, type CoffeeStrengthType } from "@/lib/utils";
import type { CoffeeItem, Branch } from "@shared/schema";
import CurrentOrderBanner from "@/components/current-order-banner";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { useSession } from "@/hooks/use-session";
import BranchCard from "@/components/branch-card";
import LocationDistanceMap from "@/components/location-distance-map";

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MenuPage = memo(function MenuPage() {
  const { cartItems } = useCartStore();
  const { isAuthenticated } = useCustomer();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStrength, setSelectedStrength] = useState<CoffeeStrengthType | "all">("all");
  const [selectedBranch, setSelectedBranch] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedBranch') || "";
    }
    return "";
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  // Persist selected branch to localStorage whenever it changes
  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem('selectedBranch', selectedBranch);
    }
  }, [selectedBranch]);

  // Get user location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Riyadh center if geolocation fails
          setUserLocation({ lat: 24.7136, lng: 46.6753 });
        }
      );
    }
  }, []);

  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items", selectedBranch],
    queryFn: async () => {
      const url = `/api/coffee-items${selectedBranch ? `?branchId=${selectedBranch}` : ""}`;
      const res = await fetch(url);
      return res.json();
    }
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

  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);

  const strengthOptions = [
    { id: "all" as const, labelAr: "جميع الأنواع", icon: Star },
    { id: "mild" as const, labelAr: "خفيف (1-4)", icon: Sprout },
    { id: "medium" as const, labelAr: "متوسط (4-8)", icon: Zap },
    { id: "strong" as const, labelAr: "قوي (8-12)", icon: Flame },
    { id: "classic" as const, labelAr: "العادي/الكلاسيك", icon: Coffee },
  ];

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
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.8s'}}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <Coffee className="w-20 h-20 text-primary mx-auto relative z-10 coffee-steam" />
          </div>
          
          <h3 className="font-amiri text-3xl font-bold text-primary mb-4 golden-gradient">
            جاري تحضير المنيو
          </h3>
          <p className="text-muted-foreground text-xl">أفضل ما لدينا من القهوة الطازجة</p>
          
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
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50">
      <CurrentOrderBanner />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-secondary/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-muted/30 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <header className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-40 shadow-sm" data-testid="header-menu">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              <img 
                src={qahwaLogo} 
                alt="قهوة كوب" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain" 
                data-testid="logo-header"
              />
              <div>
                <h1 className="font-amiri text-lg sm:text-2xl font-bold text-foreground" data-testid="text-header-title">
                  قهوة كوب
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">تجربة قهوة استثنائية</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-3">
              
              <PWAInstallButton />

              {selectedBranch && (
                <div className="relative">
                  <Badge 
                    variant="outline" 
                    onClick={() => setIsBranchSelectorOpen(!isBranchSelectorOpen)}
                    className="bg-primary/10 border-primary/30 text-primary px-3 py-1 rounded-full animate-in fade-in zoom-in duration-500 cursor-pointer hover:bg-primary/20 transition-colors text-[10px] sm:text-xs"
                  >
                    <MapPin className="w-3 h-3 ml-1" />
                    {branches.find(b => ((b as any).id || (b as any)._id) === selectedBranch)?.nameAr}
                  </Badge>

                  {isBranchSelectorOpen && (
                    <div className="absolute top-full mt-2 left-0 w-64 bg-background border border-border rounded-xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="text-right p-2 border-b mb-2">
                        <p className="text-xs font-bold text-primary">اختر فرعاً آخر</p>
                      </div>
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {branches.map((branch) => (
                          <div
                            key={(branch as any).id || (branch as any)._id}
                            onClick={() => {
                              setSelectedBranch((branch as any).id || (branch as any)._id || "");
                              setIsBranchSelectorOpen(false);
                            }}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedBranch === ((branch as any).id || (branch as any)._id) 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-muted"
                            }`}
                          >
                            <span className="text-sm font-semibold">{branch.nameAr}</span>
                            <MapPin className={`w-4 h-4 ${selectedBranch === ((branch as any).id || (branch as any)._id) ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={() => setLocation("/cart")}
                variant="default"
                size="sm"
                className="relative transition-all duration-300 px-3 sm:px-6 h-9 sm:h-10 text-xs sm:text-base font-semibold shadow-md hover:shadow-lg rounded-lg"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 sm:ml-2" />
                <span className="hidden sm:inline">السلة</span>
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1.5 sm:-top-2 -left-1.5 sm:-left-2 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center p-0 text-[10px] sm:text-sm font-bold"
                    data-testid="badge-cart-count"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>

              <Button 
                onClick={() => setLocation(isAuthenticated ? "/copy-card" : "/auth")}
                variant="outline"
                size="icon"
                className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 h-9 w-9 sm:h-10 sm:w-10 rounded-lg shadow-sm"
                title={isAuthenticated ? "بطاقة كوبي" : "تسجيل الدخول"}
              >
                {isAuthenticated ? <User className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 relative z-10">
        <section className="mb-12 sm:mb-16 md:mb-20" data-testid="section-menu">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
            <div className="relative inline-block mb-4 sm:mb-6">
              <h2 className="font-amiri text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4" data-testid="text-menu-title">
                منيو قهوة كوب
              </h2>
              <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-muted-foreground/30 rounded-full"></div>
            </div>
            
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-500 px-4" data-testid="text-menu-description">
              انطلق في رحلة قهوة استثنائية مع تشكيلتنا المختارة بعناية من أجود حبوب القهوة العربية الأصيلة، 
              محضرة بحرفية عالية لتقدم لك تجربة لا تُنسى مع كل رشفة
            </p>
            
            <div className="flex justify-center space-x-4 mt-6">
              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
              <div className="w-2 h-2 bg-primary/50 rounded-full"></div>
              <div className="w-2 h-2 bg-secondary/50 rounded-full"></div>
            </div>
          </div>

          {/* Branch Selection Overlay - Table-like Design */}
          {!selectedBranch && userLocation && branches.length > 1 && (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
              <div className="max-w-4xl w-full py-6 px-4 space-y-6 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
                <div className="text-center space-y-2 mb-2">
                  <h2 className="font-amiri text-lg sm:text-2xl font-bold text-foreground leading-tight">أهلاً بك في قهوة كوب</h2>
                  <p className="text-muted-foreground text-xs sm:text-sm max-w-xs mx-auto font-medium">لطفاً اختر الفرع لبدء طلبك</p>
                </div>

                {/* Map View - Positioned at the Top */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-card w-full">
                  <div className="h-40 sm:h-64 md:h-80">
                    {(() => {
                      if (!branches.length) return null;
                      const coords = (branches as any[]).map(b => ({
                        lat: b.location?.latitude || 24.7136,
                        lng: b.location?.longitude || 46.6753,
                      }));
                      const center = {
                        lat: coords.reduce((sum, c) => sum + c.lat, 0) / coords.length,
                        lng: coords.reduce((sum, c) => sum + c.lng, 0) / coords.length,
                      };
                      return (
                        <LocationDistanceMap
                          userLocation={userLocation}
                          branchLocation={center}
                          distance={0}
                          allBranches={(branches as any[]).map(b => ({
                            id: b.id || b._id || "",
                            lat: b.location?.latitude || 24.7136,
                            lng: b.location?.longitude || 46.6753,
                            nameAr: b.nameAr || "فرع"
                          }))}
                        />
                      );
                    })()}
                  </div>
                </div>

                {/* Divider Line - Table-like feel */}
                <div className="w-full flex items-center gap-4 py-2">
                  <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-primary/20"></div>
                  <Coffee className="w-5 h-5 text-primary/40" />
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-primary/20"></div>
                </div>

                {/* Badges Grid - Positioned at the Bottom */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full">
                  {branches.map((branch, index) => {
                    const branchLat = (branch as any).location?.latitude || 24.7136;
                    const branchLng = (branch as any).location?.longitude || 46.6753;
                    const distance = calculateDistance(userLocation.lat, userLocation.lng, branchLat, branchLng);
                    const distanceText = distance > 1000 ? `${(distance / 1000).toFixed(1)} كم` : `${Math.round(distance)} متر`;

                    return (
                      <button
                        key={(branch as any).id || (branch as any)._id}
                        onClick={() => setSelectedBranch((branch as any).id || (branch as any)._id || "")}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="group relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 border-primary/5 bg-card hover:border-primary hover:bg-primary/[0.02] transition-all duration-300 shadow-sm hover:shadow-xl text-center animate-in slide-in-from-bottom-2"
                      >
                        <MapPin className="w-4 h-4 text-primary/40 group-hover:text-primary mb-1.5 transition-colors duration-500" />
                        <h3 className="font-amiri font-bold text-foreground text-[11px] sm:text-[13px] leading-tight mb-1">{branch.nameAr}</h3>
                        <span className="text-[9px] sm:text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">{distanceText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-6 mb-6 sm:mb-8 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-700" data-testid="filter-categories">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 transition-all duration-300 px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base lg:text-lg font-semibold rounded-full shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transform hover:-translate-y-0.5 sm:hover:-translate-y-1
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
                </button>
              );
            })}
          </div>

          <div className="mb-8 sm:mb-10 md:mb-12 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-900" data-testid="filter-strength">
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

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-2">
              {strengthOptions.map((strength, index) => {
                const config = strength.id === "all" ? null : getCoffeeStrengthConfig(strength.id);
                const isSelected = selectedStrength === strength.id;
                const StrengthIcon = strength.icon;
                
                return (
                  <button
                    key={strength.id}
                    onClick={() => setSelectedStrength(strength.id)}
                    className={`
                      flex items-center gap-2 transition-all duration-300 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-full shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg transform hover:-translate-y-0.5
                      ${isSelected 
                        ? "bg-primary text-primary-foreground glow-effect" 
                        : config 
                          ? `${config.bgColor} ${config.textColor} ${config.borderColor} border-2 hover:scale-105`
                          : "bg-muted text-foreground border-2 border-border hover:bg-muted/80"
                      }
                    `}
                    data-testid={`button-strength-${strength.id}`}
                    style={{animationDelay: `${index * 0.1 + 1.1}s`}}
                  >
                    <StrengthIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    <span className="text-xs sm:text-sm md:text-base">{strength.labelAr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedCategory === "all" ? (
            <div className="space-y-16">
              {categories.filter(cat => cat.id !== "all").map((category, categoryIndex) => {
                const categoryItems = getCategoryItems(category.id);
                if (categoryItems.length === 0) return null;

                const Icon = category.icon;
                return (
                  <div 
                    key={category.id} 
                    className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl sm:shadow-2xl border border-border hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000"
                    style={{animationDelay: `${categoryIndex * 0.2 + 1}s`}}
                  >
                    <div className="text-center mb-6 sm:mb-8 md:mb-12">
                      <div className="inline-flex items-center justify-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4">
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ml-2 sm:ml-3 md:ml-4 text-primary" />
                        <h3 className="font-amiri text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary golden-gradient">
                          {category.nameAr}
                        </h3>
                      </div>
                      <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full"></div>
                    </div>
                    
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
            </div>
          ) : (
            <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl sm:shadow-2xl border border-border animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
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
                <EmptyState
                  title="لا توجد منتجات"
                  description="لم نجد أي منتجات في هذه الفئة حالياً"
                  icon={<Coffee className="h-10 w-10 text-muted-foreground" />}
                />
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
});

export default MenuPage;
