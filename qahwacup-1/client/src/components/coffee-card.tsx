import { useState, memo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { getCoffeeImage } from "@/lib/coffee-images";
import { Plus, Eye } from "lucide-react";
import type { CoffeeItem } from "@shared/schema";
import CoffeeStrengthBadge from "@/components/coffee-strength-badge";

interface CoffeeCardProps {
 item: CoffeeItem;
}

const CoffeeCard = memo(function CoffeeCard({ item }: CoffeeCardProps) {
 const [, setLocation] = useLocation();
 const { addToCart } = useCartStore();
 const [isAnimating, setIsAnimating] = useState(false);

 const discount = item.oldPrice ? 
 Math.round(((Number(item.oldPrice) - Number(item.price)) / Number(item.oldPrice)) * 100) : 0;

 const handleAddToCart = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();

 setIsAnimating(true);
 addToCart(item.id, 1);

 setTimeout(() => {
 setIsAnimating(false);
 }, 1000);
 };

 const handleViewDetails = () => {
 setLocation(`/product/${item.id}`);
 };

 return (
 <Card 
 className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm rounded-xl sm:rounded-2xl card-hover cursor-pointer overflow-hidden group transform transition-all duration-500 hover:scale-105 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-primary/20 border border-card-border/50 hover:border-primary/30"
 onClick={handleViewDetails}
 data-testid={`card-coffee-${item.id}`}
 >
 <CardContent className="p-0">
 {/* Premium Image Container - Mobile Optimized */}
 <div className="relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
 <img 
 src={item.imageUrl || getCoffeeImage(item.id)}
 alt={item.nameAr}
 className="w-full h-40 sm:h-48 md:h-52 object-cover transition-all duration-700 group-hover:scale-110 brightness-95 group-hover:brightness-105"
 loading="lazy"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 data-testid={`img-coffee-${item.id}`}
 />

 {/* Status and Discount Badges - Mobile Optimized */}
 <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2">
 {discount > 0 && (
 <Badge 
 variant="default" 
 className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg glow-effect"
 data-testid={`badge-discount-${item.id}`}
 >
 خصم {discount}%
 </Badge>
 )}
 
 {item.availabilityStatus && item.availabilityStatus !== 'available' && (
 <Badge 
 className={`text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 ${
 item.availabilityStatus === 'out_of_stock' ? "bg-red-500" :
 item.availabilityStatus === 'coming_soon' ? "bg-blue-500" :
 "bg-orange-500"
 }`}
 data-testid={`badge-availability-${item.id}`}
 >
 {item.availabilityStatus === 'out_of_stock' && "نفذت الكمية "}
 {item.availabilityStatus === 'coming_soon' && "قريباً"}
 {item.availabilityStatus === 'temporarily_unavailable' && "غير متوفر مؤقتاً"}
 </Badge>
 )}
 </div>

 {/* Elegant Quick View Button - Mobile Optimized */}
 <Button
 variant="secondary"
 size="icon"
 className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-card/90 backdrop-blur-sm border border-card-border hover:bg-primary hover:text-primary-foreground shadow-lg"
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 handleViewDetails();
 }}
 data-testid={`button-view-${item.id}`}
 >
 <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
 </Button>

 {/* Floating Coffee Steam Effect */}
 <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
 <img 
 src="/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757428239748.png"
 alt="Coffee Cup"
 className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
 />
 </div>
 </div>

 {/* Elegant Content - Mobile Optimized */}
 <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
 <div className="text-center border-b border-border/30 pb-2 sm:pb-3 space-y-1.5 sm:space-y-2">
 <h4 className="font-amiri text-base sm:text-lg md:text-xl font-bold text-primary mb-1 golden-gradient" data-testid={`text-name-${item.id}`}>
 {item.nameAr}
 </h4>

 {/* Coffee Strength Indicator */}
 <div className="flex justify-center">
 <CoffeeStrengthBadge 
 strength={item.coffeeStrength ?? null} 
 strengthLevel={item.strengthLevel ?? null}
 size="sm"
 className="transform transition-all duration-300 hover:scale-105"
 />
 </div>

 <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2 pt-1" data-testid={`text-description-${item.id}`}>
 {item.description}
 </p>
 </div>

 {/* Premium Price Section - Mobile Optimized */}
 <div className="flex justify-between items-center pt-2">
 <div className="text-right">
 {item.oldPrice && (
 <div className="price-old text-xs sm:text-sm text-muted-foreground" data-testid={`text-old-price-${item.id}`}>
 {item.oldPrice} ريال
 </div>
 )}
 <div className="text-primary font-bold text-lg sm:text-xl md:text-2xl font-amiri" data-testid={`text-price-${item.id}`}>
 {item.price} ريال
 </div>
 </div>

 <Button
 onClick={handleAddToCart}
 size="sm"
 disabled={item.isAvailable === 0 || Boolean(item.availabilityStatus && item.availabilityStatus !== 'available')}
 className={`bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary transition-all duration-300 transform hover:scale-110 shadow-md sm:shadow-lg hover:shadow-primary/30 rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
 isAnimating ? 'add-to-cart-animation glow-effect' : ''
 }`}
 data-testid={`button-add-${item.id}`}
 >
 <Plus className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
 <span className="hidden sm:inline">
 {item.availabilityStatus === 'out_of_stock' ? ' نفذ' :
 item.availabilityStatus === 'coming_soon' ? ' قريباً' :
 item.availabilityStatus === 'temporarily_unavailable' ? '⏸ غير متوفر' :
 isAnimating ? ' تم الإضافة ' : 'أضف للسلة '}
 </span>
 <span className="sm:hidden">
 {item.availabilityStatus === 'out_of_stock' ? '' :
 item.availabilityStatus === 'coming_soon' ? '' :
 item.availabilityStatus === 'temporarily_unavailable' ? '⏸' :
 isAnimating ? '' : 'أضف'}
 </span>
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 );
});

export default CoffeeCard;