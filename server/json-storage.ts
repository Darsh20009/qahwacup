import fs from 'fs';
import path from 'path';
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
  type DiscountCode,
  type InsertDiscountCode,
  type LoyaltyCard,
  type InsertLoyaltyCard,
  type CardCode,
  type InsertCardCode,
  type LoyaltyTransaction,
  type InsertLoyaltyTransaction,
  type LoyaltyReward,
  type InsertLoyaltyReward,
  type Ingredient,
  type InsertIngredient,
  type CoffeeItemIngredient,
  type InsertCoffeeItemIngredient,
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import type { IStorage } from "./storage";

const DATA_DIR = path.join(process.cwd(), 'data');
const LOGS_DIR = path.join(DATA_DIR, 'logs');

// تأكد من وجود المجلدات
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

interface AuditLog {
  timestamp: string;
  action: string;
  entity: string;
  entityId?: string;
  details: any;
  user?: string;
}

export class JsonStorage implements IStorage {
  private dataPath = (filename: string) => path.join(DATA_DIR, `${filename}.json`);
  private orderCounter = 1;

  constructor() {
    this.initializeStorage();
  }

  // نظام Audit Logging الإبداعي
  private log(action: string, entity: string, entityId: string | undefined, details: any, user?: string) {
    const timestamp = new Date().toISOString();
    const logEntry: AuditLog = {
      timestamp,
      action,
      entity,
      entityId,
      details,
      user
    };

    const logDate = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOGS_DIR, `activity-${logDate}.json`);
    
    let logs: AuditLog[] = [];
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf-8');
      logs = JSON.parse(content);
    }
    
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

    // طباعة log ملون في الكونسول
    const emoji = this.getActionEmoji(action);
    console.log(`${emoji} [${entity}] ${action}: ${entityId || 'N/A'} - ${JSON.stringify(details).substring(0, 100)}`);
  }

  private getActionEmoji(action: string): string {
    const emojiMap: Record<string, string> = {
      'CREATE': '✨',
      'UPDATE': '🔄',
      'DELETE': '🗑️',
      'READ': '👁️',
      'LOGIN': '🔐',
      'ORDER': '📦',
      'PAYMENT': '💰',
      'CART': '🛒',
      'LOYALTY': '⭐'
    };
    return emojiMap[action] || '📝';
  }

  private readData<T>(filename: string): T[] {
    const filePath = this.dataPath(filename);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private writeData<T>(filename: string, data: T[]) {
    const filePath = this.dataPath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  private async initializeStorage() {
    // تهيئة ملفات JSON
    const files = [
      'users', 'employees', 'customers', 'coffeeItems', 
      'orders', 'orderItems', 'cartItems', 'discountCodes',
      'loyaltyCards', 'cardCodes', 'loyaltyTransactions', 
      'loyaltyRewards', 'ingredients', 'coffeeItemIngredients'
    ];

    for (const file of files) {
      const filePath = this.dataPath(file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    }

    await this.initializeCoffeeMenu();
    await this.initializeDemoEmployee();
    
    this.log('INIT', 'SYSTEM', undefined, { message: 'نظام التخزين JSON تم تشغيله بنجاح' });
  }

  private async initializeCoffeeMenu() {
    const items = this.readData<CoffeeItem>('coffeeItems');
    
    const newItemIds = ["turkish-coffee", "french-press", "coffee-dessert-cup"];
    
    for (const itemId of newItemIds) {
      const exists = items.find(item => item.id === itemId);
      
      if (!exists) {
        const newItems: Record<string, any> = {
          "turkish-coffee": { 
            id: "turkish-coffee", 
            nameAr: "قهوة تركي", 
            nameEn: "Turkish Coffee", 
            description: "قهوة تركية تقليدية محضرة بطريقة عريقة، غنية بالنكهة والتراث", 
            price: "5.00", 
            oldPrice: null, 
            category: "basic", 
            imageUrl: "/attached_assets/Screenshot 2025-10-05 003822_1759666311817.png", 
            isAvailable: 1, 
            coffeeStrength: "medium", 
            strengthLevel: 6,
            availabilityStatus: "available"
          },
          "french-press": { 
            id: "french-press", 
            nameAr: "قهوة فرنسي", 
            nameEn: "French Press Coffee", 
            description: "قهوة فرنسية فاخرة محضرة بطريقة الكبس الفرنسي، تمنحك نكهة غنية ومميزة", 
            price: "6.00", 
            oldPrice: null, 
            category: "hot", 
            imageUrl: "/attached_assets/Screenshot 2025-10-05 003844_1759666320914.png", 
            isAvailable: 1, 
            coffeeStrength: "medium", 
            strengthLevel: 6,
            availabilityStatus: "available"
          },
          "coffee-dessert-cup": { 
            id: "coffee-dessert-cup", 
            nameAr: "حلى قهوة كوب", 
            nameEn: "Coffee Dessert Cup", 
            description: "حلى قهوة فاخر في كوب، طبقات من الكريمة والقهوة والبسكويت المطحون، تجربة حلوة لا تُنسى", 
            price: "8.00", 
            oldPrice: null, 
            category: "desserts", 
            imageUrl: "/attached_assets/Screenshot 2025-10-05 012338_1759666320915.png", 
            isAvailable: 1, 
            coffeeStrength: "classic", 
            strengthLevel: null,
            availabilityStatus: "available"
          }
        };
        
        items.push(newItems[itemId] as CoffeeItem);
        this.log('CREATE', 'COFFEE_ITEM', itemId, { nameAr: newItems[itemId].nameAr });
      }
    }

    if (items.length === 0) {
      const coffeeMenuData: CoffeeItem[] = [
        { id: "espresso-single", nameAr: "إسبريسو (شوت)", nameEn: "Espresso Single", description: "قهوة إسبريسو مركزة من حبوب عربية مختارة", price: "4.00", oldPrice: "5.00", category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 10, availabilityStatus: "available" },
        { id: "espresso-double", nameAr: "إسبريسو (دبل شوت)", nameEn: "Espresso Double", description: "قهوة إسبريسو مضاعفة للباحثين عن النكهة القوية", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 12, availabilityStatus: null },
        { id: "americano", nameAr: "أمريكانو", nameEn: "Americano", description: "إسبريسو مخفف بالماء الساخن لطعم معتدل", price: "5.00", oldPrice: "6.00", category: "basic", imageUrl: "/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757426884660.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 3, availabilityStatus: null },
        { id: "cafe-latte", nameAr: "كافيه لاتيه", nameEn: "Cafe Latte", description: "إسبريسو مع حليب مخفوق كريمي ورغوة ناعمة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null, availabilityStatus: null },
        { id: "cappuccino", nameAr: "كابتشينو", nameEn: "Cappuccino", description: "مزيج متوازن من الإسبريسو والحليب والرغوة", price: "5.00", oldPrice: "6.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191916_1757434923575.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null, availabilityStatus: null },
        { id: "mocha", nameAr: "موكا", nameEn: "Mocha", description: "مزيج رائع من القهوة والشوكولاتة والحليب", price: "7.00", oldPrice: "8.00", category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191928_1757434923575.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 6, availabilityStatus: null },
        { id: "iced-latte", nameAr: "آيسد لاتيه", nameEn: "Iced Latte", description: "لاتيه منعش مع الثلج والحليب البارد", price: "6.00", oldPrice: "7.00", category: "cold", imageUrl: "/attached_assets/generated_images/Luxury_iced_coffee_drink_571860f5.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: null, availabilityStatus: null },
      ];
      items.push(...coffeeMenuData);
      this.log('CREATE', 'COFFEE_MENU', 'initial', { count: coffeeMenuData.length });
    }

    this.writeData('coffeeItems', items);
  }

  private async initializeDemoEmployee() {
    const employees = this.readData<Employee>('employees');
    const exists = employees.find(emp => emp.username === 'darwish');
    
    if (!exists) {
      const hashedPassword = bcrypt.hashSync('2009', 10);
      const demoEmployee: Employee = {
        id: 'demo-employee-1',
        username: 'darwish',
        password: hashedPassword,
        fullName: 'يوسف درويش',
        role: 'manager',
        title: 'مدير المقهى',
      };
      employees.push(demoEmployee);
      this.writeData('employees', employees);
      this.log('CREATE', 'EMPLOYEE', 'demo-employee-1', { username: 'darwish', role: 'manager' });
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const users = this.readData<User>('users');
    return users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = this.readData<User>('users');
    return users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const users = this.readData<User>('users');
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: User = {
      id: randomUUID(),
      ...user,
      password: hashedPassword,
    };
    users.push(newUser);
    this.writeData('users', users);
    this.log('CREATE', 'USER', newUser.id, { username: user.username });
    return newUser;
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    const employees = this.readData<Employee>('employees');
    return employees.find(e => e.id === id);
  }

  async getEmployeeByUsername(username: string): Promise<Employee | undefined> {
    const employees = this.readData<Employee>('employees');
    return employees.find(e => e.username === username);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const employees = this.readData<Employee>('employees');
    const hashedPassword = await bcrypt.hash(insertEmployee.password, 10);
    const newEmployee: Employee = {
      id: randomUUID(),
      ...insertEmployee,
      password: hashedPassword,
    };
    employees.push(newEmployee);
    this.writeData('employees', employees);
    this.log('CREATE', 'EMPLOYEE', newEmployee.id, { username: insertEmployee.username, role: insertEmployee.role });
    return newEmployee;
  }

  async getEmployees(): Promise<Employee[]> {
    return this.readData<Employee>('employees');
  }

  // Discount Code methods
  async createDiscountCode(insertDiscountCode: InsertDiscountCode): Promise<DiscountCode> {
    const codes = this.readData<DiscountCode>('discountCodes');
    const newCode: DiscountCode = {
      id: randomUUID(),
      usageCount: 0,
      isActive: 1,
      ...insertDiscountCode,
    };
    codes.push(newCode);
    this.writeData('discountCodes', codes);
    this.log('CREATE', 'DISCOUNT_CODE', newCode.id, { code: insertDiscountCode.code, discount: insertDiscountCode.discountPercentage });
    return newCode;
  }

  async getDiscountCode(id: string): Promise<DiscountCode | undefined> {
    const codes = this.readData<DiscountCode>('discountCodes');
    return codes.find(c => c.id === id);
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const codes = this.readData<DiscountCode>('discountCodes');
    return codes.find(c => c.code === code);
  }

  async getDiscountCodes(): Promise<DiscountCode[]> {
    return this.readData<DiscountCode>('discountCodes');
  }

  async getDiscountCodesByEmployee(employeeId: string): Promise<DiscountCode[]> {
    const codes = this.readData<DiscountCode>('discountCodes');
    return codes.filter(c => c.employeeId === employeeId);
  }

  async updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode | undefined> {
    const codes = this.readData<DiscountCode>('discountCodes');
    const index = codes.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    codes[index] = { ...codes[index], ...updates };
    this.writeData('discountCodes', codes);
    this.log('UPDATE', 'DISCOUNT_CODE', id, updates);
    return codes[index];
  }

  async incrementDiscountCodeUsage(id: string): Promise<DiscountCode | undefined> {
    const code = await this.getDiscountCode(id);
    if (!code) return undefined;
    return this.updateDiscountCode(id, { usageCount: (code.usageCount || 0) + 1 });
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    const customers = this.readData<Customer>('customers');
    return customers.find(c => c.id === id);
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const customers = this.readData<Customer>('customers');
    return customers.find(c => c.phone === phone);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const customers = this.readData<Customer>('customers');
    const newCustomer: Customer = {
      id: randomUUID(),
      ...customer,
    };
    customers.push(newCustomer);
    this.writeData('customers', customers);
    this.log('CREATE', 'CUSTOMER', newCustomer.id, { phone: customer.phone });
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customers = this.readData<Customer>('customers');
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    customers[index] = { ...customers[index], ...updates };
    this.writeData('customers', customers);
    this.log('UPDATE', 'CUSTOMER', id, updates);
    return customers[index];
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const orders = this.readData<Order>('orders');
    return orders.filter(o => o.customerId === customerId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Coffee Item methods
  async getCoffeeItems(): Promise<CoffeeItem[]> {
    return this.readData<CoffeeItem>('coffeeItems');
  }

  async getCoffeeItem(id: string): Promise<CoffeeItem | undefined> {
    const items = this.readData<CoffeeItem>('coffeeItems');
    return items.find(i => i.id === id);
  }

  async getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]> {
    const items = this.readData<CoffeeItem>('coffeeItems');
    return items.filter(i => i.category === category);
  }

  async createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem> {
    const items = this.readData<CoffeeItem>('coffeeItems');
    const newItem: CoffeeItem = {
      id: randomUUID(),
      isAvailable: 1,
      availabilityStatus: null,
      ...item,
    };
    items.push(newItem);
    this.writeData('coffeeItems', items);
    this.log('CREATE', 'COFFEE_ITEM', newItem.id, { nameAr: item.nameAr });
    return newItem;
  }

  async updateCoffeeItem(id: string, updates: Partial<CoffeeItem>): Promise<CoffeeItem | undefined> {
    const items = this.readData<CoffeeItem>('coffeeItems');
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    
    items[index] = { ...items[index], ...updates };
    this.writeData('coffeeItems', items);
    this.log('UPDATE', 'COFFEE_ITEM', id, updates);
    return items[index];
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const orders = this.readData<Order>('orders');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `C${timestamp}${random}`;
    
    const newOrder: Order = {
      id: randomUUID(),
      orderNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...order,
    };
    orders.push(newOrder);
    this.writeData('orders', orders);
    this.log('ORDER', 'ORDER', newOrder.id, { orderNumber, total: order.totalAmount, payment: order.paymentMethod });
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const orders = this.readData<Order>('orders');
    return orders.find(o => o.id === id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const orders = this.readData<Order>('orders');
    return orders.find(o => o.orderNumber === orderNumber);
  }

  async updateOrderStatus(id: string, status: string, cancellationReason?: string): Promise<Order | undefined> {
    const orders = this.readData<Order>('orders');
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    
    orders[index] = { 
      ...orders[index], 
      status,
      cancellationReason: cancellationReason || orders[index].cancellationReason
    };
    this.writeData('orders', orders);
    this.log('UPDATE', 'ORDER_STATUS', id, { status, cancellationReason });
    return orders[index];
  }

  async getOrders(limit?: number, offset?: number): Promise<Order[]> {
    const orders = this.readData<Order>('orders');
    const sorted = orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    if (limit !== undefined && offset !== undefined) {
      return sorted.slice(offset, offset + limit);
    }
    return sorted;
  }

  // Order Item methods
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const items = this.readData<OrderItem>('orderItems');
    const newItem: OrderItem = {
      id: randomUUID(),
      ...orderItem,
    };
    items.push(newItem);
    this.writeData('orderItems', items);
    return newItem;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const items = this.readData<OrderItem>('orderItems');
    return items.filter(i => i.orderId === orderId);
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    const items = this.readData<CartItem>('cartItems');
    return items.filter(i => i.sessionId === sessionId);
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const items = this.readData<CartItem>('cartItems');
    const existingIndex = items.findIndex(
      i => i.sessionId === cartItem.sessionId && i.coffeeItemId === cartItem.coffeeItemId
    );

    if (existingIndex !== -1) {
      items[existingIndex].quantity += cartItem.quantity;
      this.writeData('cartItems', items);
      this.log('CART', 'CART_UPDATE', items[existingIndex].id, { quantity: items[existingIndex].quantity });
      return items[existingIndex];
    }

    const newItem: CartItem = {
      id: randomUUID(),
      ...cartItem,
    };
    items.push(newItem);
    this.writeData('cartItems', items);
    this.log('CART', 'CART_ADD', newItem.id, { coffeeItemId: cartItem.coffeeItemId, quantity: cartItem.quantity });
    return newItem;
  }

  async updateCartItemQuantity(sessionId: string, coffeeItemId: string, quantity: number): Promise<CartItem | undefined> {
    const items = this.readData<CartItem>('cartItems');
    const index = items.findIndex(
      i => i.sessionId === sessionId && i.coffeeItemId === coffeeItemId
    );
    
    if (index === -1) return undefined;
    
    items[index].quantity = quantity;
    this.writeData('cartItems', items);
    this.log('CART', 'CART_UPDATE', items[index].id, { quantity });
    return items[index];
  }

  async removeFromCart(sessionId: string, coffeeItemId: string): Promise<boolean> {
    const items = this.readData<CartItem>('cartItems');
    const filtered = items.filter(
      i => !(i.sessionId === sessionId && i.coffeeItemId === coffeeItemId)
    );
    
    if (filtered.length === items.length) return false;
    
    this.writeData('cartItems', filtered);
    this.log('CART', 'CART_REMOVE', undefined, { sessionId, coffeeItemId });
    return true;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const items = this.readData<CartItem>('cartItems');
    const filtered = items.filter(i => i.sessionId !== sessionId);
    this.writeData('cartItems', filtered);
    this.log('CART', 'CART_CLEAR', undefined, { sessionId });
    return true;
  }

  // Loyalty Card methods
  async createLoyaltyCard(card: InsertLoyaltyCard): Promise<LoyaltyCard> {
    const cards = this.readData<LoyaltyCard>('loyaltyCards');
    const newCard: LoyaltyCard = {
      id: randomUUID(),
      ...card,
    };
    cards.push(newCard);
    this.writeData('loyaltyCards', cards);
    this.log('LOYALTY', 'CARD_CREATE', newCard.id, { phone: card.phoneNumber });
    return newCard;
  }

  async getLoyaltyCard(id: string): Promise<LoyaltyCard | undefined> {
    const cards = this.readData<LoyaltyCard>('loyaltyCards');
    return cards.find(c => c.id === id);
  }

  async getLoyaltyCardByQRToken(qrToken: string): Promise<LoyaltyCard | undefined> {
    const cards = this.readData<LoyaltyCard>('loyaltyCards');
    return cards.find(c => c.qrToken === qrToken);
  }

  async getLoyaltyCardByCardNumber(cardNumber: string): Promise<LoyaltyCard | undefined> {
    const cards = this.readData<LoyaltyCard>('loyaltyCards');
    return cards.find(c => c.cardNumber === cardNumber);
  }

  async getLoyaltyCardByPhone(phoneNumber: string): Promise<LoyaltyCard | undefined> {
    const cards = this.readData<LoyaltyCard>('loyaltyCards');
    return cards.find(c => c.phoneNumber === phoneNumber);
  }

  async getLoyaltyCards(): Promise<LoyaltyCard[]> {
    return this.readData<LoyaltyCard>('loyaltyCards');
  }

  async updateLoyaltyCard(id: string, updates: Partial<LoyaltyCard>): Promise<LoyaltyCard | undefined> {
    const cards = this.readData<LoyaltyCard>('loyaltyCards');
    const index = cards.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    cards[index] = { ...cards[index], ...updates };
    this.writeData('loyaltyCards', cards);
    this.log('LOYALTY', 'CARD_UPDATE', id, updates);
    return cards[index];
  }

  // Card Code methods
  async generateCodesForOrder(orderId: string, drinks: Array<{name: string, quantity: number}>): Promise<CardCode[]> {
    const codes = this.readData<CardCode>('cardCodes');
    const newCodes: CardCode[] = [];
    
    for (const drink of drinks) {
      for (let i = 0; i < drink.quantity; i++) {
        const code = nanoid(10).toUpperCase();
        const newCode: CardCode = {
          id: randomUUID(),
          code,
          drinkName: drink.name,
          orderId,
          isRedeemed: 0,
          createdAt: new Date().toISOString(),
          redeemedAt: null,
          redeemedByCardId: null,
        };
        newCodes.push(newCode);
        codes.push(newCode);
      }
    }
    
    this.writeData('cardCodes', codes);
    this.log('LOYALTY', 'CODES_GENERATE', orderId, { count: newCodes.length });
    return newCodes;
  }

  async redeemCode(code: string, cardId: string): Promise<{success: boolean, message: string, card?: LoyaltyCard}> {
    const codes = this.readData<CardCode>('cardCodes');
    const codeIndex = codes.findIndex(c => c.code === code);
    
    if (codeIndex === -1) {
      return { success: false, message: 'الكود غير صحيح' };
    }
    
    if (codes[codeIndex].isRedeemed === 1) {
      return { success: false, message: 'هذا الكود مستخدم مسبقاً' };
    }
    
    codes[codeIndex] = {
      ...codes[codeIndex],
      isRedeemed: 1,
      redeemedAt: new Date().toISOString(),
      redeemedByCardId: cardId,
    };
    this.writeData('cardCodes', codes);
    
    const card = await this.getLoyaltyCard(cardId);
    if (!card) {
      return { success: false, message: 'البطاقة غير موجودة' };
    }
    
    const updatedCard = await this.updateLoyaltyCard(cardId, {
      currentStamps: card.currentStamps + 1,
    });
    
    this.log('LOYALTY', 'CODE_REDEEM', code, { cardId, newStamps: updatedCard?.currentStamps });
    return { success: true, message: 'تم إضافة ختم بنجاح', card: updatedCard };
  }

  async getCodesByOrder(orderId: string): Promise<CardCode[]> {
    const codes = this.readData<CardCode>('cardCodes');
    return codes.filter(c => c.orderId === orderId);
  }

  async getCodeDetails(code: string): Promise<CardCode | undefined> {
    const codes = this.readData<CardCode>('cardCodes');
    return codes.find(c => c.code === code);
  }

  // Loyalty Transaction methods
  async createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const transactions = this.readData<LoyaltyTransaction>('loyaltyTransactions');
    const newTransaction: LoyaltyTransaction = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...transaction,
    };
    transactions.push(newTransaction);
    this.writeData('loyaltyTransactions', transactions);
    this.log('LOYALTY', 'TRANSACTION', newTransaction.id, { type: transaction.type, points: transaction.pointsChange });
    return newTransaction;
  }

  async getLoyaltyTransactions(cardId: string): Promise<LoyaltyTransaction[]> {
    const transactions = this.readData<LoyaltyTransaction>('loyaltyTransactions');
    return transactions.filter(t => t.cardId === cardId).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getAllLoyaltyTransactions(limit?: number): Promise<LoyaltyTransaction[]> {
    const transactions = this.readData<LoyaltyTransaction>('loyaltyTransactions');
    const sorted = transactions.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (limit) {
      return sorted.slice(0, limit);
    }
    return sorted;
  }

  // Loyalty Reward methods
  async createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const rewards = this.readData<LoyaltyReward>('loyaltyRewards');
    const newReward: LoyaltyReward = {
      id: randomUUID(),
      isActive: 1,
      ...reward,
    };
    rewards.push(newReward);
    this.writeData('loyaltyRewards', rewards);
    this.log('LOYALTY', 'REWARD_CREATE', newReward.id, { nameAr: reward.nameAr, stampsRequired: reward.stampsRequired });
    return newReward;
  }

  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return this.readData<LoyaltyReward>('loyaltyRewards');
  }

  async getLoyaltyReward(id: string): Promise<LoyaltyReward | undefined> {
    const rewards = this.readData<LoyaltyReward>('loyaltyRewards');
    return rewards.find(r => r.id === id);
  }

  // Ingredient methods
  async getIngredients(): Promise<Ingredient[]> {
    return this.readData<Ingredient>('ingredients');
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const ingredients = this.readData<Ingredient>('ingredients');
    const newIngredient: Ingredient = {
      id: randomUUID(),
      isAvailable: 1,
      ...ingredient,
    };
    ingredients.push(newIngredient);
    this.writeData('ingredients', ingredients);
    this.log('CREATE', 'INGREDIENT', newIngredient.id, { nameAr: ingredient.nameAr });
    return newIngredient;
  }

  async updateIngredientAvailability(id: string, isAvailable: number): Promise<Ingredient | undefined> {
    const ingredients = this.readData<Ingredient>('ingredients');
    const index = ingredients.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    
    ingredients[index].isAvailable = isAvailable;
    this.writeData('ingredients', ingredients);
    this.log('UPDATE', 'INGREDIENT_AVAILABILITY', id, { isAvailable });
    return ingredients[index];
  }

  async getCoffeeItemIngredients(coffeeItemId: string): Promise<CoffeeItemIngredient[]> {
    const relations = this.readData<CoffeeItemIngredient>('coffeeItemIngredients');
    return relations.filter(r => r.coffeeItemId === coffeeItemId);
  }

  async addCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<CoffeeItemIngredient> {
    const relations = this.readData<CoffeeItemIngredient>('coffeeItemIngredients');
    const newRelation: CoffeeItemIngredient = {
      id: randomUUID(),
      coffeeItemId,
      ingredientId,
    };
    relations.push(newRelation);
    this.writeData('coffeeItemIngredients', relations);
    this.log('CREATE', 'COFFEE_INGREDIENT', newRelation.id, { coffeeItemId, ingredientId });
    return newRelation;
  }

  async removeCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<void> {
    const relations = this.readData<CoffeeItemIngredient>('coffeeItemIngredients');
    const filtered = relations.filter(
      r => !(r.coffeeItemId === coffeeItemId && r.ingredientId === ingredientId)
    );
    this.writeData('coffeeItemIngredients', filtered);
    this.log('DELETE', 'COFFEE_INGREDIENT', undefined, { coffeeItemId, ingredientId });
  }

  async getCoffeeItemsByIngredient(ingredientId: string): Promise<CoffeeItem[]> {
    const relations = this.readData<CoffeeItemIngredient>('coffeeItemIngredients');
    const items = this.readData<CoffeeItem>('coffeeItems');
    
    const coffeeItemIds = relations
      .filter(r => r.ingredientId === ingredientId)
      .map(r => r.coffeeItemId);
    
    return items.filter(item => coffeeItemIds.includes(item.id));
  }
}
