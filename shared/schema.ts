import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coffee Items Schema
export const coffeeItems = pgTable("coffee_items", {
  id: varchar("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  oldPrice: decimal("old_price", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 50 }).notNull(), // 'basic', 'hot', 'cold'
  imageUrl: text("image_url"),
  isAvailable: integer("is_available").default(1).notNull(),
  // Coffee strength properties
  coffeeStrength: varchar("coffee_strength", { length: 20 }).default("classic"), // 'classic', 'mild', 'medium', 'strong'
  strengthLevel: integer("strength_level"), // 1-4 mild, 4-8 medium, 8-12 strong, null for classic
});

// Customers Schema - العملاء
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Employees Schema
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'manager', 'cashier'
  title: text("title"), // اللقب أو البرستيج
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Discount Codes Schema - كودات الخصم
export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  discountPercentage: integer("discount_percentage").notNull(), // 5, 10, 15, etc.
  reason: text("reason").notNull(), // سبب الخصم
  employeeId: varchar("employee_id").references(() => employees.id).notNull(), // الموظف الذي أنشأ الكود
  isActive: integer("is_active").default(1).notNull(), // 0 = inactive, 1 = active
  usageCount: integer("usage_count").default(0).notNull(), // عدد مرات الاستخدام
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders Schema
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(),
  items: jsonb("items").notNull(), // Array of order items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentDetails: text("payment_details"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'confirmed', 'completed', 'cancelled'
  customerInfo: jsonb("customer_info"), // Customer details: {name, phone} - legacy field
  customerId: varchar("customer_id").references(() => customers.id), // العميل المسجل
  employeeId: varchar("employee_id").references(() => employees.id), // الموظف الذي أنشأ الطلب
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order Items Schema (for detailed tracking)
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  coffeeItemId: varchar("coffee_item_id").references(() => coffeeItems.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Cart Items Schema (for session storage)
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(), // Browser session identifier
  coffeeItemId: varchar("coffee_item_id").references(() => coffeeItems.id).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas for validation
export const insertCoffeeItemSchema = createInsertSchema(coffeeItems).omit({
  id: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  usageCount: true,
  createdAt: true,
});

// TypeScript Types
export type CoffeeItem = typeof coffeeItems.$inferSelect;
export type InsertCoffeeItem = z.infer<typeof insertCoffeeItemSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Payment Method Types
export type PaymentMethod = 'cash' | 'stc' | 'alinma' | 'ur' | 'barq' | 'rajhi' | 'qahwa-card';

export interface PaymentMethodInfo {
  id: PaymentMethod;
  nameAr: string;
  nameEn: string;
  details: string;
  icon: string;
}

// Employee Role Types
export type EmployeeRole = 'manager' | 'cashier';

// Order Status Types
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';

// Coffee Categories
export type CoffeeCategory = 'basic' | 'hot' | 'cold' | 'specialty';

// Coffee Strength Types
export type CoffeeStrength = 'classic' | 'mild' | 'medium' | 'strong';

export interface CoffeeStrengthInfo {
  id: CoffeeStrength;
  nameAr: string;
  nameEn: string;
  description: string;
  levelRange: string;
  color: string;
  icon: string;
}

// Loyalty Cards Schema - بطاقات الولاء
export const loyaltyCards = pgTable("loyalty_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name"), // اختياري الآن
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  qrToken: varchar("qr_token", { length: 100 }).notNull().unique(), // Unique QR code token
  cardNumber: varchar("card_number", { length: 20 }).notNull().unique(), // رقم البطاقة للعرض
  stamps: integer("stamps").default(0).notNull(), // الأختام (0-6، بعد 6 يحصل على كوب مجاني)
  freeCupsEarned: integer("free_cups_earned").default(0).notNull(), // عدد الأكواب المجانية المكتسبة
  freeCupsRedeemed: integer("free_cups_redeemed").default(0).notNull(), // عدد الأكواب المجانية المستخدمة
  points: integer("points").default(0).notNull(), // نقاط الولاء
  tier: varchar("tier", { length: 20 }).default("bronze").notNull(), // 'bronze', 'silver', 'gold', 'platinum'
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0").notNull(),
  discountCount: integer("discount_count").default(0).notNull(), // عدد مرات استخدام الخصم
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active', 'suspended', 'expired'
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Card Codes Schema - أكواد للاستخدام الواحد (كود لكل مشروب)
export const cardCodes = pgTable("card_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 12 }).notNull().unique(), // الكود الفريد للاستخدام مرة واحدة
  issuedForOrderId: varchar("issued_for_order_id").references(() => orders.id).notNull(), // الطلب الذي أصدر هذا الكود
  drinkName: text("drink_name").notNull(), // اسم المشروب
  isRedeemed: integer("is_redeemed").default(0).notNull(), // 0 = لم يستخدم، 1 = مستخدم
  redeemedAt: timestamp("redeemed_at"),
  redeemedByCardId: varchar("redeemed_by_card_id").references(() => loyaltyCards.id), // البطاقة التي استخدمت الكود
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Loyalty Transactions Schema - سجل معاملات النقاط
export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").references(() => loyaltyCards.id).notNull(),
  orderId: varchar("order_id").references(() => orders.id),
  type: varchar("type", { length: 20 }).notNull(), // 'earn', 'redeem', 'discount_applied', 'bonus'
  pointsChange: integer("points_change").notNull(), // موجب للكسب، سالب للاستخدام
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  orderAmount: decimal("order_amount", { precision: 10, scale: 2 }),
  description: text("description"),
  employeeId: varchar("employee_id").references(() => employees.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Loyalty Rewards Master Data - جوائز الولاء
export const loyaltyRewards = pgTable("loyalty_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  tier: varchar("tier", { length: 20 }), // null = available to all tiers
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas for Loyalty
export const insertLoyaltyCardSchema = createInsertSchema(loyaltyCards).omit({
  id: true,
  qrToken: true,
  cardNumber: true,
  stamps: true,
  freeCupsEarned: true,
  freeCupsRedeemed: true,
  points: true,
  totalSpent: true,
  discountCount: true,
  tier: true,
  status: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCardCodeSchema = createInsertSchema(cardCodes).omit({
  id: true,
  code: true,
  isRedeemed: true,
  redeemedAt: true,
  redeemedByCardId: true,
  createdAt: true,
});

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertLoyaltyRewardSchema = createInsertSchema(loyaltyRewards).omit({
  id: true,
  createdAt: true,
});

// TypeScript Types for Loyalty
export type LoyaltyCard = typeof loyaltyCards.$inferSelect;
export type InsertLoyaltyCard = z.infer<typeof insertLoyaltyCardSchema>;

export type CardCode = typeof cardCodes.$inferSelect;
export type InsertCardCode = z.infer<typeof insertCardCodeSchema>;

export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;

export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type InsertLoyaltyReward = z.infer<typeof insertLoyaltyRewardSchema>;

// Loyalty Tier Types
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTierInfo {
  id: LoyaltyTier;
  nameAr: string;
  nameEn: string;
  pointsRequired: number;
  benefits: string[];
  color: string;
  icon: string;
}

// Legacy User Schema (keeping for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
