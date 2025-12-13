import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Coffee, ArrowRight, ArrowLeft, CheckCircle, XCircle, Plus, Edit2, Trash2, Sparkles, Upload, ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCoffeeImage } from "@/lib/coffee-images";
import { nanoid } from "nanoid";
import { Checkbox } from "@/components/ui/checkbox";
import type { CoffeeItem, Employee, Ingredient } from "@shared/schema";

export default function EmployeeMenuManagement() {
 const [, setLocation] = useLocation();
 const [employee, setEmployee] = useState<Employee | null>(null);
 const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
 const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
 const [editingItem, setEditingItem] = useState<CoffeeItem | null>(null);
 const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
 const [selectedImage, setSelectedImage] = useState<File | null>(null);
 const [imagePreview, setImagePreview] = useState<string | null>(null);
 const [isUploadingImage, setIsUploadingImage] = useState(false);
 const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
 const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);
 const editFileInputRef = useRef<HTMLInputElement>(null);
 const { toast } = useToast();
 const queryClient = useQueryClient();
 const [selectedIngredients, setSelectedIngredients] = useState<Array<{ingredientId: string, name: string, quantity: number, unit: string}>>([]);
 const [addStep, setAddStep] = useState<1 | 2>(1);
 const [selectedCategory, setSelectedCategory] = useState<string>("hot");
 const [selectedCoffeeStrength, setSelectedCoffeeStrength] = useState<string>("classic");
 const [step1Data, setStep1Data] = useState<{
   nameAr: string;
   nameEn: string;
   description: string;
   category: string;
   price: string;
   oldPrice: string;
   coffeeStrength: string;
   imageUrl?: string;
 } | null>(null);

 useEffect(() => {
 const storedEmployee = localStorage.getItem("currentEmployee");
 if (storedEmployee) {
 setEmployee(JSON.parse(storedEmployee));
 } else {
 setLocation("/employee/gateway");
 }
 }, [setLocation]);

 const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
 queryKey: ["/api/coffee-items"],
 });

 const { data: ingredients = [] } = useQuery<Ingredient[]>({
 queryKey: ["/api/ingredients"],
 });

 const createItemMutation = useMutation({
 mutationFn: async (payload: { itemData: any; ingredientsList: Array<{ingredientId: string, quantity: number, unit: string}> }) => {
   const { itemData, ingredientsList } = payload;
   const res = await apiRequest("POST", "/api/coffee-items", itemData);
   const createdItem = await res.json();
   
   const newItemId = createdItem.id || createdItem._id;
   if (newItemId && ingredientsList.length > 0) {
     for (const ing of ingredientsList) {
       await apiRequest("POST", `/api/coffee-items/${newItemId}/ingredients`, {
         ingredientId: ing.ingredientId,
         quantity: ing.quantity,
         unit: ing.unit
       });
     }
   }
   
   return createdItem;
 },
 onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ["/api/coffee-items"] });
   setIsAddDialogOpen(false);
   setSelectedIngredients([]);
   resetImageState();
   setAddStep(1);
   setStep1Data(null);
   setSelectedCategory("hot");
   setSelectedCoffeeStrength("classic");
   toast({
     title: "تم إضافة المشروب",
     description: "تم إضافة المشروب بنجاح إلى القائمة",
   });
 },
 onError: (error: any) => {
   toast({
     variant: "destructive",
     title: "فشل إضافة المشروب",
     description: error.message || "حدث خطأ أثناء إضافة المشروب",
   });
 },
 });

 const updateAvailabilityMutation = useMutation({
 mutationFn: async ({ id, isAvailable, availabilityStatus }: { id: string; isAvailable?: number; availabilityStatus?: string }) => {
 const response = await fetch(`/api/coffee-items/${id}/availability`, {
 method: "PATCH",
 headers: {
 "Content-Type": "application/json",
 },
 credentials: 'include',
 body: JSON.stringify({ isAvailable, availabilityStatus }),
 });
 
 if (!response.ok) {
 throw new Error("Failed to update availability");
 }
 
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/coffee-items"] });
 toast({
 title: "تم التحديث بنجاح",
 description: "تم تحديث حالةتوفر المشروب",
 });
 },
 onError: () => {
 toast({
 title: "خطأ",
 description: "فشل تحديث حالةتوفر المشروب",
 variant: "destructive",
 });
 },
 });

 const updateItemMutation = useMutation({
 mutationFn: async (data: { id: string; updates: any }) => {
 const res = await apiRequest("PUT", `/api/coffee-items/${data.id}`, data.updates);
 return await res.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/coffee-items"] });
 setIsEditDialogOpen(false);
 setEditingItem(null);
 toast({
 title: "تم التحديث",
 description: "تم تحديث المشروب بنجاح",
 });
 },
 onError: (error: any) => {
 toast({
 variant: "destructive",
 title: "فشل التحديث",
 description: error.message || "حدث خطأ أثناء تحديث المشروب",
 });
 },
 });

 const deleteItemMutation = useMutation({
 mutationFn: async (id: string) => {
 const res = await apiRequest("DELETE", `/api/coffee-items/${id}`);
 return await res.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/coffee-items"] });
 setDeletingItemId(null);
 toast({
 title: "تم الحذف",
 description: "تم حذف المشروب بنجاح",
 });
 },
 onError: (error: any) => {
 toast({
 variant: "destructive",
 title: "فشل الحذف",
 description: error.message || "حدث خطأ أثناء حذف المشروب",
 });
 },
 });

 const toggleNewProductMutation = useMutation({
 mutationFn: async ({ id, isNewProduct }: { id: string; isNewProduct: number }) => {
 const res = await apiRequest("PUT", `/api/coffee-items/${id}`, { isNewProduct });
 return await res.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/coffee-items"] });
 toast({
 title: "تم التحديث",
 description: "تم تحديث حالةالمنتج الجديد",
 });
 },
 onError: (error: any) => {
 toast({
 variant: "destructive",
 title: "فشل التحديث",
 description: error.message || "حدث خطأ أثناء التحديث",
 });
 },
 });

 const handleToggleAvailability = (item: CoffeeItem) => {
 const newAvailability = item.isAvailable === 1 ? 0 : 1;
 updateAvailabilityMutation.mutate({ id: item.id, isAvailable: newAvailability });
 };

 const handleStatusChange = (id: string, status: string) => {
 updateAvailabilityMutation.mutate({ 
 id, 
 availabilityStatus: status 
 });
 };

 const handleStep1Submit = async (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();
   const formData = new FormData(e.currentTarget);
   
   const nameAr = formData.get("nameAr") as string;
   const price = formData.get("price") as string;
   
   if (!nameAr || !selectedCategory || !price) {
     toast({
       title: "خطأ",
       description: "يرجى ملء جميع الحقول المطلوبة",
       variant: "destructive"
     });
     return;
   }
   
   let imageUrl: string | undefined = undefined;
   
   if (selectedImage) {
     setIsUploadingImage(true);
     const uploadedUrl = await uploadImage(selectedImage);
     setIsUploadingImage(false);
     if (uploadedUrl) {
       imageUrl = uploadedUrl;
     } else {
       toast({
         title: "خطأ",
         description: "فشل رفع الصورة، يرجى المحاولة مرة أخرى",
         variant: "destructive"
       });
       return;
     }
   }
   
   setStep1Data({
     nameAr,
     nameEn: formData.get("nameEn") as string || "",
     description: formData.get("description") as string || "",
     category: selectedCategory,
     price,
     oldPrice: formData.get("oldPrice") as string || "",
     coffeeStrength: selectedCoffeeStrength,
     imageUrl
   });
   setAddStep(2);
 };

 const handleStep2Submit = () => {
   if (!step1Data) return;
   
   const itemId = nanoid(10);
   const itemData = {
     id: itemId,
     nameAr: step1Data.nameAr,
     nameEn: step1Data.nameEn || undefined,
     description: step1Data.description,
     price: parseFloat(step1Data.price),
     oldPrice: step1Data.oldPrice ? parseFloat(step1Data.oldPrice) : undefined,
     category: step1Data.category,
     coffeeStrength: step1Data.coffeeStrength || "classic",
     imageUrl: step1Data.imageUrl,
     isAvailable: 1,
     availabilityStatus: "available",
     isNewProduct: 0,
   };

   createItemMutation.mutate({
     itemData,
     ingredientsList: selectedIngredients.map(ing => ({
       ingredientId: ing.ingredientId,
       quantity: ing.quantity,
       unit: ing.unit
     }))
   });
 };

 const handleSkipIngredients = () => {
   if (!step1Data) return;
   
   const itemId = nanoid(10);
   const itemData = {
     id: itemId,
     nameAr: step1Data.nameAr,
     nameEn: step1Data.nameEn || undefined,
     description: step1Data.description,
     price: parseFloat(step1Data.price),
     oldPrice: step1Data.oldPrice ? parseFloat(step1Data.oldPrice) : undefined,
     category: step1Data.category,
     coffeeStrength: step1Data.coffeeStrength || "classic",
     imageUrl: step1Data.imageUrl,
     isAvailable: 1,
     availabilityStatus: "available",
     isNewProduct: 0,
   };

   createItemMutation.mutate({
     itemData,
     ingredientsList: []
   });
 };

 const handleSubmitEditItem = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 if (!editingItem) return;
 
 const formData = new FormData(e.currentTarget);
 
 let imageUrl: string | undefined = editingItem.imageUrl;
 
 if (editSelectedImage) {
   setIsUploadingImage(true);
   const uploadedUrl = await uploadImage(editSelectedImage);
   setIsUploadingImage(false);
   if (uploadedUrl) {
     imageUrl = uploadedUrl;
   } else {
     toast({
       title: "خطأ",
       description: "فشل رفع الصورة، يرجى المحاولة مرة أخرى",
       variant: "destructive"
     });
     return;
   }
 }
 
 const updates = {
 nameAr: formData.get("nameAr") as string,
 nameEn: formData.get("nameEn") as string || undefined,
 description: formData.get("description") as string,
 price: parseFloat(formData.get("price") as string),
 oldPrice: formData.get("oldPrice") ? parseFloat(formData.get("oldPrice") as string) : undefined,
 category: formData.get("category") as string,
 imageUrl: imageUrl,
 };

 updateItemMutation.mutate({ id: editingItem.id, updates });
 resetEditImageState();
 };

 const handleEdit = (item: CoffeeItem) => {
 setEditingItem(item);
 setIsEditDialogOpen(true);
 };

 const handleDelete = (id: string) => {
 setDeletingItemId(id);
 };

 const confirmDelete = () => {
 if (deletingItemId) {
 deleteItemMutation.mutate(deletingItemId);
 }
 };

 const handleToggleNewProduct = (item: CoffeeItem) => {
 const newValue = item.isNewProduct === 1 ? 0 : 1;
 toggleNewProductMutation.mutate({ id: item.id, isNewProduct: newValue });
 };

 const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0];
   if (file) {
     if (!file.type.startsWith('image/')) {
       toast({
         title: "خطأ",
         description: "يرجى اختيار ملف صورة فقط",
         variant: "destructive"
       });
       return;
     }
     if (file.size > 5 * 1024 * 1024) {
       toast({
         title: "خطأ",
         description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
         variant: "destructive"
       });
       return;
     }
     setSelectedImage(file);
     const reader = new FileReader();
     reader.onloadend = () => {
       setImagePreview(reader.result as string);
     };
     reader.readAsDataURL(file);
   }
 };

 const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0];
   if (file) {
     if (!file.type.startsWith('image/')) {
       toast({
         title: "خطأ",
         description: "يرجى اختيار ملف صورة فقط",
         variant: "destructive"
       });
       return;
     }
     if (file.size > 5 * 1024 * 1024) {
       toast({
         title: "خطأ",
         description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
         variant: "destructive"
       });
       return;
     }
     setEditSelectedImage(file);
     const reader = new FileReader();
     reader.onloadend = () => {
       setEditImagePreview(reader.result as string);
     };
     reader.readAsDataURL(file);
   }
 };

 const uploadImage = async (file: File): Promise<string | null> => {
   try {
     const formData = new FormData();
     formData.append('image', file);
     
     const response = await fetch('/api/upload-drink-image', {
       method: 'POST',
       body: formData,
       credentials: 'include'
     });
     
     if (!response.ok) {
       throw new Error('فشل رفع الصورة');
     }
     
     const data = await response.json();
     return data.url;
   } catch (error) {
     console.error('Error uploading image:', error);
     return null;
   }
 };

 const resetImageState = () => {
   setSelectedImage(null);
   setImagePreview(null);
   if (fileInputRef.current) {
     fileInputRef.current.value = '';
   }
 };

 const resetEditImageState = () => {
   setEditSelectedImage(null);
   setEditImagePreview(null);
   if (editFileInputRef.current) {
     editFileInputRef.current.value = '';
   }
 };

 const categoryNames = {
 basic: "قهوة أساسية",
 hot: "قهوة ساخنة",
 cold: "قهوة باردة",
 specialty: "مشروبات إضافية ",
 desserts: "الحلويات",
 };

 const categorizedItems = coffeeItems.reduce((acc, item) => {
 if (!acc[item.category]) {
 acc[item.category] = [];
 }
 acc[item.category].push(item);
 return acc;
 }, {} as Record<string, CoffeeItem[]>);

 if (!employee) {
 return null;
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] p-4">
 {/* Header */}
 <div className="max-w-7xl mx-auto mb-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
 <Coffee className="w-6 h-6 text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-amber-500">إدارةالمشروبات</h1>
 <p className="text-gray-400 text-sm">تحديث حالةتوفر المشروبات</p>
 </div>
 </div>
 <div className="flex gap-3">
 {employee?.role === "manager" && (
 <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
  setIsAddDialogOpen(open);
  if (!open) {
    setAddStep(1);
    setStep1Data(null);
    setSelectedIngredients([]);
    resetImageState();
    setSelectedCategory("hot");
    setSelectedCoffeeStrength("classic");
  }
}}>
 <DialogTrigger asChild>
 <Button
 className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
 data-testid="button-add-item"
 >
 <Plus className="w-4 h-4 ml-2" />
 إضافة مشروب جديد
 </Button>
 </DialogTrigger>
 <DialogContent className="bg-[#2d1f1a] border-amber-500/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle className="text-amber-500">
   <div className="flex flex-col gap-3">
     <span>إضافة مشروب جديد</span>
     <div className="flex items-center gap-2 text-sm font-normal">
       <span className={`px-3 py-1 rounded-full ${addStep === 1 ? 'bg-amber-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
         1. المعلومات الأساسية
       </span>
       <ArrowLeft className="w-4 h-4 text-gray-400" />
       <span className={`px-3 py-1 rounded-full ${addStep === 2 ? 'bg-amber-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
         2. المكونات والوصفة
       </span>
     </div>
   </div>
 </DialogTitle>
 </DialogHeader>

 {addStep === 1 ? (
 <form onSubmit={handleStep1Submit} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="nameAr" className="text-gray-300">الاسم بالعربية *</Label>
 <Input
 id="nameAr"
 name="nameAr"
 required
 defaultValue={step1Data?.nameAr || ""}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-name-ar"
 />
 </div>
 <div>
 <Label htmlFor="nameEn" className="text-gray-300">الاسم بالإنجليزية</Label>
 <Input
 id="nameEn"
 name="nameEn"
 defaultValue={step1Data?.nameEn || ""}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-name-en"
 />
 </div>
 </div>

 <div>
 <Label htmlFor="description" className="text-gray-300">الوصف *</Label>
 <Textarea
 id="description"
 name="description"
 required
 defaultValue={step1Data?.description || ""}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-description"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="category" className="text-gray-300">القسم *</Label>
 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
 <SelectTrigger className="bg-[#1a1410] border-amber-500/30 text-white" data-testid="select-category">
 <SelectValue placeholder="اختر القسم" />
 </SelectTrigger>
 <SelectContent className="bg-[#2d1f1a] border-amber-500/20 text-white">
 <SelectItem value="basic">قهوة أساسية</SelectItem>
 <SelectItem value="hot">قهوة ساخنة</SelectItem>
 <SelectItem value="cold">قهوة باردة </SelectItem>
 <SelectItem value="specialty">مشروبات إضافية </SelectItem>
 <SelectItem value="desserts">الحلويات</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="price" className="text-gray-300">السعر (ريال) *</Label>
 <Input
 id="price"
 name="price"
 type="number"
 step="0.01"
 min="0"
 required
 defaultValue={step1Data?.price || ""}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-price"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="oldPrice" className="text-gray-300">السعر القديم (ريال)</Label>
 <Input
 id="oldPrice"
 name="oldPrice"
 type="number"
 step="0.01"
 min="0"
 defaultValue={step1Data?.oldPrice || ""}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-old-price"
 />
 </div>
 <div>
 <Label className="text-gray-300">صورة المشروب</Label>
 <div className="mt-2">
   <input
     ref={fileInputRef}
     type="file"
     accept="image/*"
     onChange={handleImageSelect}
     className="hidden"
     data-testid="input-image-file"
   />
   <div 
     onClick={() => fileInputRef.current?.click()}
     className="border-2 border-dashed border-amber-500/30 rounded-lg p-4 text-center cursor-pointer hover:border-amber-500/60 transition-colors"
   >
     {imagePreview ? (
       <div className="relative">
         <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
           <span className="text-white text-sm">انقر لتغيير الصورة</span>
         </div>
       </div>
     ) : (
       <div className="py-4">
         <Upload className="w-8 h-8 text-amber-500/50 mx-auto mb-2" />
         <p className="text-gray-400 text-sm">انقر لرفع صورة</p>
         <p className="text-gray-500 text-xs mt-1">PNG, JPG حتى 5 ميجابايت</p>
       </div>
     )}
   </div>
 </div>
 </div>
 </div>

 <div>
 <Label htmlFor="coffeeStrength" className="text-gray-300">قوة القهوة</Label>
 <Select value={selectedCoffeeStrength} onValueChange={setSelectedCoffeeStrength}>
 <SelectTrigger className="bg-[#1a1410] border-amber-500/30 text-white" data-testid="select-coffee-strength">
 <SelectValue placeholder="اختر قوة القهوة" />
 </SelectTrigger>
 <SelectContent className="bg-[#2d1f1a] border-amber-500/20 text-white">
 <SelectItem value="mild">خفيفة (1-4)</SelectItem>
 <SelectItem value="classic">كلاسيكية/العادي</SelectItem>
 <SelectItem value="medium">متوسطة (4-8)</SelectItem>
 <SelectItem value="strong">قوية (8-12)</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex justify-end gap-2">
 <Button
 type="button"
 variant="outline"
 onClick={() => { setIsAddDialogOpen(false); resetImageState(); setSelectedIngredients([]); setAddStep(1); setStep1Data(null); setSelectedCategory("hot"); setSelectedCoffeeStrength("classic"); }}
 className="border-gray-600 text-gray-300"
 data-testid="button-cancel"
 >
 إلغاء
 </Button>
 <Button
 type="submit"
 disabled={isUploadingImage}
 className="bg-gradient-to-r from-amber-500 to-amber-700"
 data-testid="button-next"
 >
 {isUploadingImage ? "جاري رفع الصورة..." : "التالي: إضافة المكونات"}
 <ArrowLeft className="w-4 h-4 mr-2" />
 </Button>
 </div>
 </form>
 ) : (
 <div className="space-y-4">
   <div className="bg-[#1a1410] p-4 rounded-lg border border-amber-500/20">
     <p className="text-gray-400 text-sm mb-1">المشروب:</p>
     <p className="text-amber-500 font-bold text-lg">{step1Data?.nameAr}</p>
     <p className="text-gray-500 text-sm">{step1Data?.category && categoryNames[step1Data.category as keyof typeof categoryNames]} • {step1Data?.price} ريال</p>
   </div>

   <div className="border-t border-amber-500/20 pt-4">
     <Label className="text-gray-300 text-lg">المكونات والكميات (اختياري)</Label>
     <p className="text-gray-500 text-sm mb-3">اختر المكونات اللازمة لتحضير المشروب</p>
     
     <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
       {ingredients.map((ing) => {
         const isSelected = selectedIngredients.some(s => s.ingredientId === ing.id);
         const selected = selectedIngredients.find(s => s.ingredientId === ing.id);
         
         return (
           <div key={ing.id} className="flex items-center gap-3 p-2 bg-[#1a1410] rounded-lg border border-amber-500/10">
             <Checkbox
               id={`ing-step2-${ing.id}`}
               checked={isSelected}
               onCheckedChange={(checked) => {
                 if (checked) {
                   setSelectedIngredients([...selectedIngredients, {
                     ingredientId: ing.id,
                     name: ing.nameAr,
                     quantity: 10,
                     unit: 'g'
                   }]);
                 } else {
                   setSelectedIngredients(selectedIngredients.filter(s => s.ingredientId !== ing.id));
                 }
               }}
               className="border-amber-500/50"
               data-testid={`checkbox-ingredient-${ing.id}`}
             />
             <label htmlFor={`ing-step2-${ing.id}`} className="text-gray-300 flex-1 cursor-pointer">
               {ing.nameAr}
             </label>
             {isSelected && (
               <div className="flex items-center gap-2">
                 <Input
                   type="number"
                   min="1"
                   step="1"
                   value={selected?.quantity || 10}
                   onChange={(e) => {
                     setSelectedIngredients(selectedIngredients.map(s =>
                       s.ingredientId === ing.id ? { ...s, quantity: parseFloat(e.target.value) || 0 } : s
                     ));
                   }}
                   className="w-20 bg-[#2d1f1a] border-amber-500/30 text-white text-center"
                   data-testid={`input-quantity-${ing.id}`}
                 />
                 <Select
                   value={selected?.unit || 'g'}
                   onValueChange={(value) => {
                     setSelectedIngredients(selectedIngredients.map(s =>
                       s.ingredientId === ing.id ? { ...s, unit: value } : s
                     ));
                   }}
                 >
                   <SelectTrigger className="w-20 bg-[#2d1f1a] border-amber-500/30 text-white" data-testid={`select-unit-${ing.id}`}>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-[#2d1f1a] border-amber-500/20 text-white">
                     <SelectItem value="g">جرام</SelectItem>
                     <SelectItem value="ml">مل</SelectItem>
                     <SelectItem value="kg">كجم</SelectItem>
                     <SelectItem value="l">لتر</SelectItem>
                     <SelectItem value="pcs">قطعة</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             )}
           </div>
         );
       })}
     </div>
     
     {selectedIngredients.length > 0 && (
       <div className="flex flex-wrap gap-2 mb-2">
         {selectedIngredients.map((ing) => (
           <Badge key={ing.ingredientId} className="bg-amber-500/20 text-amber-500 border border-amber-500/30">
             {ing.name}: {ing.quantity} {ing.unit}
             <button
               type="button"
               onClick={() => setSelectedIngredients(selectedIngredients.filter(s => s.ingredientId !== ing.ingredientId))}
               className="mr-1 hover:text-red-400"
             >
               <X className="w-3 h-3" />
             </button>
           </Badge>
         ))}
       </div>
     )}
   </div>

   <div className="flex justify-between gap-2">
     <Button
       type="button"
       variant="outline"
       onClick={() => setAddStep(1)}
       className="border-amber-500/30 text-amber-500"
       data-testid="button-back-step"
     >
       <ArrowRight className="w-4 h-4 ml-2" />
       السابق
     </Button>
     <div className="flex gap-2">
       <Button
         type="button"
         variant="outline"
         onClick={handleSkipIngredients}
         disabled={createItemMutation.isPending}
         className="border-gray-600 text-gray-300"
         data-testid="button-skip"
       >
         {createItemMutation.isPending ? "جاري الإضافة..." : "تخطي المكونات"}
       </Button>
       <Button
         type="button"
         onClick={handleStep2Submit}
         disabled={createItemMutation.isPending || selectedIngredients.length === 0}
         className="bg-gradient-to-r from-green-500 to-green-700"
         data-testid="button-submit"
       >
         {createItemMutation.isPending ? "جاري الإضافة..." : "إضافة المشروب"}
       </Button>
     </div>
   </div>
 </div>
 )}
 </DialogContent>
 </Dialog>
 )}
 <Button
 variant="outline"
 onClick={() => setLocation("/employee/ingredients")}
 className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
 data-testid="button-ingredients"
 >
 إدارةالمكونات
 </Button>
 <Button
 variant="outline"
 onClick={() => setLocation("/employee/dashboard")}
 className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
 data-testid="button-back"
 >
 <ArrowRight className="w-4 h-4 ml-2" />
 العودةللوحةالتحكم
 </Button>
 </div>
 </div>
 </div>

 {/* Content */}
 <div className="max-w-7xl mx-auto space-y-6">
 {isLoading ? (
 <div className="text-center text-amber-500 py-12">
 <Coffee className="w-12 h-12 animate-spin mx-auto mb-4" />
 <p>جاري تحميل المشروبات...</p>
 </div>
 ) : (
 Object.entries(categorizedItems).map(([category, items]) => (
 <Card key={category} className="bg-[#2d1f1a] border-amber-500/20">
 <CardHeader>
 <CardTitle className="text-amber-500 text-right text-xl">
 {categoryNames[category as keyof typeof categoryNames] || category}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {items.map((item) => (
 <div
 key={item.id}
 className="flex items-center justify-between p-4 bg-[#1a1410] rounded-lg border border-amber-500/10 hover:border-amber-500/30 transition-all"
 data-testid={`item-${item.id}`}
 >
 <div className="flex items-center gap-4 flex-1">
 <img
 src={item.imageUrl || getCoffeeImage(item.id)}
 alt={item.nameAr}
 className="w-16 h-16 rounded-lg object-cover"
 onError={(e) => {
 e.currentTarget.src = "/images/default-coffee.png";
 }}
 data-testid={`img-${item.id}`}
 />
 <div className="flex-1">
 <h3 className="text-lg font-bold text-amber-500" data-testid={`text-name-${item.id}`}>
 {item.nameAr}
 </h3>
 <p className="text-gray-400 text-sm">{item.nameEn}</p>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-amber-500 font-bold" data-testid={`text-price-${item.id}`}>
 {parseFloat(String(item.price)).toFixed(2)} ريال
 </span>
 {item.coffeeStrength && item.coffeeStrength !== "classic" && (
 <Badge variant="outline" className="text-xs border-amber-500/30 text-gray-400">
 {item.coffeeStrength === "strong" && "قوي"}
 {item.coffeeStrength === "medium" && "متوسط"}
 {item.coffeeStrength === "mild" && "خفيف"}
 </Badge>
 )}
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <div className="text-right flex flex-col gap-2">
 <Badge
 className={
 item.availabilityStatus === 'available' ? "bg-green-500" :
 item.availabilityStatus === 'out_of_stock' ? "bg-red-500" :
 item.availabilityStatus === 'coming_soon' ? "bg-blue-500" :
 "bg-orange-500"
 }
 data-testid={`badge-status-${item.id}`}
 >
 {item.availabilityStatus === 'available' && (
 <>
 <CheckCircle className="w-4 h-4 ml-1" />
 متوفر
 </>
 )}
 {item.availabilityStatus === 'out_of_stock' && (
 <>
 <XCircle className="w-4 h-4 ml-1" />
 نفذت الكمية 
 </>
 )}
 {item.availabilityStatus === 'coming_soon' && (
 <>
 <Coffee className="w-4 h-4 ml-1" />
 قريباً
 </>
 )}
 {item.availabilityStatus === 'temporarily_unavailable' && (
 <>
 <XCircle className="w-4 h-4 ml-1" />
 غير متوفر مؤقتاً
 </>
 )}
 </Badge>
 
 <select
 value={item.availabilityStatus || 'available'}
 onChange={(e) => handleStatusChange(item.id, e.target.value)}
 disabled={updateAvailabilityMutation.isPending}
 className="bg-[#1a1410] border border-amber-500/30 rounded-lg px-3 py-1 text-sm text-amber-500"
 data-testid={`select-status-${item.id}`}
 >
 <option value="available"> متوفر</option>
 <option value="out_of_stock"> نفذت الكمية </option>
 <option value="temporarily_unavailable">⏸ غير متوفر مؤقتاً</option>
 <option value="coming_soon"> قريباً</option>
 </select>
 </div>

 {employee?.role === "manager" && (
 <div className="flex flex-col gap-2">
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleToggleNewProduct(item)}
 className={`${
 item.isNewProduct === 1
 ? "bg-yellow-500 border-yellow-500 text-white"
 : "border-amber-500/30 text-amber-500"
 }`}
 disabled={toggleNewProductMutation.isPending}
 data-testid={`button-toggle-new-${item.id}`}
 >
 <Sparkles className="w-4 h-4 ml-1" />
 {item.isNewProduct === 1 ? "منتج جديد" : "جديد؟"}
 </Button>
 <div className="flex gap-1">
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleEdit(item)}
 className="border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white flex-1"
 data-testid={`button-edit-${item.id}`}
 >
 <Edit2 className="w-4 h-4" />
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleDelete(item.id)}
 className="border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white flex-1"
 data-testid={`button-delete-${item.id}`}
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 </div>
 </div>
 )}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 ))
 )}
 </div>

 {/* Edit Dialog */}
 <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
 <DialogContent className="bg-[#2d1f1a] border-amber-500/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle className="text-amber-500">تعديل المشروب</DialogTitle>
 </DialogHeader>
 {editingItem && (
 <form onSubmit={handleSubmitEditItem} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="edit-nameAr" className="text-gray-300">الاسم بالعربية *</Label>
 <Input
 id="edit-nameAr"
 name="nameAr"
 defaultValue={editingItem.nameAr}
 required
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-name-ar"
 />
 </div>
 <div>
 <Label htmlFor="edit-nameEn" className="text-gray-300">الاسم بالإنجليزية</Label>
 <Input
 id="edit-nameEn"
 name="nameEn"
 defaultValue={editingItem.nameEn}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-name-en"
 />
 </div>
 </div>

 <div>
 <Label htmlFor="edit-description" className="text-gray-300">الوصف *</Label>
 <Textarea
 id="edit-description"
 name="description"
 defaultValue={editingItem.description}
 required
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-description"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="edit-category" className="text-gray-300">القسم *</Label>
 <Select name="category" defaultValue={editingItem.category} required>
 <SelectTrigger className="bg-[#1a1410] border-amber-500/30 text-white" data-testid="select-edit-category">
 <SelectValue placeholder="اختر القسم" />
 </SelectTrigger>
 <SelectContent className="bg-[#2d1f1a] border-amber-500/20 text-white">
 <SelectItem value="basic">قهوة أساسية</SelectItem>
 <SelectItem value="hot">قهوة ساخنة</SelectItem>
 <SelectItem value="cold">قهوة باردة </SelectItem>
 <SelectItem value="specialty">مشروبات إضافية </SelectItem>
 <SelectItem value="desserts">الحلويات</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="edit-price" className="text-gray-300">السعر (ريال) *</Label>
 <Input
 id="edit-price"
 name="price"
 type="number"
 step="0.01"
 min="0"
 defaultValue={editingItem.price}
 required
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-price"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="edit-oldPrice" className="text-gray-300">السعر القديم (ريال)</Label>
 <Input
 id="edit-oldPrice"
 name="oldPrice"
 type="number"
 step="0.01"
 min="0"
 defaultValue={editingItem.oldPrice}
 className="bg-[#1a1410] border-amber-500/30 text-white"
 data-testid="input-edit-old-price"
 />
 </div>
 <div>
 <Label className="text-gray-300">صورة المشروب</Label>
 <div className="mt-2">
   <input
     ref={editFileInputRef}
     type="file"
     accept="image/*"
     onChange={handleEditImageSelect}
     className="hidden"
     data-testid="input-edit-image-file"
   />
   <div 
     onClick={() => editFileInputRef.current?.click()}
     className="border-2 border-dashed border-amber-500/30 rounded-lg p-4 text-center cursor-pointer hover:border-amber-500/60 transition-colors"
   >
     {editImagePreview ? (
       <div className="relative">
         <img src={editImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
           <span className="text-white text-sm">انقر لتغيير الصورة</span>
         </div>
       </div>
     ) : editingItem.imageUrl ? (
       <div className="relative">
         <img src={editingItem.imageUrl} alt="Current" className="w-full h-32 object-cover rounded-lg" />
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
           <span className="text-white text-sm">انقر لتغيير الصورة</span>
         </div>
       </div>
     ) : (
       <div className="py-4">
         <Upload className="w-8 h-8 text-amber-500/50 mx-auto mb-2" />
         <p className="text-gray-400 text-sm">انقر لرفع صورة</p>
         <p className="text-gray-500 text-xs mt-1">PNG, JPG حتى 5 ميجابايت</p>
       </div>
     )}
   </div>
 </div>
 </div>
 </div>

 <div className="flex justify-end gap-2">
 <Button
 type="button"
 variant="outline"
 onClick={() => {
 setIsEditDialogOpen(false);
 setEditingItem(null);
 resetEditImageState();
 }}
 className="border-gray-600 text-gray-300"
 data-testid="button-edit-cancel"
 >
 إلغاء
 </Button>
 <Button
 type="submit"
 disabled={updateItemMutation.isPending || isUploadingImage}
 className="bg-gradient-to-r from-blue-500 to-blue-700"
 data-testid="button-edit-submit"
 >
 {isUploadingImage ? "جاري رفع الصورة..." : updateItemMutation.isPending ? "جاري التحديث..." : "تحديث المشروب"}
 </Button>
 </div>
 </form>
 )}
 </DialogContent>
 </Dialog>

 {/* Delete Confirmation */}
 <AlertDialog open={!!deletingItemId} onOpenChange={() => setDeletingItemId(null)}>
 <AlertDialogContent className="bg-[#2d1f1a] border-red-500/20 text-white">
 <AlertDialogHeader>
 <AlertDialogTitle className="text-red-500">تأكيد الحذف</AlertDialogTitle>
 <AlertDialogDescription className="text-gray-300">
 هل أنت متأكد من حذف هذا المشروب؟ لا يمكن التراجع عن هذا الإجراء.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel
 className="bg-transparent border-gray-600 text-gray-300"
 data-testid="button-delete-cancel"
 >
 إلغاء
 </AlertDialogCancel>
 <AlertDialogAction
 onClick={confirmDelete}
 disabled={deleteItemMutation.isPending}
 className="bg-gradient-to-r from-red-500 to-red-700 text-white"
 data-testid="button-delete-confirm"
 >
 {deleteItemMutation.isPending ? "جاري الحذف..." : "حذف"}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 );
}
