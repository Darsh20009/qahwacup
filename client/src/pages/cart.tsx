import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, showCheckout } = useCartStore();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="page-cart-empty">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2" data-testid="text-empty-title">
              السلة فارغة
            </h2>
            <p className="text-muted-foreground mb-4" data-testid="text-empty-description">
              لم تقم بإضافة أي عناصر إلى السلة بعد
            </p>
            <Button variant="default" className="bg-primary text-accent-foreground" data-testid="button-continue-shopping">
              متابعة التسوق
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8" data-testid="page-cart">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold text-foreground" data-testid="text-cart-title">
              <ShoppingCart className="w-6 h-6 ml-2" />
              سلة الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.coffeeItemId} 
                className="flex justify-between items-center bg-background rounded-xl p-4 border"
                data-testid={`cart-item-${item.coffeeItemId}`}
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-lg" data-testid={`text-item-name-${item.coffeeItemId}`}>
                    {item.coffeeItem?.nameAr}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid={`text-item-details-${item.coffeeItemId}`}>
                    {item.coffeeItem?.price} ريال × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.coffeeItemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    data-testid={`button-decrease-${item.coffeeItemId}`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-semibold text-foreground w-8 text-center" data-testid={`text-quantity-${item.coffeeItemId}`}>
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.coffeeItemId, item.quantity + 1)}
                    data-testid={`button-increase-${item.coffeeItemId}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFromCart(item.coffeeItemId)}
                    className="mr-2"
                    data-testid={`button-remove-${item.coffeeItemId}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-foreground" data-testid="text-total-label">
                  المجموع:
                </span>
                <span className="text-2xl font-bold text-primary" data-testid="text-total-amount">
                  {getTotalPrice().toFixed(2)} ريال
                </span>
              </div>
              <Button 
                onClick={showCheckout}
                size="lg"
                className="w-full btn-primary text-accent-foreground py-3 text-lg font-semibold"
                data-testid="button-checkout"
              >
                إتمام الطلب
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
