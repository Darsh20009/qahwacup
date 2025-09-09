import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { ArrowRight, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();

  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        {/* Creative Dark Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-16 w-48 h-48 bg-yellow-500/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-24 right-16 w-40 h-40 bg-yellow-300/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="bg-black/80 backdrop-blur-xl border-b border-yellow-500/30 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/menu" className="flex items-center space-x-4 text-yellow-400 hover:text-yellow-300 transition-colors">
                  <ArrowRight className="w-6 h-6" />
                  <span className="text-lg font-semibold">العودة للمنيو</span>
                </Link>
                <h1 className="font-amiri text-2xl font-bold text-yellow-400">سلة التسوق</h1>
              </div>
            </div>
          </header>

          {/* Empty Cart */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <ShoppingCart className="w-24 h-24 text-yellow-400/50 mb-8" />
            <h2 className="font-amiri text-3xl font-bold text-yellow-400 mb-4">السلة فارغة</h2>
            <p className="text-yellow-200 text-xl mb-8 text-center">لم تضف أي عناصر إلى سلة التسوق بعد</p>
            <Link href="/menu">
              <Button className="bg-yellow-500 text-black px-8 py-4 text-lg font-semibold hover:bg-yellow-400 transition-all duration-300">
                تصفح المنيو
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Creative Dark Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-48 h-48 bg-yellow-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-24 w-36 h-36 bg-yellow-400/6 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-24 left-32 w-56 h-56 bg-yellow-600/7 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-16 w-40 h-40 bg-yellow-300/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-xl border-b border-yellow-500/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/menu" className="flex items-center space-x-4 text-yellow-400 hover:text-yellow-300 transition-colors">
                <ArrowRight className="w-6 h-6" />
                <span className="text-lg font-semibold">العودة للمنيو</span>
              </Link>
              <h1 className="font-amiri text-2xl font-bold text-yellow-400">سلة التسوق</h1>
            </div>
          </div>
        </header>

        {/* Cart Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-amiri text-2xl font-bold text-yellow-400 mb-6">العناصر المضافة</h2>
              
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={`${item.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100`}
                          alt={item.nameAr}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-yellow-200 text-lg">{item.nameAr}</h3>
                          <p className="text-yellow-300 font-bold">{item.price} ريال</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="h-8 w-8 p-0 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          
                          <span className="text-yellow-200 font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm sticky top-24">
                <CardHeader>
                  <CardTitle className="text-yellow-400 font-amiri text-xl">ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-yellow-200">
                    <span>عدد العناصر:</span>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  </div>
                  
                  <div className="border-t border-yellow-500/30 pt-4">
                    <div className="flex justify-between text-xl font-bold text-yellow-400">
                      <span>المجموع:</span>
                      <span>{totalPrice.toFixed(2)} ريال</span>
                    </div>
                  </div>

                  <Link href="/checkout" className="block w-full">
                    <Button className="w-full bg-yellow-500 text-black py-3 text-lg font-semibold hover:bg-yellow-400 transition-all duration-300">
                      إتمام الطلب
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}