/**
 * Recipe Intelligence Engine - Phase 1
 * Handles recipe cost calculation, validation, and integration with orders
 */

import { RecipeModel, RawItemModel, CoffeeItemModel, type IRecipe } from "@shared/schema";
import { nanoid } from "nanoid";

interface RecipeIngredient {
  rawItemId: string;
  quantity: number;
  unit: string;
}

interface CalculatedRecipeIngredient extends RecipeIngredient {
  rawItemName: string;
  unitCost: number;
  totalCost: number;
}

/**
 * 1.4 Cost Calculation Engine
 * Calculates actual cost for each drink
 */
export class RecipeEngine {
  /**
   * Calculate total cost of recipe from raw item prices
   */
  static async calculateRecipeCost(
    ingredients: RecipeIngredient[]
  ): Promise<{
    success: boolean;
    totalCost: number;
    ingredients: CalculatedRecipeIngredient[];
    errors?: string[];
  }> {
    const errors: string[] = [];
    let totalCost = 0;
    const calculatedIngredients: CalculatedRecipeIngredient[] = [];

    for (const ing of ingredients) {
      // Validation 1: Check if raw item exists
      const rawItem = await RawItemModel.findOne({ _id: ing.rawItemId });
      if (!rawItem) {
        errors.push(`Raw item ${ing.rawItemId} not found`);
        continue;
      }

      // Validation 2: Check quantity > 0
      if (!ing.quantity || ing.quantity <= 0) {
        errors.push(`Ingredient ${rawItem.nameAr} must have quantity > 0`);
        continue;
      }

      // Validation 3: Check supported units
      const supportedUnits = ["g", "ml", "kg", "l", "pieces", "pcs", "box"];
      if (!supportedUnits.includes(ing.unit.toLowerCase())) {
        errors.push(`Unit "${ing.unit}" not supported`);
        continue;
      }

      // Convert units if needed and calculate cost
      const unitCost = (rawItem as any).unitCost || (rawItem as any).costPerUnit || 0;
      const convertedQuantity = this.convertUnits(
        ing.quantity,
        ing.unit,
        rawItem.unit
      );
      const ingredientCost = convertedQuantity * unitCost;

      totalCost += ingredientCost;
      calculatedIngredients.push({
        rawItemId: ing.rawItemId,
        quantity: ing.quantity,
        unit: ing.unit,
        rawItemName: rawItem.nameAr,
        unitCost: unitCost,
        totalCost: ingredientCost,
      });
    }

    return {
      success: errors.length === 0,
      totalCost: parseFloat(totalCost.toFixed(2)),
      ingredients: calculatedIngredients,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Create or update recipe with versioning
   */
  static async createRecipe(
    coffeeItemId: string,
    nameAr: string,
    nameEn: string | undefined,
    ingredients: RecipeIngredient[]
  ): Promise<{
    success: boolean;
    recipe?: IRecipe;
    error?: string;
  }> {
    try {
      // Validate coffee item exists
      const coffeeItem = await CoffeeItemModel.findOne({ _id: coffeeItemId });
      if (!coffeeItem) {
        return {
          success: false,
          error: `Coffee item ${coffeeItemId} not found`,
        };
      }

      // Calculate cost
      const costResult = await this.calculateRecipeCost(ingredients);
      if (!costResult.success) {
        return {
          success: false,
          error: `Recipe validation failed: ${costResult.errors?.join(", ")}`,
        };
      }

      // Get next version
      const lastRecipe = await RecipeModel.findOne({ coffeeItemId })
        .sort({ version: -1 })
        .limit(1);
      const nextVersion = (lastRecipe?.version || 0) + 1;

      // Create recipe
      const recipe = new RecipeModel({
        coffeeItemId,
        nameAr,
        nameEn,
        version: nextVersion,
        isActive: true,
        totalCost: costResult.totalCost,
        ingredients: costResult.ingredients,
      });

      await recipe.save();

      return {
        success: true,
        recipe,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Get active recipe for a coffee item
   */
  static async getActiveRecipe(
    coffeeItemId: string
  ): Promise<IRecipe | null> {
    return RecipeModel.findOne({ coffeeItemId, isActive: true }).sort({
      version: -1,
    });
  }

  /**
   * 1.5 Freeze cost snapshot for order
   * Called when order is created - locks current recipe cost
   */
  static async freezeRecipeSnapshot(coffeeItemId: string): Promise<{
    totalCost: number;
    ingredients: CalculatedRecipeIngredient[];
  } | null> {
    const recipe = await this.getActiveRecipe(coffeeItemId);
    if (!recipe) {
      return null;
    }

    return {
      totalCost: recipe.totalCost,
      ingredients: recipe.ingredients,
    };
  }

  /**
   * Calculate profit for order item
   */
  static calculateProfit(
    sellingPrice: number,
    costOfGoods: number
  ): {
    profitAmount: number;
    profitMargin: number;
  } {
    const profitAmount = sellingPrice - costOfGoods;
    const profitMargin = (profitAmount / sellingPrice) * 100;

    return {
      profitAmount: parseFloat(profitAmount.toFixed(2)),
      profitMargin: parseFloat(profitMargin.toFixed(2)),
    };
  }

  /**
   * Unit conversion helper
   */
  private static convertUnits(
    quantity: number,
    fromUnit: string,
    toUnit: string
  ): number {
    const from = fromUnit.toLowerCase().trim();
    const to = toUnit.toLowerCase().trim();

    if (from === to) return quantity;

    // ml to l
    if ((from === "ml" || from === "milliliter") && (to === "l" || to === "liter")) {
      return quantity / 1000;
    }
    // l to ml
    if ((from === "l" || from === "liter") && (to === "ml" || to === "milliliter")) {
      return quantity * 1000;
    }
    // g to kg
    if ((from === "g" || from === "gram") && (to === "kg" || to === "kilogram")) {
      return quantity / 1000;
    }
    // kg to g
    if ((from === "kg" || from === "kilogram") && (to === "g" || to === "gram")) {
      return quantity * 1000;
    }

    return quantity;
  }
}

/**
 * Export types for API
 */
export type RecipeCreateRequest = {
  coffeeItemId: string;
  nameAr: string;
  nameEn?: string;
  ingredients: RecipeIngredient[];
};

export type RecipeCostResponse = {
  totalCost: number;
  ingredients: CalculatedRecipeIngredient[];
  profitMargin?: number;
};
