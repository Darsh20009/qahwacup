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
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type ICafe,
  type IBranch,
  type IBusinessConfig,
  type IIngredientItem,
  type IRecipeDefinition,
  type RawItem,
  type InsertRawItem,
  type Supplier,
  type InsertSupplier,
  type BranchStock,
  type StockTransfer,
  type InsertStockTransfer,
  type PurchaseInvoice,
  type InsertPurchaseInvoice,
  type RecipeItem,
  type InsertRecipeItem,
  type StockAlert,
  type StockMovement,
  type InsertStockMovement,
  type Branch,
  type InsertBranch,
  type Category,
  type InsertCategory,
  type DeliveryZone,
  type InsertDeliveryZone,
  type Table,
  type InsertTable,
  CafeModel,
  BranchModel,
  BusinessConfigModel,
  IngredientItemModel,
  RecipeDefinitionModel,
  CoffeeItemModel,
  CustomerModel,
  EmployeeModel,
  DiscountCodeModel,
  OrderModel,
  OrderItemModel,
  CartItemModel,
  UserModel,
  LoyaltyCardModel,
  CardCodeModel,
  LoyaltyTransactionModel,
  LoyaltyRewardModel,
  IngredientModel,
  CoffeeItemIngredientModel,
  PasswordResetTokenModel,
  PasswordSetupOTPModel,
  CategoryModel,
  DeliveryZoneModel,
  TableModel,
  TaxInvoiceModel,
  RawItemModel,
  SupplierModel,
  BranchStockModel,
  StockTransferModel,
  PurchaseInvoiceModel,
  RecipeItemModel,
  StockAlertModel,
  StockMovementModel,
  ProductReviewModel,
  ReferralModel,
  NotificationModel,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export interface IStorage {
  // Business Config
  getBusinessConfig(tenantId: string): Promise<IBusinessConfig | undefined>;
  updateBusinessConfig(tenantId: string, updates: Partial<IBusinessConfig>): Promise<IBusinessConfig>;
  
  // Ingredient Items
  getIngredientItems(tenantId: string): Promise<IIngredientItem[]>;
  createIngredientItem(item: Partial<IIngredientItem>): Promise<IIngredientItem>;
  updateIngredientItem(id: string, updates: Partial<IIngredientItem>): Promise<IIngredientItem | undefined>;
  
  // Recipes
  getRecipeDefinition(tenantId: string, productId: string): Promise<IRecipeDefinition | undefined>;
  createRecipeDefinition(recipe: Partial<IRecipeDefinition>): Promise<IRecipeDefinition>;
  updateRecipeDefinition(id: string, updates: Partial<IRecipeDefinition>): Promise<IRecipeDefinition | undefined>;

  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCafe(id: string): Promise<ICafe | undefined>;
  createCafe(cafe: Partial<ICafe>): Promise<ICafe>;
  updateCafe(id: string, cafe: Partial<ICafe>): Promise<ICafe | undefined>;
  
  getBranches(cafeId: string): Promise<IBranch[]>;
  getBranch(id: string): Promise<IBranch | null>;
  createBranch(branch: Partial<IBranch>): Promise<IBranch>;
  updateBranch(id: string, branch: Partial<IBranch>): Promise<IBranch | null>;

  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined>;
  getCustomerOrders(customerId: string): Promise<Order[]>;
  verifyCustomerPassword(phone: string, password: string): Promise<Customer | undefined>;
  resetCustomerPassword(email: string, newPassword: string): Promise<boolean>;
  
  createPasswordResetToken(email: string): Promise<{token: string, expiresAt: Date}>;
  verifyPasswordResetToken(token: string): Promise<{valid: boolean, email?: string}>;
  usePasswordResetToken(token: string): Promise<boolean>;

  createPasswordSetupOTP(phone: string): Promise<{otp: string, expiresAt: Date}>;
  verifyPasswordSetupOTP(phone: string, otp: string): Promise<{valid: boolean, message?: string}>;
  invalidatePasswordSetupOTP(phone: string, otp: string): Promise<boolean>;

  getCoffeeItems(): Promise<CoffeeItem[]>;
  getCoffeeItem(id: string): Promise<CoffeeItem | undefined>;
  getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]>;
  createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem>;
  updateCoffeeItem(id: string, item: Partial<CoffeeItem>): Promise<CoffeeItem | undefined>;

  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string, cancellationReason?: string): Promise<Order | undefined>;
  updateOrderCarPickup(id: string, carPickup: any): Promise<Order | undefined>;
  getOrders(limit?: number, offset?: number): Promise<Order[]>;

  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;

  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(sessionId: string, coffeeItemId: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(sessionId: string, coffeeItemId: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  createLoyaltyCard(card: InsertLoyaltyCard): Promise<LoyaltyCard>;
  getLoyaltyCard(id: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardByQRToken(qrToken: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardByCardNumber(cardNumber: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardByPhone(phoneNumber: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCards(): Promise<LoyaltyCard[]>;
  updateLoyaltyCard(id: string, updates: Partial<LoyaltyCard>): Promise<LoyaltyCard | undefined>;

  generateCodesForOrder(orderId: string, drinks: Array<{name: string, quantity: number}>): Promise<CardCode[]>;
  redeemCode(code: string, cardId: string): Promise<{success: boolean, message: string, card?: LoyaltyCard}>;
  getCodesByOrder(orderId: string): Promise<CardCode[]>;
  getCodeDetails(code: string): Promise<CardCode | undefined>;

  createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction>;
  getLoyaltyTransactions(cardId: string): Promise<LoyaltyTransaction[]>;
  getAllLoyaltyTransactions(limit?: number): Promise<LoyaltyTransaction[]>;

  createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward>;
  getLoyaltyRewards(): Promise<LoyaltyReward[]>;
  getLoyaltyReward(id: string): Promise<LoyaltyReward | undefined>;

  getIngredients(): Promise<any[]>;
  createIngredient(ingredient: any): Promise<any>;
  updateIngredientAvailability(id: string, isAvailable: number): Promise<any>;
  getCoffeeItemIngredients(coffeeItemId: string): Promise<any[]>;
  addCoffeeItemIngredient(coffeeItemId: string, ingredientId: string, quantity?: number, unit?: string): Promise<any>;
  removeCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<void>;
  getCoffeeItemsByIngredient(ingredientId: string): Promise<CoffeeItem[]>;
  deleteBranch(id: string): Promise<boolean>;

  // ================== INVENTORY MANAGEMENT ==================
  // Raw Items
  getRawItems(): Promise<RawItem[]>;
  getRawItem(id: string): Promise<RawItem | undefined>;
  getRawItemByCode(code: string): Promise<RawItem | undefined>;
  createRawItem(item: InsertRawItem): Promise<RawItem>;
  updateRawItem(id: string, updates: Partial<RawItem>): Promise<RawItem | undefined>;
  deleteRawItem(id: string): Promise<boolean>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  getSupplierByCode(code: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Branch Stock
  getBranchStock(branchId: string): Promise<BranchStock[]>;
  getBranchStockItem(branchId: string, rawItemId: string): Promise<BranchStock | undefined>;
  updateBranchStock(branchId: string, rawItemId: string, quantity: number, createdBy: string, movementType?: string, notes?: string): Promise<BranchStock>;
  getLowStockItems(branchId?: string): Promise<any[]>;
  getAllBranchesStock(): Promise<any[]>;

  // Stock Transfers
  getStockTransfers(branchId?: string): Promise<StockTransfer[]>;
  getStockTransfer(id: string): Promise<StockTransfer | undefined>;
  createStockTransfer(transfer: InsertStockTransfer): Promise<StockTransfer>;
  updateStockTransferStatus(id: string, status: string, approvedBy?: string): Promise<StockTransfer | undefined>;
  completeStockTransfer(id: string, completedBy: string): Promise<StockTransfer | undefined>;

  // Purchase Invoices
  getPurchaseInvoices(branchId?: string): Promise<PurchaseInvoice[]>;
  getPurchaseInvoice(id: string): Promise<PurchaseInvoice | undefined>;
  createPurchaseInvoice(invoice: InsertPurchaseInvoice): Promise<PurchaseInvoice>;
  updatePurchaseInvoice(id: string, updates: Partial<PurchaseInvoice>): Promise<PurchaseInvoice | undefined>;
  receivePurchaseInvoice(id: string, receivedBy: string): Promise<PurchaseInvoice | undefined>;
  updatePurchaseInvoicePayment(id: string, paidAmount: number): Promise<PurchaseInvoice | undefined>;

  // Recipe Items
  getAllRecipeItems(): Promise<RecipeItem[]>;
  getRecipeItems(coffeeItemId: string): Promise<RecipeItem[]>;
  createRecipeItem(item: InsertRecipeItem): Promise<RecipeItem>;
  updateRecipeItem(id: string, updates: Partial<RecipeItem>): Promise<RecipeItem | undefined>;
  deleteRecipeItem(id: string): Promise<boolean>;
  calculateProductCost(coffeeItemId: string): Promise<number>;

  // Stock Alerts
  getStockAlerts(branchId?: string, resolved?: boolean): Promise<StockAlert[]>;
  createStockAlert(branchId: string, rawItemId: string, alertType: string, currentQuantity: number, thresholdQuantity: number): Promise<StockAlert>;
  resolveStockAlert(id: string, resolvedBy: string): Promise<StockAlert | undefined>;
  markAlertAsRead(id: string): Promise<StockAlert | undefined>;

  // Stock Movements
  getStockMovements(branchId: string, rawItemId?: string, limit?: number): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;

  // Smart Inventory Deduction
  deductInventoryForOrder(
    orderId: string,
    branchId: string,
    items: Array<{ coffeeItemId: string; quantity: number; addons?: Array<{ rawItemId: string; quantity: number; unit: string }> }>,
    createdBy: string
  ): Promise<{
    success: boolean;
    costOfGoods: number;
    grossProfit: number;
    deductionDetails: Array<{
      rawItemId: string;
      rawItemName: string;
      quantity: number;
      unit: string;
      unitCost: number;
      totalCost: number;
      previousQuantity: number;
      newQuantity: number;
      status: 'deducted' | 'skipped_no_stock' | 'skipped_insufficient' | 'skipped_no_recipe';
      message: string;
    }>;
    shortages: Array<{
      rawItemId: string;
      rawItemName: string;
      required: number;
      available: number;
      unit: string;
    }>;
    warnings: string[];
    errors: string[];
  }>;

  calculateOrderCOGS(items: Array<{ coffeeItemId: string; quantity: number }>, branchId?: string): Promise<{
    totalCost: number;
    itemBreakdown: Array<{
      coffeeItemId: string;
      coffeeItemName: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      ingredients: Array<{
        rawItemId: string;
        rawItemName: string;
        quantity: number;
        unit: string;
        unitCost: number;
        totalCost: number;
      }>;
    }>;
    shortages: Array<{
      rawItemId: string;
      rawItemName: string;
      required: number;
      available: number;
      unit: string;
    }>;
  }>;
}

// Helper function to serialize MongoDB documents
function serializeDoc(doc: any): any {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Only set id from _id if there's no existing id field
  if (obj._id && !obj.id) {
    obj.id = obj._id.toString();
  }
  
  // Always clean up MongoDB internal fields
  delete obj._id;
  delete obj.__v;
  return obj;
}

export class DBStorage implements IStorage {
  private orderCounter: number = 1;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await this.initializeDemoEmployee();
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  private async initializeCoffeeMenu() {
    return;
  }

  private async initializeDemoEmployee() {
    const existing = await EmployeeModel.findOne({ username: 'manager' });
    if (existing) return;

    const hashedPassword = bcrypt.hashSync('2030', 10);
    await EmployeeModel.create({
      id: "manager-demo",
      username: 'manager',
      password: hashedPassword,
      fullName: 'المدير',
      role: 'manager',
      title: 'مدير المقهى',
      phone: '500000000',
      jobTitle: 'مدير',
      isActivated: 1,
      employmentNumber: 'EMP-001',
      tenantId: 'demo-tenant'
    });
  }

  // --- OPERATING SYSTEM CORE IMPLEMENTATIONS ---

  async getBusinessConfig(tenantId: string): Promise<IBusinessConfig | undefined> {
    const config = await BusinessConfigModel.findOne({ tenantId }).lean();
    return config ? (config as any) : undefined;
  }

  async updateBusinessConfig(tenantId: string, updates: Partial<IBusinessConfig>): Promise<IBusinessConfig> {
    const config = await BusinessConfigModel.findOneAndUpdate(
      { tenantId },
      { $set: { ...updates, updatedAt: new Date() } },
      { upsert: true, new: true }
    ).lean();
    return config as any;
  }

  async getIngredientItems(tenantId: string): Promise<IIngredientItem[]> {
    return await IngredientItemModel.find({ tenantId }).lean() as any[];
  }

  async createIngredientItem(item: Partial<IIngredientItem>): Promise<IIngredientItem> {
    const newItem = await IngredientItemModel.create(item);
    return newItem.toObject() as any;
  }

  async updateIngredientItem(id: string, updates: Partial<IIngredientItem>): Promise<IIngredientItem | undefined> {
    const updated = await IngredientItemModel.findByIdAndUpdate(
      id,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated ? (updated as any) : undefined;
  }

  async getRecipeDefinition(tenantId: string, productId: string): Promise<IRecipeDefinition | undefined> {
    const recipe = await RecipeDefinitionModel.findOne({ tenantId, productId, isActive: true }).lean();
    return recipe ? (recipe as any) : undefined;
  }

  async createRecipeDefinition(recipe: Partial<IRecipeDefinition>): Promise<IRecipeDefinition> {
    const newRecipe = await RecipeDefinitionModel.create(recipe);
    return newRecipe.toObject() as any;
  }

  async updateRecipeDefinition(id: string, updates: Partial<IRecipeDefinition>): Promise<IRecipeDefinition | undefined> {
    const updated = await RecipeDefinitionModel.findByIdAndUpdate(
      id,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated ? (updated as any) : undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await UserModel.create({
      ...user,
      password: hashedPassword,
    });
    return newUser;
  }

  async getCafe(id: string): Promise<ICafe | undefined> {
    const cafe = await CafeModel.findOne({ id }).lean();
    return cafe ? serializeDoc(cafe) : undefined;
  }

  async createCafe(cafe: Partial<ICafe>): Promise<ICafe> {
    const newCafe = await CafeModel.create(cafe);
    return serializeDoc(newCafe);
  }

  async updateCafe(id: string, updates: Partial<ICafe>): Promise<ICafe | undefined> {
    const cafe = await CafeModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return cafe ? serializeDoc(cafe) : undefined;
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findById(id).lean();
    if (!employee) return undefined;
    
    // Convert _id to id
    const result: any = {
      ...employee,
      id: employee._id.toString(),
    };
    delete result._id;
    delete result.__v;
    
    return result;
  }

  async getEmployeeByUsername(username: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findOne({ username }).lean();
    if (!employee) return undefined;
    
    // Convert _id to id
    const result: any = {
      ...employee,
      id: employee._id.toString(),
    };
    delete result._id;
    delete result.__v;
    
    return result;
  }

  async getEmployeeByPhone(phone: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findOne({ phone }).lean();
    if (!employee) return undefined;
    
    // Convert _id to id
    const result: any = {
      ...employee,
      id: employee._id.toString(),
    };
    delete result._id;
    delete result.__v;
    
    return result;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    // Generate employmentNumber if not provided
    const employmentNumber = insertEmployee.employmentNumber || nanoid(10);
    
    if (insertEmployee.password) {
      const hashedPassword = await bcrypt.hash(insertEmployee.password, 10);
      const newEmployee = await EmployeeModel.create({
        ...insertEmployee,
        employmentNumber,
        password: hashedPassword,
      });
      // Convert _id to id
      const result: any = {
        ...newEmployee.toObject(),
        id: (newEmployee._id as any).toString(),
      };
      delete result._id;
      delete result.__v;
      return result;
    } else {
      const newEmployee = await EmployeeModel.create({
        ...insertEmployee,
        employmentNumber,
      });
      // Convert _id to id
      const result: any = {
        ...newEmployee.toObject(),
        id: (newEmployee._id as any).toString(),
      };
      delete result._id;
      delete result.__v;
      return result;
    }
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    updates.updatedAt = new Date();
    const employee = await EmployeeModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!employee) return undefined;
    
    // Convert _id to id
    const result: any = {
      ...employee,
      id: employee._id.toString(),
    };
    delete result._id;
    delete result.__v;
    return result;
  }

  async activateEmployee(phone: string, fullName: string, password: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findOne({ phone, fullName, isActivated: 0 });
    if (!employee) return undefined;

    const hashedPassword = await bcrypt.hash(password, 10);
    employee.password = hashedPassword;
    employee.isActivated = 1;
    employee.updatedAt = new Date();
    await employee.save();
    
    // Convert _id to id
    const obj = employee.toObject();
    const result: any = {
      ...obj,
      id: (employee._id as any).toString(),
    };
    delete result._id;
    delete result.__v;
    return result;
  }

  async resetEmployeePasswordByUsername(username: string, newPassword: string): Promise<boolean> {
    const employee = await this.getEmployeeByUsername(username);
    if (!employee) return false;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await EmployeeModel.updateOne({ username }, { password: hashedPassword });
    
    return true;
  }

  async getEmployees(tenantId?: string): Promise<Employee[]> {
    const query = tenantId ? { tenantId } : {};
    const employees = await EmployeeModel.find(query).lean();
    return employees.map((emp: any) => ({
      ...emp,
      id: emp._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async getActiveCashiers(tenantId?: string): Promise<Employee[]> {
    const query: any = { 
      role: 'cashier',
      isActivated: 1
    };
    if (tenantId) query.tenantId = tenantId;
    
    const cashiers = await EmployeeModel.find(query).lean();
    return cashiers.map((emp: any) => ({
      ...emp,
      id: emp._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async createDiscountCode(insertDiscountCode: InsertDiscountCode): Promise<DiscountCode> {
    const normalizedCode = {
      ...insertDiscountCode,
      code: insertDiscountCode.code.trim().toLowerCase()
    };
    const newCode = await DiscountCodeModel.create(normalizedCode);
    return newCode;
  }

  async getDiscountCode(id: string): Promise<DiscountCode | undefined> {
    const code = await DiscountCodeModel.findById(id);
    return code || undefined;
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const discountCode = await DiscountCodeModel.findOne({ 
      code: { $regex: new RegExp(`^${code.trim()}$`, 'i') }
    });
    return discountCode || undefined;
  }

  async getDiscountCodes(): Promise<DiscountCode[]> {
    return await DiscountCodeModel.find();
  }

  async getDiscountCodesByEmployee(employeeId: string): Promise<DiscountCode[]> {
    return await DiscountCodeModel.find({ employeeId });
  }

  async updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode | undefined> {
    const updated = await DiscountCodeModel.findByIdAndUpdate(id, updates, { new: true });
    return updated || undefined;
  }

  async incrementDiscountCodeUsage(id: string): Promise<DiscountCode | undefined> {
    const code = await this.getDiscountCode(id);
    if (!code) return undefined;
    return this.updateDiscountCode(id, { usageCount: (code.usageCount || 0) + 1 });
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const customer = await CustomerModel.findById(id);
    return customer || undefined;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const customer = await CustomerModel.findOne({ phone });
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    if (!email) return undefined;
    const customer = await CustomerModel.findOne({ email });
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const hashedPassword = customer.password ? await bcrypt.hash(customer.password, 10) : undefined;
    const newCustomer = await CustomerModel.create({
      ...customer,
      password: hashedPassword,
    });
    return newCustomer;
  }

  async verifyCustomerPassword(phone: string, password: string): Promise<Customer | undefined> {
    const customer = await this.getCustomerByPhone(phone);
    if (!customer || !customer.password) return undefined;
    
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) return undefined;
    
    return customer;
  }

  async resetCustomerPassword(email: string, newPassword: string): Promise<boolean> {
    const customer = await this.getCustomerByEmail(email);
    if (!customer) return false;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await CustomerModel.updateOne({ email }, { password: hashedPassword });
    
    // Auto-sync card PIN with new password
    if (customer.phone) {
      const loyaltyCard = await LoyaltyCardModel.findOne({ phoneNumber: customer.phone });
      if (loyaltyCard) {
        await LoyaltyCardModel.updateOne({ phoneNumber: customer.phone }, { cardPin: newPassword });
      }
    }
    
    return true;
  }

  async createPasswordResetToken(email: string): Promise<{token: string, expiresAt: Date}> {
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    await PasswordResetTokenModel.create({
      email,
      token,
      expiresAt,
    });
    
    return { token, expiresAt };
  }

  async verifyPasswordResetToken(token: string): Promise<{valid: boolean, email?: string}> {
    const resetToken = await PasswordResetTokenModel.findOne({ token });
    
    if (!resetToken) return { valid: false };
    
    if (resetToken.used === 1) return { valid: false };
    if (resetToken.expiresAt < new Date()) return { valid: false };
    
    return { valid: true, email: resetToken.email };
  }

  async usePasswordResetToken(token: string): Promise<boolean> {
    const result = await PasswordResetTokenModel.updateOne({ token }, { used: 1 });
    return result.modifiedCount > 0;
  }

  async createPasswordSetupOTP(phone: string): Promise<{otp: string, expiresAt: Date}> {
    const MAX_OTP_REQUESTS_PER_HOUR = 5;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Rate limiting: check how many OTPs were created for this phone in the last hour
    const recentOTPs = await PasswordSetupOTPModel.countDocuments({
      phone,
      createdAt: { $gte: oneHourAgo }
    });
    
    if (recentOTPs >= MAX_OTP_REQUESTS_PER_HOUR) {
      throw new Error('تم تجاوز الحد الأقصى للمحاولات. يرجى المحاولة مرة أخرى بعد ساعة');
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Invalidate any previous unused OTPs for this phone
    await PasswordSetupOTPModel.updateMany(
      { phone, used: 0 },
      { used: 1 }
    );
    
    // Create new OTP
    await PasswordSetupOTPModel.create({
      phone,
      otp,
      expiresAt,
      used: 0,
      attempts: 0
    });
    
    return { otp, expiresAt };
  }

  async verifyPasswordSetupOTP(phone: string, otp: string): Promise<{valid: boolean, message?: string}> {
    const MAX_ATTEMPTS = 3;
    
    // Find the most recent unused OTP for this phone
    const otpRecord = await PasswordSetupOTPModel.findOne({ 
      phone, 
      used: 0,
      otp: otp 
    }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      return { valid: false, message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' };
    }
    
    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      return { valid: false, message: 'رمز التحقق منتهي الصلاحية' };
    }
    
    // Check max attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return { valid: false, message: 'تم تجاوز الحد الأقصى للمحاولات' };
    }
    
    // Increment attempts
    await PasswordSetupOTPModel.updateOne(
      { _id: otpRecord._id },
      { $inc: { attempts: 1 } }
    );
    
    return { valid: true };
  }

  async invalidatePasswordSetupOTP(phone: string, otp: string): Promise<boolean> {
    const result = await PasswordSetupOTPModel.updateOne(
      { phone, otp, used: 0 },
      { used: 1 }
    );
    return result.modifiedCount > 0;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const updated = await CustomerModel.findByIdAndUpdate(id, updates, { new: true });
    return updated || undefined;
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return await OrderModel.find({ customerId }).sort({ createdAt: -1 });
  }

  async getCoffeeItems(): Promise<CoffeeItem[]> {
    const items = await CoffeeItemModel.find().lean();
    return (items as any[]).map(i => {
      const doc = { ...i, id: i.id || i._id?.toString() };
      delete (doc as any)._id;
      delete (doc as any).__v;
      return doc as CoffeeItem;
    });
  }

  async getCoffeeItem(id: string): Promise<CoffeeItem | undefined> {
    const item = await CoffeeItemModel.findOne({ id }).lean();
    if (!item) return undefined;
    const doc = { ...item, id: item.id || (item as any)._id?.toString() };
    delete (doc as any)._id;
    delete (doc as any).__v;
    return doc as CoffeeItem;
  }

  async getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]> {
    const items = await CoffeeItemModel.find({ category }).lean();
    return (items as any[]).map(i => {
      const doc = { ...i, id: i.id || i._id?.toString() };
      delete (doc as any)._id;
      delete (doc as any).__v;
      return doc as CoffeeItem;
    });
  }

  async createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem> {
    const newItem = await CoffeeItemModel.create(item);
    const doc = newItem.toObject();
    doc.id = (newItem._id as any).toString();
    delete (doc as any)._id;
    delete (doc as any).__v;
    return doc as CoffeeItem;
  }

  async updateCoffeeItem(id: string, updates: Partial<CoffeeItem>): Promise<CoffeeItem | undefined> {
    const updated = await CoffeeItemModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    if (!updated) return undefined;
    const doc = { ...updated, id: updated.id || (updated as any)._id?.toString() };
    delete (doc as any)._id;
    delete (doc as any).__v;
    return doc as CoffeeItem;
  }

  async deleteCoffeeItem(id: string): Promise<boolean> {
    const result = await CoffeeItemModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}-${this.orderCounter++}`;
    const newOrder = await OrderModel.create({
      ...order,
      orderNumber,
    });
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const order = await OrderModel.findById(id);
    return order || undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const order = await OrderModel.findOne({ orderNumber });
    return order || undefined;
  }

  async updateOrderStatus(id: string, status: string, cancellationReason?: string): Promise<Order | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }
    const updated = await OrderModel.findByIdAndUpdate(id, updates, { new: true });
    return updated || undefined;
  }

  async updateOrderCarPickup(id: string, carPickup: any): Promise<Order | undefined> {
    const updated = await OrderModel.findByIdAndUpdate(
      id,
      { carPickup, updatedAt: new Date() },
      { new: true }
    );
    return updated || undefined;
  }

  async getOrders(limit?: number, offset?: number): Promise<Order[]> {
    const orders = await OrderModel.find({}).sort({ createdAt: -1 }).skip(offset || 0).limit(limit || 50);
    return orders.map((order: any) => serializeDoc(order));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const newOrderItem = await OrderItemModel.create(orderItem);
    return newOrderItem;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await OrderItemModel.find({ orderId });
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return await CartItemModel.find({ sessionId });
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const existing = await CartItemModel.findOne({
      sessionId: cartItem.sessionId,
      coffeeItemId: cartItem.coffeeItemId,
    });

    if (existing) {
      existing.quantity += cartItem.quantity;
      await existing.save();
      return existing;
    }

    const newCartItem = await CartItemModel.create(cartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(sessionId: string, coffeeItemId: string, quantity: number): Promise<CartItem | undefined> {
    const updated = await CartItemModel.findOneAndUpdate(
      { sessionId, coffeeItemId },
      { quantity },
      { new: true }
    );
    return updated || undefined;
  }

  async removeFromCart(sessionId: string, coffeeItemId: string): Promise<boolean> {
    const result = await CartItemModel.deleteOne({ sessionId, coffeeItemId });
    return result.deletedCount > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const result = await CartItemModel.deleteMany({ sessionId });
    return result.deletedCount > 0;
  }

  async createLoyaltyCard(card: InsertLoyaltyCard): Promise<LoyaltyCard> {
    const qrToken = nanoid(32);
    const cardNumber = `QC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const newCard = await LoyaltyCardModel.create({
      ...card,
      qrToken,
      cardNumber,
    });
    return newCard;
  }

  async getLoyaltyCard(id: string): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findById(id);
    return card || undefined;
  }

  async getLoyaltyCardByQRToken(qrToken: string): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findOne({ qrToken });
    return card || undefined;
  }

  async getLoyaltyCardByCardNumber(cardNumber: string): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findOne({ cardNumber });
    return card || undefined;
  }

  async getLoyaltyCardByPhone(phoneNumber: string): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findOne({ phoneNumber, isActive: true });
    return card || undefined;
  }

  async getLoyaltyCardsByCustomerId(customerId: string): Promise<LoyaltyCard[]> {
    return await LoyaltyCardModel.find({ customerId }).sort({ isActive: -1, createdAt: -1 });
  }

  async getActiveCardByCustomerId(customerId: string): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findOne({ customerId, isActive: true });
    return card || undefined;
  }

  async setActiveCard(cardId: string, customerId: string): Promise<LoyaltyCard | undefined> {
    await LoyaltyCardModel.updateMany({ customerId }, { isActive: false });
    const updated = await LoyaltyCardModel.findByIdAndUpdate(
      cardId,
      { isActive: true, updatedAt: new Date() },
      { new: true }
    );
    return updated || undefined;
  }

  async getLoyaltyCards(): Promise<LoyaltyCard[]> {
    return await LoyaltyCardModel.find();
  }

  async updateLoyaltyCard(id: string, updates: Partial<LoyaltyCard>): Promise<LoyaltyCard | undefined> {
    const updated = await LoyaltyCardModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return updated || undefined;
  }

  async generateCodesForOrder(orderId: string, drinks: Array<{name: string, quantity: number}>): Promise<CardCode[]> {
    const codes: CardCode[] = [];
    
    for (const drink of drinks) {
      for (let i = 0; i < drink.quantity; i++) {
        const code = nanoid(12).toUpperCase();
        const newCode = await CardCodeModel.create({
          code,
          issuedForOrderId: orderId,
          drinkName: drink.name,
        });
        codes.push(newCode);
      }
    }
    
    return codes;
  }

  async redeemCode(code: string, cardId: string): Promise<{success: boolean, message: string, card?: LoyaltyCard}> {
    const cardCode = await CardCodeModel.findOne({ code });
    
    if (!cardCode) {
      return { success: false, message: 'الكود غير صحيح' };
    }
    
    if (cardCode.isRedeemed === 1) {
      return { success: false, message: 'هذا الكود مستخدم مسبقاً' };
    }
    
    const loyaltyCard = await this.getLoyaltyCard(cardId);
    if (!loyaltyCard) {
      return { success: false, message: 'البطاقة غير موجودة' };
    }
    
    cardCode.isRedeemed = 1;
    cardCode.redeemedAt = new Date();
    cardCode.redeemedByCardId = cardId;
    await cardCode.save();
    
    const newStamps = (loyaltyCard.stamps || 0) + 1;
    let freeCupsEarned = loyaltyCard.freeCupsEarned || 0;
    let stamps = newStamps;
    
    if (newStamps >= 6) {
      freeCupsEarned += 1;
      stamps = newStamps - 6;
    }
    
    const updatedCard = await this.updateLoyaltyCard(cardId, {
      stamps,
      freeCupsEarned,
      lastUsedAt: new Date(),
    });
    
    return {
      success: true,
      message: 'تم تفعيل الكود بنجاح',
      card: updatedCard,
    };
  }

  async getCodesByOrder(orderId: string): Promise<CardCode[]> {
    return await CardCodeModel.find({ issuedForOrderId: orderId });
  }

  async getCodeDetails(code: string): Promise<CardCode | undefined> {
    const cardCode = await CardCodeModel.findOne({ code });
    return cardCode || undefined;
  }

  async createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const newTransaction = await LoyaltyTransactionModel.create(transaction);
    return newTransaction;
  }

  async getLoyaltyTransactions(cardId: string): Promise<LoyaltyTransaction[]> {
    return await LoyaltyTransactionModel.find({ cardId }).sort({ createdAt: -1 });
  }

  async getAllLoyaltyTransactions(limit?: number): Promise<LoyaltyTransaction[]> {
    const query = LoyaltyTransactionModel.find().sort({ createdAt: -1 });
    if (limit) query.limit(limit);
    return await query;
  }

  async createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const newReward = await LoyaltyRewardModel.create(reward);
    return newReward;
  }

  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return await LoyaltyRewardModel.find();
  }

  async getLoyaltyReward(id: string): Promise<LoyaltyReward | undefined> {
    const reward = await LoyaltyRewardModel.findById(id);
    return reward || undefined;
  }

  async getIngredients(): Promise<any[]> {
    const items = await IngredientModel.find();
    return items.map(serializeDoc);
  }

  async createIngredient(ingredient: any): Promise<any> {
    const newIngredient = await IngredientModel.create(ingredient);
    return newIngredient;
  }

  async updateIngredientAvailability(id: string, isAvailable: number): Promise<any> {
    const updated = await IngredientModel.findByIdAndUpdate(
      id,
      { isAvailable, updatedAt: new Date() },
      { new: true }
    );
    return updated;
  }

  async getCoffeeItemIngredients(coffeeItemId: string): Promise<any[]> {
    const items = await CoffeeItemIngredientModel.find({ coffeeItemId });
    return items.map(serializeDoc);
  }

  async addCoffeeItemIngredient(coffeeItemId: string, ingredientId: string, quantity: number = 0, unit: string = 'ml'): Promise<any> {
    const result = await CoffeeItemIngredientModel.findOneAndUpdate(
      { coffeeItemId, ingredientId },
      { coffeeItemId, ingredientId, quantity, unit },
      { upsert: true, new: true }
    );
    
    // Also try to sync with RecipeItem if there's a matching RawItem
    // This creates an automatic link between ingredient display and inventory tracking
    try {
      const ingredient = await IngredientModel.findById(ingredientId);
      if (ingredient) {
        // Try to find a RawItem with matching name
        const rawItem = await RawItemModel.findOne({
          $or: [
            { nameAr: ingredient.nameAr },
            { nameEn: ingredient.nameEn }
          ],
          category: 'ingredient'
        });
        
        if (rawItem && quantity > 0) {
          // Create or update the RecipeItem for inventory deduction
          await RecipeItemModel.findOneAndUpdate(
            { coffeeItemId, rawItemId: (rawItem._id as any).toString() },
            { 
              coffeeItemId, 
              rawItemId: (rawItem._id as any).toString(), 
              quantity, 
              unit,
              updatedAt: new Date() 
            },
            { upsert: true }
          );
          console.log(`[SYNC] Created RecipeItem for ${coffeeItemId} -> ${rawItem.nameAr}`);
        }
      }
    } catch (syncError) {
      console.log('[SYNC] Could not sync ingredient to recipe item:', syncError);
      // Non-blocking - continue even if sync fails
    }
    
    return result;
  }

  async removeCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<void> {
    await CoffeeItemIngredientModel.deleteOne({ coffeeItemId, ingredientId });
    
    // Also try to remove corresponding RecipeItem
    try {
      const ingredient = await IngredientModel.findById(ingredientId);
      if (ingredient) {
        const rawItem = await RawItemModel.findOne({
          $or: [
            { nameAr: ingredient.nameAr },
            { nameEn: ingredient.nameEn }
          ],
          category: 'ingredient'
        });
        
        if (rawItem) {
          await RecipeItemModel.deleteOne({ 
            coffeeItemId, 
            rawItemId: (rawItem._id as any).toString() 
          });
          console.log(`[SYNC] Removed RecipeItem for ${coffeeItemId} -> ${rawItem.nameAr}`);
        }
      }
    } catch (syncError) {
      console.log('[SYNC] Could not remove synced recipe item:', syncError);
    }
  }

  async getCoffeeItemsByIngredient(ingredientId: string): Promise<CoffeeItem[]> {
    const links = await CoffeeItemIngredientModel.find({ ingredientId });
    const coffeeItemIds = links.map(link => link.coffeeItemId);
    return await CoffeeItemModel.find({ id: { $in: coffeeItemIds } });
  }

  async getBranches(cafeId?: string): Promise<IBranch[]> {
    const query: any = { 
      $or: [
        { isActive: true },
        { isActive: 1 },
        { isActive: "true" },
        { isActive: "1" }
      ]
    };
    if (cafeId) query.cafeId = cafeId;
    const branches = await BranchModel.find(query).sort({ createdAt: -1 }).lean();
    return (branches as any[]).map(b => serializeDoc(b));
  }

  async getAllBranches(): Promise<IBranch[]> {
    const branches = await BranchModel.find().sort({ createdAt: -1 }).lean();
    return (branches as any[]).map(b => serializeDoc(b));
  }

  async getBranch(id: string): Promise<IBranch | null> {
    const branch = await BranchModel.findOne({ id }).lean();
    // Only return branch if it's active
    if (branch && (branch as any).isActive !== false && (branch as any).isActive !== 0) {
      return serializeDoc(branch);
    }
    return null;
  }

  async createBranch(branch: any): Promise<IBranch> {
    const id = branch.id || nanoid();
    const newBranch = await BranchModel.create({ ...branch, id, isActive: 1 });
    return serializeDoc(newBranch.toObject());
  }

  async updateBranch(id: string, updates: Partial<IBranch>): Promise<IBranch | null> {
    const updated = await BranchModel.findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated ? serializeDoc(updated) : null;
  }

  async deleteBranch(id: string): Promise<boolean> {
    const result = await BranchModel.findByIdAndUpdate(
      id,
      { isActive: 0, updatedAt: new Date() },
      { new: true }
    );
    return !!result;
  }

  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find().sort({ sortOrder: 1, nameAr: 1 });
    return categories.map(serializeDoc);
  }

  async getCategory(id: string): Promise<Category | null> {
    const category = await CategoryModel.findById(id);
    return category ? category.toObject() : null;
  }

  async createCategory(category: any): Promise<Category> {
    const newCategory = await CategoryModel.create(category);
    return newCategory.toObject();
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const updated = await CategoryModel.findByIdAndUpdate(
      id,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    );
    return updated ? updated.toObject() : null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return !!result;
  }

  async getCustomers(): Promise<Customer[]> {
    return await CustomerModel.find().sort({ createdAt: -1 });
  }

  async getOrdersByEmployee(employeeId: string): Promise<Order[]> {
    return await OrderModel.find({ employeeId }).sort({ createdAt: -1 });
  }

  async getDeliveryZones(): Promise<DeliveryZone[]> {
    return await DeliveryZoneModel.find({ isActive: 1 }).sort({ nameAr: 1 });
  }

  async getDeliveryZone(id: string): Promise<DeliveryZone | null> {
    const zone = await DeliveryZoneModel.findById(id);
    return zone ? zone.toObject() : null;
  }

  async createDeliveryZone(zone: any): Promise<DeliveryZone> {
    const newZone = await DeliveryZoneModel.create(zone);
    return newZone.toObject();
  }

  async updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): Promise<DeliveryZone | null> {
    const updated = await DeliveryZoneModel.findByIdAndUpdate(
      id,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    );
    return updated ? updated.toObject() : null;
  }

  async deleteDeliveryZone(id: string): Promise<boolean> {
    const result = await DeliveryZoneModel.findByIdAndUpdate(
      id,
      { isActive: 0, updatedAt: new Date() },
      { new: true }
    );
    return !!result;
  }

  async getAvailableDrivers(): Promise<Employee[]> {
    return await EmployeeModel.find({ 
      role: 'driver', 
      isActivated: 1,
      isAvailableForDelivery: 1 
    });
  }

  async updateDriverAvailability(id: string, isAvailable: number): Promise<Employee | undefined> {
    const updated = await EmployeeModel.findByIdAndUpdate(
      id,
      { isAvailableForDelivery: isAvailable, updatedAt: new Date() },
      { new: true }
    );
    return updated || undefined;
  }

  async updateDriverLocation(id: string, location: {lat: number, lng: number}): Promise<Employee | undefined> {
    const updated = await EmployeeModel.findByIdAndUpdate(
      id,
      { 
        currentLocation: { 
          lat: location.lat, 
          lng: location.lng, 
          updatedAt: new Date() 
        },
        updatedAt: new Date()
      },
      { new: true }
    );
    return updated || undefined;
  }

  async assignDriverToOrder(orderId: string, driverId: string): Promise<Order | undefined> {
    const updated = await OrderModel.findByIdAndUpdate(
      orderId,
      { driverId, deliveryStatus: 'assigned', updatedAt: new Date() },
      { new: true }
    );
    return updated || undefined;
  }

  async updateOrderDeliveryStatus(orderId: string, status: string): Promise<Order | undefined> {
    const updated = await OrderModel.findByIdAndUpdate(
      orderId,
      { deliveryStatus: status, updatedAt: new Date() },
      { new: true }
    );
    return updated || undefined;
  }

  async startDelivery(orderId: string): Promise<Order | undefined> {
    const updated = await OrderModel.findByIdAndUpdate(
      orderId,
      { 
        deliveryStatus: 'out_for_delivery',
        deliveryStartedAt: new Date(),
        status: 'out_for_delivery',
        updatedAt: new Date()
      },
      { new: true }
    );
    return updated || undefined;
  }

  async completeDelivery(orderId: string): Promise<Order | undefined> {
    const updated = await OrderModel.findByIdAndUpdate(
      orderId,
      { 
        deliveryStatus: 'delivered',
        deliveredAt: new Date(),
        status: 'completed',
        updatedAt: new Date()
      },
      { new: true }
    );
    return updated || undefined;
  }

  async getActiveDeliveryOrders(): Promise<Order[]> {
    return await OrderModel.find({
      deliveryType: 'delivery',
      status: { $in: ['pending', 'payment_confirmed', 'in_progress', 'ready', 'out_for_delivery'] }
    }).sort({ createdAt: -1 });
  }

  async getDriverActiveOrders(driverId: string): Promise<Order[]> {
    return await OrderModel.find({
      driverId,
      deliveryStatus: { $in: ['assigned', 'out_for_delivery'] }
    }).sort({ createdAt: -1 });
  }

  async getTables(branchId?: string): Promise<Table[]> {
    const filter = branchId ? { branchId } : {};
    return await TableModel.find(filter).sort({ tableNumber: 1 });
  }

  async getTable(id: string): Promise<Table | null> {
    const table = await TableModel.findById(id);
    return table ? table.toObject() : null;
  }

  async getTableByNumber(tableNumber: string): Promise<Table | null> {
    const table = await TableModel.findOne({ tableNumber });
    return table ? table.toObject() : null;
  }

  async getTableByQRToken(qrToken: string): Promise<Table | null> {
    const table = await TableModel.findOne({ qrToken });
    return table ? table.toObject() : null;
  }

  async createTable(table: InsertTable): Promise<Table> {
    // Check for duplicate table number in the same branch
    const existingTable = await TableModel.findOne({
      tableNumber: table.tableNumber,
      branchId: table.branchId,
    });

    if (existingTable) {
      throw new Error(`Table number ${table.tableNumber} already exists in this branch`);
    }

    // Generate unique QR token (32 chars like loyalty cards for maximum security)
    const qrToken = nanoid(32);
    const newTable = await TableModel.create({
      ...table,
      qrToken,
      isOccupied: 0, // Set default
    });
    return newTable;
  }

  async bulkCreateTables(count: number, branchId?: string): Promise<Table[]> {
    const tables: Table[] = [];
    
    // Get all tables (including inactive) to find highest number
    const allTables = await TableModel.find(branchId ? { branchId } : {});
    
    // Find the highest table number (accounting for gaps from deletions)
    let highestNumber = 0;
    for (const table of allTables) {
      const num = parseInt(table.tableNumber);
      if (!isNaN(num) && num > highestNumber) {
        highestNumber = num;
      }
    }
    
    const startNumber = highestNumber + 1;

    for (let i = 0; i < count; i++) {
      const tableNumber = String(startNumber + i);
      const qrToken = nanoid(32);
      
      const newTable = await TableModel.create({
        tableNumber,
        qrToken,
        branchId,
        isActive: 1,
        isOccupied: 0,
      });
      
      tables.push(newTable);
    }
    
    return tables;
  }

  async updateTable(id: string, updates: Partial<Table>): Promise<Table | undefined> {
    // Build update object, handling null values to remove fields
    const updateObj: any = { ...updates, updatedAt: new Date() };
    const unsetObj: any = {};
    
    // Move null values to $unset for proper field removal
    Object.keys(updateObj).forEach(key => {
      if (updateObj[key] === null) {
        unsetObj[key] = 1;
        delete updateObj[key];
      }
    });
    
    // Build the final update query
    const query: any = {};
    if (Object.keys(updateObj).length > 0) {
      query.$set = updateObj;
    }
    if (Object.keys(unsetObj).length > 0) {
      query.$unset = unsetObj;
    }
    
    // If query is empty, just return the table
    const finalQuery = Object.keys(query).length === 0 ? updateObj : query;
    
    const updated = await TableModel.findByIdAndUpdate(
      id,
      finalQuery,
      { new: true }
    );
    return updated || undefined;
  }

  async deleteTable(id: string): Promise<boolean> {
    const result = await TableModel.findByIdAndUpdate(
      id,
      { isActive: 0, updatedAt: new Date() },
      { new: true }
    );
    return !!result;
  }

  async updateTableOccupancy(id: string, isOccupied: number, currentOrderId?: string): Promise<Table | undefined> {
    try {
      const updated = await TableModel.findByIdAndUpdate(
        id,
        { 
          $set: { 
            isOccupied, 
            currentOrderId: isOccupied ? currentOrderId : undefined,
            status: isOccupied ? 'occupied' : 'available',
            updatedAt: new Date() 
          } 
        },
        { new: true }
      );
      return updated ? serializeDoc(updated) : undefined;
    } catch (error) {
      console.error("Error updating table occupancy:", error);
      return undefined;
    }
  }

  async regenerateTableQRToken(id: string): Promise<Table | undefined> {
    const newQrToken = nanoid(32); // Use 32 chars for maximum security (same as loyalty cards)
    const updated = await TableModel.findByIdAndUpdate(
      id,
      { 
        qrToken: newQrToken,
        updatedAt: new Date() 
      },
      { new: true }
    );
    return updated || undefined;
  }

  async getTableOrders(status?: string): Promise<Order[]> {
    const filter: any = { orderType: 'dine-in' };
    if (status) {
      filter.status = status;
    }
    return await OrderModel.find(filter).sort({ createdAt: -1 });
  }

  async getPendingTableOrders(): Promise<Order[]> {
    return await OrderModel.find({
      orderType: 'dine-in',
      status: { $in: ['pending', 'payment_confirmed'] }
    }).sort({ createdAt: -1 });
  }

  async createTaxInvoice(invoiceData: any, invoiceNumber: string): Promise<any> {
    const { TaxInvoiceModel } = require("@shared/schema");
    const invoice = await TaxInvoiceModel.create({
      invoiceNumber,
      ...invoiceData,
      invoiceDate: new Date()
    });
    return invoice;
  }

  // ================== INVENTORY MANAGEMENT IMPLEMENTATIONS ==================

  // Raw Items
  async getRawItems(): Promise<RawItem[]> {
    const items = await RawItemModel.find({ $or: [{ isActive: 1 }, { isActive: { $exists: false } }] }).sort({ nameAr: 1 }).lean();
    return items.map((item: any) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async getRawItem(id: string): Promise<RawItem | undefined> {
    const item = await RawItemModel.findById(id).lean();
    if (!item) return undefined;
    return {
      ...item,
      id: (item as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async getRawItemByCode(code: string): Promise<RawItem | undefined> {
    const item = await RawItemModel.findOne({ code }).lean();
    if (!item) return undefined;
    return {
      ...item,
      id: (item as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async createRawItem(item: InsertRawItem): Promise<RawItem> {
    const itemWithDefaults = {
      ...item,
      isActive: item.isActive ?? 1,
    };
    const newItem = await RawItemModel.create(itemWithDefaults);
    return {
      ...newItem.toObject(),
      id: newItem._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async updateRawItem(id: string, updates: Partial<RawItem>): Promise<RawItem | undefined> {
    const updated = await RawItemModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: (updated as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async deleteRawItem(id: string): Promise<boolean> {
    const result = await RawItemModel.findByIdAndUpdate(id, { isActive: 0, updatedAt: new Date() });
    return !!result;
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const suppliers = await SupplierModel.find({ isActive: 1 }).sort({ nameAr: 1 }).lean();
    return suppliers.map((supplier: any) => ({
      ...supplier,
      id: supplier._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const supplier = await SupplierModel.findById(id).lean();
    if (!supplier) return undefined;
    return {
      ...supplier,
      id: (supplier as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async getSupplierByCode(code: string): Promise<Supplier | undefined> {
    const supplier = await SupplierModel.findOne({ code }).lean();
    if (!supplier) return undefined;
    return {
      ...supplier,
      id: (supplier as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const newSupplier = await SupplierModel.create(supplier);
    return {
      ...newSupplier.toObject(),
      id: newSupplier._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | undefined> {
    const updated = await SupplierModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: (updated as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await SupplierModel.findByIdAndUpdate(id, { isActive: 0, updatedAt: new Date() });
    return !!result;
  }

  // Branch Stock
  async getBranchStock(branchId: string): Promise<BranchStock[]> {
    const stocks = await BranchStockModel.find({ branchId }).lean();
    const stocksWithItems = await Promise.all(
      stocks.map(async (stock: any) => {
        const rawItem = await RawItemModel.findById(stock.rawItemId).lean();
        return {
          ...stock,
          id: stock._id.toString(),
          rawItem: rawItem ? { ...rawItem, id: (rawItem as any)._id.toString() } : null,
          _id: undefined,
          __v: undefined,
        };
      })
    );
    return stocksWithItems;
  }

  async getBranchStockItem(branchId: string, rawItemId: string): Promise<BranchStock | undefined> {
    const stock = await BranchStockModel.findOne({ branchId, rawItemId }).lean();
    if (!stock) return undefined;
    return {
      ...stock,
      id: (stock as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async updateBranchStock(
    branchId: string,
    rawItemId: string,
    quantity: number,
    createdBy: string,
    movementType: string = 'adjustment',
    notes?: string
  ): Promise<BranchStock> {
    let stock = await BranchStockModel.findOne({ branchId, rawItemId });
    const previousQuantity = stock?.currentQuantity || 0;
    const newQuantity = previousQuantity + quantity;

    if (stock) {
      stock.currentQuantity = newQuantity;
      stock.lastUpdated = new Date();
      if (notes) stock.notes = notes;
      await stock.save();
    } else {
      stock = await BranchStockModel.create({
        branchId,
        rawItemId,
        currentQuantity: newQuantity,
        reservedQuantity: 0,
        lastUpdated: new Date(),
        notes,
      });
    }

    // Create stock movement record
    await StockMovementModel.create({
      branchId,
      rawItemId,
      movementType,
      quantity,
      previousQuantity,
      newQuantity,
      referenceType: 'manual',
      notes,
      createdBy,
    });

    // Check for low stock alert
    const rawItem = await RawItemModel.findById(rawItemId);
    if (rawItem && newQuantity <= rawItem.minStockLevel) {
      const alertType = newQuantity === 0 ? 'out_of_stock' : 'low_stock';
      const existingAlert = await StockAlertModel.findOne({
        branchId,
        rawItemId,
        alertType,
        isResolved: 0,
      });
      if (!existingAlert) {
        await StockAlertModel.create({
          branchId,
          rawItemId,
          alertType,
          currentQuantity: newQuantity,
          thresholdQuantity: rawItem.minStockLevel,
        });
      }
    }

    return {
      ...stock.toObject(),
      id: stock._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async getLowStockItems(branchId?: string): Promise<any[]> {
    const rawItems = await RawItemModel.find({ isActive: 1 }).lean();
    const lowStockItems: any[] = [];

    for (const item of rawItems) {
      const filter: any = { rawItemId: (item as any)._id.toString() };
      if (branchId) filter.branchId = branchId;

      const stocks = await BranchStockModel.find(filter).lean();
      for (const stock of stocks) {
        if (stock.currentQuantity <= item.minStockLevel) {
          const branch = await BranchModel.findById(stock.branchId).lean();
          lowStockItems.push({
            rawItem: { ...item, id: (item as any)._id.toString() },
            stock: { ...stock, id: (stock as any)._id.toString() },
            branch: branch ? { ...branch, id: (branch as any)._id.toString() } : null,
            alertLevel: stock.currentQuantity === 0 ? 'critical' : 'warning',
          });
        }
      }
    }

    return lowStockItems;
  }

  async getAllBranchesStock(): Promise<any[]> {
    const branches = await BranchModel.find({ isActive: 1 }).lean();
    const result: any[] = [];

    for (const branch of branches) {
      const branchId = (branch as any)._id.toString();
      const stocks = await BranchStockModel.find({ branchId }).lean();
      const stocksWithItems = await Promise.all(
        stocks.map(async (stock: any) => {
          const rawItem = await RawItemModel.findById(stock.rawItemId).lean();
          return {
            ...stock,
            id: stock._id.toString(),
            rawItem: rawItem ? { ...rawItem, id: (rawItem as any)._id.toString() } : null,
          };
        })
      );

      result.push({
        branch: { ...branch, id: branchId },
        stocks: stocksWithItems,
      });
    }

    return result;
  }

  // Stock Transfers
  async getStockTransfers(branchId?: string): Promise<StockTransfer[]> {
    const filter: any = {};
    if (branchId) {
      filter.$or = [{ fromBranchId: branchId }, { toBranchId: branchId }];
    }
    const transfers = await StockTransferModel.find(filter).sort({ createdAt: -1 }).lean();
    return transfers.map((transfer: any) => ({
      ...transfer,
      id: transfer._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async getStockTransfer(id: string): Promise<StockTransfer | undefined> {
    const transfer = await StockTransferModel.findById(id).lean();
    if (!transfer) return undefined;
    return {
      ...transfer,
      id: (transfer as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async createStockTransfer(transfer: InsertStockTransfer): Promise<StockTransfer> {
    const transferNumber = `TRF-${Date.now()}-${nanoid(4).toUpperCase()}`;
    const newTransfer = await StockTransferModel.create({
      ...transfer,
      transferNumber,
      status: 'pending',
      requestDate: new Date(),
    });
    return {
      ...newTransfer.toObject(),
      id: newTransfer._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async updateStockTransferStatus(id: string, status: string, approvedBy?: string): Promise<StockTransfer | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (status === 'approved' && approvedBy) {
      updates.approvedBy = approvedBy;
      updates.approvalDate = new Date();
    }
    const updated = await StockTransferModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: (updated as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async completeStockTransfer(id: string, completedBy: string): Promise<StockTransfer | undefined> {
    const transfer = await StockTransferModel.findById(id);
    if (!transfer || transfer.status !== 'approved') return undefined;

    // Process each item in the transfer
    for (const item of transfer.items) {
      // Decrease stock from source branch
      await this.updateBranchStock(
        transfer.fromBranchId,
        item.rawItemId,
        -item.quantity,
        completedBy,
        'transfer_out',
        `Transfer to branch: ${transfer.toBranchId}`
      );

      // Increase stock in destination branch
      await this.updateBranchStock(
        transfer.toBranchId,
        item.rawItemId,
        item.quantity,
        completedBy,
        'transfer_in',
        `Transfer from branch: ${transfer.fromBranchId}`
      );
    }

    transfer.status = 'completed';
    transfer.completionDate = new Date();
    transfer.updatedAt = new Date();
    await transfer.save();

    return {
      ...transfer.toObject(),
      id: transfer._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  // Purchase Invoices
  async getPurchaseInvoices(branchId?: string): Promise<PurchaseInvoice[]> {
    const filter = branchId ? { branchId } : {};
    const invoices = await PurchaseInvoiceModel.find(filter).sort({ createdAt: -1 }).lean();
    return invoices.map((invoice: any) => ({
      ...invoice,
      id: invoice._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async getPurchaseInvoice(id: string): Promise<PurchaseInvoice | undefined> {
    const invoice = await PurchaseInvoiceModel.findById(id).lean();
    if (!invoice) return undefined;
    return {
      ...invoice,
      id: (invoice as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async createPurchaseInvoice(invoice: InsertPurchaseInvoice): Promise<PurchaseInvoice> {
    const invoiceNumber = `PUR-${Date.now()}-${nanoid(4).toUpperCase()}`;
    const newInvoice = await PurchaseInvoiceModel.create({
      ...invoice,
      invoiceNumber,
      status: 'pending',
      paymentStatus: 'unpaid',
      paidAmount: 0,
    });
    return {
      ...newInvoice.toObject(),
      id: newInvoice._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async updatePurchaseInvoice(id: string, updates: Partial<PurchaseInvoice>): Promise<PurchaseInvoice | undefined> {
    const updated = await PurchaseInvoiceModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: (updated as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async receivePurchaseInvoice(id: string, receivedBy: string): Promise<PurchaseInvoice | undefined> {
    const invoice = await PurchaseInvoiceModel.findById(id);
    if (!invoice || invoice.status === 'received') return undefined;

    // Add items to branch stock
    for (const item of invoice.items) {
      await this.updateBranchStock(
        invoice.branchId,
        item.rawItemId,
        item.quantity,
        receivedBy,
        'purchase',
        `Purchase invoice: ${invoice.invoiceNumber}`
      );

      // Update raw item cost if different
      const rawItem = await RawItemModel.findById(item.rawItemId);
      if (rawItem && rawItem.unitCost !== item.unitCost) {
        await RawItemModel.findByIdAndUpdate(item.rawItemId, { unitCost: item.unitCost, updatedAt: new Date() });
      }
    }

    invoice.status = 'received';
    invoice.receivedDate = new Date();
    invoice.receivedBy = receivedBy;
    invoice.updatedAt = new Date();
    await invoice.save();

    return {
      ...invoice.toObject(),
      id: invoice._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async updatePurchaseInvoicePayment(id: string, paidAmount: number): Promise<PurchaseInvoice | undefined> {
    const invoice = await PurchaseInvoiceModel.findById(id);
    if (!invoice) return undefined;

    invoice.paidAmount = paidAmount;
    if (paidAmount >= invoice.totalAmount) {
      invoice.paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      invoice.paymentStatus = 'partial';
    }
    invoice.updatedAt = new Date();
    await invoice.save();

    return {
      ...invoice.toObject(),
      id: invoice._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  // Recipe Items
  async getAllRecipeItems(): Promise<RecipeItem[]> {
    const items = await RecipeItemModel.find({}).lean();
    return items.map((item: any) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async getRecipeItems(coffeeItemId: string): Promise<RecipeItem[]> {
    const items = await RecipeItemModel.find({ coffeeItemId }).lean();
    return items.map((item: any) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async createRecipeItem(item: InsertRecipeItem): Promise<RecipeItem> {
    const newItem = await RecipeItemModel.create(item);
    return {
      ...newItem.toObject(),
      id: newItem._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async updateRecipeItem(id: string, updates: Partial<RecipeItem>): Promise<RecipeItem | undefined> {
    const updated = await RecipeItemModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: (updated as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async deleteRecipeItem(id: string): Promise<boolean> {
    const result = await RecipeItemModel.findByIdAndDelete(id);
    return !!result;
  }

  async calculateProductCost(coffeeItemId: string): Promise<number> {
    const recipeItems = await RecipeItemModel.find({ coffeeItemId }).lean();
    let totalCost = 0;

    for (const item of recipeItems) {
      const rawItem = await RawItemModel.findById(item.rawItemId).lean();
      if (rawItem) {
        // Convert quantity to base unit and calculate cost
        totalCost += item.quantity * rawItem.unitCost;
      }
    }

    return totalCost;
  }

  // Stock Alerts
  async getStockAlerts(branchId?: string, resolved?: boolean): Promise<StockAlert[]> {
    const filter: any = {};
    if (branchId) filter.branchId = branchId;
    if (resolved !== undefined) filter.isResolved = resolved ? 1 : 0;

    const alerts = await StockAlertModel.find(filter).sort({ createdAt: -1 }).lean();
    return alerts.map((alert: any) => ({
      ...alert,
      id: alert._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async createStockAlert(
    branchId: string,
    rawItemId: string,
    alertType: string,
    currentQuantity: number,
    thresholdQuantity: number
  ): Promise<StockAlert> {
    const alert = await StockAlertModel.create({
      branchId,
      rawItemId,
      alertType,
      currentQuantity,
      thresholdQuantity,
    });
    return {
      ...alert.toObject(),
      id: alert._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async resolveStockAlert(id: string, resolvedBy: string): Promise<StockAlert | undefined> {
    const updated = await StockAlertModel.findByIdAndUpdate(
      id,
      { isResolved: 1, resolvedBy, resolvedAt: new Date() },
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: (updated as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  async markAlertAsRead(id: string): Promise<StockAlert | undefined> {
    const updated = await StockAlertModel.findByIdAndUpdate(
      id,
      { isRead: 1 },
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: (updated as any)._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  // Stock Movements
  async getStockMovements(branchId: string, rawItemId?: string, limit: number = 100): Promise<StockMovement[]> {
    const filter: any = { branchId };
    if (rawItemId) filter.rawItemId = rawItemId;

    const movements = await StockMovementModel.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return movements.map((movement: any) => ({
      ...movement,
      id: movement._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const newMovement = await StockMovementModel.create(movement);
    return {
      ...newMovement.toObject(),
      id: newMovement._id.toString(),
      _id: undefined,
      __v: undefined,
    } as any;
  }

  private convertToBaseUnit(quantity: number, unit: string): { value: number; baseUnit: string } {
    const conversions: Record<string, { factor: number; baseUnit: string }> = {
      'kg': { factor: 1000, baseUnit: 'g' },
      'g': { factor: 1, baseUnit: 'g' },
      'liter': { factor: 1000, baseUnit: 'ml' },
      'ml': { factor: 1, baseUnit: 'ml' },
      'piece': { factor: 1, baseUnit: 'piece' },
      'box': { factor: 1, baseUnit: 'box' },
      'bag': { factor: 1, baseUnit: 'bag' },
    };

    const conversion = conversions[unit.toLowerCase()] || { factor: 1, baseUnit: unit };
    return {
      value: quantity * conversion.factor,
      baseUnit: conversion.baseUnit,
    };
  }

  async deductInventoryForOrder(
    orderId: string,
    branchId: string,
    items: Array<{ coffeeItemId: string; quantity: number; addons?: Array<{ rawItemId: string; quantity: number; unit: string }> }>,
    createdBy: string
  ): Promise<{
    success: boolean;
    costOfGoods: number;
    grossProfit: number;
    deductionDetails: Array<{
      rawItemId: string;
      rawItemName: string;
      quantity: number;
      unit: string;
      unitCost: number;
      totalCost: number;
      previousQuantity: number;
      newQuantity: number;
      status: 'deducted' | 'skipped_no_stock' | 'skipped_insufficient' | 'skipped_no_recipe';
      message: string;
    }>;
    shortages: Array<{
      rawItemId: string;
      rawItemName: string;
      required: number;
      available: number;
      unit: string;
    }>;
    warnings: string[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const shortages: Array<{
      rawItemId: string;
      rawItemName: string;
      required: number;
      available: number;
      unit: string;
    }> = [];
    const deductionDetails: Array<{
      rawItemId: string;
      rawItemName: string;
      quantity: number;
      unit: string;
      unitCost: number;
      totalCost: number;
      previousQuantity: number;
      newQuantity: number;
      status: 'deducted' | 'skipped_no_stock' | 'skipped_insufficient' | 'skipped_no_recipe';
      message: string;
    }> = [];
    let totalCostOfGoods = 0;

    try {
      // Phase 1: Aggregate all requirements from recipes
      const aggregatedRequirements: Map<string, {
        rawItemId: string;
        rawItemName: string;
        quantity: number;
        unit: string;
        unitCost: number;
      }> = new Map();

      let hasAnyRecipe = false;

      for (const item of items) {
        const recipeItems = await RecipeItemModel.find({ coffeeItemId: item.coffeeItemId }).lean();

        if (recipeItems.length === 0) {
          warnings.push(`لا توجد وصفة للمنتج: ${item.coffeeItemId} - لم يتم خصم مخزون`);
          continue;
        }

        hasAnyRecipe = true;

        for (const recipeItem of recipeItems) {
          const rawItem = await RawItemModel.findById(recipeItem.rawItemId).lean();
          if (!rawItem) {
            errors.push(`المادة الخام غير موجودة: ${recipeItem.rawItemId}`);
            continue;
          }

          const recipeUnit = recipeItem.unit || rawItem.unit;
          const totalQuantityToDeduct = recipeItem.quantity * item.quantity;

          const existing = aggregatedRequirements.get(recipeItem.rawItemId);
          if (existing) {
            existing.quantity += totalQuantityToDeduct;
          } else {
            aggregatedRequirements.set(recipeItem.rawItemId, {
              rawItemId: recipeItem.rawItemId,
              rawItemName: rawItem.nameAr || rawItem.nameEn || 'Unknown',
              quantity: totalQuantityToDeduct,
              unit: recipeUnit,
              unitCost: rawItem.unitCost,
            });
          }
        }

        // Phase 1b: Process addon customizations for this item (if any)
        // Note: addon.quantity is already pre-calculated in routes.ts to include:
        // (addon selection qty * quantityPerUnit * order item qty)
        // So we do NOT multiply by item.quantity here
        if (item.addons && item.addons.length > 0) {
          for (const addon of item.addons) {
            const rawItem = await RawItemModel.findById(addon.rawItemId).lean();
            if (!rawItem) {
              errors.push(`مادة الإضافة غير موجودة: ${addon.rawItemId}`);
              continue;
            }

            // addon.quantity is already the total raw material needed (pre-calculated)
            const totalAddonQuantity = addon.quantity;
            const existing = aggregatedRequirements.get(addon.rawItemId);
            if (existing) {
              existing.quantity += totalAddonQuantity;
            } else {
              aggregatedRequirements.set(addon.rawItemId, {
                rawItemId: addon.rawItemId,
                rawItemName: rawItem.nameAr || rawItem.nameEn || 'Unknown (Addon)',
                quantity: totalAddonQuantity,
                unit: addon.unit || rawItem.unit,
                unitCost: rawItem.unitCost,
              });
            }
          }
        }
      }

      // Phase 2: Preflight check - validate stock availability BEFORE any deduction
      for (const [rawItemId, requirement] of aggregatedRequirements) {
        const branchStock = await BranchStockModel.findOne({ branchId, rawItemId }).lean();
        const availableQuantity = branchStock?.currentQuantity || 0;

        // Check if branch stock exists
        if (!branchStock) {
          shortages.push({
            rawItemId: requirement.rawItemId,
            rawItemName: requirement.rawItemName,
            required: requirement.quantity,
            available: 0,
            unit: requirement.unit,
          });
          warnings.push(`⚠️ لا يوجد سجل مخزون لـ ${requirement.rawItemName} في هذا الفرع - لم يتم الخصم`);
          
          // Calculate expected cost for reporting (but NOT added to actual COGS since no deduction)
          const expectedCost = requirement.quantity * requirement.unitCost;
          
          deductionDetails.push({
            rawItemId: requirement.rawItemId,
            rawItemName: requirement.rawItemName,
            quantity: requirement.quantity,
            unit: requirement.unit,
            unitCost: requirement.unitCost,
            totalCost: 0, // No cost incurred since no deduction
            previousQuantity: 0,
            newQuantity: 0,
            status: 'skipped_no_stock',
            message: `لا يوجد سجل مخزون في هذا الفرع - التكلفة المتوقعة: ${expectedCost.toFixed(2)} ريال`,
          });
          continue;
        }

        // Check if sufficient stock available - PREVENT negative deduction
        if (availableQuantity < requirement.quantity) {
          shortages.push({
            rawItemId: requirement.rawItemId,
            rawItemName: requirement.rawItemName,
            required: requirement.quantity,
            available: availableQuantity,
            unit: requirement.unit,
          });
          warnings.push(`⚠️ مخزون ${requirement.rawItemName} غير كافي: المطلوب ${requirement.quantity} ${requirement.unit}، المتوفر ${availableQuantity} ${requirement.unit} - لم يتم الخصم`);
          
          // Calculate expected cost for reporting (but NOT added to actual COGS since no deduction)
          const expectedCost = requirement.quantity * requirement.unitCost;
          
          deductionDetails.push({
            rawItemId: requirement.rawItemId,
            rawItemName: requirement.rawItemName,
            quantity: requirement.quantity,
            unit: requirement.unit,
            unitCost: requirement.unitCost,
            totalCost: 0, // No cost incurred since no deduction
            previousQuantity: availableQuantity,
            newQuantity: availableQuantity, // Stock unchanged - no deduction
            status: 'skipped_insufficient',
            message: `المخزون غير كافي: المطلوب ${requirement.quantity}، المتوفر ${availableQuantity} - التكلفة المتوقعة: ${expectedCost.toFixed(2)} ريال`,
          });
          continue;
        }

        // Stock is sufficient - proceed with deduction
        const itemCost = requirement.quantity * requirement.unitCost;
        totalCostOfGoods += itemCost;

        try {
          const newQuantity = availableQuantity - requirement.quantity;
          
          // Perform the deduction
          await this.updateBranchStock(
            branchId,
            rawItemId,
            -requirement.quantity,
            createdBy,
            'order_deduction',
            `خصم للطلب: ${orderId}`
          );

          // Record stock movement
          await StockMovementModel.create({
            branchId,
            rawItemId,
            movementType: 'sale',
            quantity: -requirement.quantity,
            previousQuantity: availableQuantity,
            newQuantity: newQuantity,
            referenceType: 'order',
            referenceId: orderId,
            notes: `خصم تلقائي للطلب ${orderId}`,
            createdBy,
            createdAt: new Date(),
          });

          deductionDetails.push({
            rawItemId: requirement.rawItemId,
            rawItemName: requirement.rawItemName,
            quantity: requirement.quantity,
            unit: requirement.unit,
            unitCost: requirement.unitCost,
            totalCost: itemCost,
            previousQuantity: availableQuantity,
            newQuantity: newQuantity,
            status: 'deducted',
            message: `تم الخصم بنجاح: ${availableQuantity} -> ${newQuantity} ${requirement.unit}`,
          });

          console.log(`[INVENTORY] ✅ Deducted ${requirement.quantity} ${requirement.unit} of ${requirement.rawItemName} | Stock: ${availableQuantity} -> ${newQuantity}`);

        } catch (error: any) {
          errors.push(`فشل في خصم ${requirement.rawItemName}: ${error.message}`);
          deductionDetails.push({
            rawItemId: requirement.rawItemId,
            rawItemName: requirement.rawItemName,
            quantity: requirement.quantity,
            unit: requirement.unit,
            unitCost: requirement.unitCost,
            totalCost: itemCost,
            previousQuantity: availableQuantity,
            newQuantity: availableQuantity,
            status: 'skipped_insufficient',
            message: `خطأ في الخصم: ${error.message}`,
          });
        }
      }

      // Calculate success metrics
      const successfulDeductions = deductionDetails.filter(d => d.status === 'deducted');
      const hasShortages = shortages.length > 0;
      const allDeductionsSuccessful = successfulDeductions.length === deductionDetails.length && errors.length === 0;

      // Get order for gross profit calculation
      const order = await OrderModel.findById(orderId);
      const totalRevenue = order?.totalAmount || 0;
      const grossProfit = totalRevenue - totalCostOfGoods;

      // Determine inventory status
      let inventoryStatus = 0; // 0 = not deducted
      if (allDeductionsSuccessful && !hasShortages && successfulDeductions.length > 0) {
        inventoryStatus = 1; // 1 = fully deducted
      } else if (successfulDeductions.length > 0) {
        inventoryStatus = 2; // 2 = partially deducted (with shortages/errors)
      }

      // Update order with deduction results
      await OrderModel.findByIdAndUpdate(orderId, {
        costOfGoods: totalCostOfGoods,
        grossProfit: grossProfit,
        inventoryDeducted: inventoryStatus,
        inventoryDeductionDetails: deductionDetails,
        updatedAt: new Date(),
      });

      // Log summary
      if (hasShortages || errors.length > 0) {
        console.warn(`[INVENTORY] Order ${orderId} deduction issues:`, { 
          shortagesCount: shortages.length, 
          errorsCount: errors.length,
          successfulCount: successfulDeductions.length,
          totalCOGS: totalCostOfGoods.toFixed(2)
        });
      } else if (successfulDeductions.length > 0) {
        console.log(`[INVENTORY] ✅ Order ${orderId}: All ${successfulDeductions.length} items deducted successfully | COGS: ${totalCostOfGoods.toFixed(2)} SAR | Gross Profit: ${grossProfit.toFixed(2)} SAR`);
      }

      return {
        success: allDeductionsSuccessful,
        costOfGoods: totalCostOfGoods,
        grossProfit,
        deductionDetails,
        shortages,
        warnings,
        errors,
      };
    } catch (error: any) {
      errors.push(`خطأ حرج: ${error.message}`);
      return {
        success: false,
        costOfGoods: 0,
        grossProfit: 0,
        deductionDetails: [],
        shortages: [],
        warnings,
        errors,
      };
    }
  }

  async calculateOrderCOGS(items: Array<{ coffeeItemId: string; quantity: number }>, branchId?: string): Promise<{
    totalCost: number;
    itemBreakdown: Array<{
      coffeeItemId: string;
      coffeeItemName: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      ingredients: Array<{
        rawItemId: string;
        rawItemName: string;
        quantity: number;
        unit: string;
        unitCost: number;
        totalCost: number;
      }>;
    }>;
    shortages: Array<{
      rawItemId: string;
      rawItemName: string;
      required: number;
      available: number;
      unit: string;
    }>;
  }> {
    const itemBreakdown: Array<{
      coffeeItemId: string;
      coffeeItemName: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      ingredients: Array<{
        rawItemId: string;
        rawItemName: string;
        quantity: number;
        unit: string;
        unitCost: number;
        totalCost: number;
      }>;
    }> = [];
    const shortages: Array<{
      rawItemId: string;
      rawItemName: string;
      required: number;
      available: number;
      unit: string;
    }> = [];
    const aggregatedRequirements: Map<string, {
      rawItemId: string;
      rawItemName: string;
      quantity: number;
      unit: string;
    }> = new Map();
    let totalCost = 0;

    for (const item of items) {
      const coffeeItem = await CoffeeItemModel.findOne({ id: item.coffeeItemId }).lean();
      const recipeItems = await RecipeItemModel.find({ coffeeItemId: item.coffeeItemId }).lean();

      let itemUnitCost = 0;
      const ingredients: Array<{
        rawItemId: string;
        rawItemName: string;
        quantity: number;
        unit: string;
        unitCost: number;
        totalCost: number;
      }> = [];

      for (const recipeItem of recipeItems) {
        const rawItem = await RawItemModel.findById(recipeItem.rawItemId).lean();
        if (rawItem) {
          const recipeUnit = recipeItem.unit || rawItem.unit;
          const ingredientCost = recipeItem.quantity * rawItem.unitCost;
          itemUnitCost += ingredientCost;

          ingredients.push({
            rawItemId: recipeItem.rawItemId,
            rawItemName: rawItem.nameAr || rawItem.nameEn || 'Unknown',
            quantity: recipeItem.quantity,
            unit: recipeUnit,
            unitCost: rawItem.unitCost,
            totalCost: ingredientCost,
          });

          const totalQuantityRequired = recipeItem.quantity * item.quantity;
          const existing = aggregatedRequirements.get(recipeItem.rawItemId);
          if (existing) {
            existing.quantity += totalQuantityRequired;
          } else {
            aggregatedRequirements.set(recipeItem.rawItemId, {
              rawItemId: recipeItem.rawItemId,
              rawItemName: rawItem.nameAr || rawItem.nameEn || 'Unknown',
              quantity: totalQuantityRequired,
              unit: recipeUnit,
            });
          }
        }
      }

      const itemTotalCost = itemUnitCost * item.quantity;
      totalCost += itemTotalCost;

      itemBreakdown.push({
        coffeeItemId: item.coffeeItemId,
        coffeeItemName: coffeeItem?.nameAr || coffeeItem?.nameEn || 'Unknown',
        quantity: item.quantity,
        unitCost: itemUnitCost,
        totalCost: itemTotalCost,
        ingredients,
      });
    }

    if (branchId) {
      for (const [rawItemId, requirement] of aggregatedRequirements) {
        const branchStock = await BranchStockModel.findOne({ branchId, rawItemId }).lean();
        const availableQuantity = branchStock?.currentQuantity || 0;

        if (availableQuantity < requirement.quantity) {
          shortages.push({
            rawItemId: requirement.rawItemId,
            rawItemName: requirement.rawItemName,
            required: requirement.quantity,
            available: availableQuantity,
            unit: requirement.unit,
          });
        }
      }
    }

    return {
      totalCost,
      itemBreakdown,
      shortages,
    };
  }
}

export const storage = new DBStorage();
