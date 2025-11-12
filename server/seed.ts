import { storage } from "./storage";
import type { InsertIngredient, InsertDiscountCode, InsertDeliveryZone } from "@shared/schema";

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

export async function runSeeds() {
  console.log("\n🌱 Starting database seeding...\n");
  
  console.log("📋 Seeding discount codes...");
  await seedDiscountCodes();
  
  console.log("\n🥤 Seeding ingredients...");
  const ingredientMap = await seedIngredients();
  
  console.log("\n🔗 Linking drinks with ingredients...");
  await linkDrinkIngredients(ingredientMap);
  
  console.log("\n📍 Seeding delivery zones...");
  await seedDeliveryZones();
  
  console.log("\n✅ Seeding completed!\n");
}
