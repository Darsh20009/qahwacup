import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCoffeeImage } from "@/lib/coffee-images";
import QRCodeComponent from "@/components/qr-code";
import { ArrowLeft, Coffee, Star, Sparkles, Grid3X3, Layers, Tv, QrCode, Zap, Palette } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CoffeeItem {
 id: string;
 nameAr: string;
 nameEn: string | null;
 description: string;
 price: string;
 oldPrice: string | null;
 category: string;
 imageUrl: string | null;
 isAvailable: number;
}

export default function MenuView() {
 const [, setLocation] = useLocation();
 const [viewMode, setViewMode] = useState<'elegant' | 'showcase' | 'grid' | 'mosaic' | 'waterfall' | 'tv-display' | 'window-display'>('elegant');
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isAutoPlay, setIsAutoPlay] = useState(true);

 // Fetch coffee items
 const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
 queryKey: ["/api/coffee-items"],
 });

 // Auto-play functionality for all views
 useEffect(() => {
 if (!isAutoPlay || coffeeItems.length === 0) return;

 const interval = setInterval(() => {
 setCurrentIndex((prev) => (prev + 1) % coffeeItems.length);
 }, 6000);

 return () => clearInterval(interval);
 }, [isAutoPlay, coffeeItems.length]);

 // Clamp currentIndex when coffeeItems changes
 useEffect(() => {
 if (coffeeItems.length > 0) {
 setCurrentIndex(prev => Math.min(prev, coffeeItems.length - 1));
 } else {
 setCurrentIndex(0);
 }
 }, [coffeeItems.length]);


 // Group coffee items by category for organized display
 const groupedItems = coffeeItems.reduce((acc, item) => {
 if (!acc[item.category]) {
 acc[item.category] = [];
 }
 acc[item.category].push(item);
 return acc;
 }, {} as Record<string, CoffeeItem[]>);

 const categoryTitles: Record<string, string> = {
 "basic": "القهوة الأساسية",
 "hot": "المشروبات الساخنة", 
 "cold": "المشروبات الباردة"
 };


 if (isLoading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
 <div className="text-center">
 <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
 <p className="text-primary text-xl font-semibold">جاري تحميل القائمة الفاخرة...</p>
 </div>
 </div>
 );
 }

 const currentItem = coffeeItems[currentIndex];

 return (
 <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
 {/* Luxury Background Effects */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden">
 <div className="absolute top-20 left-20 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300/15 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
 <div className="absolute bottom-20 right-20 w-80 h-80 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-300/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200/5 via-transparent to-transparent rounded-full blur-3xl"></div>
 </div>

 {/* Header Controls - Mobile Responsive */}
 <div className="relative z-50 p-3 md:p-6 space-y-4">
 {/* Title Section */}
 <div className="flex justify-between items-center">
 <div className="bg-card/90 backdrop-blur-xl rounded-2xl px-4 md:px-6 py-2 md:py-3 border border-primary/20 shadow-xl">
 <h1 className="font-amiri text-lg md:text-2xl font-bold text-primary">قائمة القهوة الفاخرة</h1>
 </div>
 
 <Button 
 onClick={() => setLocation("/menu")} 
 variant="outline"
 size="sm"
 className="bg-card/90 backdrop-blur-xl border-primary/20 hover:bg-primary/10"
 data-testid="button-back"
 >
 <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 ml-2" />
 <span className="hidden sm:inline">العودة</span>
 </Button>
 </div>

 {/* View Mode Selector - Mobile Responsive */}
 <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-2 border border-primary/20 shadow-xl">
 <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-2">
 <Button
 variant={viewMode === 'elegant' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => {setViewMode('elegant'); setCurrentIndex(0);}}
 className="flex items-center justify-center space-x-1 space-x-reverse text-xs sm:text-sm"
 data-testid="button-elegant"
 >
 <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
 <span className="hidden sm:inline">عرض أنيق</span>
 </Button>
 <Button
 variant={viewMode === 'showcase' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('showcase')}
 className="flex items-center justify-center space-x-1 space-x-reverse text-xs sm:text-sm"
 data-testid="button-showcase"
 >
 <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
 <span className="hidden sm:inline">عرض شامل</span>
 </Button>
 <Button
 variant={viewMode === 'grid' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('grid')}
 className="flex items-center justify-center space-x-1 space-x-reverse text-xs sm:text-sm"
 data-testid="button-grid"
 >
 <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
 <span className="hidden sm:inline">شبكة</span>
 </Button>
 <Button
 variant={viewMode === 'mosaic' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('mosaic')}
 className="flex items-center justify-center space-x-1 space-x-reverse text-xs sm:text-sm"
 data-testid="button-mosaic"
 >
 <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
 <span className="hidden sm:inline">فسيفساء</span>
 </Button>
 <Button
 variant={viewMode === 'waterfall' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('waterfall')}
 className="flex items-center justify-center space-x-1 space-x-reverse text-xs sm:text-sm"
 data-testid="button-waterfall"
 >
 <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
 <span className="hidden sm:inline">شلال</span>
 </Button>
 <Button
 variant={viewMode === 'tv-display' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('tv-display')}
 className="flex items-center justify-center space-x-1 space-x-reverse text-xs sm:text-sm"
 data-testid="button-tv"
 >
 <Tv className="w-3 h-3 sm:w-4 sm:h-4" />
 <span className="hidden sm:inline">تلفزيوني</span>
 </Button>
 <Button
 variant={viewMode === 'window-display' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('window-display')}
 className="flex items-center justify-center space-x-1 space-x-reverse text-xs sm:text-sm"
 data-testid="button-window"
 >
 <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
 <span className="hidden sm:inline">النافذة</span>
 </Button>
 </div>
 </div>
 </div>

 {/* Main Content */}
 <div className="relative z-10 pb-20">
 {viewMode === 'elegant' && currentItem && (
 <div className="flex items-center justify-center min-h-[80vh] px-6">
 <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
 {/* Coffee Image Section */}
 <div className="relative group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-600/20 rounded-3xl blur-2xl animate-pulse"></div>
 <div className="relative bg-card/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-primary/30 shadow-2xl group-hover:shadow-primary/20 transition-all duration-700">
 <div className="relative overflow-hidden rounded-2xl">
 <img 
 src={currentItem.imageUrl || getCoffeeImage(currentItem.id)}
 alt={currentItem.nameAr}
 className="w-full h-96 object-cover transition-all duration-700 group-hover:scale-105"
 data-testid="img-current-drink"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"></div>
 </div>
 </div>
 </div>

 {/* Coffee Details Section */}
 <div className="space-y-8">
 <div>
 <h2 className="font-amiri text-5xl font-bold text-primary mb-4 leading-tight">
 {currentItem.nameAr}
 </h2>
 <p className="text-xl text-muted-foreground leading-relaxed">
 {currentItem.description}
 </p>
 </div>

 <div className="flex items-center justify-between">
 <div className="space-y-2">
 <div className="flex items-center space-x-3 space-x-reverse">
 <span className="text-4xl font-bold text-primary">{currentItem.price}</span>
 <span className="text-2xl text-muted-foreground">ريال</span>
 </div>
 </div>

 <div className="flex items-center space-x-2 space-x-reverse">
 {Array.from({length: 5}).map((_, i) => (
 <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
 ))}
 </div>
 </div>

 {/* Category Badge */}
 <div className="inline-flex items-center px-6 py-3 bg-primary/10 border border-primary/30 rounded-full">
 <Coffee className="w-5 h-5 text-primary ml-2" />
 <span className="text-primary font-semibold">
 {categoryTitles[currentItem.category] || currentItem.category}
 </span>
 </div>
 </div>
 </div>
 </div>
 )}

 {viewMode === 'showcase' && currentItem && (
 <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
 <div className="max-w-4xl w-full text-center space-y-12">
 {/* Featured Item */}
 <div className="relative group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-orange-600/30 rounded-full blur-3xl animate-pulse"></div>
 <div className="relative bg-card/95 backdrop-blur-xl rounded-full p-12 border-2 border-primary/40 shadow-2xl">
 <img 
 src={currentItem.imageUrl || getCoffeeImage(currentItem.id)}
 alt={currentItem.nameAr}
 className="w-80 h-80 object-cover rounded-full mx-auto group-hover:scale-105 transition-all duration-700"
 data-testid="img-showcase-drink"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 />
 </div>
 </div>

 <div className="space-y-6">
 <h2 className="font-amiri text-6xl font-bold text-primary">
 {currentItem.nameAr}
 </h2>
 <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
 {currentItem.description}
 </p>
 <div className="text-5xl font-bold text-primary">
 {currentItem.price} <span className="text-3xl">ريال</span>
 </div>
 </div>
 </div>
 </div>
 )}

 {viewMode === 'grid' && currentItem && (
 <div className="px-6">
 <div className="max-w-4xl mx-auto h-screen flex items-center justify-center">
 <Card className="group cursor-pointer transform transition-all duration-500 hover:scale-105 bg-card/95 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/40 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl w-full max-w-2xl">
 <div className="relative overflow-hidden">
 <img 
 src={currentItem.imageUrl || getCoffeeImage(currentItem.id)}
 alt={currentItem.nameAr}
 className="w-full h-96 object-cover transition-all duration-500 group-hover:scale-110"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"></div>
 </div>
 <div className="p-8 space-y-6">
 <h3 className="font-amiri text-4xl font-bold text-primary text-center">
 {currentItem.nameAr}
 </h3>
 <p className="text-xl text-muted-foreground leading-relaxed text-center">
 {currentItem.description}
 </p>
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3 space-x-reverse">
 <span className="text-4xl font-bold text-primary">{currentItem.price}</span>
 <span className="text-2xl text-muted-foreground">ريال</span>
 </div>
 <div className="flex items-center space-x-2 space-x-reverse">
 {Array.from({length: 5}).map((_, i) => (
 <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
 ))}
 </div>
 </div>
 </div>
 </Card>
 </div>
 </div>
 )}

 {/* New Creative Display Modes */}
 
 {/* Mosaic View */}
 {viewMode === 'mosaic' && currentItem && (
 <div className="px-6">
 <div className="max-w-6xl mx-auto h-screen flex items-center justify-center">
 <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 w-full">
 {/* Large Featured Item */}
 <div className="col-span-2 lg:col-span-2 group relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 cursor-pointer" style={{ minHeight: '500px' }}>
 <img 
 src={currentItem.imageUrl || getCoffeeImage(currentItem.id)}
 alt={currentItem.nameAr}
 className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
 <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
 <h3 className="font-amiri text-4xl font-bold mb-4">{currentItem.nameAr}</h3>
 <p className="text-xl opacity-90 mb-4">{currentItem.description}</p>
 <div className="flex items-center justify-between">
 <span className="text-3xl font-bold">{currentItem.price} ريال</span>
 <div className="flex items-center space-x-1 space-x-reverse">
 {Array.from({length: 5}).map((_, i) => (
 <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
 ))}
 </div>
 </div>
 </div>
 </div>
 
 {/* QR Code Section */}
 <div className="flex flex-col justify-center space-y-6">
 <QRCodeComponent 
 url="https://qahwa.ma3k.online"
 size="lg"
 title="امسح للطلب"
 className="w-full"
 />
 <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl p-4 text-center">
 <p className="text-lg font-bold">
 لكل لحظة قهوة ، لحظة نجاح
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Waterfall View */}
 {viewMode === 'waterfall' && currentItem && (
 <div className="px-6">
 <div className="max-w-4xl mx-auto h-screen flex items-center justify-center">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
 {/* Flowing Card Design */}
 <Card className="group cursor-pointer bg-card/95 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/40 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
 <div className="relative overflow-hidden">
 <img 
 src={currentItem.imageUrl || getCoffeeImage(currentItem.id)}
 alt={currentItem.nameAr}
 className="w-full h-80 object-cover transition-all duration-500 group-hover:scale-105"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"></div>
 </div>
 <div className="p-8 space-y-6">
 <h3 className="font-amiri text-3xl font-bold text-primary">
 {currentItem.nameAr}
 </h3>
 <p className="text-muted-foreground text-lg leading-relaxed">
 {currentItem.description}
 </p>
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3 space-x-reverse">
 <span className="text-3xl font-bold text-primary">{currentItem.price}</span>
 <span className="text-xl text-muted-foreground">ريال</span>
 </div>
 <div className="flex items-center space-x-1 space-x-reverse">
 {Array.from({length: 5}).map((_, i) => (
 <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
 ))}
 </div>
 </div>
 </div>
 </Card>
 
 {/* Info and QR Section */}
 <div className="flex flex-col justify-center space-y-8">
 <div className="text-center space-y-4">
 <h1 className="font-amiri text-5xl font-bold text-primary">
 قهوة كوب
 </h1>
 <p className="text-xl text-muted-foreground">
 أجود أنواع القهوة العربية الأصيلة
 </p>
 </div>
 
 <QRCodeComponent 
 url="https://qahwa.ma3k.online"
 size="lg"
 title="امسح للطلب"
 className="w-full"
 />
 
 <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl p-6 text-center">
 <p className="text-xl font-bold">
 لكل لحظة قهوة ، لحظة نجاح
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* TV Display View */}
 {viewMode === 'tv-display' && (
 <div className="px-6">
 <div className="max-w-8xl mx-auto">
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-screen">
 
 {/* Main Featured Section */}
 <div className="lg:col-span-3">
 {currentItem && (
 <div className="h-full flex flex-col justify-center">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
 {/* Large Image */}
 <div className="relative group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-orange-600/30 rounded-3xl blur-2xl animate-pulse"></div>
 <div className="relative bg-card/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-primary/30 shadow-2xl">
 <img 
 src={currentItem.imageUrl || getCoffeeImage(currentItem.id)}
 alt={currentItem.nameAr}
 className="w-full h-96 object-cover rounded-2xl transition-all duration-700 group-hover:scale-105"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 />
 </div>
 </div>

 {/* Product Details */}
 <div className="space-y-8">
 <div>
 <h2 className="font-amiri text-6xl font-bold text-primary mb-6 leading-tight">
 {currentItem.nameAr}
 </h2>
 <p className="text-2xl text-muted-foreground leading-relaxed mb-8">
 {currentItem.description}
 </p>
 </div>

 <div className="space-y-4">
 <div className="text-6xl font-bold text-primary">
 {currentItem.price} <span className="text-4xl">ريال</span>
 </div>
 </div>

 <div className="flex items-center space-x-3 space-x-reverse">
 {Array.from({length: 5}).map((_, i) => (
 <Star key={i} className="w-8 h-8 text-amber-400 fill-amber-400" />
 ))}
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Sidebar with QR Code */}
 <div className="lg:col-span-1 flex flex-col justify-center space-y-8">
 <QRCodeComponent 
 url="https://qahwa.ma3k.online"
 size="lg"
 title="امسح للطلب الآن"
 className="w-full"
 />
 
 {/* Current Item Info */}
 <div className="space-y-4">
 <h3 className="font-amiri text-2xl font-bold text-primary text-center">
 المشروب الحالي
 </h3>
 {currentItem && (
 <div className="bg-card/80 backdrop-blur-xl rounded-xl p-4 border border-primary/20 text-center space-y-3">
 <h4 className="font-amiri font-bold text-primary text-lg">{currentItem.nameAr}</h4>
 <p className="text-muted-foreground text-sm">{currentItem.description}</p>
 <div className="text-primary font-bold text-xl">{currentItem.price} ريال</div>
 <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg p-3">
 <p className="text-sm font-bold">
 لكل لحظة قهوة ، لحظة نجاح
 </p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Window Display View - QR Camera Style */}
 {viewMode === 'window-display' && (
 <div className="px-3 md:px-6">
 <div className="max-w-7xl mx-auto h-screen flex flex-col justify-center">
 {/* Camera View Container */}
 <div className="bg-black/90 backdrop-blur-xl rounded-3xl p-4 md:p-8 border-4 border-primary/50 shadow-2xl">
 
 {/* Camera Header */}
 <div className="flex items-center justify-between mb-6 px-2">
 <div className="flex items-center space-x-2 space-x-reverse text-white">
 <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
 <span className="text-sm font-medium">وجّه الكاميرا نحو الرمز للطلب</span>
 <span className="text-lg"></span>
 </div>
 <div className="text-primary text-sm font-bold">قهوة كوب</div>
 </div>

 {/* Main Camera View - Always Side by Side */}
 <div className="grid grid-cols-2 gap-3 md:gap-8 items-center min-h-[400px] md:min-h-[500px]">
 
 {/* QR Code Section */}
 <div className="text-center space-y-3 md:space-y-6 p-2 md:p-4">
 <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl">
 <QRCodeComponent 
 url="https://qahwa.ma3k.online"
 size="lg"
 title="امسح للطلب"
 showURL={false}
 className="w-full"
 />
 </div>
 
 <div className="space-y-2 md:space-y-4">
 <h1 className="font-amiri text-lg md:text-4xl font-bold text-white">
 قهوة كوب
 </h1>
 <p className="text-xs md:text-xl text-gray-300">
 أجود أنواع القهوة العربية الأصيلة
 </p>
 <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl md:rounded-2xl p-2 md:p-4">
 <p className="text-xs md:text-lg font-bold">
 لكل لحظة قهوة ، لحظة نجاح
 </p>
 </div>
 </div>
 </div>

 {/* Current Drink Display */}
 <div className="flex justify-center p-2 md:p-4">
 {currentItem && (
 <div className="bg-card/95 backdrop-blur-xl border-2 border-primary/30 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl w-full">
 <div className="relative">
 <img 
 src={currentItem.imageUrl || getCoffeeImage(currentItem.id)}
 alt={currentItem.nameAr}
 className="w-full h-32 md:h-64 object-cover"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent"></div>
 {/* Price Tag Overlay */}
 <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 md:px-4 md:py-2 rounded-full">
 <span className="text-xs md:text-lg font-bold">{currentItem.price} ريال</span>
 </div>
 </div>
 
 <div className="p-3 md:p-6 space-y-2 md:space-y-4">
 <h3 className="font-amiri text-sm md:text-2xl font-bold text-primary text-center">
 {currentItem.nameAr}
 </h3>
 <p className="text-xs md:text-base text-muted-foreground text-center line-clamp-2">
 {currentItem.description}
 </p>
 <div className="flex items-center justify-center space-x-1 space-x-reverse">
 {Array.from({length: 5}).map((_, i) => (
 <Star key={i} className="w-3 h-3 md:w-5 md:h-5 text-amber-400 fill-amber-400" />
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Camera Footer */}
 <div className="flex items-center justify-center mt-4 md:mt-6 px-2">
 <div className="flex items-center space-x-4 space-x-reverse text-white/70">
 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
 <span className="text-xs md:text-sm">جاهز للمسح</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 </div>
 );
}