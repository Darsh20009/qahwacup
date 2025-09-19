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
  customerInfo: jsonb("customer_info"), // Optional customer details
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

// TypeScript Types
export type CoffeeItem = typeof coffeeItems.$inferSelect;
export type InsertCoffeeItem = z.infer<typeof insertCoffeeItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Payment Method Types
export type PaymentMethod = 'cash' | 'stc' | 'alinma' | 'ur' | 'barq' | 'rajhi';

export interface PaymentMethodInfo {
  id: PaymentMethod;
  nameAr: string;
  nameEn: string;
  details: string;
  icon: string;
}

// Order Status Types
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Coffee Categories
export type CoffeeCategory = 'basic' | 'hot' | 'cold' | 'specialty';

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
