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
  type Branch,
  type InsertBranch,
  type Category,
  type InsertCategory,
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
  BranchModel,
  CategoryModel,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByUsername(username: string): Promise<Employee | undefined>;
  getEmployeeByPhone(phone: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;
  activateEmployee(phone: string, fullName: string, password: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;

  createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode>;
  getDiscountCode(id: string): Promise<DiscountCode | undefined>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  getDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCodesByEmployee(employeeId: string): Promise<DiscountCode[]>;
  updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode | undefined>;
  incrementDiscountCodeUsage(id: string): Promise<DiscountCode | undefined>;

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

  getCoffeeItems(): Promise<CoffeeItem[]>;
  getCoffeeItem(id: string): Promise<CoffeeItem | undefined>;
  getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]>;
  createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem>;
  updateCoffeeItem(id: string, item: Partial<CoffeeItem>): Promise<CoffeeItem | undefined>;

  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string, cancellationReason?: string): Promise<Order | undefined>;
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
  addCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<any>;
  removeCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<void>;
  getCoffeeItemsByIngredient(ingredientId: string): Promise<CoffeeItem[]>;

  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | undefined>;
  deleteBranch(id: string): Promise<boolean>;

  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  getCustomers(): Promise<Customer[]>;
  getOrdersByEmployee(employeeId: string): Promise<Order[]>;
}

export class DBStorage implements IStorage {
  private orderCounter: number = 1;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await this.initializeCoffeeMenu();
      await this.initializeDemoEmployee();
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  private async initializeCoffeeMenu() {
    const existingItems = await CoffeeItemModel.find();
    if (existingItems.length === 24) {
      return;
    }

    if (existingItems.length > 0 && existingItems.length < 24) {
      await CoffeeItemModel.deleteMany({});
    }

    const coffeeMenuData = [
      { id: "espresso-single", nameAr: "إسبريسو (شوت)", nameEn: "Espresso Single", description: "قهوة إسبريسو مركزة من حبوب عربية مختارة", price: 4.00, oldPrice: 5.00, category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 10, availabilityStatus: "available" },
      { id: "espresso-double", nameAr: "إسبريسو (دبل شوت)", nameEn: "Espresso Double", description: "قهوة إسبريسو مضاعفة للباحثين عن النكهة القوية", price: 5.00, oldPrice: 6.00, category: "basic", imageUrl: "/attached_assets/generated_images/Luxury_espresso_shot_coffee_d4560626.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 12 },
      { id: "americano", nameAr: "أمريكانو", nameEn: "Americano", description: "إسبريسو مخفف بالماء الساخن لطعم معتدل", price: 5.00, oldPrice: 6.00, category: "basic", imageUrl: "/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757426884660.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 3 },
      { id: "ristretto", nameAr: "ريستريتو", nameEn: "Ristretto", description: "إسبريسو مركز بنصف كمية الماء لطعم أقوى", price: 5.00, oldPrice: 6.00, category: "basic", imageUrl: "/attached_assets/ChatGPT Image Sep 9, 2025, 04_06_17 PM_1757428239748.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 11 },
      { id: "turkish-coffee", nameAr: "قهوة تركي", nameEn: "Turkish Coffee", description: "قهوة تركية تقليدية محضرة بطريقة عريقة، غنية بالنكهة والتراث", price: 5.00, category: "basic", imageUrl: "/attached_assets/Screenshot 2025-10-05 003822_1759666311817.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 6 },
      { id: "cafe-latte", nameAr: "كافيه لاتيه", nameEn: "Cafe Latte", description: "إسبريسو مع حليب مخفوق كريمي ورغوة ناعمة", price: 5.00, oldPrice: 6.00, category: "hot", imageUrl: "/attached_assets/generated_images/Luxury_café_latte_drink_156cb225.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "cappuccino", nameAr: "كابتشينو", nameEn: "Cappuccino", description: "مزيج متوازن من الإسبريسو والحليب والرغوة", price: 5.00, oldPrice: 6.00, category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191916_1757434923575.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "vanilla-latte", nameAr: "فانيلا لاتيه", nameEn: "Vanilla Latte", description: "لاتيه كلاسيكي مع نكهة الفانيلا الطبيعية", price: 6.00, oldPrice: 7.00, category: "hot", imageUrl: "/attached_assets/Elegant Coffee Culture Design_1757428233689.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "mocha", nameAr: "موكا", nameEn: "Mocha", description: "مزيج رائع من القهوة والشوكولاتة والحليب", price: 7.00, oldPrice: 8.00, category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191928_1757434923575.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 6 },
      { id: "con-panna", nameAr: "كافيه كون بانا", nameEn: "Cafe Con Panna", description: "إسبريسو مع كريمة مخفوقة طازجة", price: 5.00, oldPrice: 6.00, category: "hot", imageUrl: "/attached_assets/Screenshot 2025-09-09 191936_1757434923574.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 7 },
      { id: "coffee-day-hot", nameAr: "قهوة اليوم (حار)", nameEn: "Coffee of the Day Hot", description: "تشكيلة مختارة يومياً من أفضل حبوب القهوة", price: 4.95, oldPrice: 5.50, category: "hot", imageUrl: "/attached_assets/coffee-day-hot-new.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "french-press", nameAr: "قهوة فرنسي", nameEn: "French Press Coffee", description: "قهوة فرنسية فاخرة محضرة بطريقة الكبس الفرنسي، تمنحك نكهة غنية ومميزة", price: 6.00, category: "hot", imageUrl: "/attached_assets/Screenshot 2025-10-05 003844_1759666320914.png", isAvailable: 1, coffeeStrength: "medium", strengthLevel: 6 },
      { id: "hot-tea", nameAr: "شاي حار", nameEn: "Hot Tea", description: "شاي طبيعي مُحضر بعناية من أوراق الشاي المختارة، يُقدم ساخناً ومنعشاً لبداية يوم مثالية", price: 2.00, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161654_1758288116712.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "ice-tea", nameAr: "آيس تي", nameEn: "Ice Tea", description: "انتعاش لا يُقاوم مع مزيج مثالي من الشاي المنقوع ببرودة والطعم المميز، رحلة منعشة في كل رشفة تجدد طاقتك وتمنحك لحظات من الصفاء", price: 3.00, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161645_1758288659656.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "iced-matcha-latte", nameAr: "آيس لاتيه ماتشا", nameEn: "Iced Matcha Latte", description: "إبداع ياباني ساحر يجمع بين نعومة الحليب المثلج وسحر الماتشا الأخضر النقي، تجربة بصرية وذوقية استثنائية تأخذك في رحلة إلى عالم من الهدوء والتميز", price: 10.00, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161627_1758288688792.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "hot-matcha-latte", nameAr: "لاتيه ماتشا حار", nameEn: "Hot Matcha Latte", description: "دفء ساحر يلتقي مع نكهة الماتشا الاستثنائية في لحن متناغم من الكريمة والطعم الياباني الأصيل، يُقدم ساخناً بفن لاتيه مبهر يسعد العين قبل أن يأسر الذوق", price: 11.00, category: "specialty", imageUrl: "/attached_assets/Screenshot 2025-09-19 161637_1758288723420.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "iced-latte", nameAr: "آيسد لاتيه", nameEn: "Iced Latte", description: "لاتيه منعش مع الثلج والحليب البارد", price: 6.00, oldPrice: 7.00, category: "cold", imageUrl: "/attached_assets/generated_images/Luxury_iced_coffee_drink_571860f5.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "iced-mocha", nameAr: "آيسد موكا", nameEn: "Iced Mocha", description: "موكا باردة مع الشوكولاتة والكريمة المخفوقة", price: 7.00, oldPrice: 8.00, category: "cold", imageUrl: "/attached_assets/generated_images/Luxury_iced_coffee_drink_571860f5.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 5 },
      { id: "iced-cappuccino", nameAr: "آيسد كابتشينو", nameEn: "Iced Cappuccino", description: "كابتشينو بارد مع رغوة الحليب المثلجة", price: 6.00, oldPrice: 7.00, category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192012_1757434923573.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "iced-condensed", nameAr: "قهوة مثلجة بالحليب المكثف", nameEn: "Iced Coffee with Condensed Milk", description: "قهوة باردة مع حليب مكثف حلو ولذيذ", price: 5.00, oldPrice: 6.00, category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192022_1757434929813.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 5 },
      { id: "vanilla-cold-brew", nameAr: "فانيلا كولد برو", nameEn: "Vanilla Cold Brew", description: "قهوة باردة منقوعة ببطء مع نكهة الفانيلا", price: 6.00, oldPrice: 7.00, category: "cold", imageUrl: "/attached_assets/Screenshot 2025-09-09 192045_1757434923573.png", isAvailable: 1, coffeeStrength: "classic", strengthLevel: 2 },
      { id: "coffee-day-cold", nameAr: "قهوة اليوم (بارد)", nameEn: "Coffee of the Day Cold", description: "تشكيلة مختارة يومياً من القهوة الباردة المنعشة", price: 4.95, oldPrice: 5.50, category: "cold", imageUrl: "/attached_assets/coffee-day-cold-new.png", isAvailable: 1, coffeeStrength: "classic" },
      { id: "coffee-dessert-cup", nameAr: "حلى قهوة كوب", nameEn: "Coffee Dessert Cup", description: "حلى قهوة فاخر في كوب، طبقات من الكريمة والقهوة والبسكويت المطحون، تجربة حلوة لا تُنسى", price: 8.00, category: "desserts", imageUrl: "/attached_assets/Screenshot 2025-10-05 012338_1759666320915.png", isAvailable: 1, coffeeStrength: "classic" },
    ];

    await CoffeeItemModel.insertMany(coffeeMenuData);
  }

  private async initializeDemoEmployee() {
    const existing = await EmployeeModel.findOne({ username: 'manager' });
    if (existing) return;

    const hashedPassword = bcrypt.hashSync('2030', 10);
    await EmployeeModel.create({
      username: 'manager',
      password: hashedPassword,
      fullName: 'المدير',
      role: 'manager',
      title: 'مدير المقهى',
      phone: '500000000',
      jobTitle: 'مدير',
      isActivated: 1,
    });
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

  async getEmployee(id: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findById(id);
    return employee || undefined;
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
    if (insertEmployee.password) {
      const hashedPassword = await bcrypt.hash(insertEmployee.password, 10);
      const newEmployee = await EmployeeModel.create({
        ...insertEmployee,
        password: hashedPassword,
      });
      return newEmployee;
    } else {
      const newEmployee = await EmployeeModel.create({
        ...insertEmployee,
      });
      return newEmployee;
    }
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    updates.updatedAt = new Date();
    const employee = await EmployeeModel.findByIdAndUpdate(id, updates, { new: true });
    return employee || undefined;
  }

  async activateEmployee(phone: string, fullName: string, password: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findOne({ phone, fullName, isActivated: 0 });
    if (!employee) return undefined;

    const hashedPassword = await bcrypt.hash(password, 10);
    employee.password = hashedPassword;
    employee.isActivated = 1;
    employee.updatedAt = new Date();
    await employee.save();
    return employee;
  }

  async getEmployees(): Promise<Employee[]> {
    return await EmployeeModel.find();
  }

  async createDiscountCode(insertDiscountCode: InsertDiscountCode): Promise<DiscountCode> {
    const newCode = await DiscountCodeModel.create(insertDiscountCode);
    return newCode;
  }

  async getDiscountCode(id: string): Promise<DiscountCode | undefined> {
    const code = await DiscountCodeModel.findById(id);
    return code || undefined;
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const discountCode = await DiscountCodeModel.findOne({ code });
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
    const hashedPassword = await bcrypt.hash(customer.password, 10);
    const newCustomer = await CustomerModel.create({
      ...customer,
      password: hashedPassword,
    });
    return newCustomer;
  }

  async verifyCustomerPassword(phone: string, password: string): Promise<Customer | undefined> {
    const customer = await this.getCustomerByPhone(phone);
    if (!customer) return undefined;
    
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) return undefined;
    
    return customer;
  }

  async resetCustomerPassword(email: string, newPassword: string): Promise<boolean> {
    const customer = await this.getCustomerByEmail(email);
    if (!customer) return false;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await CustomerModel.updateOne({ email }, { password: hashedPassword });
    
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

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const updated = await CustomerModel.findByIdAndUpdate(id, updates, { new: true });
    return updated || undefined;
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return await OrderModel.find({ customerId }).sort({ createdAt: -1 });
  }

  async getCoffeeItems(): Promise<CoffeeItem[]> {
    return await CoffeeItemModel.find();
  }

  async getCoffeeItem(id: string): Promise<CoffeeItem | undefined> {
    const item = await CoffeeItemModel.findOne({ id });
    return item || undefined;
  }

  async getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]> {
    return await CoffeeItemModel.find({ category });
  }

  async createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem> {
    const newItem = await CoffeeItemModel.create(item);
    return newItem;
  }

  async updateCoffeeItem(id: string, updates: Partial<CoffeeItem>): Promise<CoffeeItem | undefined> {
    const updated = await CoffeeItemModel.findOneAndUpdate({ id }, updates, { new: true });
    return updated || undefined;
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

  async getOrders(limit?: number, offset?: number): Promise<Order[]> {
    const query = OrderModel.find().sort({ createdAt: -1 });
    if (limit) query.limit(limit);
    if (offset) query.skip(offset);
    return await query;
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
    const card = await LoyaltyCardModel.findOne({ phoneNumber });
    return card || undefined;
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
    return await IngredientModel.find();
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
    return await CoffeeItemIngredientModel.find({ coffeeItemId });
  }

  async addCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<any> {
    const newLink = await CoffeeItemIngredientModel.create({
      coffeeItemId,
      ingredientId,
    });
    return newLink;
  }

  async removeCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<void> {
    await CoffeeItemIngredientModel.deleteOne({ coffeeItemId, ingredientId });
  }

  async getCoffeeItemsByIngredient(ingredientId: string): Promise<CoffeeItem[]> {
    const links = await CoffeeItemIngredientModel.find({ ingredientId });
    const coffeeItemIds = links.map(link => link.coffeeItemId);
    return await CoffeeItemModel.find({ id: { $in: coffeeItemIds } });
  }

  async getBranches(): Promise<Branch[]> {
    return await BranchModel.find().sort({ createdAt: -1 });
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    const branch = await BranchModel.findById(id);
    return branch || undefined;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const newBranch = await BranchModel.create(branch);
    return newBranch;
  }

  async updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | undefined> {
    const updated = await BranchModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return updated || undefined;
  }

  async deleteBranch(id: string): Promise<boolean> {
    const result = await BranchModel.findByIdAndDelete(id);
    return !!result;
  }

  async getCategories(): Promise<Category[]> {
    return await CategoryModel.find().sort({ sortOrder: 1, nameAr: 1 });
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const category = await CategoryModel.findById(id);
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = await CategoryModel.create(category);
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined> {
    const updated = await CategoryModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return updated || undefined;
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
}

export const storage = new DBStorage();
