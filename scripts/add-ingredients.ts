import { db } from "../db";
import { ingredients } from "@shared/schema";

const ingredientsData = [
  { nameAr: "حليب", nameEn: "Milk", isAvailable: 1 },
  { nameAr: "حبوب البن", nameEn: "Coffee Beans", isAvailable: 1 },
  { nameAr: "بن مطحون", nameEn: "Ground Coffee", isAvailable: 1 },
  { nameAr: "شوكولاتة", nameEn: "Chocolate", isAvailable: 1 },
  { nameAr: "حليب مكثف", nameEn: "Condensed Milk", isAvailable: 1 },
  { nameAr: "فانيليا", nameEn: "Vanilla", isAvailable: 1 },
  { nameAr: "كاكاو", nameEn: "Cocoa", isAvailable: 1 },
  { nameAr: "كراميل", nameEn: "Caramel", isAvailable: 1 },
  { nameAr: "ثلج", nameEn: "Ice", isAvailable: 1 },
  { nameAr: "ماء", nameEn: "Water", isAvailable: 1 },
  { nameAr: "شاي", nameEn: "Tea", isAvailable: 1 },
  { nameAr: "نعناع", nameEn: "Mint", isAvailable: 1 },
  { nameAr: "ليمون", nameEn: "Lemon", isAvailable: 1 },
  { nameAr: "ماتشا", nameEn: "Matcha", isAvailable: 1 },
  { nameAr: "كيك", nameEn: "Cake", isAvailable: 1 },
  { nameAr: "كريمة", nameEn: "Cream", isAvailable: 1 },
  { nameAr: "بسكويت", nameEn: "Biscuits", isAvailable: 1 },
];

async function addIngredients() {
  try {
    console.log("Adding ingredients...");
    
    for (const ingredient of ingredientsData) {
      await db.insert(ingredients).values(ingredient);
      console.log(`Added: ${ingredient.nameAr} (${ingredient.nameEn})`);
    }
    
    console.log("\n✅ Successfully added all 17 ingredients!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding ingredients:", error);
    process.exit(1);
  }
}

addIngredients();
