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
            src={item.imageUrl?.startsWith('http') ? `${item.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300` : (item.imageUrl || '/placeholder-coffee.jpg')}
            alt={item.nameAr}
            className="w-full h-52 object-cover transition-all duration-700 group-hover:scale-110 brightness-95 group-hover:brightness-105"
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
            <div className="w-1 h-8 bg-gradient-to-t from-transparent via-primary/30 to-transparent rounded-full coffee-steam"></div>
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
