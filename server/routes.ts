import type { Express } from "express";
import { db } from "../db";
import { customers, employees, loyaltyCards, orders, orderItems, products } from "@db/schema";
import type { InsertCustomer, InsertEmployee, InsertOrder, InsertOrderItem, Customer, Employee, Order, OrderItem, Product, LoyaltyCard } from "@db/schema";

export class DBHandler {
  constructor(private app: Express) {}

  public setupRoutes() {
    this.app.get("/customers", async (req, res) => {
      const customers = await this.db.query.customers.findMany();
      res.send(customers);
    });

    this.app.get("/employees", async (req, res) => {
      const employees = await this.db.query.employees.findMany();
      res.send(employees);
    });

    this.app.get("/loyalty-cards", async (req, res) => {
      const loyaltyCards = await this.db.query.loyaltyCards.findMany();
      res.send(loyaltyCards);
    });

    this.app.get("/orders", async (req, res) => {
      const orders = await this.db.query.orders.findMany({
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });
      res.send(orders);
    });

    this.app.get("/products", async (req, res) => {
      const products = await this.db.query.products.findMany();
      res.send(products);
    });

    this.app.post("/customers", async (req, res) => {
      const customer: InsertCustomer = req.body;
      const result = await this.db.insert(customers).values(customer).returning();
      res.status(201).send(result[0]);
    });

    this.app.post("/employees", async (req, res) => {
      const employee: InsertEmployee = req.body;
      const result = await this.db.insert(employees).values(employee).returning();
      res.status(201).send(result[0]);
    });

    this.app.post("/orders", async (req, res) => {
      const order: InsertOrder = req.body;
      try {
        const createdOrder = await this.createOrder(order);
        res.status(201).send(createdOrder);
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).send({ message: "Error creating order", error });
      }
    });

    this.app.post("/order-items", async (req, res) => {
      const orderItem: InsertOrderItem = req.body;
      const result = await this.db.insert(orderItems).values(orderItem).returning();
      res.status(201).send(result[0]);
    });

    this.app.post("/loyalty-cards", async (req, res) => {
      const loyaltyCard: InsertLoyaltyCard = req.body;
      const result = await this.db.insert(loyaltyCards).values(loyaltyCard).returning();
      res.status(201).send(result[0]);
    });

    this.app.post("/products", async (req, res) => {
      const product: InsertProduct = req.body;
      const result = await this.db.insert(products).values(product).returning();
      res.status(201).send(result[0]);
    });
  }

  // Insert a new customer
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await this.db.insert(customers).values(customer).returning();
    return result[0];
  }

  // Insert a new employee
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await this.db.insert(employees).values(employee).returning();
    return result[0];
  }

  // Insert a new order
  async createOrder(order: InsertOrder): Promise<Order> {
    // Generate short order number (max 20 chars)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const random = Math.random().toString(36).substr(2, 6).toUpperCase(); // 6 chars
    const orderNumber = `C${timestamp}${random}`; // C + 8 digits + 6 chars = 15 total

    const result = await this.db.insert(orders).values({
      ...order,
      orderNumber,
    }).returning();
    return result[0];
  }

  // Insert a new order item
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await this.db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }

  // Insert a new loyalty card
  async createLoyaltyCard(loyaltyCard: InsertLoyaltyCard): Promise<LoyaltyCard> {
    const result = await this.db.insert(loyaltyCards).values(loyaltyCard).returning();
    return result[0];
  }

  // Insert a new product
  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await this.db.insert(products).values(product).returning();
    return result[0];
  }
}