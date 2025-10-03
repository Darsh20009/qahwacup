import type { Express } from "express";
import { db } from "@shared/schema";
import { customers, employees, loyaltyCards, orders, orderItems, coffeeItems } from "@shared/schema";
import type { InsertCustomer, InsertEmployee, InsertOrder, InsertOrderItem, Customer, Employee, Order, OrderItem, CoffeeItem, LoyaltyCard, InsertLoyaltyCard } from "@shared/schema";

export function registerRoutes(app: Express) {
  // Routes will be implemented from storage.ts
}