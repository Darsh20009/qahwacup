import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Coffee, ShoppingBag, User, Phone, Trash2, Plus, Minus, ArrowRight, 
  Check, Search, X, Printer, MonitorSmartphone, 
  Wifi, WifiOff, FileText, CreditCard, Banknote, Smartphone,
  PauseCircle, PlayCircle, Clock, RotateCcw, Percent, Tag, 
  Calculator, Grid3X3, ChevronLeft, ChevronRight,
  Loader2, CheckCircle, Zap, Building, Users, Edit3,
  Receipt, Wallet, QrCode, SplitSquareVertical, AlertTriangle,
  RefreshCw, Archive, MoreVertical, MessageSquare
} from "lucide-react";
import { ReceiptPrint } from "@/components/receipt-print";
import { TaxInvoicePrint } from "@/components/tax-invoice-print";
import type { Employee, CoffeeItem, PaymentMethod, LoyaltyCard } from "@shared/schema";

interface OrderItem {
  coffeeItem: CoffeeItem;
  quantity: number;
  itemDiscount?: number;
  discountType?: 'fixed' | 'percentage';
  notes?: string;
}

interface ParkedOrder {
  id: string;
  name: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tableNumber?: string;
  createdAt: string;
  note?: string;
  priority?: 'normal' | 'urgent';
  appliedDiscount?: { code: string; percentage: number; reason: string } | null;
  invoiceDiscount?: number;
}

interface SplitPayment {
  method: PaymentMethod;
  amount: number;
}

interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  nameEn: string;
  icon: typeof CreditCard;
  color: string;
  bgColor: string;
  enabled: boolean;
}

const PAYMENT_METHODS: PaymentMethodInfo[] = [
  { id: "cash", name: "نقدي", nameEn: "Cash", icon: Banknote, color: "text-green-400", bgColor: "bg-green-600", enabled: true },
  { id: "pos", name: "مدى", nameEn: "Mada", icon: CreditCard, color: "text-blue-400", bgColor: "bg-blue-600", enabled: true },
  { id: "apple_pay", name: "Apple Pay", nameEn: "Apple Pay", icon: Smartphone, color: "text-gray-200", bgColor: "bg-gray-800", enabled: true },
  { id: "alinma", name: "Alinma Pay", nameEn: "Alinma", icon: Wallet, color: "text-purple-400", bgColor: "bg-purple-600", enabled: true },
  { id: "rajhi", name: "الراجحي", nameEn: "Al Rajhi", icon: Building, color: "text-teal-400", bgColor: "bg-teal-600", enabled: true },
  { id: "ur", name: "Ur Pay", nameEn: "Ur Pay", icon: Zap, color: "text-orange-400", bgColor: "bg-orange-600", enabled: true },
  { id: "barq", name: "Barq", nameEn: "Barq", icon: Zap, color: "text-yellow-400", bgColor: "bg-yellow-600", enabled: true },
  { id: "qahwa-card", name: "بطاقة قهوة", nameEn: "Qahwa Card", icon: Coffee, color: "text-amber-400", bgColor: "bg-amber-600", enabled: true },
];

const CATEGORIES = [
  { id: "all", name: "الكل", nameEn: "All", icon: Grid3X3, color: "bg-slate-600" },
  { id: "espresso", name: "إسبريسو", nameEn: "Espresso", icon: Coffee, color: "bg-amber-700" },
  { id: "latte", name: "لاتيه", nameEn: "Latte", icon: Coffee, color: "bg-orange-600" },
  { id: "cappuccino", name: "كابتشينو", nameEn: "Cappuccino", icon: Coffee, color: "bg-amber-600" },
  { id: "cold", name: "مشروبات باردة", nameEn: "Cold Drinks", icon: Coffee, color: "bg-cyan-600" },
  { id: "tea", name: "شاي", nameEn: "Tea", icon: Coffee, color: "bg-green-600" },
  { id: "matcha", name: "ماتشا", nameEn: "Matcha", icon: Coffee, color: "bg-emerald-600" },
  { id: "specialty", name: "مميز", nameEn: "Specialty", icon: Coffee, color: "bg-purple-600" },
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
  const [editingParkedOrder, setEditingParkedOrder] = useState<ParkedOrder | null>(null);
  
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percentage: number, reason: string} | null>(null);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [invoiceDiscountType, setInvoiceDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [itemDiscountId, setItemDiscountId] = useState<string | null>(null);
  const [itemDiscountAmount, setItemDiscountAmount] = useState(0);
  const [itemDiscountType, setItemDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);
  const [currentSplitAmount, setCurrentSplitAmount] = useState(0);
  const [currentSplitMethod, setCurrentSplitMethod] = useState<PaymentMethod>("cash");
  
  const [posConnected, setPosConnected] = useState(false);
  const [cashDrawerOpen, setCashDrawerOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineOrders, setOfflineOrders] = useState<any[]>([]);
  const [syncingOffline, setSyncingOffline] = useState(false);
  
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showTaxInvoice, setShowTaxInvoice] = useState(false);
  
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const [categoryPage, setCategoryPage] = useState(0);
  const categoriesPerPage = 6;
  
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
    if (offlineOrders.length === 0 || syncingOffline) return;
    
    setSyncingOffline(true);
    
    try {
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
    } finally {
      setSyncingOffline(false);
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

  const applyItemDiscount = (coffeeItemId: string, discount: number, type: 'fixed' | 'percentage') => {
    setOrderItems(orderItems.map(item => {
      if (item.coffeeItem.id === coffeeItemId) {
        const itemTotal = Number(item.coffeeItem.price) * item.quantity;
        const actualDiscount = type === 'percentage' ? (itemTotal * discount / 100) : discount;
        return { ...item, itemDiscount: Math.min(actualDiscount, itemTotal), discountType: type };
      }
      return item;
    }));
    setItemDiscountId(null);
    setItemDiscountAmount(0);
    setShowDiscountDialog(false);
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

  const calculateInvoiceDiscount = () => {
    if (invoiceDiscount <= 0) return 0;
    const subtotal = calculateSubtotal() - calculateCodeDiscount();
    if (invoiceDiscountType === 'percentage') {
      return (subtotal * invoiceDiscount) / 100;
    }
    return Math.min(invoiceDiscount, subtotal);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const codeDiscount = calculateCodeDiscount();
    const invDiscount = calculateInvoiceDiscount();
    const total = subtotal - codeDiscount - invDiscount;
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
      customerEmail,
      tableNumber,
      createdAt: new Date().toISOString(),
      note: parkOrderNote,
      priority: 'normal',
      appliedDiscount,
      invoiceDiscount
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
    setCustomerEmail(parkedOrder.customerEmail || "");
    setTableNumber(parkedOrder.tableNumber || "");
    setAppliedDiscount(parkedOrder.appliedDiscount || null);
    setInvoiceDiscount(parkedOrder.invoiceDiscount || 0);
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

  const updateParkedOrderPriority = (id: string, priority: 'normal' | 'urgent') => {
    setParkedOrders(parkedOrders.map(o => 
      o.id === id ? { ...o, priority } : o
    ));
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
    setInvoiceDiscountType('fixed');
    setShowRegisterDialog(false);
    setSplitPayments([]);
    setShowSplitPayment(false);
  };

  const addSplitPayment = () => {
    if (currentSplitAmount <= 0) return;
    const remaining = parseFloat(calculateTotal()) - splitPayments.reduce((sum, p) => sum + p.amount, 0);
    const amount = Math.min(currentSplitAmount, remaining);
    
    setSplitPayments([...splitPayments, { method: currentSplitMethod, amount }]);
    setCurrentSplitAmount(0);
  };

  const removeSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const getRemainingAmount = () => {
    const total = parseFloat(calculateTotal());
    const paid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, total - paid);
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
      const paymentInfo = showSplitPayment && splitPayments.length > 0
        ? splitPayments.map(p => `${PAYMENT_METHODS.find(m => m.id === p.method)?.name}: ${p.amount.toFixed(2)}`).join(' + ')
        : PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod;
      
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
        invoiceDiscount: calculateInvoiceDiscount() > 0 ? calculateInvoiceDiscount().toFixed(2) : undefined,
        total: order.totalAmount,
        paymentMethod: paymentInfo,
        employeeName: employee?.fullName || "",
        tableNumber: tableNumber || undefined,
        date: new Date().toLocaleString('ar-SA'),
        offline: order.offline
      });
      
      setShowReceipt(true);
      
      if (paymentMethod === "cash" || splitPayments.some(p => p.method === "cash")) {
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

    if (showSplitPayment && getRemainingAmount() > 0.01) {
      toast({ title: "خطأ", description: "يرجى إكمال الدفع المقسم", variant: "destructive" });
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
      paymentMethod: showSplitPayment ? "split" : paymentMethod,
      splitPayments: showSplitPayment ? splitPayments : undefined,
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
      invoiceDiscount: calculateInvoiceDiscount() > 0 ? calculateInvoiceDiscount() : undefined,
      status: "in_progress"
    };

    createOrderMutation.mutate(orderData);
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    );
  }

  const visibleCategories = CATEGORIES.slice(categoryPage * categoriesPerPage, (categoryPage + 1) * categoriesPerPage);
  const totalPages = Math.ceil(CATEGORIES.length / categoriesPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" dir="rtl">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    نظام نقاط البيع
                  </h1>
                  <p className="text-sm text-slate-400">{employee.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {isOffline && (
                  <Badge variant="destructive" className="flex items-center gap-2 px-3 py-1.5 animate-pulse">
                    <WifiOff className="w-4 h-4" />
                    وضع عدم الاتصال
                    {offlineOrders.length > 0 && (
                      <span className="bg-red-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        {offlineOrders.length}
                      </span>
                    )}
                  </Badge>
                )}
                
                {offlineOrders.length > 0 && !isOffline && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={syncOfflineOrders}
                    disabled={syncingOffline}
                    className="border-amber-500/30 text-amber-500"
                  >
                    {syncingOffline ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span className="mr-2">مزامنة ({offlineOrders.length})</span>
                  </Button>
                )}
                
                <Badge 
                  variant={posConnected ? "default" : "secondary"} 
                  className={`flex items-center gap-2 px-3 py-1.5 ${posConnected ? "bg-emerald-600/90" : "bg-slate-600/90"}`}
                >
                  <MonitorSmartphone className="w-4 h-4" />
                  {posConnected ? "POS متصل" : "POS غير متصل"}
                </Badge>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowParkedOrders(true)} 
                  className={`border-blue-500/30 text-blue-400 hover:bg-blue-500/10 ${parkedOrders.length > 0 ? 'animate-pulse' : ''}`}
                  data-testid="button-parked-orders"
                >
                  <PauseCircle className="w-4 h-4 ml-2" />
                  معلق
                  {parkedOrders.length > 0 && (
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold mr-2">
                      {parkedOrders.length}
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openCashDrawer} 
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  data-testid="button-open-drawer"
                >
                  <Receipt className="w-4 h-4 ml-2" />
                  فتح الخزانة
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setLocation("/employee/dashboard")} 
                  data-testid="button-back"
                  className="hover:bg-slate-700"
                >
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="بحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 h-12 bg-slate-800/50 border-slate-600/50 text-white text-lg placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-amber-500/50"
                    data-testid="input-search"
                  />
                </div>
                
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="h-12 w-12"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3 mb-6">
                {categoryPage > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCategoryPage(p => p - 1)}
                    className="shrink-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
                
                <div className="flex gap-2 flex-1 overflow-hidden">
                  {visibleCategories.map(cat => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex-1 h-14 rounded-xl transition-all ${
                        selectedCategory === cat.id 
                          ? `${cat.color} shadow-lg` 
                          : "border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                      }`}
                      data-testid={`button-category-${cat.id}`}
                    >
                      <cat.icon className="w-5 h-5 ml-2" />
                      <span className="font-medium">{cat.name}</span>
                    </Button>
                  ))}
                </div>
                
                {categoryPage < totalPages - 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCategoryPage(p => p + 1)}
                    className="shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 -mx-2 px-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
                      <p className="text-slate-400">جاري تحميل المنتجات...</p>
                    </div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Coffee className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">لا توجد منتجات مطابقة</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {filteredItems.map((item) => {
                      const inCart = orderItems.find(oi => oi.coffeeItem.id === item.id);
                      return (
                        <Card
                          key={item.id}
                          className={`relative bg-slate-800/60 border-slate-700/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10 rounded-xl overflow-hidden group ${
                            inCart ? 'ring-2 ring-amber-500' : ''
                          }`}
                          onClick={() => addToOrder(item)}
                          data-testid={`card-item-${item.id}`}
                        >
                          {inCart && (
                            <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                              {inCart.quantity}
                            </div>
                          )}
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gradient-to-br from-amber-900/40 to-amber-800/20 rounded-xl mb-3 flex items-center justify-center group-hover:from-amber-900/60 group-hover:to-amber-800/40 transition-all">
                              <Coffee className="w-12 h-12 text-amber-500/60 group-hover:text-amber-500/80 transition-all" />
                            </div>
                            <h3 className="text-sm font-semibold text-amber-400 truncate mb-1">{item.nameAr}</h3>
                            {item.nameEn && (
                              <p className="text-xs text-slate-500 truncate mb-2">{item.nameEn}</p>
                            )}
                            <p className="text-xl font-bold text-white">{Number(item.price).toFixed(2)} <span className="text-sm text-slate-400">ر.س</span></p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="w-[420px] bg-slate-800/90 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
              <div className="p-5 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    الفاتورة
                  </h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowParkDialog(true)} 
                      disabled={orderItems.length === 0}
                      className="hover:bg-blue-500/20 text-blue-400"
                      data-testid="button-park-order"
                    >
                      <PauseCircle className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={resetForm}
                      className="hover:bg-red-500/20 text-red-400"
                      data-testid="button-clear-order"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        placeholder="5xxxxxxxx"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        className="pr-10 bg-slate-900/50 border-slate-600/50 text-white rounded-lg"
                        data-testid="input-phone"
                      />
                    </div>
                    {isCheckingCustomer && <Loader2 className="w-5 h-5 animate-spin text-amber-500 self-center" />}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        placeholder="اسم العميل"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="pr-10 bg-slate-900/50 border-slate-600/50 text-white rounded-lg"
                        data-testid="input-customer-name"
                      />
                    </div>
                    <Input
                      placeholder="رقم الطاولة"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="bg-slate-900/50 border-slate-600/50 text-white rounded-lg"
                      data-testid="input-table"
                    />
                  </div>
                  
                  {loyaltyCard && (
                    <div className="flex items-center gap-2 bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                      <Coffee className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-400">
                        {loyaltyCard.stamps || 0} أختام | {customerPoints} نقطة
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-5">
                {orderItems.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">اضغط على المنتجات لإضافتها</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div 
                        key={item.coffeeItem.id} 
                        className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30"
                        data-testid={`order-item-${item.coffeeItem.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-amber-400">{item.coffeeItem.nameAr}</h4>
                            <p className="text-sm text-slate-500">{Number(item.coffeeItem.price).toFixed(2)} ر.س × {item.quantity}</p>
                            {item.itemDiscount && item.itemDiscount > 0 && (
                              <Badge className="mt-1 bg-green-600/20 text-green-400 border-green-600/30">
                                خصم: {item.itemDiscount.toFixed(2)} ر.س
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => updateQuantity(item.coffeeItem.id, item.quantity - 1)} 
                              className="h-8 w-8 hover:bg-red-500/20 text-red-400"
                              data-testid={`button-decrease-${item.coffeeItem.id}`}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => updateQuantity(item.coffeeItem.id, item.quantity + 1)} 
                              className="h-8 w-8 hover:bg-green-500/20 text-green-400"
                              data-testid={`button-increase-${item.coffeeItem.id}`}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-white">
                            {((Number(item.coffeeItem.price) * item.quantity) - (item.itemDiscount || 0)).toFixed(2)} ر.س
                          </span>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => { setItemDiscountId(item.coffeeItem.id); setShowDiscountDialog(true); }} 
                              className="h-8 w-8 hover:bg-green-500/20"
                              data-testid={`button-item-discount-${item.coffeeItem.id}`}
                            >
                              <Tag className="w-4 h-4 text-green-400" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setOrderItems(orderItems.filter(i => i.coffeeItem.id !== item.coffeeItem.id))} 
                              className="h-8 w-8 hover:bg-red-500/20"
                              data-testid={`button-remove-${item.coffeeItem.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="p-5 border-t border-slate-700/50 space-y-4 bg-slate-800/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="كود الخصم"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="bg-slate-900/50 border-slate-600/50 text-white rounded-lg"
                    data-testid="input-discount-code"
                  />
                  <Button 
                    onClick={validateDiscountCode} 
                    disabled={isValidatingDiscount || !discountCode.trim()} 
                    className="bg-amber-600 hover:bg-amber-700 px-4"
                    data-testid="button-apply-discount"
                  >
                    {isValidatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                </div>

                {appliedDiscount && (
                  <div className="flex items-center justify-between bg-green-600/10 rounded-lg px-4 py-2 border border-green-600/20">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">{appliedDiscount.reason} ({appliedDiscount.percentage}%)</span>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => { setAppliedDiscount(null); setDiscountCode(""); }} 
                      className="h-6 w-6 hover:bg-red-500/20"
                    >
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
                    className="bg-slate-900/50 border-slate-600/50 text-white rounded-lg"
                    data-testid="input-invoice-discount"
                  />
                  <Button 
                    variant={invoiceDiscountType === 'fixed' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setInvoiceDiscountType('fixed')}
                    className={invoiceDiscountType === 'fixed' ? 'bg-amber-600' : 'border-slate-600'}
                  >
                    <span className="text-xs font-bold">ر.س</span>
                  </Button>
                  <Button 
                    variant={invoiceDiscountType === 'percentage' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setInvoiceDiscountType('percentage')}
                    className={invoiceDiscountType === 'percentage' ? 'bg-amber-600' : 'border-slate-600'}
                  >
                    <Percent className="w-4 h-4" />
                  </Button>
                </div>

                <Separator className="bg-slate-700/50" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>المجموع الفرعي:</span>
                    <span className="text-white font-medium">{calculateSubtotal().toFixed(2)} ر.س</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-400">
                      <span>خصم الكود ({appliedDiscount.percentage}%):</span>
                      <span>-{calculateCodeDiscount().toFixed(2)} ر.س</span>
                    </div>
                  )}
                  {calculateInvoiceDiscount() > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>خصم الفاتورة{invoiceDiscountType === 'percentage' ? ` (${invoiceDiscount}%)` : ''}:</span>
                      <span>-{calculateInvoiceDiscount().toFixed(2)} ر.س</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold text-amber-400 pt-2 border-t border-slate-700/50">
                    <span>الإجمالي:</span>
                    <span>{calculateTotal()} ر.س</span>
                  </div>
                </div>

                <Separator className="bg-slate-700/50" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">طريقة الدفع</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowSplitPayment(!showSplitPayment)}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      <SplitSquareVertical className="w-4 h-4 ml-1" />
                      {showSplitPayment ? 'إلغاء التقسيم' : 'تقسيم الدفع'}
                    </Button>
                  </div>
                  
                  {!showSplitPayment ? (
                    <div className="grid grid-cols-4 gap-2">
                      {PAYMENT_METHODS.map((method) => (
                        <Button
                          key={method.id}
                          variant={paymentMethod === method.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex flex-col h-16 gap-1 ${
                            paymentMethod === method.id 
                              ? method.bgColor 
                              : "border-slate-600/50 text-slate-400 hover:bg-slate-700/50"
                          }`}
                          data-testid={`button-payment-${method.id}`}
                        >
                          <method.icon className="w-5 h-5" />
                          <span className="text-[10px]">{method.name}</span>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {splitPayments.map((payment, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            {PAYMENT_METHODS.find(m => m.id === payment.method)?.icon && (
                              <div className={`w-8 h-8 rounded-lg ${PAYMENT_METHODS.find(m => m.id === payment.method)?.bgColor} flex items-center justify-center`}>
                                {(() => {
                                  const IconComponent = PAYMENT_METHODS.find(m => m.id === payment.method)?.icon;
                                  return IconComponent ? <IconComponent className="w-4 h-4 text-white" /> : null;
                                })()}
                              </div>
                            )}
                            <span className="text-sm">{PAYMENT_METHODS.find(m => m.id === payment.method)?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{payment.amount.toFixed(2)} ر.س</span>
                            <Button size="icon" variant="ghost" onClick={() => removeSplitPayment(index)} className="h-6 w-6">
                              <X className="w-3 h-3 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {getRemainingAmount() > 0 && (
                        <div className="flex gap-2">
                          <select 
                            value={currentSplitMethod}
                            onChange={(e) => setCurrentSplitMethod(e.target.value as PaymentMethod)}
                            className="bg-slate-900/50 border border-slate-600/50 text-white rounded-lg px-3 py-2"
                          >
                            {PAYMENT_METHODS.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            placeholder={`المتبقي: ${getRemainingAmount().toFixed(2)}`}
                            value={currentSplitAmount || ""}
                            onChange={(e) => setCurrentSplitAmount(parseFloat(e.target.value) || 0)}
                            className="bg-slate-900/50 border-slate-600/50 text-white"
                          />
                          <Button onClick={addSplitPayment} className="bg-amber-600">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="text-center py-2 bg-slate-900/30 rounded-lg">
                        <span className="text-sm text-slate-400">المتبقي: </span>
                        <span className={`font-bold ${getRemainingAmount() > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {getRemainingAmount().toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full h-16 text-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/40"
                  onClick={handleSubmitOrder}
                  disabled={orderItems.length === 0 || createOrderMutation.isPending || (showSplitPayment && getRemainingAmount() > 0.01)}
                  data-testid="button-submit-order"
                >
                  {createOrderMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin ml-2" />
                  ) : (
                    <CheckCircle className="w-6 h-6 ml-2" />
                  )}
                  تأكيد الطلب - {calculateTotal()} ر.س
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showParkedOrders} onOpenChange={setShowParkedOrders}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-amber-400 flex items-center gap-2 text-xl">
              <Archive className="w-6 h-6" />
              الطلبات المعلقة ({parkedOrders.length})
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              يمكنك استئناف أي طلب معلق أو حذفه
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {parkedOrders.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">لا توجد طلبات معلقة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parkedOrders.sort((a, b) => {
                  if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                  if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }).map((order) => (
                  <Card 
                    key={order.id} 
                    className={`bg-slate-900/50 border-slate-700/50 ${order.priority === 'urgent' ? 'border-red-500/50 bg-red-900/10' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-amber-400">{order.name}</h4>
                            {order.priority === 'urgent' && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 ml-1" />
                                عاجل
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{order.items.length} عنصر</span>
                            <span>{order.items.reduce((sum, i) => sum + i.quantity, 0)} قطعة</span>
                            {order.tableNumber && <span>طاولة {order.tableNumber}</span>}
                          </div>
                          {order.note && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                              <MessageSquare className="w-3 h-3" />
                              {order.note}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <Badge variant="secondary" className="text-xs bg-slate-700">
                            {new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                          <p className="text-lg font-bold text-white mt-1">
                            {order.items.reduce((sum, i) => sum + (Number(i.coffeeItem.price) * i.quantity - (i.itemDiscount || 0)), 0).toFixed(2)} ر.س
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => resumeParkedOrder(order)} 
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                          data-testid={`button-resume-${order.id}`}
                        >
                          <PlayCircle className="w-4 h-4 ml-1" />
                          استئناف
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateParkedOrderPriority(order.id, order.priority === 'urgent' ? 'normal' : 'urgent')}
                          className="border-slate-600"
                        >
                          <AlertTriangle className={`w-4 h-4 ${order.priority === 'urgent' ? 'text-red-400' : 'text-slate-400'}`} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteParkedOrder(order.id)}
                          data-testid={`button-delete-parked-${order.id}`}
                        >
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
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-400">تعليق الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">ملاحظة (اختياري)</Label>
              <Input
                value={parkOrderNote}
                onChange={(e) => setParkOrderNote(e.target.value)}
                placeholder="أضف ملاحظة للطلب المعلق..."
                className="bg-slate-900/50 border-slate-600/50 text-white mt-2"
                data-testid="input-park-note"
              />
            </div>
            <div className="bg-slate-900/30 rounded-lg p-3">
              <p className="text-sm text-slate-400">سيتم حفظ:</p>
              <ul className="text-sm text-slate-300 mt-2 space-y-1">
                <li>{orderItems.length} منتج</li>
                <li>المجموع: {calculateTotal()} ر.س</li>
                {customerName && <li>العميل: {customerName}</li>}
                {tableNumber && <li>طاولة: {tableNumber}</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParkDialog(false)} className="border-slate-600">
              إلغاء
            </Button>
            <Button onClick={parkOrder} className="bg-blue-600 hover:bg-blue-700" data-testid="button-confirm-park">
              <PauseCircle className="w-4 h-4 ml-1" />
              تعليق الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-400">خصم على المنتج</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">نوع الخصم</Label>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant={itemDiscountType === 'fixed' ? 'default' : 'outline'}
                  onClick={() => setItemDiscountType('fixed')}
                  className={itemDiscountType === 'fixed' ? 'bg-amber-600 flex-1' : 'border-slate-600 flex-1'}
                >
                  مبلغ ثابت (ر.س)
                </Button>
                <Button 
                  variant={itemDiscountType === 'percentage' ? 'default' : 'outline'}
                  onClick={() => setItemDiscountType('percentage')}
                  className={itemDiscountType === 'percentage' ? 'bg-amber-600 flex-1' : 'border-slate-600 flex-1'}
                >
                  نسبة مئوية (%)
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">
                قيمة الخصم {itemDiscountType === 'percentage' ? '(%)' : '(ر.س)'}
              </Label>
              <Input
                type="number"
                value={itemDiscountAmount}
                onChange={(e) => setItemDiscountAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="bg-slate-900/50 border-slate-600/50 text-white mt-2 text-xl text-center"
                data-testid="input-item-discount-amount"
              />
            </div>
            {itemDiscountType === 'percentage' && (
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20, 25, 30, 50, 100].map(p => (
                  <Button 
                    key={p} 
                    variant="outline" 
                    size="sm"
                    onClick={() => setItemDiscountAmount(p)}
                    className="border-slate-600"
                  >
                    {p}%
                  </Button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDiscountDialog(false); setItemDiscountId(null); }} className="border-slate-600">
              إلغاء
            </Button>
            <Button 
              onClick={() => { if (itemDiscountId) applyItemDiscount(itemDiscountId, itemDiscountAmount, itemDiscountType); }} 
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-item-discount"
            >
              <Check className="w-4 h-4 ml-1" />
              تطبيق الخصم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReceipt && !!lastOrder} onOpenChange={setShowReceipt}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-400 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              تم إنشاء الطلب بنجاح
            </DialogTitle>
          </DialogHeader>
          {lastOrder && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm mb-1">رقم الطلب</p>
                <p className="text-3xl font-bold text-amber-400">{lastOrder.orderNumber}</p>
                <p className="text-2xl font-bold text-white mt-3">{lastOrder.total} ر.س</p>
                {lastOrder.offline && (
                  <Badge variant="secondary" className="mt-2">
                    <WifiOff className="w-3 h-3 ml-1" />
                    محفوظ محلياً
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={printReceipt} className="h-14 bg-amber-600 hover:bg-amber-700" data-testid="button-print-receipt">
                  <Printer className="w-5 h-5 ml-2" />
                  طباعة الإيصال
                </Button>
                <Button onClick={printTaxInvoice} variant="outline" className="h-14 border-slate-600 text-amber-400" data-testid="button-print-tax">
                  <FileText className="w-5 h-5 ml-2" />
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
