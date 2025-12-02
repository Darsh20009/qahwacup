import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Coffee, ShoppingBag, User, Phone, Trash2, Plus, Minus, ArrowRight, 
  Check, Search, X, Gift, Printer, MonitorSmartphone, Settings, 
  Wifi, WifiOff, Mail, FileText, CreditCard, Banknote, Smartphone,
  PauseCircle, PlayCircle, Clock, RotateCcw, Percent, Tag, 
  DollarSign, Calculator, Home, Grid3X3, List, ChevronRight,
  Loader2, AlertCircle, CheckCircle, Zap, Building, History,
  Box, Apple
} from "lucide-react";
import { SiApplepay } from "react-icons/si";
import { ReceiptPrint } from "@/components/receipt-print";
import { TaxInvoicePrint } from "@/components/tax-invoice-print";
import type { Employee, CoffeeItem, PaymentMethod, LoyaltyCard } from "@shared/schema";

interface OrderItem {
  coffeeItem: CoffeeItem;
  quantity: number;
  itemDiscount?: number;
  notes?: string;
}

interface ParkedOrder {
  id: string;
  name: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  createdAt: string;
  note?: string;
}

interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  nameEn: string;
  icon: typeof CreditCard;
  color: string;
  enabled: boolean;
}

const PAYMENT_METHODS: PaymentMethodInfo[] = [
  { id: "cash", name: "نقدي", nameEn: "Cash", icon: Banknote, color: "bg-green-600", enabled: true },
  { id: "pos", name: "مدى", nameEn: "Mada", icon: CreditCard, color: "bg-blue-600", enabled: true },
  { id: "alinma", name: "Alinma Pay", nameEn: "Alinma", icon: Smartphone, color: "bg-purple-600", enabled: true },
  { id: "ur", name: "Ur Pay", nameEn: "Ur Pay", icon: Zap, color: "bg-orange-600", enabled: true },
  { id: "barq", name: "Barq", nameEn: "Barq", icon: Zap, color: "bg-yellow-600", enabled: true },
  { id: "rajhi", name: "الراجحي", nameEn: "Al Rajhi", icon: Building, color: "bg-teal-600", enabled: true },
  { id: "apple_pay", name: "Apple Pay", nameEn: "Apple Pay", icon: Smartphone, color: "bg-black", enabled: true },
];

const CATEGORIES = [
  { id: "all", name: "الكل", icon: Grid3X3 },
  { id: "espresso", name: "إسبريسو", icon: Coffee },
  { id: "latte", name: "لاتيه", icon: Coffee },
  { id: "cold", name: "مشروبات باردة", icon: Coffee },
  { id: "tea", name: "شاي", icon: Coffee },
  { id: "specialty", name: "مميز", icon: Coffee },
];

export default function POSSystem() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [parkedOrders, setParkedOrders] = useState<ParkedOrder[]>([]);
  const [showParkedOrders, setShowParkedOrders] = useState(false);
  const [parkOrderNote, setParkOrderNote] = useState("");
  const [showParkDialog, setShowParkDialog] = useState(false);
  
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percentage: number, reason: string} | null>(null);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [itemDiscountId, setItemDiscountId] = useState<string | null>(null);
  const [itemDiscountAmount, setItemDiscountAmount] = useState(0);
  
  const [posConnected, setPosConnected] = useState(false);
  const [cashDrawerOpen, setCashDrawerOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineOrders, setOfflineOrders] = useState<any[]>([]);
  
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showTaxInvoice, setShowTaxInvoice] = useState(false);
  
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const taxInvoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      const storedEmployee = localStorage.getItem("currentEmployee");
      if (storedEmployee) {
        const parsed = JSON.parse(storedEmployee);
        if (!parsed._id && parsed.id) parsed._id = parsed.id;
        
        if (!parsed.branchId) {
          try {
            const response = await fetch('/api/verify-session');
            if (response.ok) {
              const data = await response.json();
              if (data.employee?.branchId) {
                parsed.branchId = data.employee.branchId;
                localStorage.setItem("currentEmployee", JSON.stringify(parsed));
              }
            }
          } catch (error) {
            console.error("Error fetching branch info:", error);
          }
        }
        setEmployee(parsed);
      } else {
        setLocation("/employee/gateway");
      }
    };
    loadEmployee();
    
    const savedParkedOrders = localStorage.getItem("parkedOrders");
    if (savedParkedOrders) {
      setParkedOrders(JSON.parse(savedParkedOrders));
    }
    
    const savedOfflineOrders = localStorage.getItem("offlineOrders");
    if (savedOfflineOrders) {
      setOfflineOrders(JSON.parse(savedOfflineOrders));
    }
  }, [setLocation]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast({ title: "تم استعادة الاتصال", description: "جاري مزامنة الطلبات المحفوظة...", className: "bg-green-600 text-white" });
      syncOfflineOrders();
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast({ title: "انقطع الاتصال", description: "النظام يعمل في وضع عدم الاتصال", variant: "destructive" });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  useEffect(() => {
    const checkPosConnection = async () => {
      try {
        const response = await fetch('/api/pos/status', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setPosConnected(data.connected === true);
        }
      } catch (error) {
        setPosConnected(false);
      }
    };
    checkPosConnection();
    const interval = setInterval(checkPosConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("parkedOrders", JSON.stringify(parkedOrders));
  }, [parkedOrders]);

  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const syncOfflineOrders = async () => {
    if (offlineOrders.length === 0) return;
    
    const sessionVerify = await fetch('/api/verify-session', { credentials: 'include' });
    if (!sessionVerify.ok) {
      toast({ 
        title: "يرجى تسجيل الدخول", 
        description: "سيتم مزامنة الطلبات بعد تسجيل الدخول", 
        variant: "destructive" 
      });
      return;
    }
    
    const syncedOrders: string[] = [];
    const failedOrders: typeof offlineOrders = [];
    
    for (const order of offlineOrders) {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(order),
        });
        
        if (response.ok) {
          syncedOrders.push(order.offlineId);
        } else {
          failedOrders.push(order);
        }
      } catch (error) {
        console.error("Failed to sync order:", error);
        failedOrders.push(order);
      }
    }
    
    if (failedOrders.length > 0) {
      setOfflineOrders(failedOrders);
      localStorage.setItem("offlineOrders", JSON.stringify(failedOrders));
      toast({ 
        title: "مزامنة جزئية", 
        description: `تم رفع ${syncedOrders.length} طلب، ${failedOrders.length} طلب فشل`, 
        variant: "destructive" 
      });
    } else {
      setOfflineOrders([]);
      localStorage.removeItem("offlineOrders");
      toast({ title: "تمت المزامنة", description: `تم رفع ${syncedOrders.length} طلب محفوظ`, className: "bg-green-600 text-white" });
    }
  };

  const checkCustomer = useCallback(async (phone: string) => {
    if (phone.length === 9 && phone.startsWith('5')) {
      setIsCheckingCustomer(true);
      try {
        const response = await fetch(`/api/customers/lookup-by-phone`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.found && data.customer) {
            setCustomerName(data.customer.name);
            setCustomerEmail(data.customer.email || "");
            setCustomerPoints(data.customer.points || 0);
            setCustomerId(data.customer.id);
            setLoyaltyCard(data.loyaltyCard || null);
            setShowRegisterDialog(false);
            
            toast({
              title: "عميل مسجل",
              description: `مرحباً ${data.customer.name}! لديك ${data.customer.points || 0} نقطة`,
              className: "bg-green-600 text-white",
            });
          } else {
            setShowRegisterDialog(true);
          }
        }
      } catch (error) {
        console.error('Error checking customer:', error);
      } finally {
        setIsCheckingCustomer(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => checkCustomer(customerPhone), 500);
    return () => clearTimeout(timer);
  }, [customerPhone, checkCustomer]);

  const filteredItems = coffeeItems.filter(item => {
    const matchesSearch = item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || 
                            item.id.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                            (item.category?.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const addToOrder = (coffeeItem: CoffeeItem) => {
    const existingItem = orderItems.find(item => item.coffeeItem.id === coffeeItem.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.coffeeItem.id === coffeeItem.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrderItems([...orderItems, { coffeeItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (coffeeItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(item => item.coffeeItem.id !== coffeeItemId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.coffeeItem.id === coffeeItemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const applyItemDiscount = (coffeeItemId: string, discount: number) => {
    setOrderItems(orderItems.map(item =>
      item.coffeeItem.id === coffeeItemId ? { ...item, itemDiscount: discount } : item
    ));
    setItemDiscountId(null);
    setItemDiscountAmount(0);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      const itemTotal = Number(item.coffeeItem.price) * item.quantity;
      const itemDiscount = item.itemDiscount || 0;
      return sum + itemTotal - itemDiscount;
    }, 0);
  };

  const calculateCodeDiscount = () => {
    if (!appliedDiscount) return 0;
    return (calculateSubtotal() * appliedDiscount.percentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const codeDiscount = calculateCodeDiscount();
    const total = subtotal - codeDiscount - invoiceDiscount;
    return Math.max(0, total).toFixed(2);
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return;
    
    setIsValidatingDiscount(true);
    try {
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedDiscount({
          code: data.code,
          percentage: data.discountPercentage,
          reason: data.reason
        });
        toast({
          title: "تم تطبيق الخصم",
          description: `${data.reason} - ${data.discountPercentage}%`,
          className: "bg-green-600 text-white",
        });
      } else {
        toast({
          title: "كود غير صالح",
          description: data.error || "الكود غير صحيح أو منتهي",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل التحقق من الكود", variant: "destructive" });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const parkOrder = () => {
    if (orderItems.length === 0) {
      toast({ title: "خطأ", description: "لا توجد عناصر لتعليقها", variant: "destructive" });
      return;
    }

    const parkedOrder: ParkedOrder = {
      id: `park-${Date.now()}`,
      name: customerName || `طلب معلق #${parkedOrders.length + 1}`,
      items: [...orderItems],
      customerName,
      customerPhone,
      tableNumber,
      createdAt: new Date().toISOString(),
      note: parkOrderNote
    };

    setParkedOrders([...parkedOrders, parkedOrder]);
    resetForm();
    setShowParkDialog(false);
    setParkOrderNote("");
    
    toast({
      title: "تم تعليق الطلب",
      description: `تم حفظ الطلب: ${parkedOrder.name}`,
      className: "bg-blue-600 text-white",
    });
  };

  const resumeParkedOrder = (parkedOrder: ParkedOrder) => {
    setOrderItems(parkedOrder.items);
    setCustomerName(parkedOrder.customerName);
    setCustomerPhone(parkedOrder.customerPhone);
    setTableNumber(parkedOrder.tableNumber || "");
    setParkedOrders(parkedOrders.filter(o => o.id !== parkedOrder.id));
    setShowParkedOrders(false);
    
    toast({
      title: "تم استئناف الطلب",
      description: parkedOrder.name,
    });
  };

  const deleteParkedOrder = (id: string) => {
    setParkedOrders(parkedOrders.filter(o => o.id !== id));
    toast({ title: "تم حذف الطلب المعلق" });
  };

  const openCashDrawer = async () => {
    try {
      const response = await fetch('/api/pos/cash-drawer/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (response.ok) {
        setCashDrawerOpen(true);
        setTimeout(() => setCashDrawerOpen(false), 3000);
        toast({ title: "تم فتح الخزانة", className: "bg-green-600 text-white" });
      } else {
        toast({ title: "فشل فتح الخزانة", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "خطأ في الاتصال بالخزانة", variant: "destructive" });
    }
  };

  const printReceipt = async () => {
    if (lastOrder) {
      try {
        await fetch('/api/pos/print-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderNumber: lastOrder.orderNumber,
            receiptData: lastOrder
          })
        });
        toast({ title: "تم إرسال الإيصال للطابعة", className: "bg-green-600 text-white" });
      } catch (error) {
        console.error("Error sending to printer:", error);
      }
    }
    window.print();
  };

  const printTaxInvoice = async () => {
    setShowTaxInvoice(true);
    if (lastOrder) {
      try {
        await fetch('/api/pos/print-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderNumber: lastOrder.orderNumber,
            receiptData: { ...lastOrder, isTaxInvoice: true }
          })
        });
      } catch (error) {
        console.error("Error sending tax invoice to printer:", error);
      }
    }
    setTimeout(() => {
      window.print();
      setShowTaxInvoice(false);
    }, 100);
  };

  const resetForm = () => {
    setOrderItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerPoints(0);
    setCustomerId(null);
    setLoyaltyCard(null);
    setTableNumber("");
    setPaymentMethod("cash");
    setDiscountCode("");
    setAppliedDiscount(null);
    setInvoiceDiscount(0);
    setShowRegisterDialog(false);
  };

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      if (isOffline) {
        const offlineOrder = { ...orderData, offlineId: `offline-${Date.now()}`, createdAt: new Date() };
        const newOfflineOrders = [...offlineOrders, offlineOrder];
        setOfflineOrders(newOfflineOrders);
        localStorage.setItem("offlineOrders", JSON.stringify(newOfflineOrders));
        return { orderNumber: offlineOrder.offlineId, totalAmount: orderData.totalAmount, offline: true };
      }
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
    onSuccess: async (order) => {
      const paymentMethodName = PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod;
      
      setLastOrder({
        orderNumber: order.orderNumber,
        customerName: customerName || "عميل",
        customerPhone: customerPhone || "",
        items: orderItems,
        subtotal: calculateSubtotal().toFixed(2),
        discount: appliedDiscount ? {
          code: appliedDiscount.code,
          percentage: appliedDiscount.percentage,
          amount: calculateCodeDiscount().toFixed(2)
        } : undefined,
        invoiceDiscount: invoiceDiscount > 0 ? invoiceDiscount.toFixed(2) : undefined,
        total: order.totalAmount,
        paymentMethod: paymentMethodName,
        employeeName: employee?.fullName || "",
        tableNumber: tableNumber || undefined,
        date: new Date().toLocaleString('ar-SA'),
        offline: order.offline
      });
      
      setShowReceipt(true);
      
      if (paymentMethod === "cash") {
        openCashDrawer();
      }
      
      toast({
        title: order.offline ? "تم حفظ الطلب محلياً" : "تم إنشاء الطلب بنجاح",
        description: `رقم الطلب: ${order.orderNumber}`,
        className: "bg-green-600 text-white",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      resetForm();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل إنشاء الطلب. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      toast({ title: "خطأ", description: "يرجى إضافة عناصر للطلب", variant: "destructive" });
      return;
    }

    if (!employee?.branchId) {
      toast({ title: "خطأ", description: "معلومات الفرع غير متوفرة", variant: "destructive" });
      return;
    }

    const orderData = {
      items: orderItems.map(item => ({
        coffeeItemId: item.coffeeItem.id,
        quantity: item.quantity,
        price: item.coffeeItem.price,
        itemDiscount: item.itemDiscount || 0
      })),
      totalAmount: calculateTotal(),
      paymentMethod,
      customerInfo: {
        customerName: customerName || "عميل",
        phoneNumber: customerPhone || undefined,
        customerEmail: customerEmail || undefined
      },
      customerId: customerId || undefined,
      employeeId: employee?.id,
      branchId: employee.branchId,
      tableNumber: tableNumber || undefined,
      discountCode: appliedDiscount?.code,
      invoiceDiscount: invoiceDiscount > 0 ? invoiceDiscount : undefined,
      status: "in_progress"
    };

    createOrderMutation.mutate(orderData);
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#1a1410] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1410] text-white" dir="rtl">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <header className="bg-[#2d1f1a] border-b border-amber-500/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-amber-500">نظام نقاط البيع</h1>
                  <p className="text-xs text-gray-400">{employee.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {isOffline && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    وضع عدم الاتصال
                    {offlineOrders.length > 0 && ` (${offlineOrders.length})`}
                  </Badge>
                )}
                
                <Badge variant={posConnected ? "default" : "secondary"} className={posConnected ? "bg-green-600" : ""}>
                  <MonitorSmartphone className="w-3 h-3 ml-1" />
                  {posConnected ? "POS متصل" : "POS غير متصل"}
                </Badge>
                
                <Button variant="outline" size="sm" onClick={() => setShowParkedOrders(true)} className="border-amber-500/30 text-amber-500" data-testid="button-parked-orders">
                  <PauseCircle className="w-4 h-4 ml-1" />
                  معلق ({parkedOrders.length})
                </Button>
                
                <Button variant="outline" size="sm" onClick={openCashDrawer} className="border-amber-500/30 text-amber-500" data-testid="button-open-drawer">
                  <Box className="w-4 h-4 ml-1" />
                  فتح الخزانة
                </Button>
                
                <Button variant="ghost" size="icon" onClick={() => setLocation("/employee/dashboard")} data-testid="button-back">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="بحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 bg-[#2d1f1a] border-amber-500/20 text-white"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <ScrollArea className="mb-4">
                <div className="flex gap-2 pb-2">
                  {CATEGORIES.map(cat => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={selectedCategory === cat.id ? "bg-amber-600" : "border-amber-500/30 text-amber-500"}
                      data-testid={`button-category-${cat.id}`}
                    >
                      <cat.icon className="w-4 h-4 ml-1" />
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-[#2d1f1a] border-amber-500/10 hover:border-amber-500/30 cursor-pointer transition-all hover-elevate"
                        onClick={() => addToOrder(item)}
                        data-testid={`card-item-${item.id}`}
                      >
                        <CardContent className="p-3">
                          <div className="aspect-square bg-gradient-to-br from-amber-900/50 to-amber-800/30 rounded-lg mb-2 flex items-center justify-center">
                            <Coffee className="w-8 h-8 text-amber-500/50" />
                          </div>
                          <h3 className="text-sm font-medium text-amber-500 truncate">{item.nameAr}</h3>
                          <p className="text-lg font-bold text-white">{Number(item.price).toFixed(2)} ر.س</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="w-96 bg-[#2d1f1a] border-r border-amber-500/20 flex flex-col">
              <div className="p-4 border-b border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-amber-500">الفاتورة</h2>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowParkDialog(true)} disabled={orderItems.length === 0} data-testid="button-park-order">
                      <PauseCircle className="w-5 h-5 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={resetForm} data-testid="button-clear-order">
                      <RotateCcw className="w-5 h-5 text-gray-400" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="رقم الجوال (5xxxxxxxx)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="bg-[#1a1410] border-amber-500/20 text-white"
                      data-testid="input-phone"
                    />
                    {isCheckingCustomer && <Loader2 className="w-5 h-5 animate-spin text-amber-500" />}
                  </div>
                  <Input
                    placeholder="اسم العميل"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-[#1a1410] border-amber-500/20 text-white"
                    data-testid="input-customer-name"
                  />
                  <Input
                    placeholder="رقم الطاولة (اختياري)"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="bg-[#1a1410] border-amber-500/20 text-white"
                    data-testid="input-table"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {orderItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد عناصر في الطلب</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.coffeeItem.id} className="bg-[#1a1410] rounded-lg p-3" data-testid={`order-item-${item.coffeeItem.id}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-amber-500">{item.coffeeItem.nameAr}</h4>
                            <p className="text-xs text-gray-400">{Number(item.coffeeItem.price).toFixed(2)} ر.س</p>
                            {item.itemDiscount && item.itemDiscount > 0 && (
                              <Badge variant="secondary" className="mt-1 text-xs bg-green-600/20 text-green-400">
                                خصم: {item.itemDiscount.toFixed(2)} ر.س
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.coffeeItem.id, item.quantity - 1)} className="h-7 w-7" data-testid={`button-decrease-${item.coffeeItem.id}`}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center font-bold">{item.quantity}</span>
                            <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.coffeeItem.id, item.quantity + 1)} className="h-7 w-7" data-testid={`button-increase-${item.coffeeItem.id}`}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">
                            {((Number(item.coffeeItem.price) * item.quantity) - (item.itemDiscount || 0)).toFixed(2)} ر.س
                          </span>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => { setItemDiscountId(item.coffeeItem.id); setShowDiscountDialog(true); }} className="h-6 w-6" data-testid={`button-item-discount-${item.coffeeItem.id}`}>
                              <Tag className="w-3 h-3 text-green-400" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setOrderItems(orderItems.filter(i => i.coffeeItem.id !== item.coffeeItem.id))} className="h-6 w-6" data-testid={`button-remove-${item.coffeeItem.id}`}>
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="p-4 border-t border-amber-500/20 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="كود الخصم"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="bg-[#1a1410] border-amber-500/20 text-white"
                    data-testid="input-discount-code"
                  />
                  <Button onClick={validateDiscountCode} disabled={isValidatingDiscount} className="bg-amber-600" data-testid="button-apply-discount">
                    {isValidatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                </div>

                {appliedDiscount && (
                  <div className="flex items-center justify-between bg-green-600/20 rounded-lg px-3 py-2">
                    <span className="text-sm text-green-400">{appliedDiscount.reason} ({appliedDiscount.percentage}%)</span>
                    <Button size="icon" variant="ghost" onClick={() => { setAppliedDiscount(null); setDiscountCode(""); }} className="h-6 w-6">
                      <X className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="خصم على الفاتورة"
                    value={invoiceDiscount || ""}
                    onChange={(e) => setInvoiceDiscount(parseFloat(e.target.value) || 0)}
                    className="bg-[#1a1410] border-amber-500/20 text-white"
                    data-testid="input-invoice-discount"
                  />
                  <Button variant="outline" onClick={() => setInvoiceDiscount(0)} className="border-amber-500/30" data-testid="button-clear-invoice-discount">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <Separator className="bg-amber-500/20" />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">المجموع الفرعي:</span>
                    <span>{calculateSubtotal().toFixed(2)} ر.س</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-400">
                      <span>خصم الكود ({appliedDiscount.percentage}%):</span>
                      <span>-{calculateCodeDiscount().toFixed(2)} ر.س</span>
                    </div>
                  )}
                  {invoiceDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>خصم الفاتورة:</span>
                      <span>-{invoiceDiscount.toFixed(2)} ر.س</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-amber-500 pt-2">
                    <span>الإجمالي:</span>
                    <span>{calculateTotal()} ر.س</span>
                  </div>
                </div>

                <Separator className="bg-amber-500/20" />

                <div className="grid grid-cols-4 gap-2">
                  {PAYMENT_METHODS.slice(0, 4).map((method) => (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMethod(method.id)}
                      className={paymentMethod === method.id ? method.color : "border-amber-500/30 text-amber-500"}
                      data-testid={`button-payment-${method.id}`}
                    >
                      <method.icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.slice(4).map((method) => (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMethod(method.id)}
                      className={paymentMethod === method.id ? method.color : "border-amber-500/30 text-amber-500"}
                      data-testid={`button-payment-${method.id}`}
                    >
                      <method.icon className="w-3 h-3 ml-1" />
                      <span className="text-xs">{method.name}</span>
                    </Button>
                  ))}
                </div>

                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                  onClick={handleSubmitOrder}
                  disabled={orderItems.length === 0 || createOrderMutation.isPending}
                  data-testid="button-submit-order"
                >
                  {createOrderMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  ) : (
                    <CheckCircle className="w-5 h-5 ml-2" />
                  )}
                  تأكيد الطلب - {calculateTotal()} ر.س
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showParkedOrders} onOpenChange={setShowParkedOrders}>
        <DialogContent className="bg-[#2d1f1a] border-amber-500/20 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-amber-500 flex items-center gap-2">
              <PauseCircle className="w-5 h-5" />
              الطلبات المعلقة ({parkedOrders.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            {parkedOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد طلبات معلقة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parkedOrders.map((order) => (
                  <Card key={order.id} className="bg-[#1a1410] border-amber-500/10">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-amber-500">{order.name}</h4>
                          <p className="text-xs text-gray-400">{order.items.length} عنصر</p>
                          {order.note && <p className="text-xs text-gray-500 mt-1">{order.note}</p>}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => resumeParkedOrder(order)} className="flex-1 bg-amber-600" data-testid={`button-resume-${order.id}`}>
                          <PlayCircle className="w-4 h-4 ml-1" />
                          استئناف
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteParkedOrder(order.id)} data-testid={`button-delete-parked-${order.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showParkDialog} onOpenChange={setShowParkDialog}>
        <DialogContent className="bg-[#2d1f1a] border-amber-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-500">تعليق الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">ملاحظة (اختياري)</Label>
              <Input
                value={parkOrderNote}
                onChange={(e) => setParkOrderNote(e.target.value)}
                placeholder="أضف ملاحظة للطلب المعلق..."
                className="bg-[#1a1410] border-amber-500/20 text-white mt-2"
                data-testid="input-park-note"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParkDialog(false)} className="border-amber-500/30">إلغاء</Button>
            <Button onClick={parkOrder} className="bg-blue-600" data-testid="button-confirm-park">
              <PauseCircle className="w-4 h-4 ml-1" />
              تعليق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent className="bg-[#2d1f1a] border-amber-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-500">خصم على المنتج</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">قيمة الخصم (ر.س)</Label>
              <Input
                type="number"
                value={itemDiscountAmount}
                onChange={(e) => setItemDiscountAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="bg-[#1a1410] border-amber-500/20 text-white mt-2"
                data-testid="input-item-discount-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDiscountDialog(false); setItemDiscountId(null); }} className="border-amber-500/30">إلغاء</Button>
            <Button onClick={() => { if (itemDiscountId) applyItemDiscount(itemDiscountId, itemDiscountAmount); setShowDiscountDialog(false); }} className="bg-green-600" data-testid="button-confirm-item-discount">
              <Check className="w-4 h-4 ml-1" />
              تطبيق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReceipt && !!lastOrder} onOpenChange={setShowReceipt}>
        <DialogContent className="bg-[#2d1f1a] border-amber-500/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-500 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              تم الطلب بنجاح
            </DialogTitle>
          </DialogHeader>
          {lastOrder && (
            <div className="space-y-4">
              <div className="bg-[#1a1410] rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">رقم الطلب</p>
                <p className="text-2xl font-bold text-amber-500">{lastOrder.orderNumber}</p>
                <p className="text-lg font-bold text-white mt-2">{lastOrder.total} ر.س</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={printReceipt} className="flex-1 bg-amber-600" data-testid="button-print-receipt">
                  <Printer className="w-4 h-4 ml-1" />
                  طباعة الإيصال
                </Button>
                <Button onClick={printTaxInvoice} variant="outline" className="flex-1 border-amber-500/30 text-amber-500" data-testid="button-print-tax">
                  <FileText className="w-4 h-4 ml-1" />
                  فاتورة ضريبية
                </Button>
              </div>
              <Button onClick={() => setShowReceipt(false)} variant="ghost" className="w-full" data-testid="button-close-receipt">
                إغلاق
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {lastOrder && (
        <div className="hidden print:block">
          <div ref={receiptRef}>
            <ReceiptPrint
              orderNumber={lastOrder.orderNumber}
              customerName={lastOrder.customerName}
              customerPhone={lastOrder.customerPhone || ""}
              items={lastOrder.items}
              subtotal={lastOrder.subtotal}
              discount={lastOrder.discount}
              total={lastOrder.total}
              paymentMethod={lastOrder.paymentMethod}
              employeeName={lastOrder.employeeName}
              tableNumber={lastOrder.tableNumber}
              date={lastOrder.date}
            />
          </div>
          {showTaxInvoice && (
            <div ref={taxInvoiceRef}>
              <TaxInvoicePrint
                orderNumber={lastOrder.orderNumber}
                customerName={lastOrder.customerName}
                customerPhone={lastOrder.customerPhone || ""}
                items={lastOrder.items}
                subtotal={lastOrder.subtotal}
                discount={lastOrder.discount}
                total={lastOrder.total}
                paymentMethod={lastOrder.paymentMethod}
                employeeName={lastOrder.employeeName}
                date={lastOrder.date}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
