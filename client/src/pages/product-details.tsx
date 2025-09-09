import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { ArrowRight, Plus, Minus } from "lucide-react";
import { useState } from "react";
import type { CoffeeItem } from "@shared/schema";
import qahwaCupProduct from "@/assets/qahwa-cup-product.png";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const { data: item, isLoading } = useQuery<CoffeeItem>({
    queryKey: ["/api/coffee-items", params?.id],
    enabled: !!params?.id,
  });

  const handleAddToCart = () => {
    if (item) {
      addToCart(item.id, quantity);
      setLocation("/menu");
    }
  };

  const handleGoBack = () => {
    setLocation("/menu");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">المنتج غير موجود</p>
            <Button onClick={handleGoBack} variant="outline">
              العودة للمنيو
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const discount = item.oldPrice ? 
    Math.round(((parseFloat(item.oldPrice) - parseFloat(item.price)) / parseFloat(item.oldPrice)) * 100) : 0;

  return (
    <div className="min-h-screen bg-background" data-testid="page-product-details">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          onClick={handleGoBack}
          variant="ghost" 
          className="mb-6 hover-elevate"
          data-testid="button-back"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للمنيو
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative" data-testid="section-product-image">
            <img 
              src="/attached_assets/Elegant Coffee Culture Design_1757441959827.png"
              alt={item.nameAr}
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "/images/default-coffee.png";
              }}
              data-testid="img-product"
            />
            {discount > 0 && (
              <Badge 
                variant="default" 
                className="absolute top-4 left-4 bg-primary text-accent-foreground text-sm font-semibold px-3 py-1"
                data-testid="badge-discount"
              >
                خصم {discount}%
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6" data-testid="section-product-info">
            <div>
              <h1 className="font-amiri text-4xl font-bold text-foreground mb-2" data-testid="text-product-name">
                {item.nameAr}
              </h1>
              {item.nameEn && (
                <p className="text-lg text-muted-foreground" data-testid="text-product-name-en">
                  {item.nameEn}
                </p>
              )}
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-product-description">
              {item.description}
            </p>

            {/* Category Badge */}
            <Badge variant="outline" className="w-fit" data-testid="badge-category">
              {item.category === 'basic' && 'قهوة أساسية'}
              {item.category === 'hot' && 'قهوة ساخنة'}
              {item.category === 'cold' && 'قهوة باردة'}
            </Badge>

            {/* Price */}
            <div className="space-y-2" data-testid="section-pricing">
              <div className="flex items-center space-x-3">
                {item.oldPrice && (
                  <span className="price-old text-lg line-through" data-testid="text-old-price">
                    {item.oldPrice} ريال
                  </span>
                )}
                <span className="text-3xl font-bold text-primary" data-testid="text-current-price">
                  {item.price} ريال
                </span>
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600" data-testid="text-savings">
                  توفير {(parseFloat(item.oldPrice!) - parseFloat(item.price)).toFixed(2)} ريال
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3" data-testid="section-quantity">
              <label className="text-sm font-semibold text-foreground">الكمية</label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-card rounded-xl p-4 border" data-testid="section-total">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">المجموع:</span>
                <span className="text-2xl font-bold text-primary" data-testid="text-total-price">
                  {(parseFloat(item.price) * quantity).toFixed(2)} ريال
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full btn-primary text-accent-foreground py-6 text-lg font-semibold"
              data-testid="button-add-to-cart"
            >
              <Plus className="w-5 h-5 ml-2" />
              أضف للسلة ({quantity})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
