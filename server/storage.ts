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
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Employee,
  type InsertEmployee,
  type LoyaltyCard,
  type InsertLoyaltyCard,
  type CardCode,
  type InsertCardCode,
  type LoyaltyTransaction,
  type InsertLoyaltyTransaction,
  type LoyaltyReward,
  type InsertLoyaltyReward,
  coffeeItems,
  customers,
  employees,
  orders,
  orderItems,
  cartItems,
  users,
  loyaltyCards,
  cardCodes,
  loyaltyTransactions,
  loyaltyRewards
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import pg from "pg";
import { eq, desc, and, sql } from "drizzle-orm";
import ws from "ws";
import { nanoid } from "nanoid";

const { Pool: PgPool } = pg;

export interface IStorage {
  // User methods (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Employee methods
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByUsername(username: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployees(): Promise<Employee[]>;

  // Customer methods
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined>;
  getCustomerOrders(customerId: string): Promise<Order[]>;

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

  // Loyalty Card methods
  createLoyaltyCard(card: InsertLoyaltyCard): Promise<LoyaltyCard>;
  getLoyaltyCard(id: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardByQRToken(qrToken: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardByCardNumber(cardNumber: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardByPhone(phoneNumber: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCards(): Promise<LoyaltyCard[]>;
  updateLoyaltyCard(id: string, updates: Partial<LoyaltyCard>): Promise<LoyaltyCard | undefined>;

  // Card Code methods
  generateCodesForOrder(orderId: string, drinks: Array<{name: string, quantity: number}>): Promise<CardCode[]>;
  redeemCode(code: string, cardId: string): Promise<{success: boolean, message: string, card?: LoyaltyCard}>;
  getCodesByOrder(orderId: string): Promise<CardCode[]>;
  getCodeDetails(code: string): Promise<CardCode | undefined>;

  // Loyalty Transaction methods
  createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction>;
  getLoyaltyTransactions(cardId: string): Promise<LoyaltyTransaction[]>;
  getAllLoyaltyTransactions(limit?: number): Promise<LoyaltyTransaction[]>;

  // Loyalty Reward methods
  createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward>;
  getLoyaltyRewards(): Promise<LoyaltyReward[]>;
  getLoyaltyReward(id: string): Promise<LoyaltyReward | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private employees: Map<string, Employee>;
  private coffeeItems: Map<string, CoffeeItem>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private cartItems: Map<string, CartItem>;
  private loyaltyCards: Map<string, LoyaltyCard>;
  private loyaltyTransactions: Map<string, LoyaltyTransaction>;
  private loyaltyRewards: Map<string, LoyaltyReward>;
  private orderCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.coffeeItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    this.loyaltyCards = new Map();
    this.loyaltyTransactions = new Map();
    this.loyaltyRewards = new Map();

    // Initialize with coffee menu data and demo employee
    this.initializeCoffeeMenu();
    this.initializeDemoEmployee();
  }

  private initializeCoffeeMenu() {
    const coffeeMenuData: CoffeeItem[] = [
      // Basic Coffee
      { id: "espresso-single", nameAr: "إسبريسو (شوت)", nameEn: "Espresso Single", description: "قهوة إسبريسو مركزة من حبوب عربية مختارة", price: "4.00", oldPrice: "5.00", category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1, coffeeStrength: "strong", strengthLevel: 10 },
      { id: "espresso-double", nameAr: "إسبريسو (دبل شوت)", nameEn: "Espresso Double", description: "قهوة إسبريسو مضاعفة للباحثين عن النكهة القوية", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1, coffeeStrength: "strong", strengthLevel: 12 },
      { id: "americano", nameAr: "أمريكانو", nameEn: "Americano", description: "إسبريسو مخفف بالماء الساخن لطعم معتدل", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757426884660.png", isAvailable: 1, coffeeStrength: "mild", strengthLevel: 3 },
      { id: "ristretto", nameAr: "ريستريتو", nameEn: "Ristretto", description: "إسبريسو مركز بنصف كمية الماء لطعم أقوى", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757428239748.png", isAvailable: 1, coffeeStrength: "strong", strengthLevel: 11 },

      // Hot Coffee
      { id: "cafe-latte", nameAr: "كافيه لاتيه", nameEn: "Cafe Latte", description: "إسبريسو مع حليب مخفوق كريمي ورغوة ناعمة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "cappuccino", nameAr: "كابتشينو", nameEn: "Cappuccino", description: "مزيج متوازن من الإسبريسو والحليب والرغوة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191916_1757434923575.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "vanilla-latte", nameAr: "فانيلا لاتيه", nameEn: "Vanilla Latte", description: "لاتيه كلاسيكي مع نكهة الفانيلا الطبيعية", price: "6.00", oldPrice: "7.00", category: "hot", imageUrl: "/attached_assets/Elegant Coffee Culture Design_1757428233689.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "mocha", nameAr: "موكا", nameEn: "Mocha", description: "مزيج رائع من القهوة والشوكولاتة والحليب", price: "7.00", oldPrice: "8.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191928_1757434923575.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 6 },
      { id: "con-panna", nameAr: "كافيه كون بانا", nameEn: "Cafe Con Panna", description: "إسبريسو مع كريمة مخفوقة طازجة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191936_1757434923574.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 7 },
      { id: "coffee-day-hot", nameAr: "قهوة اليوم (حار)", nameEn: "Coffee of the Day Hot", description: "تشكيلة مختارة يومياً من أفضل حبوب القهوة", price: "4.95", oldPrice: "5.50", category: "hot", imageUrl: "/attached_assets/coffee-day-hot-new.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },

      // Specialty Drinks
      { id: "hot-tea", nameAr: "شاي حار", nameEn: "Hot Tea", description: "شاي طبيعي مُحضر بعناية من أوراق الشاي المختارة، يُقدم ساخناً ومنعشاً لبداية يوم مثالية", price: "2.00", oldPrice: null, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161654_1758288116712.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "ice-tea", nameAr: "آيس تي", nameEn: "Ice Tea", description: "انتعاش لا يُقاوم مع مزيج مثالي من الشاي المنقوع ببرودة والطعم المميز، رحلة منعشة في كل رشفة تجدد طاقتك وتمنحك لحظات من الصفاء", price: "3.00", oldPrice: null, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161645_1758288659656.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "iced-matcha-latte", nameAr: "آيس لاتيه ماتشا", nameEn: "Iced Matcha Latte", description: "إبداع ياباني ساحر يجمع بين نعومة الحليب المثلج وسحر الماتشا الأخضر النقي، تجربة بصرية وذوقية استثنائية تأخذك في رحلة إلى عالم من الهدوء والتميز", price: "10.00", oldPrice: null, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161627_1758288688792.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "hot-matcha-latte", nameAr: "لاتيه ماتشا حار", nameEn: "Hot Matcha Latte", description: "دفء ساحر يلتقي مع نكهة الماتشا الاستثنائية في لحن متناغم من الكريمة والطعم الياباني الأصيل، يُقدم ساخناً بفن لاتيه مبهر يسعد العين قبل أن يأسر الذوق", price: "11.00", oldPrice: null, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161637_1758288723420.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },

      // Cold Coffee
      { id: "iced-latte", nameAr: "آيسد لاتيه", nameEn: "Iced Latte", description: "لاتيه منعش مع الثلج والحليب البارد", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/generated_images/Luxury_iced_coffee_drink_571860f5.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "iced-mocha", nameAr: "آيسد موكا", nameEn: "Iced Mocha", description: "موكا باردة مع الشوكولاتة والكريمة المخفوقة", price: "7.00", oldPrice: "8.00", category: "cold", imageUrl: "/attached_assets/generated_images/Luxury_iced_coffee_drink_571860f5.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 5 },
      { id: "iced-cappuccino", nameAr: "آيسد كابتشينو", nameEn: "Iced Cappuccino", description: "كابتشينو بارد مع رغوة الحليب المثلجة", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192012_1757434923573.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "iced-condensed", nameAr: "قهوة مثلجة بالحليب المكثف", nameEn: "Iced Coffee with Condensed Milk", description: "قهوة باردة مع حليب مكثف حلو ولذيذ", price: "5.00", oldPrice: "6.00", category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192022_1757434929813.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 5 },
      { id: "vanilla-cold-brew", nameAr: "فانيلا كولد برو", nameEn: "Vanilla Cold Brew", description: "قهوة باردة منقوعة ببطء مع نكهة الفانيلا", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192045_1757434923573.png", isAvailable: 1, coffeeStrength: "mild", strengthLevel: 2 },
      { id: "coffee-day-cold", nameAr: "قهوة اليوم (بارد)", nameEn: "Coffee of the Day Cold", description: "تشكيلة مختارة يومياً من القهوة الباردة المنعشة", price: "4.95", oldPrice: "5.50", category: "cold", imageUrl: "/attached_assets/coffee-day-cold-new.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
    ];

    coffeeMenuData.forEach(item => {
      this.coffeeItems.set(item.id, item);
    });
  }

  private initializeDemoEmployee() {
    // Create demo employee: درويش with hashed password
    const hashedPassword = bcrypt.hashSync('2009', 10);
    const demoEmployee: Employee = {
      id: 'demo-employee-1',
      username: 'darwish',
      password: hashedPassword, // Hashed password
      fullName: 'يوسف درويش',
      role: 'manager',
      title: 'مدير المقهى',
      createdAt: new Date()
    };
    this.employees.set(demoEmployee.id, demoEmployee);
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByUsername(username: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(
      (emp) => emp.username === username,
    );
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertEmployee.password, 10);
    const employee: Employee = {
      ...insertEmployee,
      id,
      password: hashedPassword,
      title: insertEmployee.title ?? null,
      createdAt: new Date()
    };
    this.employees.set(id, employee);
    return employee;
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
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
      imageUrl: item.imageUrl ?? null,
      coffeeStrength: item.coffeeStrength ?? "classic",
      strengthLevel: item.strengthLevel ?? null
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
      updatedAt: new Date(),
      paymentDetails: orderData.paymentDetails ?? null,
      status: orderData.status ?? "pending",
      customerInfo: orderData.customerInfo ?? null,
      customerId: orderData.customerId ?? null,
      employeeId: orderData.employeeId ?? null
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

  // Loyalty Card methods
  async createLoyaltyCard(cardData: InsertLoyaltyCard): Promise<LoyaltyCard> {
    const id = randomUUID();
    // Generate unique QR token (UUID-based for security)
    const qrToken = `CUP-${randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
    // Generate unique card number for display
    const cardNumber = `${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const card: LoyaltyCard = {
      id,
      customerName: cardData.customerName || null,
      phoneNumber: cardData.phoneNumber,
      qrToken,
      cardNumber,
      stamps: 0,
      freeCupsEarned: 0,
      freeCupsRedeemed: 0,
      points: 0,
      tier: "bronze",
      totalSpent: "0",
      discountCount: 0,
      status: "active",
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.loyaltyCards.set(id, card);
    return card;
  }

  async getLoyaltyCard(id: string): Promise<LoyaltyCard | undefined> {
    return this.loyaltyCards.get(id);
  }

  async getLoyaltyCardByQRToken(qrToken: string): Promise<LoyaltyCard | undefined> {
    return Array.from(this.loyaltyCards.values()).find(
      card => card.qrToken === qrToken && card.status === "active"
    );
  }

  async getLoyaltyCardByPhone(phoneNumber: string): Promise<LoyaltyCard | undefined> {
    return Array.from(this.loyaltyCards.values()).find(
      card => card.phoneNumber === phoneNumber
    );
  }

  async getLoyaltyCardByCardNumber(cardNumber: string): Promise<LoyaltyCard | undefined> {
    return Array.from(this.loyaltyCards.values()).find(
      card => card.cardNumber === cardNumber
    );
  }

  async getLoyaltyCards(): Promise<LoyaltyCard[]> {
    return Array.from(this.loyaltyCards.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateLoyaltyCard(id: string, updates: Partial<LoyaltyCard>): Promise<LoyaltyCard | undefined> {
    const existing = this.loyaltyCards.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...updates, 
      id,
      updatedAt: new Date()
    };
    this.loyaltyCards.set(id, updated);
    return updated;
  }

  // Card Code methods (not implemented in MemStorage)
  async generateCodesForOrder(orderId: string, drinks: Array<{name: string, quantity: number}>): Promise<CardCode[]> {
    throw new Error("Not implemented in MemStorage");
  }

  async redeemCode(code: string, cardId: string): Promise<{success: boolean, message: string, card?: LoyaltyCard}> {
    throw new Error("Not implemented in MemStorage");
  }

  async getCodesByOrder(orderId: string): Promise<CardCode[]> {
    throw new Error("Not implemented in MemStorage");
  }

  async getCodeDetails(code: string): Promise<CardCode | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  // Loyalty Transaction methods
  async createLoyaltyTransaction(transactionData: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const id = randomUUID();
    const transaction: LoyaltyTransaction = {
      ...transactionData,
      id,
      orderId: transactionData.orderId ?? null,
      discountAmount: transactionData.discountAmount ?? null,
      orderAmount: transactionData.orderAmount ?? null,
      description: transactionData.description ?? null,
      employeeId: transactionData.employeeId ?? null,
      createdAt: new Date()
    };
    
    this.loyaltyTransactions.set(id, transaction);
    return transaction;
  }

  async getLoyaltyTransactions(cardId: string): Promise<LoyaltyTransaction[]> {
    return Array.from(this.loyaltyTransactions.values())
      .filter(t => t.cardId === cardId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllLoyaltyTransactions(limit?: number): Promise<LoyaltyTransaction[]> {
    const transactions = Array.from(this.loyaltyTransactions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (limit) {
      return transactions.slice(0, limit);
    }
    return transactions;
  }

  // Loyalty Reward methods
  async createLoyaltyReward(rewardData: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const id = randomUUID();
    const reward: LoyaltyReward = {
      ...rewardData,
      id,
      nameEn: rewardData.nameEn ?? null,
      discountPercentage: rewardData.discountPercentage ?? null,
      discountAmount: rewardData.discountAmount ?? null,
      tier: rewardData.tier ?? null,
      isActive: rewardData.isActive ?? 1,
      createdAt: new Date()
    };
    
    this.loyaltyRewards.set(id, reward);
    return reward;
  }

  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return Array.from(this.loyaltyRewards.values()).filter(r => r.isActive === 1);
  }

  async getLoyaltyReward(id: string): Promise<LoyaltyReward | undefined> {
    return this.loyaltyRewards.get(id);
  }

  // Customer methods (stub - not used with database)
  async getCustomer(id: string): Promise<Customer | undefined> {
    throw new Error("MemStorage customer methods not implemented - use DBStorage");
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    throw new Error("MemStorage customer methods not implemented - use DBStorage");
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    throw new Error("MemStorage customer methods not implemented - use DBStorage");
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined> {
    throw new Error("MemStorage customer methods not implemented - use DBStorage");
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    throw new Error("MemStorage customer methods not implemented - use DBStorage");
  }
}

// Database Storage Implementation using Drizzle ORM
export class DBStorage implements IStorage {
  private db: any;
  private pool: PgPool | NeonPool;
  private initialized = false;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    
    // Use Neon serverless for cloud, standard pg for local Replit PostgreSQL
    if (connectionString?.includes('neon.tech')) {
      // Neon serverless connection
      neonConfig.webSocketConstructor = ws;
      this.pool = new NeonPool({ connectionString });
      this.db = drizzleNeon(this.pool as any);
    } else {
      // Standard PostgreSQL connection (Replit local database)
      this.pool = new PgPool({ connectionString });
      this.db = drizzlePg(this.pool);
    }
  }

  async initialize() {
    if (this.initialized) return;
    
    // Check if coffee items exist
    const existingItems = await this.db.select().from(coffeeItems).limit(1);
    
    if (existingItems.length === 0) {
      // Initialize with coffee menu data
      await this.initializeCoffeeMenu();
    }

    // Check if demo employee exists
    const existingEmployees = await this.db.select().from(employees).where(eq(employees.username, 'darwish')).limit(1);
    
    if (existingEmployees.length === 0) {
      // Initialize demo employee
      await this.initializeDemoEmployee();
    }

    this.initialized = true;
  }

  private async initializeCoffeeMenu() {
    const coffeeMenuData = [
      // Basic Coffee
      { id: "espresso-single", nameAr: "إسبريسو (شوت)", nameEn: "Espresso Single", description: "قهوة إسبريسو مركزة من حبوب عربية مختارة", price: "4.00", oldPrice: "5.00", category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1, coffeeStrength: "strong", strengthLevel: 10 },
      { id: "espresso-double", nameAr: "إسبريسو (دبل شوت)", nameEn: "Espresso Double", description: "قهوة إسبريسو مضاعفة للباحثين عن النكهة القوية", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1, coffeeStrength: "strong", strengthLevel: 12 },
      { id: "americano", nameAr: "أمريكانو", nameEn: "Americano", description: "إسبريسو مخفف بالماء الساخن لطعم معتدل", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757426884660.png", isAvailable: 1, coffeeStrength: "mild", strengthLevel: 3 },
      { id: "ristretto", nameAr: "ريستريتو", nameEn: "Ristretto", description: "إسبريسو مركز بنصف كمية الماء لطعم أقوى", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757428239748.png", isAvailable: 1, coffeeStrength: "strong", strengthLevel: 11 },

      // Hot Coffee
      { id: "cafe-latte", nameAr: "كافيه لاتيه", nameEn: "Cafe Latte", description: "إسبريسو مع حليب مخفوق كريمي ورغوة ناعمة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "cappuccino", nameAr: "كابتشينو", nameEn: "Cappuccino", description: "مزيج متوازن من الإسبريسو والحليب والرغوة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191916_1757434923575.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "vanilla-latte", nameAr: "فانيلا لاتيه", nameEn: "Vanilla Latte", description: "لاتيه كلاسيكي مع نكهة الفانيلا الطبيعية", price: "6.00", oldPrice: "7.00", category: "hot", imageUrl: "/attached_assets/Elegant Coffee Culture Design_1757428233689.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "mocha", nameAr: "موكا", nameEn: "Mocha", description: "مزيج رائع من القهوة والشوكولاتة والحليب", price: "7.00", oldPrice: "8.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191928_1757434923575.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 6 },
      { id: "con-panna", nameAr: "كافيه كون بانا", nameEn: "Cafe Con Panna", description: "إسبريسو مع كريمة مخفوقة طازجة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191936_1757434923574.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 7 },
      { id: "coffee-day-hot", nameAr: "قهوة اليوم (حار)", nameEn: "Coffee of the Day Hot", description: "تشكيلة مختارة يومياً من أفضل حبوب القهوة", price: "4.95", oldPrice: "5.50", category: "hot", imageUrl: "/attached_assets/coffee-day-hot-new.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },

      // Specialty Drinks
      { id: "hot-tea", nameAr: "شاي حار", nameEn: "Hot Tea", description: "شاي طبيعي مُحضر بعناية من أوراق الشاي المختارة، يُقدم ساخناً ومنعشاً لبداية يوم مثالية", price: "2.00", oldPrice: null, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161654_1758288116712.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "ice-tea", nameAr: "آيس تي", nameEn: "Ice Tea", description: "انتعاش لا يُقاوم مع مزيج مثالي من الشاي المنقوع ببرودة والطعم المميز، رحلة منعشة في كل رشفة تجدد طاقتك وتمنحك لحظات من الصفاء", price: "3.00", oldPrice: null, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161645_1758288659656.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "iced-matcha-latte", nameAr: "آيس لاتيه ماتشا", nameEn: "Iced Matcha Latte", description: "إبداع ياباني ساحر يجمع بين نعومة الحليب المثلج وسحر الماتشا الأخضر النقي، تجربة بصرية وذوقية استثنائية تأخذك في رحلة إلى عالم من الهدوء والتميز", price: "10.00", oldPrice: null, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161627_1758288688792.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "hot-matcha-latte", nameAr: "لاتيه ماتشا حار", nameEn: "Hot Matcha Latte", description: "دفء ساحر يلتقي مع نكهة الماتشا الاستثنائية في لحن متناغم من الكريمة والطعم الياباني الأصيل، يُقدم ساخناً بفن لاتيه مبهر يسعد العين قبل أن يأسر الذوق", price: "11.00", oldPrice: null, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161637_1758288723420.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },

      // Cold Coffee
      { id: "iced-latte", nameAr: "آيسد لاتيه", nameEn: "Iced Latte", description: "لاتيه منعش مع الثلج والحليب البارد", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/generated_images/Luxury_iced_coffee_drink_571860f5.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "iced-mocha", nameAr: "آيسد موكا", nameEn: "Iced Mocha", description: "موكا باردة مع الشوكولاتة والكريمة المخفوقة", price: "7.00", oldPrice: "8.00", category: "cold", imageUrl: "/attached_assets/generated_images/Luxury_iced_coffee_drink_571860f5.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 5 },
      { id: "iced-cappuccino", nameAr: "آيسد كابتشينو", nameEn: "Iced Cappuccino", description: "كابتشينو بارد مع رغوة الحليب المثلجة", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192012_1757434923573.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
      { id: "iced-condensed", nameAr: "قهوة مثلجة بالحليب المكثف", nameEn: "Iced Coffee with Condensed Milk", description: "قهوة باردة مع حليب مكثف حلو ولذيذ", price: "5.00", oldPrice: "6.00", category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192022_1757434929813.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 5 },
      { id: "vanilla-cold-brew", nameAr: "فانيلا كولد برو", nameEn: "Vanilla Cold Brew", description: "قهوة باردة منقوعة ببطء مع نكهة الفانيلا", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192045_1757434923573.png", isAvailable: 1, coffeeStrength: "mild", strengthLevel: 2 },
      { id: "coffee-day-cold", nameAr: "قهوة اليوم (بارد)", nameEn: "Coffee of the Day Cold", description: "تشكيلة مختارة يومياً من القهوة الباردة المنعشة", price: "4.95", oldPrice: "5.50", category: "cold", imageUrl: "/attached_assets/coffee-day-cold-new.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null },
    ];

    await this.db.insert(coffeeItems).values(coffeeMenuData);
  }

  private async initializeDemoEmployee() {
    const hashedPassword = bcrypt.hashSync('2009', 10);
    await this.db.insert(employees).values({
      id: 'demo-employee-1',
      username: 'darwish',
      password: hashedPassword,
      fullName: 'يوسف درويش',
      role: 'manager',
      title: 'مدير المقهى'
    });
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    const result = await this.db.select().from(employees).where(eq(employees.id, id)).limit(1);
    return result[0];
  }

  async getEmployeeByUsername(username: string): Promise<Employee | undefined> {
    const result = await this.db.select().from(employees).where(eq(employees.username, username)).limit(1);
    return result[0];
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const hashedPassword = await bcrypt.hash(insertEmployee.password, 10);
    const result = await this.db.insert(employees).values({
      ...insertEmployee,
      password: hashedPassword
    }).returning();
    return result[0];
  }

  async getEmployees(): Promise<Employee[]> {
    return await this.db.select().from(employees);
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await this.db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const result = await this.db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
    return result[0];
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const result = await this.db.insert(customers).values(insertCustomer).returning();
    return result[0];
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const result = await this.db.update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return await this.db.select().from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  // User methods (legacy)
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Coffee Item methods
  async getCoffeeItems(): Promise<CoffeeItem[]> {
    return await this.db.select().from(coffeeItems).where(eq(coffeeItems.isAvailable, 1));
  }

  async getCoffeeItem(id: string): Promise<CoffeeItem | undefined> {
    const result = await this.db.select().from(coffeeItems)
      .where(and(eq(coffeeItems.id, id), eq(coffeeItems.isAvailable, 1)))
      .limit(1);
    return result[0];
  }

  async getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]> {
    return await this.db.select().from(coffeeItems)
      .where(and(eq(coffeeItems.category, category), eq(coffeeItems.isAvailable, 1)));
  }

  async createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem> {
    const id = randomUUID();
    const result = await this.db.insert(coffeeItems).values({ ...item, id }).returning();
    return result[0];
  }

  async updateCoffeeItem(id: string, updates: Partial<CoffeeItem>): Promise<CoffeeItem | undefined> {
    const result = await this.db.update(coffeeItems)
      .set(updates)
      .where(eq(coffeeItems.id, id))
      .returning();
    return result[0];
  }

  // Order methods
  async createOrder(orderData: InsertOrder): Promise<Order> {
    // Generate order number based on customer name
    let orderNumber = 'CUP000001';
    const customerInfo = orderData.customerInfo as any;
    if (customerInfo?.customerName) {
      const customerName = (customerInfo.customerName as string).trim();
      const nameInitials = customerName.split(' ')
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('');

      const now = new Date();
      const timeStamp = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      orderNumber = `☕${nameInitials}${timeStamp}`;

      if (nameInitials.length < 2) {
        orderNumber = `☕${customerName.substring(0, 2).toUpperCase()}${timeStamp}`;
      }
    } else {
      // Use counter-based system
      const lastOrder = await this.db.select().from(orders).orderBy(desc(orders.createdAt)).limit(1);
      const counter = lastOrder.length > 0 ? parseInt(lastOrder[0].orderNumber.replace(/\D/g, '')) + 1 : 1;
      orderNumber = `☕CUP${String(counter).padStart(4, '0')}`;
    }

    const result = await this.db.insert(orders).values({
      ...orderData,
      orderNumber
    }).returning();
    return result[0];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await this.db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async getOrders(limit?: number, offset?: number): Promise<Order[]> {
    let query = this.db.select().from(orders).orderBy(desc(orders.createdAt));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    if (offset) {
      query = query.offset(offset) as any;
    }
    
    return await query;
  }

  // Order Item methods
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await this.db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await this.db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return await this.db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = await this.db.select().from(cartItems)
      .where(and(
        eq(cartItems.sessionId, cartItem.sessionId),
        eq(cartItems.coffeeItemId, cartItem.coffeeItemId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update quantity
      const result = await this.db.update(cartItems)
        .set({ quantity: existing[0].quantity + cartItem.quantity })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return result[0];
    }

    // Create new cart item
    const result = await this.db.insert(cartItems).values(cartItem).returning();
    return result[0];
  }

  async updateCartItemQuantity(sessionId: string, coffeeItemId: string, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.db.delete(cartItems)
        .where(and(
          eq(cartItems.sessionId, sessionId),
          eq(cartItems.coffeeItemId, coffeeItemId)
        ));
      return undefined;
    }

    const result = await this.db.update(cartItems)
      .set({ quantity })
      .where(and(
        eq(cartItems.sessionId, sessionId),
        eq(cartItems.coffeeItemId, coffeeItemId)
      ))
      .returning();
    return result[0];
  }

  async removeFromCart(sessionId: string, coffeeItemId: string): Promise<boolean> {
    const result = await this.db.delete(cartItems)
      .where(and(
        eq(cartItems.sessionId, sessionId),
        eq(cartItems.coffeeItemId, coffeeItemId)
      ))
      .returning();
    return result.length > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    await this.db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    return true;
  }

  // Loyalty Card methods
  async createLoyaltyCard(cardData: InsertLoyaltyCard): Promise<LoyaltyCard> {
    const qrToken = `CUP-${randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
    const cardNumber = `${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const result = await this.db.insert(loyaltyCards).values({
      ...cardData,
      qrToken,
      cardNumber
    }).returning();
    return result[0];
  }

  async getLoyaltyCard(id: string): Promise<LoyaltyCard | undefined> {
    const result = await this.db.select().from(loyaltyCards).where(eq(loyaltyCards.id, id)).limit(1);
    return result[0];
  }

  async getLoyaltyCardByQRToken(qrToken: string): Promise<LoyaltyCard | undefined> {
    const result = await this.db.select().from(loyaltyCards)
      .where(and(eq(loyaltyCards.qrToken, qrToken), eq(loyaltyCards.status, "active")))
      .limit(1);
    return result[0];
  }

  async getLoyaltyCardByPhone(phoneNumber: string): Promise<LoyaltyCard | undefined> {
    const result = await this.db.select().from(loyaltyCards)
      .where(eq(loyaltyCards.phoneNumber, phoneNumber))
      .limit(1);
    return result[0];
  }

  async getLoyaltyCardByCardNumber(cardNumber: string): Promise<LoyaltyCard | undefined> {
    const result = await this.db.select().from(loyaltyCards)
      .where(eq(loyaltyCards.cardNumber, cardNumber))
      .limit(1);
    return result[0];
  }

  async getLoyaltyCards(): Promise<LoyaltyCard[]> {
    return await this.db.select().from(loyaltyCards).orderBy(desc(loyaltyCards.createdAt));
  }

  async updateLoyaltyCard(id: string, updates: Partial<LoyaltyCard>): Promise<LoyaltyCard | undefined> {
    const result = await this.db.update(loyaltyCards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(loyaltyCards.id, id))
      .returning();
    return result[0];
  }

  // Card Code methods
  async generateCodesForOrder(orderId: string, drinks: Array<{name: string, quantity: number}>): Promise<CardCode[]> {
    const codesToInsert: Array<{
      code: string;
      issuedForOrderId: string;
      drinkName: string;
      isRedeemed: number;
    }> = [];
    let totalCodes = 0;

    for (const drink of drinks) {
      const codesToGenerate = Math.min(drink.quantity, 5 - totalCodes);
      
      for (let i = 0; i < codesToGenerate; i++) {
        const code = nanoid(8);
        codesToInsert.push({
          code,
          issuedForOrderId: orderId,
          drinkName: drink.name,
          isRedeemed: 0
        });
        totalCodes++;
        
        if (totalCodes >= 5) break;
      }
      
      if (totalCodes >= 5) break;
    }

    if (codesToInsert.length === 0) {
      return [];
    }

    const result = await this.db.insert(cardCodes).values(codesToInsert).returning();
    return result;
  }

  async redeemCode(code: string, cardId: string): Promise<{success: boolean, message: string, card?: LoyaltyCard}> {
    try {
      return await this.db.transaction(async (tx: any) => {
        const codeResult = await tx.select().from(cardCodes)
          .where(eq(cardCodes.code, code))
          .limit(1);

        if (codeResult.length === 0) {
          return { success: false, message: "رمز غير صالح" };
        }

        const cardCode = codeResult[0];

        if (cardCode.isRedeemed === 1) {
          return { success: false, message: "تم استخدام هذا الرمز من قبل" };
        }

        await tx.update(cardCodes)
          .set({
            isRedeemed: 1,
            redeemedByCardId: cardId,
            redeemedAt: new Date()
          })
          .where(eq(cardCodes.id, cardCode.id));

        const cardResult = await tx.select().from(loyaltyCards)
          .where(eq(loyaltyCards.id, cardId))
          .limit(1);

        if (cardResult.length === 0) {
          return { success: false, message: "البطاقة غير موجودة" };
        }

        const card = cardResult[0];
        const newStamps = card.stamps + 1;

        const updatedCardResult = await tx.update(loyaltyCards)
          .set({
            stamps: newStamps,
            lastUsedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(loyaltyCards.id, cardId))
          .returning();

        return {
          success: true,
          message: "تم استخدام الرمز بنجاح",
          card: updatedCardResult[0]
        };
      });
    } catch (error) {
      return { success: false, message: "حدث خطأ أثناء استخدام الرمز" };
    }
  }

  async getCodesByOrder(orderId: string): Promise<CardCode[]> {
    return await this.db.select().from(cardCodes)
      .where(eq(cardCodes.issuedForOrderId, orderId));
  }

  async getCodeDetails(code: string): Promise<CardCode | undefined> {
    const result = await this.db.select().from(cardCodes)
      .where(eq(cardCodes.code, code))
      .limit(1);
    return result[0];
  }

  // Loyalty Transaction methods
  async createLoyaltyTransaction(transactionData: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const result = await this.db.insert(loyaltyTransactions).values(transactionData).returning();
    return result[0];
  }

  async getLoyaltyTransactions(cardId: string): Promise<LoyaltyTransaction[]> {
    return await this.db.select().from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.cardId, cardId))
      .orderBy(desc(loyaltyTransactions.createdAt));
  }

  async getAllLoyaltyTransactions(limit?: number): Promise<LoyaltyTransaction[]> {
    let query = this.db.select().from(loyaltyTransactions).orderBy(desc(loyaltyTransactions.createdAt));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }

  // Loyalty Reward methods
  async createLoyaltyReward(rewardData: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const result = await this.db.insert(loyaltyRewards).values(rewardData).returning();
    return result[0];
  }

  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return await this.db.select().from(loyaltyRewards).where(eq(loyaltyRewards.isActive, 1));
  }

  async getLoyaltyReward(id: string): Promise<LoyaltyReward | undefined> {
    const result = await this.db.select().from(loyaltyRewards).where(eq(loyaltyRewards.id, id)).limit(1);
    return result[0];
  }
}

// Create and initialize storage
let storage: IStorage;

// Use DBStorage if DATABASE_URL is available (both production and development)
if (process.env.DATABASE_URL) {
  // Use PostgreSQL database
  const dbStorage = new DBStorage();
  await dbStorage.initialize();
  storage = dbStorage;
  console.log("✅ Using DBStorage with PostgreSQL database");
} else {
  // Fallback: Use in-memory storage (limited functionality)
  storage = new MemStorage();
  console.log("⚠️  Using MemStorage (in-memory) - Customer features disabled");
}

// Export storage - initialized and ready to use
export { storage };