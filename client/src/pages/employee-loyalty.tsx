import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Gift, UserPlus, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoyaltyCardComponent from "@/components/loyalty-card";
import type { LoyaltyCard } from "@shared/schema";

export default function EmployeeLoyalty() {
 const [, setLocation] = useLocation();
 const { toast } = useToast();
 const [isDialogOpen, setIsDialogOpen] = useState(false);
 const [customerName, setCustomerName] = useState("");
 const [phoneNumber, setPhoneNumber] = useState("");

 // Fetch all loyalty cards
 const { data: cards = [], isLoading } = useQuery<LoyaltyCard[]>({
 queryKey: ["/api/loyalty/cards"]
 });

 // Create loyalty card mutation
 const createCardMutation = useMutation({
 mutationFn: async (customerData: { customerName: string; phoneNumber: string }) => {
 const response = await apiRequest("POST", "/api/loyalty/cards", customerData);
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/loyalty/cards"] });
 toast({
 title: "تم إنشاء بطاق� الولاء! 🎉",
 description: `تم إصدار بطاق� جديد� للعميل ${customerName}`,
 className: "bg-green-900 border-green-700 text-white"
 });
 setIsDialogOpen(false);
 setCustomerName("");
 setPhoneNumber("");
 },
 onError: (error: any) => {
 toast({
 variant: "destructive",
 title: "� طأ",
 description: error.message || "فشل في إنشاء بطاق� الولاء"
 });
 }
 });

 const handleCreateCard = () => {
 if (!phoneNumber.trim()) {
 toast({
 variant: "destructive",
 title: "� طأ",
 description: "الرجاء إد� ال رقم الهاتف"
 });
 return;
 }
 createCardMutation.mutate({
 customerName: customerName.trim(),
 phoneNumber: phoneNumber.trim()
 });
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-4">
 {/* Header */}
 <div className="max-w-7xl mx-auto mb-6">
 <div className="flex items-center justify-between">
 <Button
 variant="ghost"
 onClick={() => setLocation("/employee/dashboard")}
 className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
 data-testid="button-back"
 >
 <ArrowRight className="w-5 h-5 ml-2" />
 العود� للوح� التحكم
 </Button>

 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-lg shadow-lg">
 <Gift className="w-5 h-5" />
 <span className="font-bold">إدار� بطاقات الولاء</span>
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto space-y-6">
 {/* Create Card Section */}
 <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm">
 <CardHeader>
 <CardTitle className="text-purple-400 flex items-center gap-2">
 <UserPlus className="w-5 h-5" />
 إصدار بطاق� ولاء جديد� 
 </CardTitle>
 </CardHeader>
 <CardContent>
 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
 <DialogTrigger asChild>
 <Button 
 className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
 data-testid="button-create-card"
 >
 <UserPlus className="w-4 h-4 ml-2" />
 إنشاء بطاق� ولاء جديد� 
 </Button>
 </DialogTrigger>
 <DialogContent className="bg-slate-900 border-purple-500/30">
 <DialogHeader>
 <DialogTitle className="text-purple-400">بيانات العميل</DialogTitle>
 </DialogHeader>
 <div className="space-y-4 py-4">
 <div className="space-y-2">
 <Label htmlFor="customer-name" className="text-slate-300">اسم العميل</Label>
 <Input
 id="customer-name"
 value={customerName}
 onChange={(e) => setCustomerName(e.target.value)}
 placeholder="محمد أحمد"
 className="bg-slate-800 border-slate-700 text-white"
 data-testid="input-customer-name"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="phone-number" className="text-slate-300">رقم الهاتف (9 أرقام تبدأ بـ 5)</Label>
 <Input
 id="phone-number"
 value={phoneNumber}
 onChange={(e) => setPhoneNumber(e.target.value)}
 placeholder="5xxxxxxxx"
 className="bg-slate-800 border-slate-700 text-white"
 data-testid="input-phone-number"
 />
 </div>
 <Button 
 onClick={handleCreateCard}
 disabled={createCardMutation.isPending}
 className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
 data-testid="button-submit-card"
 >
 {createCardMutation.isPending ? "جاري الإنشاء..." : "إصدار البطاق� "}
 </Button>
 </div>
 </DialogContent>
 </Dialog>
 </CardContent>
 </Card>

 {/* Cards List */}
 <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm">
 <CardHeader>
 <CardTitle className="text-purple-400 flex items-center gap-2">
 <Search className="w-5 h-5" />
 بطاقات الولاء المُصدر� ({cards.length})
 </CardTitle>
 </CardHeader>
 <CardContent>
 {isLoading ? (
 <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
 ) : cards.length === 0 ? (
 <div className="text-center py-8 text-slate-400">
 لا توجد بطاقات ولاء حالياً. قم بإنشاء أول بطاق� !
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {cards.map((card) => (
 <div key={card.id} data-testid={`loyalty-card-${card.id}`}>
 <LoyaltyCardComponent card={card} />
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 {/* Decorative Elements */}
 <div className="fixed inset-0 pointer-events-none">
 <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
 <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
 </div>
 </div>
 );
}