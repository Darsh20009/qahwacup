import { 
  type CoffeeItem, 
  type InsertCoffeeItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
  type User,
  type InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Coffee Item methods
  getCoffeeItems(): Promise<CoffeeItem[]>;
  getCoffeeItem(id: string): Promise<CoffeeItem | undefined>;
  getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]>;
  createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem>;
  updateCoffeeItem(id: string, item: Partial<CoffeeItem>): Promise<CoffeeItem | undefined>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  getOrders(limit?: number, offset?: number): Promise<Order[]>;

  // Order Item methods
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;

  // Cart methods
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(sessionId: string, coffeeItemId: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(sessionId: string, coffeeItemId: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private coffeeItems: Map<string, CoffeeItem>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private cartItems: Map<string, CartItem>;
  private orderCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.coffeeItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    
    // Initialize with coffee menu data
    this.initializeCoffeeMenu();
  }

  private initializeCoffeeMenu() {
    const coffeeMenuData: CoffeeItem[] = [
      // Basic Coffee
      { id: "espresso-single", nameAr: "إسبريسو (شوت)", nameEn: "Espresso Single", description: "قهوة إسبريسو مركزة من حبوب عربية مختارة", price: "4.00", oldPrice: "5.00", category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1 },
      { id: "espresso-double", nameAr: "إسبريسو (دبل شوت)", nameEn: "Espresso Double", description: "قهوة إسبريسو مضاعفة للباحثين عن النكهة القوية", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1 },
      { id: "americano", nameAr: "أمريكانو", nameEn: "Americano", description: "إسبريسو مخفف بالماء الساخن لطعم معتدل", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757426884660.png", isAvailable: 1 },
      { id: "ristretto", nameAr: "ريستريتو", nameEn: "Ristretto", description: "إسبريسو مركز بنصف كمية الماء لطعم أقوى", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757428239748.png", isAvailable: 1 },
      
      // Hot Coffee
      { id: "cafe-latte", nameAr: "كافيه لاتيه", nameEn: "Cafe Latte", description: "إسبريسو مع حليب مخفوق كريمي ورغوة ناعمة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png", isAvailable: 1 },
      { id: "cappuccino", nameAr: "كابتشينو", nameEn: "Cappuccino", description: "مزيج متوازن من الإسبريسو والحليب والرغوة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191916_1757434923575.png", isAvailable: 1 },
      { id: "vanilla-latte", nameAr: "فانيلا لاتيه", nameEn: "Vanilla Latte", description: "لاتيه كلاسيكي مع نكهة الفانيلا الطبيعية", price: "6.00", oldPrice: "7.00", category: "hot", imageUrl: "/attached_assets/Elegant Coffee Culture Design_1757428233689.png", isAvailable: 1 },
      { id: "mocha", nameAr: "موكا", nameEn: "Mocha", description: "مزيج رائع من القهوة والشوكولاتة والحليب", price: "7.00", oldPrice: "8.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191928_1757434923575.png", isAvailable: 1 },
      { id: "con-panna", nameAr: "كافيه كون بانا", nameEn: "Cafe Con Panna", description: "إسبريسو مع كريمة مخفوقة طازجة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191936_1757434923574.png", isAvailable: 1 },
      { id: "coffee-day-hot", nameAr: "قهوة اليوم (حار)", nameEn: "Coffee of the Day Hot", description: "تشكيلة مختارة يومياً من أفضل حبوب القهوة", price: "4.95", oldPrice: "5.50", category: "hot", imageUrl: "/attached_assets/coffee-day-hot-new.png", isAvailable: 1 },
      { id: "hot-tea", nameAr: "شاي حار", nameEn: "Hot Tea", description: "شاي طبيعي مُحضر بعناية من أوراق الشاي المختارة، يُقدم ساخناً ومنعشاً لبداية يوم مثالية", price: "2.00", oldPrice: null, category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-19 161654_1758288116712.png", isAvailable: 1 },
      
      // Cold Coffee
      { id: "iced-latte", nameAr: "آيسد لاتيه", nameEn: "Iced Latte", description: "لاتيه منعش مع الثلج والحليب البارد", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/generated_images/Luxury_iced_coffee_drink_571860f5.png", isAvailable: 1 },
      { id: "iced-mocha", nameAr: "آيسد موكا", nameEn: "Iced Mocha", description: "موكا باردة مع الشوكولاتة والكريمة المخفوقة", price: "7.00", oldPrice: "8.00", category: "cold", imageUrl: "/attached_assets/generated_images/Luxury_iced_coffee_drink_571860f5.png", isAvailable: 1 },
      { id: "iced-cappuccino", nameAr: "آيسد كابتشينو", nameEn: "Iced Cappuccino", description: "كابتشينو بارد مع رغوة الحليب المثلجة", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192012_1757434923573.png", isAvailable: 1 },
      { id: "iced-condensed", nameAr: "قهوة مثلجة بالحليب المكثف", nameEn: "Iced Coffee with Condensed Milk", description: "قهوة باردة مع حليب مكثف حلو ولذيذ", price: "5.00", oldPrice: "6.00", category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192022_1757434929813.png", isAvailable: 1 },
      { id: "vanilla-cold-brew", nameAr: "فانيلا كولد برو", nameEn: "Vanilla Cold Brew", description: "قهوة باردة منقوعة ببطء مع نكهة الفانيلا", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192045_1757434923573.png", isAvailable: 1 },
      { id: "coffee-day-cold", nameAr: "قهوة اليوم (بارد)", nameEn: "Coffee of the Day Cold", description: "تشكيلة مختارة يومياً من القهوة الباردة المنعشة", price: "4.95", oldPrice: "5.50", category: "cold", imageUrl: "/attached_assets/coffee-day-cold-new.png", isAvailable: 1 },
    ];

    coffeeMenuData.forEach(item => {
      this.coffeeItems.set(item.id, item);
    });
  }

  // User methods (legacy)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Coffee Item methods
  async getCoffeeItems(): Promise<CoffeeItem[]> {
    return Array.from(this.coffeeItems.values()).filter(item => item.isAvailable === 1);
  }

  async getCoffeeItem(id: string): Promise<CoffeeItem | undefined> {
    const item = this.coffeeItems.get(id);
    return item?.isAvailable === 1 ? item : undefined;
  }

  async getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]> {
    return Array.from(this.coffeeItems.values()).filter(
      item => item.category === category && item.isAvailable === 1
    );
  }

  async createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem> {
    const id = randomUUID();
    const coffeeItem: CoffeeItem = { 
      ...item, 
      id, 
      isAvailable: item.isAvailable ?? 1,
      nameEn: item.nameEn ?? null,
      oldPrice: item.oldPrice ?? null,
      imageUrl: item.imageUrl ?? null
    };
    this.coffeeItems.set(id, coffeeItem);
    return coffeeItem;
  }

  async updateCoffeeItem(id: string, updates: Partial<CoffeeItem>): Promise<CoffeeItem | undefined> {
    const existing = this.coffeeItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, id };
    this.coffeeItems.set(id, updated);
    return updated;
  }

  // Order methods
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = randomUUID();
    
    // Create creative order number based on customer name
    let orderNumber = 'CUP000001';
    const customerInfo = orderData.customerInfo as any;
    if (customerInfo?.customerName) {
      // Get customer name and create artistic order number
      const customerName = (customerInfo.customerName as string).trim();
      const nameInitials = customerName.split(' ')
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('');
      
      // Add timestamp for uniqueness
      const now = new Date();
      const timeStamp = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Create beautiful order number: Coffee cup emoji + initials + timestamp
      orderNumber = `☕${nameInitials}${timeStamp}`;
      
      // If name is too short, add counter for beauty
      if (nameInitials.length < 2) {
        orderNumber = `☕${customerName.substring(0, 2).toUpperCase()}${timeStamp}`;
      }
    } else {
      // Fallback to counter-based system with coffee theme
      orderNumber = `☕CUP${String(this.orderCounter++).padStart(4, '0')}`;
    }
    
    const order: Order = { 
      ...orderData, 
      id, 
      orderNumber,
      createdAt: new Date(),
      paymentDetails: orderData.paymentDetails ?? null,
      status: orderData.status ?? "pending",
      customerInfo: orderData.customerInfo ?? null
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(order => order.orderNumber === orderNumber);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  async getOrders(limit?: number, offset?: number): Promise<Order[]> {
    const orders = Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (limit || offset) {
      const start = offset || 0;
      const end = limit ? start + limit : undefined;
      return orders.slice(start, end);
    }
    
    return orders;
  }

  // Order Item methods
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const item: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, item);
    return item;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = Array.from(this.cartItems.values()).find(
      item => item.sessionId === cartItem.sessionId && item.coffeeItemId === cartItem.coffeeItemId
    );

    if (existing) {
      // Update quantity
      existing.quantity += cartItem.quantity;
      this.cartItems.set(existing.id, existing);
      return existing;
    }

    // Create new cart item
    const id = randomUUID();
    const newItem: CartItem = { 
      ...cartItem, 
      id,
      createdAt: new Date()
    };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItemQuantity(sessionId: string, coffeeItemId: string, quantity: number): Promise<CartItem | undefined> {
    const existing = Array.from(this.cartItems.values()).find(
      item => item.sessionId === sessionId && item.coffeeItemId === coffeeItemId
    );

    if (!existing) return undefined;

    if (quantity <= 0) {
      this.cartItems.delete(existing.id);
      return undefined;
    }

    existing.quantity = quantity;
    this.cartItems.set(existing.id, existing);
    return existing;
  }

  async removeFromCart(sessionId: string, coffeeItemId: string): Promise<boolean> {
    const existing = Array.from(this.cartItems.values()).find(
      item => item.sessionId === sessionId && item.coffeeItemId === coffeeItemId
    );

    if (!existing) return false;

    this.cartItems.delete(existing.id);
    return true;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const sessionItems = Array.from(this.cartItems.values()).filter(
      item => item.sessionId === sessionId
    );

    sessionItems.forEach(item => {
      this.cartItems.delete(item.id);
    });

    return true;
  }
}

export const storage = new MemStorage();
