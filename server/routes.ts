import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertCartItemSchema, insertEmployeeSchema, type PaymentMethod } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // EMPLOYEE ROUTES
  
  // Employee login
  app.post("/api/employees/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const employee = await storage.getEmployeeByUsername(username);
      
      if (!employee || employee.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Don't send password back
      const { password: _, ...employeeData } = employee;
      res.json(employeeData);
    } catch (error) {
      console.error("Error during employee login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get employee by ID
  app.get("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployee(id);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Don't send password back
      const { password: _, ...employeeData } = employee;
      res.json(employeeData);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  // Create new employee (admin only - you might want to add auth middleware)
  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      
      // Check if username already exists
      const existing = await storage.getEmployeeByUsername(validatedData.username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const employee = await storage.createEmployee(validatedData);
      
      // Don't send password back
      const { password: _, ...employeeData } = employee;
      res.status(201).json(employeeData);
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  // Get all employees
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      
      // Don't send passwords back
      const employeesData = employees.map(emp => {
        const { password: _, ...data } = emp;
        return data;
      });
      
      res.json(employeesData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  // COFFEE ROUTES
  
  // Get all coffee items
  app.get("/api/coffee-items", async (req, res) => {
    try {
      const items = await storage.getCoffeeItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching coffee items:", error);
      res.status(500).json({ error: "Failed to fetch coffee items" });
    }
  });

  // Get coffee items by category
  app.get("/api/coffee-items/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const items = await storage.getCoffeeItemsByCategory(category);
      res.json(items);
    } catch (error) {
      console.error("Error fetching coffee items by category:", error);
      res.status(500).json({ error: "Failed to fetch coffee items by category" });
    }
  });

  // Get specific coffee item
  app.get("/api/coffee-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getCoffeeItem(id);
      if (!item) {
        return res.status(404).json({ error: "Coffee item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching coffee item:", error);
      res.status(500).json({ error: "Failed to fetch coffee item" });
    }
  });

  // Get cart items for session - OPTIMIZED
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const cartItems = await storage.getCartItems(sessionId);
      
      if (cartItems.length === 0) {
        return res.json([]);
      }
      
      // Get all coffee items once instead of multiple queries
      const allCoffeeItems = await storage.getCoffeeItems();
      const coffeeItemsMap = new Map(allCoffeeItems.map(item => [item.id, item]));
      
      // Enrich cart items with coffee details efficiently
      const enrichedItems = cartItems.map((cartItem) => ({
        ...cartItem,
        coffeeItem: coffeeItemsMap.get(cartItem.coffeeItemId)
      })).filter(item => item.coffeeItem); // Filter out items where coffee doesn't exist
      
      res.json(enrichedItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      
      // Verify coffee item exists
      const coffeeItem = await storage.getCoffeeItem(validatedData.coffeeItemId);
      if (!coffeeItem) {
        return res.status(404).json({ error: "Coffee item not found" });
      }

      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  // Update cart item quantity
  app.put("/api/cart/:sessionId/:coffeeItemId", async (req, res) => {
    try {
      const { sessionId, coffeeItemId } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItemQuantity(sessionId, coffeeItemId, quantity);
      if (!updatedItem && quantity > 0) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json(updatedItem || { message: "Item removed from cart" });
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      res.status(500).json({ error: "Failed to update cart item quantity" });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:sessionId/:coffeeItemId", async (req, res) => {
    try {
      const { sessionId, coffeeItemId } = req.params;
      const removed = await storage.removeFromCart(sessionId, coffeeItemId);
      
      if (!removed) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ error: "Failed to remove item from cart" });
    }
  });

  // Clear entire cart
  app.delete("/api/cart/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      
      // Validate payment method
      const validPaymentMethods: PaymentMethod[] = ['cash', 'stc', 'alinma', 'ur', 'barq', 'rajhi'];
      if (!validPaymentMethods.includes(validatedData.paymentMethod as PaymentMethod)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      // Validate order items and calculate total
      const orderItems = Array.isArray(validatedData.items) ? validatedData.items : [];
      let calculatedTotal = 0;

      for (const item of orderItems) {
        if (typeof item !== 'object' || !item.coffeeItemId || !item.quantity || !item.price) {
          return res.status(400).json({ error: "Invalid order item format" });
        }
        
        const coffeeItem = await storage.getCoffeeItem(item.coffeeItemId);
        if (!coffeeItem) {
          return res.status(400).json({ error: `Coffee item ${item.coffeeItemId} not found` });
        }
        
        calculatedTotal += parseFloat(item.price) * item.quantity;
      }

      // Verify total matches
      const requestedTotal = parseFloat(validatedData.totalAmount);
      if (Math.abs(calculatedTotal - requestedTotal) > 0.01) {
        return res.status(400).json({ error: "Total amount mismatch" });
      }

      const order = await storage.createOrder(validatedData);

      // Create individual order items for tracking
      for (const item of orderItems) {
        await storage.createOrderItem({
          orderId: order.id,
          coffeeItemId: item.coffeeItemId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: (parseFloat(item.price) * item.quantity).toString()
        });
      }

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Get order items
      const orderItems = await storage.getOrderItems(id);
      
      res.json({
        ...order,
        orderItems
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Get order by number
  app.get("/api/orders/number/:orderNumber", async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const order = await storage.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Get order items
      const orderItems = await storage.getOrderItems(order.id);
      
      res.json({
        ...order,
        orderItems
      });
    } catch (error) {
      console.error("Error fetching order by number:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Update order status
  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  
  // Get all orders (for employees)
  app.get("/api/orders", async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      const offsetNum = offset ? parseInt(offset as string) : undefined;
      
      const orders = await storage.getOrders(limitNum, offsetNum);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get payment method details
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const paymentMethods = [
        { id: 'cash', nameAr: 'الدفع نقداً', nameEn: 'Cash Payment', details: 'ادفع عند الاستلام', icon: 'fas fa-money-bill-wave' },
        { id: 'stc', nameAr: 'STC Pay', nameEn: 'STC Pay', details: '0532441566', icon: 'fas fa-mobile-alt' },
        { id: 'alinma', nameAr: 'Alinma Pay', nameEn: 'Alinma Pay', details: '0532441566', icon: 'fas fa-credit-card' },
        { id: 'ur', nameAr: 'Ur Pay', nameEn: 'Ur Pay', details: '0532441566', icon: 'fas fa-university' },
        { id: 'barq', nameAr: 'Barq', nameEn: 'Barq', details: '0532441566', icon: 'fas fa-bolt' },
        { id: 'rajhi', nameAr: 'بنك الراجحي', nameEn: 'Al Rajhi Bank', details: 'SA78 8000 0539 6080 1942 4738', icon: 'fas fa-building-columns' },
      ];

      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
