import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

export default function CartModal() {
 const { 
 cartItems, 
 isCartOpen, 
 hideCart, 
 showCheckout,
 updateQuantity, 
 removeFromCart, 
 getTotalPrice 
 } = useCartStore();

 const handleCheckout = () => {
 hideCart();
 showCheckout();
 };

 return (
 <Dialog open={isCartOpen} onOpenChange={hideCart} data-testid="modal-cart">
 <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-md border-2 border-primary/30 bg-card text-card-foreground" dir="rtl">
 <DialogHeader>
 <DialogTitle className="flex items-center text-2xl font-bold text-foreground" data-testid="text-cart-modal-title">
 <ShoppingCart className="w-6 h-6 ml-2" />
 سل� الطلبات
 </DialogTitle>
 </DialogHeader>
 
 <div className="space-y-4">
 {cartItems.length === 0 ? (
 <div className="text-center py-8" data-testid="section-cart-empty">
 <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
 <p className="text-muted-foreground" data-testid="text-cart-empty">
 السل� فارغ� 
 </p>
 </div>
 ) : (
 <>
 {/* Cart Items */}
 <div className="space-y-4" data-testid="section-cart-items">
 {cartItems.map((item) => (
 <div 
 key={item.coffeeItemId} 
 className="flex justify-between items-center bg-card/80 hover:bg-card/90 rounded-xl p-4 border border-primary/20 shadow-md backdrop-blur-sm transition-all duration-300"
 data-testid={`cart-modal-item-${item.coffeeItemId}`}
 >
 <div className="flex-1">
 <h4 className="font-semibold text-foreground" data-testid={`text-cart-item-name-${item.coffeeItemId}`}>
 {item.coffeeItem?.nameAr}
 </h4>
 <p className="text-sm text-muted-foreground" data-testid={`text-cart-item-details-${item.coffeeItemId}`}>
 {item.coffeeItem?.price} ريال × {item.quantity}
 </p>
 </div>
 <div className="flex items-center space-x-2">
 <Button
 variant="outline"
 size="icon"
 onClick={() => updateQuantity(item.coffeeItemId, item.quantity - 1)}
 disabled={item.quantity <= 1}
 className="h-8 w-8"
 data-testid={`button-cart-decrease-${item.coffeeItemId}`}
 >
 <Minus className="w-3 h-3" />
 </Button>
 <span className="font-semibold text-foreground w-8 text-center" data-testid={`text-cart-quantity-${item.coffeeItemId}`}>
 {item.quantity}
 </span>
 <Button
 variant="outline"
 size="icon"
 onClick={() => updateQuantity(item.coffeeItemId, item.quantity + 1)}
 className="h-8 w-8"
 data-testid={`button-cart-increase-${item.coffeeItemId}`}
 >
 <Plus className="w-3 h-3" />
 </Button>
 <Button
 variant="destructive"
 size="icon"
 onClick={() => removeFromCart(item.coffeeItemId)}
 className="h-8 w-8 mr-2"
 data-testid={`button-cart-remove-${item.coffeeItemId}`}
 >
 <Trash2 className="w-3 h-3" />
 </Button>
 </div>
 </div>
 ))}
 </div>
 
 {/* Total and Checkout */}
 <div className="border-t border-border pt-4" data-testid="section-cart-total">
 <div className="flex justify-between items-center mb-4">
 <span className="text-xl font-semibold text-foreground">المجموع:</span>
 <span className="text-2xl font-bold text-primary" data-testid="text-cart-total">
 {getTotalPrice().toFixed(2)} ريال
 </span>
 </div>
 <Button 
 onClick={handleCheckout}
 size="lg"
 className="w-full btn-primary text-accent-foreground py-3 text-lg font-semibold"
 data-testid="button-cart-checkout"
 >
 إتمام الطلب
 </Button>
 </div>
 </>
 )}
 </div>
 </DialogContent>
 </Dialog>
 );
}
