import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { db } from "@/lib/db/dexie-db";
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
  RefreshCw, Archive, MoreVertical, MessageSquare, ScanLine, Camera, Gift
} from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import DrinkCustomizationDialog, { DrinkCustomization, SelectedAddon } from "@/components/drink-customization-dialog";
import { printTaxInvoice, printSimpleReceipt } from "@/lib/print-utils";
import { LoadingState, EmptyState } from "@/components/ui/states";
import type { Employee, CoffeeItem, PaymentMethod, LoyaltyCard } from "@shared/schema";

interface OrderItem {
  lineItemId: string;
  coffeeItem: CoffeeItem;
  quantity: number;
  itemDiscount?: number;
  discountType?: 'fixed' | 'percentage';
  notes?: string;
  customization?: DrinkCustomization;
}

const generateLineItemId = () => `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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
  { id: "cash", name: "نقدي", nameEn: "Cash", icon: Banknote, color: "text-primary", bgColor: "bg-primary", enabled: true },
  { id: "pos", name: "مدى", nameEn: "Mada", icon: CreditCard, color: "text-primary", bgColor: "bg-primary", enabled: true },
  { id: "apple_pay", name: "Apple Pay", nameEn: "Apple Pay", icon: Smartphone, color: "text-foreground", bgColor: "bg-muted", enabled: true },
  { id: "alinma", name: "Alinma Pay", nameEn: "Alinma", icon: Wallet, color: "text-primary", bgColor: "bg-primary", enabled: true },
  { id: "rajhi", name: "الراجحي", nameEn: "Al Rajhi", icon: Building, color: "text-primary", bgColor: "bg-primary", enabled: true },
  { id: "ur", name: "Ur Pay", nameEn: "Ur Pay", icon: Zap, color: "text-primary", bgColor: "bg-primary", enabled: true },
  { id: "barq", name: "Barq", nameEn: "Barq", icon: Zap, color: "text-primary", bgColor: "bg-primary", enabled: true },
  { id: "qahwa-card", name: "بطاقة قهوة", nameEn: "Qahwa Card", icon: Coffee, color: "text-primary", bgColor: "bg-primary", enabled: true },
];

const CATEGORIES = [
  { id: "all", name: "الكل", nameEn: "All", icon: Grid3X3, color: "bg-muted" },
  { id: "espresso", name: "إسبريسو", nameEn: "Espresso", icon: Coffee, color: "bg-primary" },
  { id: "latte", name: "لاتيه", nameEn: "Latte", icon: Coffee, color: "bg-primary" },
  { id: "cappuccino", name: "كابتشينو", nameEn: "Cappuccino", icon: Coffee, color: "bg-primary" },
  { id: "cold", name: "مشروبات باردة", nameEn: "Cold Drinks", icon: Coffee, color: "bg-accent" },
  { id: "tea", name: "شاي", nameEn: "Tea", icon: Coffee, color: "bg-accent" },
  { id: "matcha", name: "ماتشا", nameEn: "Matcha", icon: Coffee, color: "bg-accent" },
  { id: "specialty", name: "مميز", nameEn: "Specialty", icon: Coffee, color: "bg-accent" },
];

type OrderType = 'dine_in' | 'takeaway' | 'delivery';

interface OrderTypeInfo {
  id: OrderType;
  name: string;
  nameEn: string;
  icon: typeof Coffee;
  color: string;
  bgColor: string;
}

const ORDER_TYPES: OrderTypeInfo[] = [
  { id: "dine_in", name: "محلي", nameEn: "Dine-in", icon: Users, color: "text-primary", bgColor: "bg-primary" },
  { id: "takeaway", name: "سفري", nameEn: "Takeaway", icon: ShoppingBag, color: "text-primary", bgColor: "bg-primary" },
  { id: "delivery", name: "توصيل", nameEn: "Delivery", icon: Zap, color: "text-primary", bgColor: "bg-primary" },
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Background sync logic
  useEffect(() => {
    if (isOnline) {
      const syncQueue = async () => {
        const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();
        for (const item of pendingItems) {
          try {
            await db.syncQueue.update(item.id!, { status: 'processing' });
            if (item.type === 'CREATE_ORDER') {
              await apiRequest("POST", "/api/orders", item.payload);
            }
            await db.syncQueue.update(item.id!, { status: 'synced' });
          } catch (err) {
            await db.syncQueue.update(item.id!, { 
              status: 'pending', 
              retryCount: (item.retryCount || 0) + 1 
            });
          }
        }
      };
      const interval = setInterval(syncQueue, 30000);
      syncQueue();
      return () => clearInterval(interval);
    }
  }, [isOnline]);
  
  // Local caching logic for offline products
  useEffect(() => {
    const syncWithLocal = async () => {
      if (coffeeItems && coffeeItems.length > 0) {
        try {
          const localProducts = coffeeItems.map((p: any) => ({
            id: p.id,
            nameAr: p.nameAr,
            price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
            category: p.category,
            imageUrl: p.imageUrl,
            isAvailable: p.isAvailable,
            tenantId: p.tenantId || 'demo-tenant',
            updatedAt: Date.now()
          }));
          await db.products.bulkPut(localProducts);
        } catch (err) {
          console.error("Failed to sync products to IndexedDB:", err);
        }
      }
    };
    syncWithLocal();
  }, [coffeeItems]);
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
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
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(() => {
    const saved = localStorage.getItem('lastSyncTime');
    return saved ? parseInt(saved) : Date.now();
  });

  // Background Sync Logic (Outbox Pattern)
  useEffect(() => {
    let isMounted = true;
    const syncInterval = setInterval(async () => {
      if (isOnline && !syncing) {
        const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();
        if (pendingItems.length > 0) {
          if (isMounted) setSyncing(true);
          
          for (const item of pendingItems) {
            try {
              if (item.type === 'CREATE_ORDER') {
                const response = await fetch("/api/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(item.payload),
                });
                
                if (response.ok) {
                  await db.syncQueue.update(item.id!, { status: 'synced' });
                  // Also update invoice status
                  const offlineId = (item.payload as any).offlineId;
                  if (offlineId) {
                    await db.invoices.where('tempId').equals(offlineId).modify({ status: 'synced' });
                  }
                } else {
                  await db.syncQueue.update(item.id!, { retryCount: (item.retryCount || 0) + 1 });
                }
              }
            } catch (error) {
              console.error("Sync error for item", item.id, error);
            }
          }
          
          if (isMounted) {
            setSyncing(false);
            setLastSyncTime(Date.now());
            localStorage.setItem('lastSyncTime', Date.now().toString());
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
          }
        }
      }
    }, 15000); // Check every 15 seconds

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, [isOnline, syncing, queryClient]);
  const [syncingOffline, setSyncingOffline] = useState(false);
  
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCustomizationDialog, setShowCustomizationDialog] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<CoffeeItem | null>(null);
  const [editingLineItemId, setEditingLineItemId] = useState<string | null>(null);
  const [usedFreeDrinks, setUsedFreeDrinks] = useState(0);
  
  const [categoryPage, setCategoryPage] = useState(0);
  const categoriesPerPage = 6;
  

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

  const { data: productsData, isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/coffee-items");
      const data = await res.json();
      if (data && Array.isArray(data)) {
        await db.products.clear();
        await db.products.bulkAdd(data.map((item: any) => ({
          ...item,
          price: Number(item.price)
        })));
      }
      return data;
    }
  });

  const { data: offlineProducts } = useQuery<CoffeeItem[]>({
    queryKey: ["offline-products"],
    queryFn: () => db.products.toArray(),
    enabled: isOffline
  });

  const coffeeItems = useMemo(() => {
    return isOffline ? (offlineProducts || []) : (productsData || []);
  }, [productsData, offlineProducts, isOffline]);

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

  // Clamp usedFreeDrinks when order items or loyalty card changes
  useEffect(() => {
    const hasQahwaCard = paymentMethod === 'qahwa-card' || (showSplitPayment && splitPayments.some(p => p.method === 'qahwa-card'));
    
    if (hasQahwaCard && loyaltyCard) {
      const availableFreeDrinks = Math.max(0, (loyaltyCard.freeCupsEarned || 0) - (loyaltyCard.freeCupsRedeemed || 0));
      const totalDrinks = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const maxUsable = Math.min(availableFreeDrinks, totalDrinks);
      if (usedFreeDrinks > maxUsable) {
        setUsedFreeDrinks(maxUsable);
      }
    } else if (!hasQahwaCard && usedFreeDrinks > 0) {
      // Reset usedFreeDrinks when qahwa-card is no longer selected
      setUsedFreeDrinks(0);
    }
  }, [orderItems, loyaltyCard, paymentMethod, showSplitPayment, splitPayments, usedFreeDrinks]);

  const handleCustomerFoundFromScanner = useCallback((result: any) => {
    if (result.found) {
      if (result.card) {
        setCustomerPhone(result.card.phoneNumber || "");
        setCustomerName(result.card.customerName || result.customer?.name || "");
        setLoyaltyCard(result.card);
        setCustomerPoints(result.customer?.points || result.card.points || 0);
        if (result.customer?.id) {
          setCustomerId(result.customer.id);
        }
        if (result.customer?.email) {
          setCustomerEmail(result.customer.email);
        }
        
        const availableFreeDrinks = Math.max(0, (result.card.freeCupsEarned || 0) - (result.card.freeCupsRedeemed || 0));
        
        toast({
          title: "تم العثور على العميل",
          description: `مرحباً ${result.card.customerName}! ${availableFreeDrinks > 0 ? `لديك ${availableFreeDrinks} مشروب مجاني` : `${result.card.stamps % 6}/6 أختام`}`,
          className: "bg-green-600 text-white",
        });
      }
      setShowBarcodeScanner(false);
    }
  }, [toast]);

  const CATEGORIES = useMemo(() => {
    const cats = Array.from(new Set(coffeeItems.map((item: any) => item.categoryAr || item.category || "أخرى")));
    return ["all", ...cats];
  }, [coffeeItems]);

  const filteredItems = useMemo(() => {
    return coffeeItems.filter(item => {
      const matchesSearch = item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || 
                              (item.categoryAr === selectedCategory) ||
                              (item.category === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [coffeeItems, searchQuery, selectedCategory]);

  const addToOrder = (coffeeItem: CoffeeItem) => {
    setCustomizingItem(coffeeItem);
    setEditingLineItemId(null);
    setShowCustomizationDialog(true);
  };

  const openEditCustomization = (orderItem: OrderItem) => {
    setCustomizingItem(orderItem.coffeeItem);
    setEditingLineItemId(orderItem.lineItemId);
    setShowCustomizationDialog(true);
  };

  const handleCustomizationConfirm = (customization: DrinkCustomization, quantity: number) => {
    if (!customizingItem) return;
    
    if (editingLineItemId) {
      setOrderItems(orderItems.map(item => 
        item.lineItemId === editingLineItemId 
          ? { ...item, customization, quantity }
          : item
      ));
    } else {
      const existingItemIndex = orderItems.findIndex(item => {
        if (item.coffeeItem.id !== customizingItem.id) return false;
        const existingAddons = item.customization?.selectedAddons || [];
        const newAddons = customization.selectedAddons || [];
        if (existingAddons.length !== newAddons.length) return false;
        return existingAddons.every(ea => 
          newAddons.some(na => na.addonId === ea.addonId && na.quantity === ea.quantity)
        );
      });

      if (existingItemIndex >= 0) {
        setOrderItems(orderItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setOrderItems([...orderItems, { 
          lineItemId: generateLineItemId(),
          coffeeItem: customizingItem, 
          quantity, 
          customization 
        }]);
      }
    }
    
    setShowCustomizationDialog(false);
    setCustomizingItem(null);
    setEditingLineItemId(null);
  };

  const updateQuantity = (lineItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(item => item.lineItemId !== lineItemId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.lineItemId === lineItemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const applyItemDiscount = (lineItemId: string, discount: number, type: 'fixed' | 'percentage') => {
    setOrderItems(orderItems.map(item => {
      if (item.lineItemId === lineItemId) {
        const basePrice = Number(item.coffeeItem.price);
        const addonsPrice = item.customization?.totalAddonsPrice || 0;
        const itemTotal = (basePrice + addonsPrice) * item.quantity;
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
      const basePrice = Number(item.coffeeItem.price);
      const addonsPrice = item.customization?.totalAddonsPrice || 0;
      const itemTotal = (basePrice + addonsPrice) * item.quantity;
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

  const handlePrintReceipt = async () => {
    if (!lastOrder) {
      toast({
        title: "خطأ",
        description: "لا يوجد طلب للطباعة",
        variant: "destructive",
      });
      return;
    }
    
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
    } catch (error) {
      console.error("Error sending to printer:", error);
    }
    
    try {
      await printSimpleReceipt({
        orderNumber: lastOrder.orderNumber,
        customerName: lastOrder.customerName,
        customerPhone: lastOrder.customerPhone,
        items: lastOrder.items,
        subtotal: lastOrder.subtotal,
        discount: lastOrder.discount,
        invoiceDiscount: lastOrder.invoiceDiscount,
        total: lastOrder.total,
        paymentMethod: lastOrder.paymentMethod,
        employeeName: lastOrder.employeeName,
        tableNumber: lastOrder.tableNumber,
        orderType: lastOrder.orderType,
        orderTypeName: lastOrder.orderTypeName,
        date: lastOrder.date,
      });
      toast({ title: "تم فتح نافذة الطباعة", className: "bg-green-600 text-white" });
    } catch (error) {
      console.error("Error printing receipt:", error);
      toast({ title: "خطأ في الطباعة", variant: "destructive" });
    }
  };

  const handlePrintTaxInvoice = async () => {
    if (!lastOrder) {
      toast({
        title: "خطأ",
        description: "لا يوجد طلب للطباعة",
        variant: "destructive",
      });
      return;
    }
    
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
    
    try {
      await printTaxInvoice({
        orderNumber: lastOrder.orderNumber,
        customerName: lastOrder.customerName,
        customerPhone: lastOrder.customerPhone,
        items: lastOrder.items,
        subtotal: lastOrder.subtotal,
        discount: lastOrder.discount,
        invoiceDiscount: lastOrder.invoiceDiscount,
        total: lastOrder.total,
        paymentMethod: lastOrder.paymentMethod,
        employeeName: lastOrder.employeeName,
        tableNumber: lastOrder.tableNumber,
        orderType: lastOrder.orderType,
        orderTypeName: lastOrder.orderTypeName,
        date: lastOrder.date,
      });
      toast({ title: "تم فتح نافذة الفاتورة الضريبية", className: "bg-green-600 text-white" });
    } catch (error) {
      console.error("Error printing tax invoice:", error);
      toast({ title: "خطأ في الطباعة", variant: "destructive" });
    }
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
    setOrderType("dine_in");
    setDiscountCode("");
    setAppliedDiscount(null);
    setInvoiceDiscount(0);
    setInvoiceDiscountType('fixed');
    setShowRegisterDialog(false);
    setSplitPayments([]);
    setShowSplitPayment(false);
    setUsedFreeDrinks(0);
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
      if (!isOnline) {
        const offlineId = `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const offlineOrder = { 
          ...orderData, 
          offlineId, 
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        
        // Save to IndexedDB
        await db.invoices.add({
          tempId: offlineId,
          items: orderData.items,
          totalAmount: Number(orderData.totalAmount),
          paymentMethod: orderData.paymentMethod,
          createdAt: Date.now(),
          status: 'pending',
          tenantId: employee?.tenantId || 'demo-tenant',
          branchId: employee?.branchId || ''
        });

        // Add to sync queue
        await db.syncQueue.add({
          type: 'CREATE_ORDER',
          payload: orderData,
          status: 'pending',
          retryCount: 0,
          createdAt: Date.now()
        });

        return { orderNumber: offlineId, totalAmount: orderData.totalAmount, offline: true };
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
      
      const orderTypeInfo = ORDER_TYPES.find(t => t.id === orderType);
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
        orderType: orderType,
        orderTypeName: orderTypeInfo?.name || orderType,
        date: new Date().toISOString(),
        offline: order.offline
      });
      
      setShowReceipt(true);
      
      if (paymentMethod === "cash" || splitPayments.some(p => p.method === "cash")) {
        openCashDrawer();
      }
      
      toast({
        title: order.offline ? "تم حفظ الطلب محلياً" : "تم إنشاء الطلب بنجاح",
        description: order.offline ? "سيتم المزامنة عند عودة الإنترنت" : `رقم الطلب: ${order.orderNumber}`,
        className: "bg-green-600 text-white",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      resetForm();
    },
    onError: (error: any) => {
      console.error("Order creation error:", error);
      const errorMessage = error?.message || error?.response?.data?.error || "فشل إنشاء الطلب. يرجى المحاولة مرة أخرى";
      toast({
        title: "خطأ في إنشاء الطلب",
        description: errorMessage,
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
        price: Number(item.coffeeItem.price) + (item.customization?.totalAddonsPrice || 0),
        itemDiscount: item.itemDiscount || 0,
        customization: item.customization ? {
          selectedAddons: item.customization.selectedAddons,
          totalAddonsPrice: item.customization.totalAddonsPrice,
          notes: item.customization.notes
        } : undefined
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
      orderType: orderType,
      tableNumber: tableNumber || undefined,
      discountCode: appliedDiscount?.code,
      invoiceDiscount: calculateInvoiceDiscount() > 0 ? calculateInvoiceDiscount() : undefined,
      usedFreeDrinks: (paymentMethod === 'qahwa-card' || (showSplitPayment && splitPayments.some(p => p.method === 'qahwa-card'))) ? usedFreeDrinks : 0,
      status: "in_progress"
    };

    createOrderMutation.mutate(orderData);
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <LoadingState message="جاري التحميل..." />
      </div>
    );
  }

  const visibleCategories = CATEGORIES.slice(categoryPage * categoriesPerPage, (categoryPage + 1) * categoriesPerPage);
  const totalPages = Math.ceil(CATEGORIES.length / categoriesPerPage);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" dir="rtl">
      <div className="flex flex-col lg:flex-row h-screen gap-0">
        {/* Header - Responsive */}
        <div className="flex-1 flex flex-col min-h-0 lg:min-h-screen">
          <header className="bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg">
                  <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                    نظام نقاط البيع
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{employee.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 rounded-full border border-border">
                  {isOnline ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-medium">متصل</span>
                      {syncing && <Loader2 className="w-3 h-3 animate-spin text-primary ml-1" />}
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-destructive" />
                      <span className="text-xs font-medium">وضع الأوفلاين</span>
                    </>
                  )}
                </div>
                
                {offlineOrders.length > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 animate-pulse text-xs sm:text-sm">
                    <Archive className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">فواتير معلقة</span>
                    <span className="bg-red-700 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold">
                      {offlineOrders.length}
                    </span>
                  </Badge>
                )}
                
                {offlineOrders.length > 0 && !isOffline && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={syncOfflineOrders}
                    disabled={syncingOffline}
                    className="text-xs sm:text-sm"
                  >
                    {syncingOffline ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="hidden sm:inline ml-1 sm:mr-2">مزامنة ({offlineOrders.length})</span>
                  </Button>
                )}
                
                <Badge 
                  variant={posConnected ? "default" : "secondary"} 
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm"
                >
                  <MonitorSmartphone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{posConnected ? "متصل" : "غير متصل"}</span>
                </Badge>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowParkedOrders(true)} 
                  className={`text-xs sm:text-sm ${parkedOrders.length > 0 ? 'animate-pulse' : ''}`}
                  data-testid="button-parked-orders"
                >
                  <PauseCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
                  <span className="hidden sm:inline">معلق</span>
                  {parkedOrders.length > 0 && (
                    <Badge variant="secondary" className="text-xs mr-1 sm:mr-2 ml-0.5">
                      {parkedOrders.length}
                    </Badge>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openCashDrawer} 
                  className="text-xs sm:text-sm"
                  data-testid="button-open-drawer"
                >
                  <Receipt className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
                  <span className="hidden sm:inline">فتح</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setLocation("/employee/dashboard")} 
                  className="h-9 w-9 sm:h-10 sm:w-10"
                  data-testid="button-back"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-0">
            {/* Products Section */}
            <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-hidden min-w-0">
              <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <Input
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-lg rounded-xl"
                    data-testid="input-search"
                  />
                </div>
                
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2">
                {categoryPage > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCategoryPage(p => p - 1)}
                    className="shrink-0 h-10 w-10 sm:h-14 sm:w-auto"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                )}
                
                <div className="flex gap-1 sm:gap-2 flex-1 min-w-0 overflow-x-auto pb-1">
                  {visibleCategories.map(cat => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(cat.id)}
                      size="sm"
                      className={`shrink-0 h-10 sm:h-14 text-xs sm:text-base rounded-xl transition-all ${
                        selectedCategory === cat.id ? `${cat.color} shadow-lg` : ""
                      }`}
                      data-testid={`button-category-${cat.id}`}
                    >
                      <cat.icon className="w-3 h-3 sm:w-5 sm:h-5 ml-0.5 sm:ml-2" />
                      <span className="hidden sm:inline font-medium">{cat.name}</span>
                    </Button>
                  ))}
                </div>
                
                {categoryPage < totalPages - 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCategoryPage(p => p + 1)}
                    className="shrink-0 h-10 w-10 sm:h-14 sm:w-auto"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 -mx-2 sm:-mx-2 px-2 sm:px-2">
                {isLoading ? (
                  <LoadingState message="جاري تحميل المنتجات..." />
                ) : filteredItems.length === 0 ? (
                  <EmptyState 
                    title="لا توجد منتجات مطابقة"
                    description="جرب البحث بكلمات أخرى"
                    icon={<Coffee className="w-10 h-10 text-muted-foreground" />}
                  />
                ) : (
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4">
                    {filteredItems.map((item) => {
                      const inCart = orderItems.find(oi => oi.coffeeItem.id === item.id);
                      return (
                        <Card
                          key={item.id}
                          className={`relative cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl rounded-xl overflow-hidden group hover-elevate ${
                            inCart ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => addToOrder(item)}
                          data-testid={`card-item-${item.id}`}
                        >
                          {inCart && (
                            <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                              {inCart.quantity}
                            </div>
                          )}
                          <CardContent className="p-4">
                            <div className="aspect-square bg-muted rounded-xl mb-3 flex items-center justify-center transition-all overflow-hidden">
                              {item.imageUrl ? (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.nameAr}
                                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Coffee className={`w-12 h-12 text-primary/60 group-hover:text-primary/80 transition-all ${item.imageUrl ? 'hidden' : ''}`} />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground truncate mb-1">{item.nameAr}</h3>
                            {item.nameEn && (
                              <p className="text-xs text-muted-foreground truncate mb-2">{item.nameEn}</p>
                            )}
                            <p className="text-xl font-bold text-foreground">{Number(item.price).toFixed(2)} <span className="text-sm text-muted-foreground">ر.س</span></p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Order Panel - Responsive */}
            <div className="w-full lg:w-[420px] bg-card/90 backdrop-blur-sm border-t lg:border-r lg:border-t-0 border-border flex flex-col max-h-[50vh] lg:max-h-none">
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    الفاتورة
                  </h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowParkDialog(true)} 
                      disabled={orderItems.length === 0}
                      data-testid="button-park-order"
                    >
                      <PauseCircle className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={resetForm}
                      data-testid="button-clear-order"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="5xxxxxxxx"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        className="pr-10 rounded-lg"
                        data-testid="input-phone"
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setShowBarcodeScanner(true)}
                      title="مسح بطاقة الولاء"
                      data-testid="button-scan-loyalty-card"
                    >
                      <ScanLine className="w-4 h-4" />
                    </Button>
                    {isCheckingCustomer && <Loader2 className="w-5 h-5 animate-spin text-primary self-center" />}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="اسم العميل"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="pr-10 rounded-lg"
                        data-testid="input-customer-name"
                      />
                    </div>
                    <Input
                      placeholder="رقم الطاولة"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="rounded-lg"
                      data-testid="input-table"
                    />
                  </div>
                  
                  {loyaltyCard && (
                    <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-2 border border-primary/20">
                      <Coffee className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary">
                        {loyaltyCard.stamps || 0} أختام | {customerPoints} نقطة
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-5">
                {orderItems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">اضغط على المنتجات لإضافتها</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item, itemIndex) => {
                      const basePrice = Number(item.coffeeItem.price);
                      const addonsPrice = item.customization?.totalAddonsPrice || 0;
                      const itemTotalBeforeDiscount = (basePrice + addonsPrice) * item.quantity;
                      const itemTotal = itemTotalBeforeDiscount - (item.itemDiscount || 0);
                      
                      return (
                        <div 
                          key={item.lineItemId} 
                          className="bg-muted/50 rounded-xl p-4 border border-border"
                          data-testid={`order-item-${item.lineItemId}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{item.coffeeItem.nameAr}</h4>
                              <p className="text-sm text-muted-foreground">
                                {basePrice.toFixed(2)} ر.س
                                {addonsPrice > 0 && <span className="text-primary"> +{addonsPrice.toFixed(2)}</span>}
                                {' × '}{item.quantity}
                              </p>
                              {item.customization?.selectedAddons && item.customization.selectedAddons.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.customization.selectedAddons.map(addon => (
                                    <Badge key={addon.addonId} variant="outline" className="text-xs">
                                      {addon.nameAr} {addon.quantity > 1 && `×${addon.quantity}`}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {item.itemDiscount && item.itemDiscount > 0 && (
                                <Badge variant="secondary" className="mt-1">
                                  خصم: {item.itemDiscount.toFixed(2)} ر.س
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => updateQuantity(item.lineItemId, item.quantity - 1)} 
                                data-testid={`button-decrease-${item.lineItemId}`}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => updateQuantity(item.lineItemId, item.quantity + 1)} 
                                data-testid={`button-increase-${item.lineItemId}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-foreground">
                              {itemTotal.toFixed(2)} ر.س
                            </span>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => openEditCustomization(item)} 
                                data-testid={`button-edit-${item.lineItemId}`}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => { setItemDiscountId(item.lineItemId); setShowDiscountDialog(true); }} 
                                data-testid={`button-item-discount-${item.lineItemId}`}
                              >
                                <Tag className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => setOrderItems(orderItems.filter(i => i.lineItemId !== item.lineItemId))} 
                                data-testid={`button-remove-${item.lineItemId}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <Separator className="my-4" />

                    <div className="flex gap-2">
                      <Input
                        placeholder="كود الخصم"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="rounded-lg"
                        data-testid="input-discount-code"
                      />
                      <Button 
                        onClick={validateDiscountCode} 
                        disabled={isValidatingDiscount || !discountCode.trim()} 
                        data-testid="button-apply-discount"
                      >
                        {isValidatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </Button>
                    </div>

                    {appliedDiscount && (
                      <div className="flex items-center justify-between bg-accent/50 rounded-lg px-4 py-2 border border-border">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">{appliedDiscount.reason} ({appliedDiscount.percentage}%)</span>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => { setAppliedDiscount(null); setDiscountCode(""); }} 
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="خصم على الفاتورة"
                        value={invoiceDiscount || ""}
                        onChange={(e) => setInvoiceDiscount(parseFloat(e.target.value) || 0)}
                        className="rounded-lg"
                        data-testid="input-invoice-discount"
                      />
                      <Button 
                        variant={invoiceDiscountType === 'fixed' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setInvoiceDiscountType('fixed')}
                      >
                        <span className="text-xs font-bold">ر.س</span>
                      </Button>
                      <Button 
                        variant={invoiceDiscountType === 'percentage' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setInvoiceDiscountType('percentage')}
                      >
                        <Percent className="w-4 h-4" />
                      </Button>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-3">
                      <div className="flex justify-between text-muted-foreground">
                        <span>المجموع الفرعي:</span>
                        <span className="text-foreground font-medium">{calculateSubtotal().toFixed(2)} ر.س</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-primary">
                          <span>خصم الكود ({appliedDiscount.percentage}%):</span>
                          <span>-{calculateCodeDiscount().toFixed(2)} ر.س</span>
                        </div>
                      )}
                      {calculateInvoiceDiscount() > 0 && (
                        <div className="flex justify-between text-primary">
                          <span>خصم الفاتورة{invoiceDiscountType === 'percentage' ? ` (${invoiceDiscount}%)` : ''}:</span>
                          <span>-{calculateInvoiceDiscount().toFixed(2)} ر.س</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between text-xl font-bold text-primary">
                        <span>الإجمالي:</span>
                        <span>{calculateTotal()} ر.س</span>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6 pt-4 border-t border-border">
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground font-medium">نوع الطلب</span>
                        <div className="grid grid-cols-3 gap-2">
                          {ORDER_TYPES.map((type) => (
                            <Button
                              key={type.id}
                              variant={orderType === type.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setOrderType(type.id)}
                              className={`flex items-center justify-center gap-1.5 h-11 font-bold text-xs ${
                                orderType === type.id ? "shadow-lg" : ""
                              }`}
                              data-testid={`button-order-type-${type.id}`}
                            >
                              <type.icon className="w-4 h-4" />
                              <span className="hidden sm:inline">{type.name}</span>
                              <span className="sm:hidden">{type.nameEn}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground font-medium">طريقة الدفع</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowSplitPayment(!showSplitPayment)}
                            className="h-7 px-2 text-xs"
                          >
                            <SplitSquareVertical className="w-3 h-3 ml-1" />
                            {showSplitPayment ? 'إلغاء' : 'تقسيم'}
                          </Button>
                        </div>
                        
                        {!showSplitPayment ? (
                          <>
                            <div className="grid grid-cols-4 gap-1.5">
                              {PAYMENT_METHODS.map((method) => (
                                <Button
                                  key={method.id}
                                  variant={paymentMethod === method.id ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    setPaymentMethod(method.id);
                                    if (method.id !== 'qahwa-card') setUsedFreeDrinks(0);
                                  }}
                                  className="flex flex-col h-14 gap-0.5 p-1"
                                  data-testid={`button-payment-${method.id}`}
                                >
                                  <method.icon className="w-4 h-4" />
                                  <span className="text-[9px] leading-tight text-center">{method.name}</span>
                                </Button>
                              ))}
                            </div>
                            
                            {paymentMethod === 'qahwa-card' && loyaltyCard && (() => {
                              const availableFreeDrinks = Math.max(0, (loyaltyCard.freeCupsEarned || 0) - (loyaltyCard.freeCupsRedeemed || 0));
                              const totalDrinks = orderItems.reduce((sum, item) => sum + item.quantity, 0);
                              const maxUsable = Math.min(availableFreeDrinks, totalDrinks);
                              
                              if (availableFreeDrinks <= 0) return (
                                <div className="p-2 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                                  لا يوجد مشروبات مجانية متاحة
                                </div>
                              );
                              
                              return (
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                      <Gift className="w-4 h-4 inline ml-1" />
                                      مشروبات مجانية متاحة: {availableFreeDrinks}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-green-600 dark:text-green-400">استخدام:</span>
                                    <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                                      <Button 
                                        size="icon" 
                                        variant="ghost"
                                        onClick={() => setUsedFreeDrinks(Math.max(0, usedFreeDrinks - 1))}
                                        disabled={usedFreeDrinks <= 0}
                                        data-testid="button-decrease-free-drinks"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <span className="w-8 text-center font-bold">{usedFreeDrinks}</span>
                                      <Button 
                                        size="icon" 
                                        variant="ghost"
                                        onClick={() => setUsedFreeDrinks(Math.min(maxUsable, usedFreeDrinks + 1))}
                                        disabled={usedFreeDrinks >= maxUsable}
                                        data-testid="button-increase-free-drinks"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setUsedFreeDrinks(maxUsable)}
                                      className="text-xs"
                                      data-testid="button-use-all-free"
                                    >
                                      استخدام الكل ({maxUsable})
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <div className="space-y-2">
                            {splitPayments.map((payment, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                                <div className="flex items-center gap-2">
                                  {PAYMENT_METHODS.find(m => m.id === payment.method)?.icon && (
                                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                      {(() => {
                                        const IconComponent = PAYMENT_METHODS.find(m => m.id === payment.method)?.icon;
                                        return IconComponent ? <IconComponent className="w-3.5 h-3.5 text-primary-foreground" /> : null;
                                      })()}
                                    </div>
                                  )}
                                  <span className="text-xs">{PAYMENT_METHODS.find(m => m.id === payment.method)?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm">{payment.amount.toFixed(2)} ر.س</span>
                                  <Button size="icon" variant="ghost" onClick={() => removeSplitPayment(index)}>
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            
                            {getRemainingAmount() > 0 && (
                              <div className="flex gap-1.5">
                                <select 
                                  value={currentSplitMethod}
                                  onChange={(e) => setCurrentSplitMethod(e.target.value as PaymentMethod)}
                                  className="bg-background border border-border text-foreground rounded-lg px-2 py-1.5 text-xs flex-1"
                                >
                                  {PAYMENT_METHODS.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                                </select>
                                <Input
                                  type="number"
                                  placeholder={`${getRemainingAmount().toFixed(2)}`}
                                  value={currentSplitAmount || ""}
                                  onChange={(e) => setCurrentSplitAmount(parseFloat(e.target.value) || 0)}
                                  className="h-8 text-xs flex-1"
                                />
                                <Button onClick={addSplitPayment} size="sm">
                                  <Plus className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                            
                            <div className="text-center py-1.5 bg-muted/30 rounded-lg">
                              <span className="text-xs text-muted-foreground">المتبقي: </span>
                              <span className={`font-bold text-sm ${getRemainingAmount() > 0 ? 'text-destructive' : 'text-primary'}`}>
                                {getRemainingAmount().toFixed(2)} ر.س
                              </span>
                            </div>
                            
                            {splitPayments.some(p => p.method === 'qahwa-card') && loyaltyCard && (() => {
                              const availableFreeDrinks = Math.max(0, (loyaltyCard.freeCupsEarned || 0) - (loyaltyCard.freeCupsRedeemed || 0));
                              const totalDrinks = orderItems.reduce((sum, item) => sum + item.quantity, 0);
                              const maxUsable = Math.min(availableFreeDrinks, totalDrinks);
                              
                              if (availableFreeDrinks <= 0) return null;
                              
                              return (
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                      <Gift className="w-3 h-3 inline ml-1" />
                                      مجاني: {availableFreeDrinks}
                                    </span>
                                    <div className="flex items-center gap-1 bg-background rounded p-0.5">
                                      <Button 
                                        size="icon" 
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => setUsedFreeDrinks(Math.max(0, usedFreeDrinks - 1))}
                                        disabled={usedFreeDrinks <= 0}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="w-6 text-center font-bold text-sm">{usedFreeDrinks}</span>
                                      <Button 
                                        size="icon" 
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => setUsedFreeDrinks(Math.min(maxUsable, usedFreeDrinks + 1))}
                                        disabled={usedFreeDrinks >= maxUsable}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full h-14 text-lg rounded-xl shadow-lg transition-all mt-4"
                        size="lg"
                        onClick={handleSubmitOrder}
                        disabled={orderItems.length === 0 || createOrderMutation.isPending || (showSplitPayment && getRemainingAmount() > 0.01)}
                        data-testid="button-submit-order"
                      >
                        {createOrderMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin ml-2" />
                        ) : (
                          <CheckCircle className="w-5 h-5 ml-2" />
                        )}
                        <span className="hidden sm:inline">تأكيد الطلب - {calculateTotal()} ر.س</span>
                        <span className="sm:hidden">تأكيد - {calculateTotal()} ر.س</span>
                      </Button>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showParkedOrders} onOpenChange={setShowParkedOrders}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Archive className="w-6 h-6" />
              الطلبات المعلقة ({parkedOrders.length})
            </DialogTitle>
            <DialogDescription>
              يمكنك استئناف أي طلب معلق أو حذفه
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {parkedOrders.length === 0 ? (
              <EmptyState 
                title="لا توجد طلبات معلقة"
                icon={<Clock className="w-10 h-10 text-muted-foreground" />}
              />
            ) : (
              <div className="space-y-3">
                {parkedOrders.sort((a, b) => {
                  if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                  if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }).map((order) => (
                  <Card 
                    key={order.id} 
                    className={order.priority === 'urgent' ? 'border-destructive/50' : ''}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{order.name}</h4>
                            {order.priority === 'urgent' && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 ml-1" />
                                عاجل
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{order.items.length} عنصر</span>
                            <span>{order.items.reduce((sum, i) => sum + i.quantity, 0)} قطعة</span>
                            {order.tableNumber && <span>طاولة {order.tableNumber}</span>}
                          </div>
                          {order.note && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <MessageSquare className="w-3 h-3" />
                              {order.note}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <Badge variant="secondary" className="text-xs">
                            {new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {order.items.reduce((sum, i) => sum + (Number(i.coffeeItem.price) * i.quantity - (i.itemDiscount || 0)), 0).toFixed(2)} ر.س
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => resumeParkedOrder(order)} 
                          className="flex-1"
                          data-testid={`button-resume-${order.id}`}
                        >
                          <PlayCircle className="w-4 h-4 ml-1" />
                          استئناف
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateParkedOrderPriority(order.id, order.priority === 'urgent' ? 'normal' : 'urgent')}
                        >
                          <AlertTriangle className={`w-4 h-4 ${order.priority === 'urgent' ? 'text-destructive' : ''}`} />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعليق الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ملاحظة (اختياري)</Label>
              <Input
                value={parkOrderNote}
                onChange={(e) => setParkOrderNote(e.target.value)}
                placeholder="أضف ملاحظة للطلب المعلق..."
                className="mt-2"
                data-testid="input-park-note"
              />
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">سيتم حفظ:</p>
              <ul className="text-sm text-foreground mt-2 space-y-1">
                <li>{orderItems.length} منتج</li>
                <li>المجموع: {calculateTotal()} ر.س</li>
                {customerName && <li>العميل: {customerName}</li>}
                {tableNumber && <li>طاولة: {tableNumber}</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParkDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={parkOrder} data-testid="button-confirm-park">
              <PauseCircle className="w-4 h-4 ml-1" />
              تعليق الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>خصم على المنتج</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>نوع الخصم</Label>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant={itemDiscountType === 'fixed' ? 'default' : 'outline'}
                  onClick={() => setItemDiscountType('fixed')}
                  className="flex-1"
                >
                  مبلغ ثابت (ر.س)
                </Button>
                <Button 
                  variant={itemDiscountType === 'percentage' ? 'default' : 'outline'}
                  onClick={() => setItemDiscountType('percentage')}
                  className="flex-1"
                >
                  نسبة مئوية (%)
                </Button>
              </div>
            </div>
            <div>
              <Label>
                قيمة الخصم {itemDiscountType === 'percentage' ? '(%)' : '(ر.س)'}
              </Label>
              <Input
                type="number"
                value={itemDiscountAmount}
                onChange={(e) => setItemDiscountAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="mt-2 text-xl text-center"
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
                  >
                    {p}%
                  </Button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDiscountDialog(false); setItemDiscountId(null); }}>
              إلغاء
            </Button>
            <Button 
              onClick={() => { if (itemDiscountId) applyItemDiscount(itemDiscountId, itemDiscountAmount, itemDiscountType); }} 
              data-testid="button-confirm-item-discount"
            >
              <Check className="w-4 h-4 ml-1" />
              تطبيق الخصم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReceipt && !!lastOrder} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              تم إنشاء الطلب بنجاح
            </DialogTitle>
          </DialogHeader>
          {lastOrder && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-6 text-center">
                <p className="text-muted-foreground text-sm mb-1">رقم الطلب</p>
                <p className="text-3xl font-bold text-primary">{lastOrder.orderNumber}</p>
                <p className="text-2xl font-bold text-foreground mt-3">{lastOrder.total} ر.س</p>
                {lastOrder.offline && (
                  <Badge variant="secondary" className="mt-2">
                    <WifiOff className="w-3 h-3 ml-1" />
                    محفوظ محلياً
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handlePrintReceipt} className="h-14" data-testid="button-print-receipt">
                  <Printer className="w-5 h-5 ml-2" />
                  طباعة الإيصال
                </Button>
                <Button onClick={handlePrintTaxInvoice} variant="outline" className="h-14" data-testid="button-print-tax">
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

      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              مسح بطاقة الولاء
            </DialogTitle>
          </DialogHeader>
          <BarcodeScanner 
            onCustomerFound={handleCustomerFoundFromScanner}
            onClose={() => setShowBarcodeScanner(false)}
            showManualInput={true}
          />
        </DialogContent>
      </Dialog>

      <DrinkCustomizationDialog
        coffeeItem={customizingItem}
        open={showCustomizationDialog}
        onClose={() => {
          setShowCustomizationDialog(false);
          setCustomizingItem(null);
          setEditingLineItemId(null);
        }}
        onConfirm={handleCustomizationConfirm}
        initialCustomization={editingLineItemId ? orderItems.find(i => i.lineItemId === editingLineItemId)?.customization : undefined}
        initialQuantity={editingLineItemId ? (orderItems.find(i => i.lineItemId === editingLineItemId)?.quantity || 1) : 1}
      />

    </div>
  );
}
