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
      className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm rounded-2xl card-hover cursor-pointer overflow-hidden group transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 border border-card-border/50 hover:border-primary/30"
      onClick={handleViewDetails}
      data-testid={`card-coffee-${item.id}`}
    >
      <CardContent className="p-0">
        {/* Premium Image Container */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
          <img 
            src={`/images/${item.id}.png`}
            alt={item.nameAr}
            className="w-full h-52 object-cover transition-all duration-700 group-hover:scale-110 brightness-95 group-hover:brightness-105"
            onError={(e) => {
              e.currentTarget.src = "/images/default-coffee.png";
            }}
            data-testid={`img-coffee-${item.id}`}
          />
          
          {/* Elegant Discount Badge */}
          {discount > 0 && (
            <Badge 
              variant="default" 
              className="absolute top-3 left-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow-lg glow-effect"
              data-testid={`badge-discount-${item.id}`}
            >
              خصم {discount}%
            </Badge>
          )}
          
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
              src="data:image/jpeg;base64,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"
              alt="Coffee Cup"
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        {/* Elegant Content */}
        <div className="p-6 space-y-4">
          <div className="text-center border-b border-border/30 pb-3">
            <h4 className="font-amiri text-xl font-bold text-primary mb-1 golden-gradient" data-testid={`text-name-${item.id}`}>
              {item.nameAr}
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2" data-testid={`text-description-${item.id}`}>
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
              className={`bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-primary/30 rounded-full px-6 py-3 font-semibold btn-primary ${
                isAnimating ? 'add-to-cart-animation glow-effect' : ''
              }`}
              data-testid={`button-add-${item.id}`}
            >
              <Plus className="w-4 h-4 ml-1" />
              {isAnimating ? '✨ تم الإضافة' : 'أضف للسلة'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
