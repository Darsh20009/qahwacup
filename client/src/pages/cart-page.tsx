import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { ArrowRight, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();
  const [, setLocation] = useLocation();

  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
        {/* Modern Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-emerald-200/30 to-teal-200/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-32 right-20 w-32 h-32 bg-gradient-to-r from-cyan-200/25 to-blue-200/25 rounded-full blur-xl animate-bounce"></div>
          <div className="absolute top-1/2 right-1/3 w-6 h-6 bg-emerald-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
        </div>

        <div className="relative z-10">
          {/* Fresh Header */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-200/50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <Link href="/menu" className="flex items-center space-x-4 space-x-reverse text-emerald-600 hover:text-emerald-700 transition-colors group">
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  <span className="text-lg font-bold">العودة للمنيو</span>
                </Link>
                <h1 className="font-amiri text-3xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">سلة التسوق 🛒</h1>
              </div>
            </div>
          </header>

          {/* Creative Empty Cart */}
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-2xl animate-pulse"></div>
              <ShoppingCart className="w-32 h-32 text-emerald-500 relative z-10 animate-bounce" />
            </div>
            <h2 className="font-amiri text-4xl font-black text-emerald-700 mb-4">السلة فارغة حالياً</h2>
            <p className="text-emerald-600 text-xl mb-12 text-center max-w-md leading-relaxed">
              ابدأ رحلة القهوة الخاصة بك واختر من تشكيلتنا الرائعة من القهوة الطازجة
            </p>
            <Link href="/menu">
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-12 py-6 text-xl font-bold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 rounded-full shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105">
                🚀 استكشف المنيو
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Modern Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-24 w-36 h-36 bg-gradient-to-r from-cyan-200/15 to-blue-200/15 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-24 left-32 w-56 h-56 bg-gradient-to-r from-teal-200/18 to-emerald-200/18 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-40 right-16 w-40 h-40 bg-gradient-to-r from-blue-200/12 to-cyan-200/12 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Modern Fresh Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/menu" className="flex items-center space-x-4 space-x-reverse text-emerald-600 hover:text-emerald-700 transition-colors group">
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                <span className="text-lg font-bold">العودة للمنيو</span>
              </Link>
              <h1 className="font-amiri text-3xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">سلة التسوق 🛒</h1>
            </div>
          </div>
        </header>

        {/* Cart Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Modern Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-amiri text-3xl font-black text-emerald-700 mb-8 flex items-center">
                <ShoppingCart className="w-8 h-8 ml-3" />
                العناصر المختارة
              </h2>
              
              {cartItems.map((item, index) => (
                <Card 
                  key={item.coffeeItemId} 
                  className="bg-white/90 border-emerald-200/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in-0 slide-in-from-bottom-10 duration-500"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="relative">
                          <img 
                            src={item.coffeeItem?.imageUrl?.startsWith('http') ? `${item.coffeeItem.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100` : (item.coffeeItem?.imageUrl || '/placeholder-coffee.jpg')}
                            alt={item.coffeeItem?.nameAr}
                            className="w-20 h-20 object-cover rounded-xl shadow-lg"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{item.quantity}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-amiri font-bold text-emerald-800 text-xl mb-1">{item.coffeeItem?.nameAr}</h3>
                          <p className="text-emerald-600 font-bold text-lg">{item.coffeeItem?.price} ريال</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 space-x-reverse">
                        {/* Modern Quantity Controls */}
                        <div className="flex items-center bg-emerald-50 rounded-full p-1 border border-emerald-200">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.coffeeItemId, Math.max(0, item.quantity - 1))}
                            className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-100 rounded-full"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          
                          <span className="text-emerald-800 font-bold text-lg w-12 text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.coffeeItemId, item.quantity + 1)}
                            className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-100 rounded-full"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Stylish Remove Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.coffeeItemId)}
                          className="h-10 w-10 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Modern Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-white/95 to-emerald-50/80 border-emerald-200/50 backdrop-blur-sm sticky top-24 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-t-lg">
                  <CardTitle className="font-amiri text-2xl flex items-center">
                    <ShoppingCart className="w-6 h-6 ml-2" />
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="text-lg">عدد العناصر:</span>
                    <Badge className="bg-emerald-100 text-emerald-800 text-lg px-3 py-1">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)} قطعة
                    </Badge>
                  </div>
                  
                  <div className="border-t border-emerald-200 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-emerald-800">المجموع الكلي:</span>
                      <span className="text-2xl font-black text-emerald-600">{totalPrice.toFixed(2)} ريال</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setLocation("/checkout")}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-6 text-xl font-bold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105 rounded-full"
                    data-testid="button-checkout"
                  >
                    ✨ إتمام الطلب الآن
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}