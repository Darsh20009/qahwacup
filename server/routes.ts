import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertCartItemSchema, insertEmployeeSchema, type PaymentMethod } from "@shared/schema";
import bcrypt from "bcryptjs";

// Helper function to send WhatsApp notification
function getOrderStatusMessage(status: string, orderNumber: string): string {
  const statusMessages: Record<string, string> = {
    'pending': `⏳ طلبك رقم ${orderNumber} في الانتظار\nنحن نستعد لتجهيزه!`,
    'payment_confirmed': `💰 تم تأكيد دفع طلبك رقم ${orderNumber}\nجاري تحضيره الآن!`,
    'in_progress': `☕ طلبك رقم ${orderNumber} قيد التحضير الآن\nقهوتك في الطريق!`,
    'ready': `🎉 طلبك رقم ${orderNumber} جاهز للاستلام!\nاستمتع بقهوتك ☕`,
    'completed': `✅ تم استلام طلبك رقم ${orderNumber}\nنتمنى أن تستمتع بقهوتك!`,
    'cancelled': `❌ تم إلغاء طلبك رقم ${orderNumber}\nنأسف للإزعاج`
  };
  return statusMessages[status] || `تم تحديث حالة طلبك رقم ${orderNumber} إلى: ${status}`;
}

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

      if (!employee) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, employee.password);

      if (!isPasswordValid) {
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

  // DISCOUNT CODE ROUTES

  // Create discount code
  app.post("/api/discount-codes", async (req, res) => {
    try {
      const { insertDiscountCodeSchema } = await import("@shared/schema");
      const validatedData = insertDiscountCodeSchema.parse(req.body);

      // Check if code already exists
      const existing = await storage.getDiscountCodeByCode(validatedData.code);
      if (existing) {
        return res.status(400).json({ error: "Code already exists" });
      }

      const discountCode = await storage.createDiscountCode(validatedData);
      res.status(201).json(discountCode);
    } catch (error) {
      console.error("Error creating discount code:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error });
      }
      res.status(500).json({ error: "Failed to create discount code" });
    }
  });

  // Get discount code by code
  app.get("/api/discount-codes/by-code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const discountCode = await storage.getDiscountCodeByCode(code);

      if (!discountCode) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      if (discountCode.isActive === 0) {
        return res.status(400).json({ error: "Discount code is inactive" });
      }

      res.json(discountCode);
    } catch (error) {
      console.error("Error fetching discount code:", error);
      res.status(500).json({ error: "Failed to fetch discount code" });
    }
  });

  // Get all discount codes for an employee
  app.get("/api/discount-codes/employee/:employeeId", async (req, res) => {
    try {
      const { employeeId } = req.params;
      const codes = await storage.getDiscountCodesByEmployee(employeeId);
      res.json(codes);
    } catch (error) {
      console.error("Error fetching employee discount codes:", error);
      res.status(500).json({ error: "Failed to fetch discount codes" });
    }
  });

  // Update discount code (toggle active status only)
  app.patch("/api/discount-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, employeeId } = req.body;

      // Require employee ID for authorization
      if (!employeeId) {
        return res.status(401).json({ error: "Employee authentication required" });
      }

      // Verify the discount code exists and belongs to this employee
      const existingCode = await storage.getDiscountCode(id);
      if (!existingCode) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      if (existingCode.employeeId !== employeeId) {
        return res.status(403).json({ error: "Unauthorized: You can only update your own discount codes" });
      }

      // Only allow updating isActive field
      if (typeof isActive !== 'number' || (isActive !== 0 && isActive !== 1)) {
        return res.status(400).json({ error: "Only isActive field can be updated (0 or 1)" });
      }

      const discountCode = await storage.updateDiscountCode(id, { isActive });
      res.json(discountCode);
    } catch (error) {
      console.error("Error updating discount code:", error);
      res.status(500).json({ error: "Failed to update discount code" });
    }
  });

  // Increment discount code usage
  app.post("/api/discount-codes/:id/use", async (req, res) => {
    try {
      const { id } = req.params;

      // Check if code exists and is active first
      const code = await storage.getDiscountCode(id);
      if (!code) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      if (code.isActive === 0) {
        return res.status(400).json({ error: "Discount code is inactive" });
      }

      const discountCode = await storage.incrementDiscountCodeUsage(id);
      res.json(discountCode);
    } catch (error) {
      console.error("Error incrementing discount code usage:", error);
      res.status(500).json({ error: "Failed to use discount code" });
    }
  });

  // CUSTOMER ROUTES

  // Customer authentication (register or login with phone)
  app.post("/api/customers/auth", async (req, res) => {
    try {
      const { phone, name } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone number required" });
      }

      // Try to find existing customer
      let customer = await storage.getCustomerByPhone(phone);

      if (!customer) {
        // Create new customer
        customer = await storage.createCustomer({ phone, name });
      } else if (name && customer.name !== name) {
        // Update name if provided and different
        customer = await storage.updateCustomer(customer.id, { name }) || customer;
      }

      res.json(customer);
    } catch (error) {
      console.error("Error during customer auth:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Get customer by ID
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  // Update customer
  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const customer = await storage.updateCustomer(id, { name });

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  // Get customer orders
  app.get("/api/customers/:id/orders", async (req, res) => {
    try {
      const { id } = req.params;
      const orders = await storage.getCustomerOrders(id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
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

  // Update coffee item availability (for employees)
  app.patch("/api/coffee-items/:id/availability", async (req, res) => {
    try {
      const { id } = req.params;
      const { isAvailable, availabilityStatus } = req.body;

      const item = await storage.getCoffeeItem(id);
      if (!item) {
        return res.status(404).json({ error: "Coffee item not found" });
      }

      const updates: any = {};
      
      if (typeof isAvailable === 'number' && (isAvailable === 0 || isAvailable === 1)) {
        updates.isAvailable = isAvailable;
      }
      
      if (availabilityStatus) {
        const validStatuses = ['available', 'out_of_stock', 'coming_soon', 'temporarily_unavailable'];
        if (!validStatuses.includes(availabilityStatus)) {
          return res.status(400).json({ error: "Invalid availability status" });
        }
        updates.availabilityStatus = availabilityStatus;
        // Auto-update isAvailable based on status
        updates.isAvailable = availabilityStatus === 'available' ? 1 : 0;
      }

      const updatedItem = await storage.updateCoffeeItem(id, updates);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating coffee item availability:", error);
      res.status(500).json({ error: "Failed to update coffee item availability" });
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
      const { items, totalAmount, paymentMethod, paymentDetails, customerInfo, customerId, customerNotes, freeItemsDiscount, usedFreeDrinks } = req.body;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items are required" });
      }

      if (!totalAmount || isNaN(parseFloat(totalAmount))) {
        return res.status(400).json({ error: "Valid total amount is required" });
      }

      if (!paymentMethod) {
        return res.status(400).json({ error: "Payment method is required" });
      }

      if (!customerInfo?.customerName) {
        return res.status(400).json({ error: "Customer name is required" });
      }

      // Get or create customer if phone number provided
      let finalCustomerId = customerId;

      if (customerInfo.phoneNumber && !customerId) {
        try {
          const existingCustomer = await storage.getCustomerByPhone(customerInfo.phoneNumber);
          if (existingCustomer) {
            finalCustomerId = existingCustomer.id;
          }
        } catch (error) {
          console.log("Customer lookup failed, will create new order without customer ID");
        }
      }

      // If using qahwa-card payment method (free drinks), update loyalty card
      if (paymentMethod === 'qahwa-card' && finalCustomerId && usedFreeDrinks > 0) {
        try {
          // Get customer's loyalty card
          const customer = await storage.getCustomer(finalCustomerId);
          if (customer?.phone) {
            const loyaltyCard = await storage.getLoyaltyCardByPhone(customer.phone);
            if (loyaltyCard) {
              // Update freeCupsRedeemed
              await storage.updateLoyaltyCard(loyaltyCard.id, {
                freeCupsRedeemed: loyaltyCard.freeCupsRedeemed + usedFreeDrinks,
                lastUsedAt: new Date()
              });

              // Create loyalty transaction
              await storage.createLoyaltyTransaction({
                cardId: loyaltyCard.id,
                type: 'free_cup_redeemed',
                pointsChange: 0,
                discountAmount: freeItemsDiscount || "0.00",
                orderAmount: totalAmount,
                description: `استخدام ${usedFreeDrinks} مشروب مجاني`,
                employeeId: null
              });
            }
          }
        } catch (error) {
          console.error("Error updating loyalty card:", error);
          // Don't fail the order if loyalty card update fails
        }
      }

      // Create order - ensure freeItemsDiscount is not included if column doesn't exist
      const orderData: any = {
        customerId: finalCustomerId || null,
        totalAmount,
        paymentMethod,
        paymentDetails,
        customerInfo,
        customerNotes,
        items: JSON.stringify(items)
      };

      const order = await storage.createOrder(orderData);

      // Add stamps automatically if customer has loyalty card
      if (finalCustomerId) {
        try {
          const customer = await storage.getCustomer(finalCustomerId);
          if (customer?.phone) {
            let loyaltyCard = await storage.getLoyaltyCardByPhone(customer.phone);

            // Create loyalty card if doesn't exist
            if (!loyaltyCard) {
              loyaltyCard = await storage.createLoyaltyCard({
                customerName: customerInfo.customerName,
                phoneNumber: customer.phone
              });
            }

            // Calculate stamps (1 stamp per drink, but not for free drinks used)
            const totalDrinks = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            const stampsToAdd = paymentMethod === 'qahwa-card' ? Math.max(0, totalDrinks - usedFreeDrinks) : totalDrinks;

            if (stampsToAdd > 0) {
              const newStamps = loyaltyCard.stamps + stampsToAdd;
              const freeCupsToEarn = Math.floor(newStamps / 6);
              const remainingStamps = newStamps % 6;

              await storage.updateLoyaltyCard(loyaltyCard.id, {
                stamps: remainingStamps,
                freeCupsEarned: loyaltyCard.freeCupsEarned + freeCupsToEarn,
                totalSpent: (parseFloat(loyaltyCard.totalSpent) + parseFloat(totalAmount)).toFixed(2),
                lastUsedAt: new Date()
              });

              // Create loyalty transaction for stamps
              await storage.createLoyaltyTransaction({
                cardId: loyaltyCard.id,
                type: 'stamps_earned',
                pointsChange: stampsToAdd,
                discountAmount: "0.00",
                orderAmount: totalAmount,
                description: `اكتسبت ${stampsToAdd} ختم من الطلب`,
                employeeId: null
              });

              // Create transaction for free cups earned
              if (freeCupsToEarn > 0) {
                await storage.createLoyaltyTransaction({
                  cardId: loyaltyCard.id,
                  type: 'free_cup_earned',
                  pointsChange: 0,
                  discountAmount: "0.00",
                  orderAmount: totalAmount,
                  description: `اكتسبت ${freeCupsToEarn} قهوة مجانية!`,
                  employeeId: null
                });
              }
            }
          }
        } catch (error) {
          console.error("Error adding stamps:", error);
          // Don't fail the order if stamp addition fails
        }
      }

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
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
      const { status, cancellationReason } = req.body;

      // Valid statuses for order workflow
      const validStatuses = ['pending', 'payment_confirmed', 'in_progress', 'ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedOrder = await storage.updateOrderStatus(id, status, cancellationReason);

      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Send WhatsApp notification to customer
      try {
        const customerInfo = typeof updatedOrder.customerInfo === 'string'
          ? JSON.parse(updatedOrder.customerInfo)
          : updatedOrder.customerInfo;

        const phoneNumber = customerInfo?.phoneNumber;

        if (phoneNumber && status !== 'pending') {
          const message = getOrderStatusMessage(status, updatedOrder.orderNumber);
          // The WhatsApp URL generation logic should remain the same
          const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

          // Return WhatsApp URL in response so frontend can optionally use it
          return res.json({
            ...updatedOrder,
            whatsappNotification: {
              url: whatsappUrl,
              message: message,
              phone: phoneNumber
            }
          });
        }
      } catch (notificationError) {
        console.error("WhatsApp notification error:", notificationError);
        // Continue even if notification fails
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Get all orders (for employee dashboard)
  app.get("/api/orders", async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      const offsetNum = offset ? parseInt(offset as string) : undefined;

      const orders = await storage.getOrders(limitNum, offsetNum);
      const coffeeItems = await storage.getCoffeeItems();

      // Enrich orders with coffee item details
      const enrichedOrders = orders.map(order => {
        const items = (order.items as any[]).map(item => {
          const coffeeItem = coffeeItems.find(ci => ci.id === item.coffeeItemId);
          return {
            ...item,
            coffeeItem: coffeeItem ? {
              nameAr: coffeeItem.nameAr,
              nameEn: coffeeItem.nameEn,
              price: coffeeItem.price,
              imageUrl: coffeeItem.imageUrl
            } : null
          };
        });

        return {
          ...order,
          items
        };
      });

      return res.json(enrichedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get payment method details
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const hasFreeDrinks = req.query.hasFreeDrinks as string; // Check for hasFreeDrinks query parameter

      const paymentMethods = [
        { id: 'cash', nameAr: 'الدفع نقداً', nameEn: 'Cash Payment', details: 'ادفع عند الاستلام', icon: 'fas fa-money-bill-wave' },
        { id: 'stc', nameAr: 'STC Pay', nameEn: 'STC Pay', details: '0532441566', icon: 'fas fa-mobile-alt' },
        { id: 'alinma', nameAr: 'Alinma Pay', nameEn: 'Alinma Pay', details: '0532441566', icon: 'fas fa-credit-card' },
        { id: 'ur', nameAr: 'Ur Pay', nameEn: 'Ur Pay', details: '0532441566', icon: 'fas fa-university' },
        { id: 'barq', nameAr: 'Barq', nameEn: 'Barq', details: '0532441566', icon: 'fas fa-bolt' },
        { id: 'bank', nameAr: 'بنك الراجحي', nameEn: 'Al Rajhi Bank', details: 'SA78 8000 0539 6080 1942 4738', icon: 'fas fa-building-columns' },
      ];

      // Add qahwa-card at the beginning if customer has free drinks
      if (hasFreeDrinks === 'true') {
        paymentMethods.unshift({
          id: 'qahwa-card',
          nameAr: 'بطاقة كوبي (مجاني)',
          nameEn: 'Qahwa Card (Free)',
          details: 'استخدم مشروبك المجاني 🎁',
          icon: 'fas fa-gift'
        });
      }

      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // LOYALTY CARD ROUTES

  // Create new loyalty card (issue card to customer)
  app.post("/api/loyalty/cards", async (req, res) => {
    try {
      const { customerName, phoneNumber } = req.body;

      if (!customerName || !phoneNumber) {
        return res.status(400).json({ error: "اسم العميل ورقم الهاتف مطلوبان" });
      }

      // Check if customer already has a card
      const existingCard = await storage.getLoyaltyCardByPhone(phoneNumber);
      if (existingCard) {
        return res.status(400).json({ error: "هذا العميل لديه بطاقة ولاء مسبقاً" });
      }

      const card = await storage.createLoyaltyCard({ customerName, phoneNumber });
      res.status(201).json(card);
    } catch (error) {
      console.error("Error creating loyalty card:", error);
      res.status(500).json({ error: "فشل في إنشاء بطاقة الولاء" });
    }
  });

  // Get all loyalty cards
  app.get("/api/loyalty/cards", async (req, res) => {
    try {
      const cards = await storage.getLoyaltyCards();
      res.json(cards);
    } catch (error) {
      console.error("Error fetching loyalty cards:", error);
      res.status(500).json({ error: "فشل في جلب بطاقات الولاء" });
    }
  });

  // Get loyalty card by QR token (for scanning)
  app.get("/api/loyalty/cards/qr/:qrToken", async (req, res) => {
    try {
      const { qrToken } = req.params;
      const card = await storage.getLoyaltyCardByQRToken(qrToken);

      if (!card) {
        return res.status(404).json({ error: "بطاقة الولاء غير موجودة أو غير نشطة" });
      }

      res.json(card);
    } catch (error) {
      console.error("Error fetching loyalty card by QR:", error);
      res.status(500).json({ error: "فشل في جلب بطاقة الولاء" });
    }
  });

  // Get loyalty card by phone
  app.get("/api/loyalty/cards/phone/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const card = await storage.getLoyaltyCardByPhone(phoneNumber);

      if (!card) {
        return res.status(404).json({ error: "بطاقة الولاء غير موجودة" });
      }

      res.json(card);
    } catch (error) {
      console.error("Error fetching loyalty card by phone:", error);
      res.status(500).json({ error: "فشل في جلب بطاقة الولاء" });
    }
  });

  // Scan loyalty card and apply discount
  app.post("/api/loyalty/scan", async (req, res) => {
    try {
      const { qrToken, orderAmount, employeeId } = req.body;

      if (!qrToken || !orderAmount) {
        return res.status(400).json({ error: "رمز QR ومبلغ الطلب مطلوبان" });
      }

      const card = await storage.getLoyaltyCardByQRToken(qrToken);

      if (!card) {
        return res.status(404).json({ error: "بطاقة ولاء غير صالحة" });
      }

      // Calculate 10% discount
      const discountPercentage = 10;
      const discountAmount = (parseFloat(orderAmount) * discountPercentage) / 100;
      const finalAmount = parseFloat(orderAmount) - discountAmount;

      // Update card - increment discount count and update last used
      await storage.updateLoyaltyCard(card.id, {
        discountCount: card.discountCount + 1,
        totalSpent: (parseFloat(card.totalSpent) + finalAmount).toFixed(2),
        lastUsedAt: new Date()
      });

      // Create loyalty transaction
      await storage.createLoyaltyTransaction({
        cardId: card.id,
        type: 'discount_applied',
        pointsChange: 0,
        discountAmount: discountAmount.toFixed(2),
        orderAmount: orderAmount,
        description: `خصم ${discountPercentage}% على الطلب`,
        employeeId: employeeId || null
      });

      res.json({
        success: true,
        card: {
          ...card,
          discountCount: card.discountCount + 1
        },
        discount: {
          percentage: discountPercentage,
          amount: discountAmount.toFixed(2),
          originalAmount: orderAmount,
          finalAmount: finalAmount.toFixed(2)
        }
      });
    } catch (error) {
      console.error("Error scanning loyalty card:", error);
      res.status(500).json({ error: "فشل في مسح بطاقة الولاء" });
    }
  });

  // Get loyalty card transactions
  app.get("/api/loyalty/cards/:cardId/transactions", async (req, res) => {
    try {
      const { cardId } = req.params;
      const transactions = await storage.getLoyaltyTransactions(cardId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching loyalty transactions:", error);
      res.status(500).json({ error: "فشل في جلب معاملات الولاء" });
    }
  });

  // Get loyalty tier information
  app.get("/api/loyalty/tiers", async (req, res) => {
    try {
      const tiers = [
        {
          id: 'bronze',
          nameAr: 'برونزي',
          nameEn: 'Bronze',
          pointsRequired: 0,
          benefits: ['خصم 10% على كل طلب', 'بطاقة رقمية مجانية'],
          color: '#CD7F32',
          icon: '🥉'
        },
        {
          id: 'silver',
          nameAr: 'فضي',
          nameEn: 'Silver',
          pointsRequired: 100,
          benefits: ['خصم 15% على كل طلب', 'قهوة مجانية شهرياً', 'أولوية في الطلبات'],
          color: '#C0C0C0',
          icon: '🥈'
        },
        {
          id: 'gold',
          nameAr: 'ذهبي',
          nameEn: 'Gold',
          pointsRequired: 500,
          benefits: ['خصم 20% على كل طلب', 'قهوتين مجانيتين شهرياً', 'دعوات خاصة للفعاليات'],
          color: '#FFD700',
          icon: '🥇'
        },
        {
          id: 'platinum',
          nameAr: 'بلاتيني',
          nameEn: 'Platinum',
          pointsRequired: 1000,
          benefits: ['خصم 25% على كل طلب', 'قهوة يومية مجانية', 'خدمة VIP', 'بطاقة فيزيائية مطبوعة'],
          color: '#E5E4E2',
          icon: '💎'
        }
      ];

      res.json(tiers);
    } catch (error) {
      console.error("Error fetching loyalty tiers:", error);
      res.status(500).json({ error: "فشل في جلب مستويات الولاء" });
    }
  });

  // Get loyalty card by card number (for cashier lookup)
  app.get("/api/loyalty/card/:cardNumber", async (req, res) => {
    try {
      const { cardNumber } = req.params;
      const card = await storage.getLoyaltyCardByCardNumber(cardNumber);

      if (!card) {
        return res.status(404).json({ error: "بطاقة الولاء غير موجودة" });
      }

      res.json(card);
    } catch (error) {
      console.error("Error fetching loyalty card by number:", error);
      res.status(500).json({ error: "فشل في جلب بطاقة الولاء" });
    }
  });

  // Generate loyalty codes for an order
  app.post("/api/orders/:orderId/generate-codes", async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }

      const orderItems = Array.isArray(order.items) ? order.items : [];
      const drinks = orderItems.map((item: any) => ({
        name: item.nameAr || item.name || "مشروب",
        quantity: item.quantity || 1
      }));

      const codes = await storage.generateCodesForOrder(orderId, drinks);
      res.status(201).json(codes);
    } catch (error) {
      console.error("Error generating codes:", error);
      res.status(500).json({ error: "فشل في إنشاء الأكواد" });
    }
  });

  // Get codes for an order
  app.get("/api/orders/:orderId/codes", async (req, res) => {
    try {
      const { orderId } = req.params;
      const codes = await storage.getCodesByOrder(orderId);
      res.json(codes);
    } catch (error) {
      console.error("Error fetching codes:", error);
      res.status(500).json({ error: "فشل في جلب الأكواد" });
    }
  });

  // Redeem a code on a loyalty card
  app.post("/api/loyalty/redeem-code", async (req, res) => {
    try {
      const { code, cardId } = req.body;

      if (!code || !cardId) {
        return res.status(400).json({ error: "الكود ومعرف البطاقة مطلوبان" });
      }

      const result = await storage.redeemCode(code, cardId);

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json({
        success: true,
        message: result.message,
        card: result.card
      });
    } catch (error) {
      console.error("Error redeeming code:", error);
      res.status(500).json({ error: "فشل في استخدام الكود" });
    }
  });

  // INGREDIENTS ROUTES

  // Get all ingredients
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getIngredients();
      res.json(ingredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  // Create ingredient
  app.post("/api/ingredients", async (req, res) => {
    try {
      const { insertIngredientSchema } = await import("@shared/schema");
      const validatedData = insertIngredientSchema.parse(req.body);
      const ingredient = await storage.createIngredient(validatedData);
      res.status(201).json(ingredient);
    } catch (error) {
      console.error("Error creating ingredient:", error);
      res.status(500).json({ error: "Failed to create ingredient" });
    }
  });

  // Update ingredient availability
  app.patch("/api/ingredients/:id/availability", async (req, res) => {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;
      
      // Update ingredient availability
      const ingredient = await storage.updateIngredientAvailability(id, isAvailable);
      
      // Guard: Check if ingredient exists
      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      
      // Get all coffee items that use this ingredient
      const affectedCoffeeItems = await storage.getCoffeeItemsByIngredient(id);
      
      // Update availability of affected coffee items
      for (const coffeeItem of affectedCoffeeItems) {
        if (isAvailable === 0) {
          // If ingredient is unavailable, mark all items using it as unavailable
          await storage.updateCoffeeItemAvailability(coffeeItem.id, {
            isAvailable: 0,
            availabilityStatus: `نفذ ${ingredient.nameAr}`
          });
        } else {
          // If ingredient is now available, check if all other ingredients are available
          const itemIngredients = await storage.getCoffeeItemIngredients(coffeeItem.id);
          const allIngredientsAvailable = itemIngredients.every(ing => ing.isAvailable === 1);
          
          if (allIngredientsAvailable) {
            // All ingredients available, make the item available
            await storage.updateCoffeeItemAvailability(coffeeItem.id, {
              isAvailable: 1,
              availabilityStatus: "متوفر"
            });
          }
        }
      }
      
      res.json({ 
        ingredient, 
        affectedItems: affectedCoffeeItems.length 
      });
    } catch (error) {
      console.error("Error updating ingredient:", error);
      res.status(500).json({ error: "Failed to update ingredient" });
    }
  });

  // Get ingredients for a coffee item
  app.get("/api/coffee-items/:id/ingredients", async (req, res) => {
    try {
      const { id } = req.params;
      const ingredients = await storage.getCoffeeItemIngredients(id);
      res.json(ingredients);
    } catch (error) {
      console.error("Error fetching coffee item ingredients:", error);
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  // Add ingredient to coffee item
  app.post("/api/coffee-items/:id/ingredients", async (req, res) => {
    try {
      const { id } = req.params;
      const { ingredientId } = req.body;
      const result = await storage.addCoffeeItemIngredient(id, ingredientId);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding ingredient to coffee item:", error);
      res.status(500).json({ error: "Failed to add ingredient" });
    }
  });

  // Remove ingredient from coffee item
  app.delete("/api/coffee-items/:id/ingredients/:ingredientId", async (req, res) => {
    try {
      const { id, ingredientId } = req.params;
      await storage.removeCoffeeItemIngredient(id, ingredientId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing ingredient:", error);
      res.status(500).json({ error: "Failed to remove ingredient" });
    }
  });

  // Get coffee items affected by ingredient
  app.get("/api/ingredients/:id/coffee-items", async (req, res) => {
    try {
      const { id } = req.params;
      const coffeeItems = await storage.getCoffeeItemsByIngredient(id);
      res.json(coffeeItems);
    } catch (error) {
      console.error("Error fetching coffee items by ingredient:", error);
      res.status(500).json({ error: "Failed to fetch coffee items" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}