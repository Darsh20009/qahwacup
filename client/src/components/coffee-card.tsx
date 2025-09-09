import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { Plus, Eye } from "lucide-react";
import type { CoffeeItem } from "@shared/schema";

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
      className="bg-background rounded-xl card-hover cursor-pointer overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/30 glow-effect shimmer"
      onClick={handleViewDetails}
      data-testid={`card-coffee-${item.id}`}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative">
          <img 
            src={`${item.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`}
            alt={item.nameAr}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110 brightness-90 group-hover:brightness-100"
            data-testid={`img-coffee-${item.id}`}
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <Badge 
              variant="default" 
              className="absolute top-2 left-2 bg-primary text-accent-foreground text-sm font-semibold"
              data-testid={`badge-discount-${item.id}`}
            >
              خصم {discount}%
            </Badge>
          )}
          
          {/* Quick View Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleViewDetails();
            }}
            data-testid={`button-view-${item.id}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h4 className="text-xl font-bold text-foreground mb-2" data-testid={`text-name-${item.id}`}>
            {item.nameAr}
          </h4>
          <p className="text-muted-foreground mb-4 text-sm line-clamp-2" data-testid={`text-description-${item.id}`}>
            {item.description}
          </p>
          
          {/* Price and Add Button */}
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              {item.oldPrice && (
                <span className="price-old text-sm" data-testid={`text-old-price-${item.id}`}>
                  {item.oldPrice} ريال
                </span>
              )}
              <span className="text-primary font-bold text-lg" data-testid={`text-price-${item.id}`}>
                {item.price} ريال
              </span>
            </div>
            
            <Button
              onClick={handleAddToCart}
              size="sm"
              className={`bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-yellow-500/50 ${
                isAnimating ? 'add-to-cart-animation animate-pulse' : ''
              }`}
              data-testid={`button-add-${item.id}`}
            >
              <Plus className="w-4 h-4 ml-1" />
              {isAnimating ? '✨ تم الإضافة' : '🛒 أضف'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
