import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCustomer } from "@/contexts/CustomerContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Coffee, ShoppingBag, LogOut, User } from "lucide-react";
import type { Order } from "@shared/schema";

export default function CopyCard() {
 const [, navigate] = useLocation();
 const { customer, logout, isAuthenticated } = useCustomer();

 useEffect(() => {
 if (!isAuthenticated) {
 navigate("/auth");
 }
 }, [isAuthenticated, navigate]);

 const { data: orders = [], isLoading } = useQuery<Order[]>({
 queryKey: ["/api/customers", customer?.id, "orders"],
 enabled: !!customer?.id,
 });

 if (!customer) return null;

 // Extract all unique coffee items from orders with their images
 const orderItems = orders.flatMap(order => {
 try {
 const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
 return Array.isArray(items) ? items : [];
 } catch {
 return [];
 }
 });

 // Group by coffee item to show unique drinks
 type DrinkInfo = {
 id: string;
 nameAr: string;
 imageUrl: string;
 count: number;
 };
 
 const uniqueDrinks: DrinkInfo[] = Array.from(
 orderItems.reduce((map, item: any) => {
 if (!map.has(item.coffeeItemId)) {
 map.set(item.coffeeItemId, {
 id: item.coffeeItemId,
 nameAr: item.nameAr,
 imageUrl: item.imageUrl,
 count: 0
 });
 }
 const drink = map.get(item.coffeeItemId);
 drink.count += item.quantity;
 return map;
 }, new Map<string, DrinkInfo>()).values()
 );

 const totalOrders = orders.length;
 const totalDrinks = orderItems.reduce((sum, item: any) => sum + item.quantity, 0);

 return (
 <div 
 className="min-h-screen p-4 pb-20"
 style={{
 background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #1a1410 100%)",
 }}
 >
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <Button
 variant="ghost"
 onClick={() => navigate("/menu")}
 className="text-amber-100 hover:text-amber-50 hover:bg-amber-900/20"
 data-testid="button-back"
 >
 <ArrowLeft className="w-5 h-5 ml-2" />
 رجوع للقائم� 
 </Button>

 <Button
 variant="ghost"
 onClick={logout}
 className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
 data-testid="button-logout"
 >
 <LogOut className="w-4 h-4 ml-2" />
 تسجيل ال� روج
 </Button>
 </div>

 {/* Main Card Container */}
 <div className="max-w-2xl mx-auto space-y-6">
 {/* Customer Card */}
 <Card className="relative overflow-hidden border-2 border-amber-600/30 bg-gradient-to-br from-amber-900/40 via-stone-900/95 to-amber-950/40 backdrop-blur shadow-2xl shadow-amber-900/50">
 {/* Decorative Background Pattern */}
 <div className="absolute inset-0 opacity-5">
 <div className="absolute top-0 left-0 w-full h-full"
 style={{
 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
 }}
 />
 </div>

 <div className="relative p-8">
 {/* Card Header */}
 <div className="text-center mb-6">
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-900/50 mb-4">
 <Coffee className="w-10 h-10 text-white" />
 </div>
 <h1 className="text-4xl font-bold text-amber-100 mb-2">
 بطاق� كوبي
 </h1>
 <div className="flex items-center justify-center gap-2 text-amber-200/70">
 <User className="w-4 h-4" />
 <p className="text-lg">{customer.name || "عميل كوب"}</p>
 </div>
 <p className="text-amber-300/60 text-sm mt-1" dir="ltr">
 {customer.phone}
 </p>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 gap-4 mb-6">
 <div className="bg-stone-800/50 rounded-lg p-4 border border-amber-900/30 text-center">
 <ShoppingBag className="w-6 h-6 text-amber-400 mx-auto mb-2" />
 <div className="text-3xl font-bold text-amber-100" data-testid="text-total-orders">
 {totalOrders}
 </div>
 <div className="text-amber-200/60 text-sm">طلب</div>
 </div>
 <div className="bg-stone-800/50 rounded-lg p-4 border border-amber-900/30 text-center">
 <Coffee className="w-6 h-6 text-amber-400 mx-auto mb-2" />
 <div className="text-3xl font-bold text-amber-100" data-testid="text-total-drinks">
 {totalDrinks}
 </div>
 <div className="text-amber-200/60 text-sm">مشروب</div>
 </div>
 </div>

 {/* Member Badge */}
 <div className="bg-gradient-to-r from-amber-600/20 to-amber-800/20 border border-amber-600/40 rounded-lg p-3 text-center">
 <p className="text-amber-200 text-sm font-semibold">
 ✨ عضو مميز في كوب ✨
 </p>
 </div>
 </div>
 </Card>

 {/* My Drinks Section */}
 <Card className="border-amber-900/30 bg-stone-900/95 backdrop-blur">
 <div className="p-6">
 <h2 className="text-2xl font-bold text-amber-100 mb-4 flex items-center gap-2">
 <Coffee className="w-6 h-6" />
 مشروباتي المفضل� 
 </h2>

 {isLoading ? (
 <div className="text-center py-12 text-amber-200/60">
 <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
 <p>جارٍ التحميل...</p>
 </div>
 ) : uniqueDrinks.length > 0 ? (
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
 {uniqueDrinks.map((drink, index) => (
 <div
 key={drink.id}
 className="group relative bg-stone-800/50 rounded-lg overflow-hidden border border-amber-900/20 hover:border-amber-600/50 transition-all duration-300 hover:scale-105"
 data-testid={`card-drink-${index}`}
 >
 <div className="aspect-square relative overflow-hidden">
 {drink.imageUrl ? (
 <img
 src={drink.imageUrl}
 alt={drink.nameAr}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-stone-700/50">
 <Coffee className="w-12 h-12 text-amber-600/50" />
 </div>
 )}
 {/* Count Badge */}
 <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
 ×{drink.count}
 </div>
 </div>
 <div className="p-2 text-center">
 <p className="text-amber-100 text-sm font-medium line-clamp-2">
 {drink.nameAr}
 </p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12">
 <Coffee className="w-16 h-16 text-amber-600/30 mx-auto mb-4" />
 <p className="text-amber-200/60 mb-4">
 لم تطلب أي مشروبات بعد
 </p>
 <Button
 onClick={() => navigate("/menu")}
 className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
 data-testid="button-browse-menu"
 >
 تصفح القائم� الآن
 </Button>
 </div>
 )}
 </div>
 </Card>

 {/* View Orders Button */}
 {totalOrders > 0 && (
 <Button
 onClick={() => navigate("/my-orders")}
 className="w-full h-14 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-lg font-bold shadow-lg"
 data-testid="button-view-orders"
 >
 <ShoppingBag className="w-5 h-5 ml-2" />
 عرض جميع طلباتي ({totalOrders})
 </Button>
 )}
 </div>
 </div>
 );
}
