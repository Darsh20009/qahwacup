import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";

export default function CartPage() {
 const [, setLocation] = useLocation();
 const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCartStore();

 if (cartItems.length === 0) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center px-4" data-testid="page-cart-empty">
 <Card className="w-full max-w-md">
 <CardContent className="pt-6 text-center">
 <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
 <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2" data-testid="text-empty-title">
 السلةفارغة
 </h2>
 <p className="text-sm sm:text-base text-muted-foreground mb-4" data-testid="text-empty-description">
 لم تقم بإضافة أي عناصر إلى السلةبعد
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
 <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8" data-testid="page-cart">
 <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
 <Card>
 <CardHeader className="pb-3 sm:pb-6">
 <CardTitle className="flex items-center text-lg sm:text-xl md:text-2xl font-bold text-foreground" data-testid="text-cart-title">
 <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
 سلةالطلبات
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 sm:space-y-4">
 {cartItems.map((item) => (
 <div 
 key={item.coffeeItemId} 
 className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0 bg-background rounded-xl p-3 sm:p-4 border"
 data-testid={`cart-item-${item.coffeeItemId}`}
 >
 <div className="flex-1">
 <h4 className="font-semibold text-foreground text-base sm:text-lg" data-testid={`text-item-name-${item.coffeeItemId}`}>
 {item.coffeeItem?.nameAr}
 </h4>
 <p className="text-xs sm:text-sm text-muted-foreground" data-testid={`text-item-details-${item.coffeeItemId}`}>
 {item.coffeeItem?.price} ريال × {item.quantity}
 </p>
 </div>
 <div className="flex items-center justify-between sm:justify-end space-x-2 space-x-reverse">
 <div className="flex items-center space-x-2 space-x-reverse">
 <Button
 variant="outline"
 size="icon"
 className="w-8 h-8 sm:w-10 sm:h-10"
 onClick={() => updateQuantity(item.coffeeItemId, item.quantity - 1)}
 disabled={item.quantity <= 1}
 data-testid={`button-decrease-${item.coffeeItemId}`}
 >
 <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
 </Button>
 <span className="font-semibold text-foreground w-6 sm:w-8 text-center text-sm sm:text-base" data-testid={`text-quantity-${item.coffeeItemId}`}>
 {item.quantity}
 </span>
 <Button
 variant="outline"
 size="icon"
 className="w-8 h-8 sm:w-10 sm:h-10"
 onClick={() => updateQuantity(item.coffeeItemId, item.quantity + 1)}
 data-testid={`button-increase-${item.coffeeItemId}`}
 >
 <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
 </Button>
 </div>
 <Button
 variant="destructive"
 size="icon"
 className="w-8 h-8 sm:w-10 sm:h-10 mr-2"
 onClick={() => removeFromCart(item.coffeeItemId)}
 data-testid={`button-remove-${item.coffeeItemId}`}
 >
 <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
 </Button>
 </div>
 </div>
 ))}
 
 <div className="border-t border-border pt-4">
 <div className="flex justify-between items-center mb-4">
 <span className="text-lg sm:text-xl font-semibold text-foreground" data-testid="text-total-label">
 المجموع:
 </span>
 <span className="text-xl sm:text-2xl font-bold text-primary" data-testid="text-total-amount">
 {getTotalPrice().toFixed(2)} ريال
 </span>
 </div>
 <Button 
 onClick={() => setLocation('/delivery')}
 size="lg"
 className="w-full btn-primary text-accent-foreground py-2.5 sm:py-3 text-base sm:text-lg font-semibold"
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
