import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { getCoffeeImage } from "@/lib/coffee-images";
import { ArrowRight, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
 const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();
 const [, setLocation] = useLocation();

 const totalPrice = getTotalPrice();

 if (cartItems.length === 0) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
 {/* Luxury Background Elements with Coffee Theme */}
 <div className="absolute inset-0 pointer-events-none">
 <div className="absolute top-20 left-20 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl animate-pulse"></div>
 <div className="absolute bottom-32 right-16 w-24 h-24 bg-orange-300/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
 <div className="absolute top-1/2 left-10 w-20 h-20 bg-amber-400/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
 </div>

 <div className="relative z-10">
 {/* Clean Header */}
 <header className="bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex justify-between items-center h-16">
 <Link href="/menu" className="flex items-center space-x-4 space-x-reverse text-muted-foreground hover:text-primary transition-colors group">
 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 <span className="text-lg font-semibold">العودةللمنيو</span>
 </Link>
 <h1 className="font-amiri text-2xl font-bold text-primary">سلةالتسوق</h1>
 </div>
 </div>
 </header>

 {/* Simple Empty Cart */}
 <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
 <ShoppingCart className="w-24 h-24 text-amber-600 mb-6" />
 <h2 className="font-amiri text-3xl font-bold text-amber-800 mb-4">السلةفارغةحالياً</h2>
 <p className="text-amber-700 text-lg mb-8 text-center max-w-md leading-relaxed">
 ابدأ رحلة القهوة الخاصةبك واختر من تشكيلتنا الرائعةمن القهوة الطازجة 
 </p>
 <Link href="/menu">
 <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg">
 تصفح المنيو
 </Button>
 </Link>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
 {/* Luxury Background Elements with Coffee Theme */}
 <div className="absolute inset-0 pointer-events-none">
 <div className="absolute top-20 left-20 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl animate-pulse"></div>
 <div className="absolute bottom-32 right-16 w-24 h-24 bg-orange-300/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
 <div className="absolute top-1/2 left-10 w-20 h-20 bg-amber-400/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
 </div>

 <div className="relative z-10">
 {/* Clean Header */}
 <header className="bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex justify-between items-center h-16">
 <Link href="/menu" className="flex items-center space-x-4 space-x-reverse text-muted-foreground hover:text-primary transition-colors group">
 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 <span className="text-lg font-semibold">العودةللمنيو</span>
 </Link>
 <h1 className="font-amiri text-2xl font-bold text-primary">سلةالتسوق</h1>
 </div>
 </div>
 </header>

 {/* Cart Content */}
 <div className="max-w-4xl mx-auto px-4 py-8">
 <div className="grid gap-8 lg:grid-cols-3">
 {/* Modern Cart Items */}
 <div className="lg:col-span-2 space-y-6">
 <h2 className="font-amiri text-3xl font-black text-amber-800 mb-8 flex items-center">
 <ShoppingCart className="w-8 h-8 ml-3" />
 العناصر المختارة
 </h2>

 {cartItems.map((item, index) => (
 <Card 
 key={item.coffeeItemId} 
 className="bg-card/90 border-primary/20 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in-0 slide-in-from-bottom-10 duration-500"
 style={{animationDelay: `${index * 0.1}s`}}
 >
 <CardContent className="p-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4 space-x-reverse">
 <div className="relative">
 <img 
 src={item.coffeeItem?.imageUrl || getCoffeeImage(item.coffeeItem?.id || '')}
 alt={item.coffeeItem?.nameAr}
 className="w-20 h-20 object-cover rounded-xl shadow-lg"
 loading="lazy"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 />
 <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
 <span className="text-white text-xs font-bold">{item.quantity}</span>
 </div>
 </div>
 <div>
 <h3 className="font-amiri font-bold text-amber-800 text-xl mb-1">{item.coffeeItem?.nameAr}</h3>
 <p className="text-amber-600 font-bold text-lg">{item.coffeeItem?.price} ريال</p>
 </div>
 </div>

 <div className="flex items-center space-x-4 space-x-reverse">
 {/* Modern Quantity Controls */}
 <div className="flex items-center bg-amber-50 rounded-full p-1 border border-amber-200">
 <Button
 size="sm"
 variant="ghost"
 onClick={() => updateQuantity(item.coffeeItemId, Math.max(0, item.quantity - 1))}
 className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-100 rounded-full"
 >
 <Minus className="w-4 h-4" />
 </Button>

 <span className="text-amber-800 font-bold text-lg w-12 text-center">
 {item.quantity}
 </span>

 <Button
 size="sm"
 variant="ghost"
 onClick={() => updateQuantity(item.coffeeItemId, item.quantity + 1)}
 className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-100 rounded-full"
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
 <Card className="bg-gradient-to-br from-white/95 to-amber-50/80 border-amber-200/50 backdrop-blur-sm sticky top-24 shadow-2xl">
 <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
 <CardTitle className="font-amiri text-2xl flex items-center">
 <ShoppingCart className="w-6 h-6 ml-2" />
 ملخص الطلب
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-6 p-6">
 <div className="flex justify-between items-center text-amber-700">
 <span className="text-lg">عدد العناصر:</span>
 <Badge className="bg-amber-100 text-amber-800 text-lg px-3 py-1">
 {cartItems.reduce((sum, item) => sum + item.quantity, 0)} قطعة
 </Badge>
 </div>

 <div className="border-t border-amber-200 pt-6">
 <div className="flex justify-between items-center">
 <span className="text-xl font-bold text-amber-800">المجموع الكلي:</span>
 <span className="text-2xl font-black text-amber-600">{totalPrice.toFixed(2)} ريال</span>
 </div>
 </div>

 <Button 
 onClick={() => setLocation("/delivery")}
 className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-6 text-xl font-bold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-xl hover:shadow-amber-500/25 transform hover:scale-105 rounded-full"
 data-testid="button-checkout"
 >
  إتمام الطلب الآن
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