import { storage } from "./storage";
import type { InsertIngredient, InsertDiscountCode, InsertDeliveryZone, InsertBranch, InsertEmployee, InsertRawItem, InsertRecipeItem, InsertSupplier } from "@shared/schema";

export async function seedDiscountCodes() {
  const discountCodes: InsertDiscountCode[] = [
    {
      code: "baba",
      discountPercentage: 100,
      reason: "كود خصم شامل 100%",
      employeeId: "system",
      isActive: 1
    },
    {
      code: "qahwa10",
      discountPercentage: 10,
      reason: "خصم 10%",
      employeeId: "system",
      isActive: 1
    },
    {
      code: "qahwa100",
      discountPercentage: 100,
      reason: "خصم 100%",
      employeeId: "system",
      isActive: 1
    },
    {
      code: "qahwa50",
      discountPercentage: 50,
      reason: "خصم 50%",
      employeeId: "system",
      isActive: 1
    },
    {
      code: "qahwa5",
      discountPercentage: 5,
      reason: "خصم 5%",
      employeeId: "system",
      isActive: 1
    }
  ];

  for (const discountCode of discountCodes) {
    try {
      const existing = await storage.getDiscountCodeByCode(discountCode.code);
      if (!existing) {
        await storage.createDiscountCode(discountCode);
        console.log(`✅ Created discount code: ${discountCode.code}`);
      } else {
        console.log(`ℹ️  Discount code already exists: ${discountCode.code}`);
      }
    } catch (error) {
      console.error(`❌ Error creating discount code ${discountCode.code}:`, error);
    }
  }
}

export async function seedIngredients() {
  const ingredients: InsertIngredient[] = [
    { nameAr: "قهوة إسبريسو", nameEn: "Espresso", isAvailable: 1, icon: "coffee" },
    { nameAr: "حليب", nameEn: "Milk", isAvailable: 1, icon: "milk" },
    { nameAr: "ماء ساخن", nameEn: "Hot Water", isAvailable: 1, icon: "droplet" },
    { nameAr: "رغوة الحليب", nameEn: "Milk Foam", isAvailable: 1, icon: "cloud" },
    { nameAr: "شوكولاتة", nameEn: "Chocolate", isAvailable: 1, icon: "chocolate" },
    { nameAr: "كريمة مخفوقة", nameEn: "Whipped Cream", isAvailable: 1, icon: "cream" },
    { nameAr: "فانيلا", nameEn: "Vanilla", isAvailable: 1, icon: "vanilla" },
    { nameAr: "كراميل", nameEn: "Caramel", isAvailable: 1, icon: "caramel" },
    { nameAr: "ثلج", nameEn: "Ice", isAvailable: 1, icon: "snowflake" },
    { nameAr: "حليب مكثف", nameEn: "Condensed Milk", isAvailable: 1, icon: "milk-condensed" },
    { nameAr: "شاي", nameEn: "Tea", isAvailable: 1, icon: "tea" },
    { nameAr: "ماتشا", nameEn: "Matcha", isAvailable: 1, icon: "leaf" },
    { nameAr: "قهوة فرنسية", nameEn: "French Press Coffee", isAvailable: 1, icon: "coffee" },
    { nameAr: "قهوة تركية", nameEn: "Turkish Coffee", isAvailable: 1, icon: "coffee" },
    { nameAr: "قهوة كولد برو", nameEn: "Cold Brew Coffee", isAvailable: 1, icon: "coffee" },
    { nameAr: "بسكويت مطحون", nameEn: "Crushed Biscuits", isAvailable: 1, icon: "cookie" },
    { nameAr: "كريمة", nameEn: "Cream", isAvailable: 1, icon: "cream" }
  ];

  const existingIngredients = await storage.getIngredients();
  const ingredientMap = new Map<string, string>();
  
  for (const existing of existingIngredients) {
    ingredientMap.set(existing.nameAr, existing._id.toString());
  }

  for (const ingredient of ingredients) {
    if (ingredientMap.has(ingredient.nameAr)) {
      console.log(`ℹ️  Ingredient already exists: ${ingredient.nameAr}`);
    } else {
      try {
        const created = await storage.createIngredient(ingredient);
        ingredientMap.set(ingredient.nameAr, created._id.toString());
        console.log(`✅ Created ingredient: ${ingredient.nameAr}`);
      } catch (error: any) {
        console.error(`❌ Error creating ingredient ${ingredient.nameAr}:`, error);
      }
    }
  }

  return ingredientMap;
}

const drinkIngredients: Record<string, string[]> = {
  "espresso-single": ["قهوة إسبريسو"],
  "espresso-double": ["قهوة إسبريسو"],
  "americano": ["قهوة إسبريسو", "ماء ساخن"],
  "ristretto": ["قهوة إسبريسو"],
  "turkish-coffee": ["قهوة تركية", "ماء ساخن"],
  "cafe-latte": ["قهوة إسبريسو", "حليب", "رغوة الحليب"],
  "cappuccino": ["قهوة إسبريسو", "حليب", "رغوة الحليب"],
  "vanilla-latte": ["قهوة إسبريسو", "حليب", "فانيلا", "رغوة الحليب"],
  "mocha": ["قهوة إسبريسو", "حليب", "شوكولاتة", "كريمة مخفوقة"],
  "con-panna": ["قهوة إسبريسو", "كريمة مخفوقة"],
  "french-press": ["قهوة فرنسية", "ماء ساخن"],
  "coffee-day-hot": ["قهوة إسبريسو", "حليب", "كراميل"],
  "hot-tea": ["شاي", "ماء ساخن"],
  "ice-tea": ["شاي", "ثلج"],
  "iced-matcha-latte": ["ماتشا", "حليب", "ثلج"],
  "hot-matcha-latte": ["ماتشا", "حليب"],
  "iced-latte": ["قهوة إسبريسو", "حليب", "ثلج"],
  "iced-mocha": ["قهوة إسبريسو", "حليب", "شوكولاتة", "ثلج", "كريمة مخفوقة"],
  "iced-cappuccino": ["قهوة إسبريسو", "حليب", "ثلج", "رغوة الحليب"],
  "iced-condensed": ["قهوة إسبريسو", "حليب مكثف", "ثلج"],
  "vanilla-cold-brew": ["قهوة كولد برو", "فانيلا", "ثلج"],
  "cold-brew": ["قهوة كولد برو", "ثلج"],
  "coffee-day-cold": ["قهوة كولد برو", "حليب", "ثلج"],
  "coffee-dessert-cup": ["قهوة إسبريسو", "كريمة", "بسكويت مطحون", "شوكولاتة"]
};

export async function linkDrinkIngredients(ingredientMap: Map<string, string>) {
  console.log("\n🔗 Linking drinks with ingredients...");
  
  for (const [drinkId, ingredientNames] of Object.entries(drinkIngredients)) {
    try {
      for (const ingredientName of ingredientNames) {
        const ingredientId = ingredientMap.get(ingredientName);
        if (ingredientId) {
          try {
            await storage.addCoffeeItemIngredient(drinkId, ingredientId);
          } catch (error: any) {
            if (error.code !== 11000) {
              console.error(`❌ Error linking ${drinkId} with ${ingredientName}:`, error);
            }
          }
        }
      }
      console.log(`✅ Linked ingredients for: ${drinkId}`);
    } catch (error) {
      console.error(`❌ Error linking drink ${drinkId}:`, error);
    }
  }
}

export async function seedBranches() {
  const branches: InsertBranch[] = [
    {
      nameAr: "فرع التحلية",
      nameEn: "Al-Tahlia Branch",
      address: "شارع التحلية، الرياض",
      phone: "501234567",
      city: "الرياض",
      location: {
        latitude: 24.7136,
        longitude: 46.6753
      },
      isActive: 1,
      managerName: "أحمد محمد"
    },
    {
      nameAr: "فرع العليا",
      nameEn: "Al-Olaya Branch",
      address: "طريق العليا، الرياض",
      phone: "502345678",
      city: "الرياض",
      location: {
        latitude: 24.7200,
        longitude: 46.6850
      },
      isActive: 1,
      managerName: "محمد عبدالله"
    },
    {
      nameAr: "فرع الملز",
      nameEn: "Al-Malaz Branch",
      address: "حي الملز، الرياض",
      phone: "503456789",
      city: "الرياض",
      location: {
        latitude: 24.7280,
        longitude: 46.7280
      },
      isActive: 1,
      managerName: "خالد سعد"
    }
  ];

  for (const branch of branches) {
    try {
      const existing = await storage.getBranches();
      const found = existing.find(b => b.nameAr === branch.nameAr);
      
      if (!found) {
        await storage.createBranch(branch);
        console.log(`✅ Created branch: ${branch.nameAr}`);
      } else {
        console.log(`ℹ️  Branch already exists: ${branch.nameAr}`);
      }
    } catch (error) {
      console.error(`❌ Error creating branch ${branch.nameAr}:`, error);
    }
  }
}

export async function seedDeliveryZones() {
  const deliveryZones: InsertDeliveryZone[] = [
    {
      nameAr: "البديعة",
      nameEn: "Al-Badia",
      coordinates: [
        { lat: 24.7136, lng: 46.6753 },
        { lat: 24.7200, lng: 46.6753 },
        { lat: 24.7200, lng: 46.6850 },
        { lat: 24.7136, lng: 46.6850 }
      ],
      deliveryFee: 10,
      isActive: 1
    },
    {
      nameAr: "ظهرة البديعة",
      nameEn: "Dhahrat Al-Badia",
      coordinates: [
        { lat: 24.7050, lng: 46.6753 },
        { lat: 24.7136, lng: 46.6753 },
        { lat: 24.7136, lng: 46.6850 },
        { lat: 24.7050, lng: 46.6850 }
      ],
      deliveryFee: 10,
      isActive: 1
    }
  ];

  for (const zone of deliveryZones) {
    try {
      const existing = await storage.getDeliveryZones();
      const found = existing.find(z => z.nameAr === zone.nameAr);
      
      if (!found) {
        await storage.createDeliveryZone(zone);
        console.log(`✅ Created delivery zone: ${zone.nameAr}`);
      } else {
        console.log(`ℹ️  Delivery zone already exists: ${zone.nameAr}`);
      }
    } catch (error) {
      console.error(`❌ Error creating delivery zone ${zone.nameAr}:`, error);
    }
  }
}

export async function seedEmployees() {
  // Get branches first
  const branches = await storage.getBranches();
  const branchMap = new Map<string, string>();
  
  branches.forEach(branch => {
    branchMap.set(branch.nameAr, branch._id?.toString() || '');
  });

  const tahliaBranchId = branchMap.get('فرع التحلية');
  const olayaBranchId = branchMap.get('فرع العليا');
  const malazBranchId = branchMap.get('فرع الملز');

  const employees: InsertEmployee[] = [
    {
      username: "manager1",
      fullName: "أحمد محمد",
      role: "manager",
      phone: "501111111",
      jobTitle: "مدير عام",
      password: "1234",
      isActivated: 1,
      branchId: tahliaBranchId, // Manager for Al-Tahlia branch
    },
    {
      username: "cashier1",
      fullName: "خالد سعيد",
      role: "cashier",
      phone: "502222222",
      jobTitle: "كاشير",
      password: "1234",
      isActivated: 1,
      branchId: malazBranchId, // Cashier for Al-Malaz branch
    },
    {
      username: "cashier2",
      fullName: "محمد علي",
      role: "cashier",
      phone: "503333333",
      jobTitle: "كاشير",
      password: "1234",
      isActivated: 1,
      branchId: olayaBranchId, // Cashier for Al-Olaya branch
    },
    {
      username: "cashier3",
      fullName: "عبدالله حسن",
      role: "cashier",
      phone: "504444444",
      jobTitle: "كاشير",
      password: "1234",
      isActivated: 1,
      branchId: tahliaBranchId, // Cashier for Al-Tahlia branch
    },
  ];

  for (const employee of employees) {
    try {
      const existing = await storage.getEmployeeByPhone(employee.phone);
      
      if (!existing) {
        await storage.createEmployee(employee);
        console.log(`✅ Created employee: ${employee.fullName} (${employee.role}) - Phone: ${employee.phone}`);
      } else {
        // Update existing employee with new password and branchId if provided
        if (employee.password) {
          await storage.updateEmployee(existing.id || existing._id?.toString(), {
            password: employee.password,
            isActivated: 1,
            branchId: employee.branchId
          });
          console.log(`✅ Updated employee password: ${employee.fullName} - Branch: ${employee.branchId}`);
        } else {
          console.log(`ℹ️  Employee already exists: ${employee.fullName}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error creating/updating employee ${employee.fullName}:`, error);
    }
  }
}

export async function seedTables() {
  console.log("📊 Seeding tables...");
  
  try {
    // Get all branches
    const branches = await storage.getBranches();
    
    for (const branch of branches) {
      // Check if tables already exist for this branch
      const existingTables = await storage.getTables(branch._id?.toString());
      
      if (existingTables && existingTables.length > 0) {
        console.log(`ℹ️  Tables already exist for branch: ${branch.nameAr} (${existingTables.length} tables)`);
      } else {
        // Create 10 tables for each branch
        try {
          const createdTables = await storage.bulkCreateTables(10, branch._id?.toString());
          console.log(`✅ Created ${createdTables.length} tables for branch: ${branch.nameAr}`);
        } catch (error) {
          console.error(`❌ Error creating tables for branch ${branch.nameAr}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error seeding tables:", error);
  }
}

export async function seedSuppliers() {
  const suppliers: InsertSupplier[] = [
    {
      code: "SUP-001",
      nameAr: "شركة القهوة الذهبية",
      nameEn: "Golden Coffee Co.",
      contactPerson: "أحمد الحربي",
      phone: "0501234567",
      email: "info@goldencoffee.sa",
      address: "المنطقة الصناعية، الرياض",
      city: "الرياض",
      taxNumber: "310000000000003",
      paymentTerms: "صافي 30 يوم",
      notes: "مورد رئيسي لحبوب القهوة المتخصصة",
      isActive: 1,
    },
    {
      code: "SUP-002",
      nameAr: "مصنع الألبان الطازجة",
      nameEn: "Fresh Dairy Factory",
      contactPerson: "محمد السعيد",
      phone: "0502345678",
      email: "sales@freshdairy.sa",
      address: "حي الصناعية، جدة",
      city: "جدة",
      taxNumber: "310000000000004",
      paymentTerms: "صافي 15 يوم",
      notes: "مورد الحليب والألبان الطازجة",
      isActive: 1,
    },
    {
      code: "SUP-003",
      nameAr: "شركة التغليف المتميز",
      nameEn: "Premium Packaging Co.",
      contactPerson: "خالد العتيبي",
      phone: "0503456789",
      email: "orders@premiumpack.sa",
      address: "المنطقة الصناعية الثانية، الرياض",
      city: "الرياض",
      taxNumber: "310000000000005",
      paymentTerms: "صافي 45 يوم",
      notes: "مورد أكواب وأغطية القهوة",
      isActive: 1,
    },
  ];

  for (const supplier of suppliers) {
    try {
      const existing = await storage.getSuppliers();
      const found = existing.find((s: any) => s.code === supplier.code);
      
      if (!found) {
        await storage.createSupplier(supplier);
        console.log(`✅ Created supplier: ${supplier.nameAr}`);
      } else {
        console.log(`ℹ️  Supplier already exists: ${supplier.nameAr}`);
      }
    } catch (error) {
      console.error(`❌ Error creating supplier ${supplier.nameAr}:`, error);
    }
  }
}

export async function seedRawMaterials() {
  const rawItems: InsertRawItem[] = [
    {
      code: "RAW-001",
      nameAr: "حبوب قهوة أرابيكا",
      nameEn: "Arabica Coffee Beans",
      description: "حبوب قهوة أرابيكا عالية الجودة - تحميص متوسط",
      category: "ingredient",
      unit: "kg",
      unitCost: 120.00,
      minStockLevel: 5,
      maxStockLevel: 50,
      isActive: 1,
    },
    {
      code: "RAW-002",
      nameAr: "حبوب قهوة روبوستا",
      nameEn: "Robusta Coffee Beans",
      description: "حبوب قهوة روبوستا - تحميص غامق",
      category: "ingredient",
      unit: "kg",
      unitCost: 80.00,
      minStockLevel: 3,
      maxStockLevel: 30,
      isActive: 1,
    },
    {
      code: "RAW-003",
      nameAr: "حليب طازج كامل الدسم",
      nameEn: "Fresh Whole Milk",
      description: "حليب طازج كامل الدسم - 3% دسم",
      category: "ingredient",
      unit: "liter",
      unitCost: 5.50,
      minStockLevel: 20,
      maxStockLevel: 100,
      isActive: 1,
    },
    {
      code: "RAW-004",
      nameAr: "حليب خالي الدسم",
      nameEn: "Skim Milk",
      description: "حليب طازج خالي الدسم",
      category: "ingredient",
      unit: "liter",
      unitCost: 6.00,
      minStockLevel: 10,
      maxStockLevel: 50,
      isActive: 1,
    },
    {
      code: "RAW-005",
      nameAr: "حليب الشوفان",
      nameEn: "Oat Milk",
      description: "حليب الشوفان النباتي",
      category: "ingredient",
      unit: "liter",
      unitCost: 12.00,
      minStockLevel: 5,
      maxStockLevel: 30,
      isActive: 1,
    },
    {
      code: "RAW-006",
      nameAr: "سيرب الفانيلا",
      nameEn: "Vanilla Syrup",
      description: "سيرب الفانيلا للمشروبات",
      category: "ingredient",
      unit: "liter",
      unitCost: 35.00,
      minStockLevel: 3,
      maxStockLevel: 20,
      isActive: 1,
    },
    {
      code: "RAW-007",
      nameAr: "سيرب الكراميل",
      nameEn: "Caramel Syrup",
      description: "سيرب الكراميل للمشروبات",
      category: "ingredient",
      unit: "liter",
      unitCost: 35.00,
      minStockLevel: 3,
      maxStockLevel: 20,
      isActive: 1,
    },
    {
      code: "RAW-008",
      nameAr: "شوكولاتة سائلة",
      nameEn: "Chocolate Sauce",
      description: "صوص الشوكولاتة الفاخرة",
      category: "ingredient",
      unit: "liter",
      unitCost: 40.00,
      minStockLevel: 3,
      maxStockLevel: 15,
      isActive: 1,
    },
    {
      code: "RAW-009",
      nameAr: "بودرة الماتشا",
      nameEn: "Matcha Powder",
      description: "بودرة ماتشا يابانية فاخرة",
      category: "ingredient",
      unit: "kg",
      unitCost: 250.00,
      minStockLevel: 1,
      maxStockLevel: 5,
      isActive: 1,
    },
    {
      code: "RAW-010",
      nameAr: "كريمة مخفوقة",
      nameEn: "Whipped Cream",
      description: "كريمة جاهزة للخفق",
      category: "ingredient",
      unit: "liter",
      unitCost: 18.00,
      minStockLevel: 5,
      maxStockLevel: 25,
      isActive: 1,
    },
    {
      code: "RAW-011",
      nameAr: "سكر أبيض",
      nameEn: "White Sugar",
      description: "سكر أبيض ناعم",
      category: "ingredient",
      unit: "kg",
      unitCost: 4.00,
      minStockLevel: 10,
      maxStockLevel: 50,
      isActive: 1,
    },
    {
      code: "RAW-012",
      nameAr: "سكر بني",
      nameEn: "Brown Sugar",
      description: "سكر بني طبيعي",
      category: "ingredient",
      unit: "kg",
      unitCost: 8.00,
      minStockLevel: 5,
      maxStockLevel: 25,
      isActive: 1,
    },
    {
      code: "RAW-013",
      nameAr: "أكواب ورقية صغيرة 8oz",
      nameEn: "Paper Cups 8oz",
      description: "أكواب ورقية صغيرة 240ml",
      category: "packaging",
      unit: "piece",
      unitCost: 0.25,
      minStockLevel: 500,
      maxStockLevel: 5000,
      isActive: 1,
    },
    {
      code: "RAW-014",
      nameAr: "أكواب ورقية متوسطة 12oz",
      nameEn: "Paper Cups 12oz",
      description: "أكواب ورقية متوسطة 360ml",
      category: "packaging",
      unit: "piece",
      unitCost: 0.30,
      minStockLevel: 500,
      maxStockLevel: 5000,
      isActive: 1,
    },
    {
      code: "RAW-015",
      nameAr: "أكواب ورقية كبيرة 16oz",
      nameEn: "Paper Cups 16oz",
      description: "أكواب ورقية كبيرة 480ml",
      category: "packaging",
      unit: "piece",
      unitCost: 0.35,
      minStockLevel: 500,
      maxStockLevel: 5000,
      isActive: 1,
    },
    {
      code: "RAW-016",
      nameAr: "أغطية أكواب",
      nameEn: "Cup Lids",
      description: "أغطية بلاستيكية للأكواب",
      category: "packaging",
      unit: "piece",
      unitCost: 0.10,
      minStockLevel: 1000,
      maxStockLevel: 10000,
      isActive: 1,
    },
    {
      code: "RAW-017",
      nameAr: "شفاطات ورقية",
      nameEn: "Paper Straws",
      description: "شفاطات ورقية صديقة للبيئة",
      category: "packaging",
      unit: "piece",
      unitCost: 0.15,
      minStockLevel: 500,
      maxStockLevel: 5000,
      isActive: 1,
    },
    {
      code: "RAW-018",
      nameAr: "حليب مكثف محلى",
      nameEn: "Sweetened Condensed Milk",
      description: "حليب مكثف محلى معلب",
      category: "ingredient",
      unit: "liter",
      unitCost: 15.00,
      minStockLevel: 5,
      maxStockLevel: 30,
      isActive: 1,
    },
    {
      code: "RAW-019",
      nameAr: "قهوة كولد برو مركزة",
      nameEn: "Cold Brew Concentrate",
      description: "قهوة كولد برو مركزة جاهزة",
      category: "ingredient",
      unit: "liter",
      unitCost: 45.00,
      minStockLevel: 5,
      maxStockLevel: 20,
      isActive: 1,
    },
    {
      code: "RAW-020",
      nameAr: "شاي أسود",
      nameEn: "Black Tea",
      description: "شاي أسود فاخر",
      category: "ingredient",
      unit: "kg",
      unitCost: 60.00,
      minStockLevel: 2,
      maxStockLevel: 10,
      isActive: 1,
    },
  ];

  for (const item of rawItems) {
    try {
      const existing = await storage.getRawItems();
      const found = existing.find((r: any) => r.code === item.code);
      
      if (!found) {
        await storage.createRawItem(item);
        console.log(`✅ Created raw item: ${item.nameAr}`);
      } else {
        console.log(`ℹ️  Raw item already exists: ${item.nameAr}`);
      }
    } catch (error) {
      console.error(`❌ Error creating raw item ${item.nameAr}:`, error);
    }
  }
}

export async function seedRecipeItems() {
  const drinkRecipes: Record<string, { rawCode: string; quantity: number; unit: string }[]> = {
    "espresso-single": [
      { rawCode: "RAW-001", quantity: 9, unit: "g" },
    ],
    "espresso-double": [
      { rawCode: "RAW-001", quantity: 18, unit: "g" },
    ],
    "americano": [
      { rawCode: "RAW-001", quantity: 18, unit: "g" },
    ],
    "cappuccino": [
      { rawCode: "RAW-001", quantity: 18, unit: "g" },
      { rawCode: "RAW-003", quantity: 120, unit: "ml" },
    ],
    "cafe-latte": [
      { rawCode: "RAW-001", quantity: 18, unit: "g" },
      { rawCode: "RAW-003", quantity: 180, unit: "ml" },
    ],
    "vanilla-latte": [
      { rawCode: "RAW-001", quantity: 18, unit: "g" },
      { rawCode: "RAW-003", quantity: 180, unit: "ml" },
      { rawCode: "RAW-006", quantity: 30, unit: "ml" },
    ],
    "mocha": [
      { rawCode: "RAW-001", quantity: 18, unit: "g" },
      { rawCode: "RAW-003", quantity: 150, unit: "ml" },
      { rawCode: "RAW-008", quantity: 30, unit: "ml" },
      { rawCode: "RAW-010", quantity: 30, unit: "ml" },
    ],
    "iced-latte": [
      { rawCode: "RAW-001", quantity: 18, unit: "g" },
      { rawCode: "RAW-003", quantity: 200, unit: "ml" },
    ],
    "iced-mocha": [
      { rawCode: "RAW-001", quantity: 18, unit: "g" },
      { rawCode: "RAW-003", quantity: 180, unit: "ml" },
      { rawCode: "RAW-008", quantity: 30, unit: "ml" },
      { rawCode: "RAW-010", quantity: 30, unit: "ml" },
    ],
    "iced-matcha-latte": [
      { rawCode: "RAW-009", quantity: 3, unit: "g" },
      { rawCode: "RAW-003", quantity: 250, unit: "ml" },
    ],
    "hot-matcha-latte": [
      { rawCode: "RAW-009", quantity: 3, unit: "g" },
      { rawCode: "RAW-003", quantity: 200, unit: "ml" },
    ],
    "cold-brew": [
      { rawCode: "RAW-019", quantity: 100, unit: "ml" },
    ],
    "vanilla-cold-brew": [
      { rawCode: "RAW-019", quantity: 100, unit: "ml" },
      { rawCode: "RAW-006", quantity: 20, unit: "ml" },
    ],
    "iced-condensed": [
      { rawCode: "RAW-001", quantity: 18, unit: "g" },
      { rawCode: "RAW-018", quantity: 50, unit: "ml" },
    ],
  };

  console.log("\n📝 Seeding recipe items...");
  
  const rawItems = await storage.getRawItems();
  const rawItemMap = new Map<string, any>();
  
  for (const item of rawItems) {
    rawItemMap.set(item.code, item);
  }

  for (const [drinkId, ingredients] of Object.entries(drinkRecipes)) {
    try {
      const existingRecipes = await storage.getRecipeItems(drinkId);
      
      if (existingRecipes && existingRecipes.length > 0) {
        console.log(`ℹ️  Recipe already exists for: ${drinkId}`);
        continue;
      }

      for (const ingredient of ingredients) {
        const rawItem = rawItemMap.get(ingredient.rawCode);
        
        if (!rawItem) {
          console.log(`⚠️  Raw item not found: ${ingredient.rawCode}`);
          continue;
        }

        try {
          await storage.createRecipeItem({
            coffeeItemId: drinkId,
            rawItemId: rawItem.id,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          });
        } catch (error: any) {
          if (error.code !== 11000) {
            console.error(`❌ Error creating recipe for ${drinkId}:`, error);
          }
        }
      }
      console.log(`✅ Created recipe for: ${drinkId}`);
    } catch (error) {
      console.error(`❌ Error seeding recipe for ${drinkId}:`, error);
    }
  }
}

export async function runSeeds() {
  console.log("\n🌱 Starting database seeding...\n");
  
  console.log("📋 Seeding discount codes...");
  await seedDiscountCodes();
  
  console.log("\n🥤 Seeding ingredients...");
  const ingredientMap = await seedIngredients();
  
  console.log("\n🔗 Linking drinks with ingredients...");
  await linkDrinkIngredients(ingredientMap);
  
  console.log("\n🏪 Seeding branches...");
  await seedBranches();
  
  console.log("\n📍 Seeding delivery zones...");
  await seedDeliveryZones();
  
  console.log("\n🏭 Seeding suppliers...");
  await seedSuppliers();
  
  console.log("\n📦 Seeding raw materials...");
  await seedRawMaterials();
  
  console.log("\n📝 Seeding recipe items (COGS)...");
  await seedRecipeItems();
  
  console.log("\n📊 Seeding tables...");
  await seedTables();
  
  console.log("\n✅ Seeding completed!\n");
}
