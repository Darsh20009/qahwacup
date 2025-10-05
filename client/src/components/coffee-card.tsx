import { useState } from "react";
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

export default function CoffeeCard({ item }: CoffeeCardProps) {
  const [, setLocation] = useLocation();
  const { addToCart } = useCartStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const discount = item.oldPrice ? 
    Math.round(((parseFloat(item.oldPrice) - parseFloat(item.price)) / parseFloat(item.oldPrice)) * 100) : 0;

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
      className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm rounded-2xl card-hover cursor-pointer overflow-hidden group transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 border border-card-border/50 hover:border-primary/30"
      onClick={handleViewDetails}
      data-testid={`card-coffee-${item.id}`}
    >
      <CardContent className="p-0">
        {/* Premium Image Container */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
          <img 
            src={getCoffeeImage(item.id)}
            alt={item.nameAr}
            className="w-full h-52 object-cover transition-all duration-700 group-hover:scale-110 brightness-95 group-hover:brightness-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/images/default-coffee.png";
            }}
            data-testid={`img-coffee-${item.id}`}
          />

          {/* Status and Discount Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow-lg glow-effect"
                data-testid={`badge-discount-${item.id}`}
              >
                خصم {discount}%
              </Badge>
            )}
            
            {item.availabilityStatus && item.availabilityStatus !== 'available' && (
              <Badge 
                className={
                  item.availabilityStatus === 'out_of_stock' ? "bg-red-500" :
                  item.availabilityStatus === 'coming_soon' ? "bg-blue-500" :
                  "bg-orange-500"
                }
                data-testid={`badge-availability-${item.id}`}
              >
                {item.availabilityStatus === 'out_of_stock' && "نفذت الكمية"}
                {item.availabilityStatus === 'coming_soon' && "قريباً"}
                {item.availabilityStatus === 'temporarily_unavailable' && "غير متوفر مؤقتاً"}
              </Badge>
            )}
          </div>

          {/* Elegant Quick View Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-card/90 backdrop-blur-sm border border-card-border hover:bg-primary hover:text-primary-foreground shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleViewDetails();
            }}
            data-testid={`button-view-${item.id}`}
          >
            <Eye className="w-4 h-4" />
          </Button>

          {/* Floating Coffee Steam Effect */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
            <img 
              src="/attached_assets/Screenshot 2025-10-05 003822_1759666311817.png"
              alt="Coffee Cup"
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        {/* Elegant Content */}
        <div className="p-6 space-y-4">
          <div className="text-center border-b border-border/30 pb-3 space-y-2">
            <h4 className="font-amiri text-xl font-bold text-primary mb-1 golden-gradient" data-testid={`text-name-${item.id}`}>
              {item.nameAr}
            </h4>

            {/* Coffee Strength Indicator */}
            <div className="flex justify-center">
              <CoffeeStrengthBadge 
                strength={item.coffeeStrength} 
                strengthLevel={item.strengthLevel}
                size="sm"
                className="transform transition-all duration-300 hover:scale-105"
              />
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 pt-1" data-testid={`text-description-${item.id}`}>
              {item.description}
            </p>
          </div>

          {/* Premium Price Section */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-right">
              {item.oldPrice && (
                <div className="price-old text-sm text-muted-foreground" data-testid={`text-old-price-${item.id}`}>
                  {item.oldPrice} ريال
                </div>
              )}
              <div className="text-primary font-bold text-xl font-amiri" data-testid={`text-price-${item.id}`}>
                {item.price} ريال
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              size="sm"
              disabled={item.isAvailable === 0 || (item.availabilityStatus && item.availabilityStatus !== 'available')}
              className={`bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-primary/30 rounded-full px-6 py-3 font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                isAnimating ? 'add-to-cart-animation glow-effect' : ''
              }`}
              data-testid={`button-add-${item.id}`}
            >
              <Plus className="w-4 h-4 ml-1" />
              {item.availabilityStatus === 'out_of_stock' ? '❌ نفذ' :
               item.availabilityStatus === 'coming_soon' ? '🔜 قريباً' :
               item.availabilityStatus === 'temporarily_unavailable' ? '⏸️ غير متوفر' :
               isAnimating ? '✨ تم الإضافة' : 'أضف للسلة'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}