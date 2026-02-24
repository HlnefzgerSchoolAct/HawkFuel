/**
 * Recipe Database Service
 * Uses IndexedDB for storing recipes (larger storage than localStorage)
 *
 * Recipe Schema:
 * {
 *   id: number (auto-generated timestamp)
 *   name: string
 *   category: 'breakfast' | 'lunch' | 'dinner' | 'snack'
 *   servings: number
 *   ingredients: [
 *     {
 *       id: number
 *       name: string
 *       quantity: number
 *       unit: string
 *       calories: number
 *       protein: number
 *       carbs: number
 *       fat: number
 *     }
 *   ]
 *   totalNutrition: {
 *     calories: number
 *     protein: number
 *     carbs: number
 *     fat: number
 *   }
 *   nutritionPerServing: {
 *     calories: number
 *     protein: number
 *     carbs: number
 *     fat: number
 *   }
 *   notes: string (optional)
 *   createdAt: string (ISO date)
 *   updatedAt: string (ISO date)
 * }
 */

import devLog from "../utils/devLog";

const DB_NAME = "nutrinoteplus_recipes_db";
const DB_VERSION = 2; // Bumped for micronutrient support
const STORE_NAME = "recipes";

let db = null;

let syncCallback = null;
export const setRecipeSyncCallback = (cb) => {
  syncCallback = cb;
};

const triggerRecipeSync = () => {
  if (syncCallback) {
    getAllRecipes().then(syncCallback).catch(() => {});
  }
};

/**
 * Initialize the IndexedDB database
 */
export const initRecipeDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      devLog.error("Failed to open recipe database:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      devLog.log("Recipe database initialized successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create recipes object store
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });

        // Create indexes for searching
        store.createIndex("name", "name", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });

        devLog.log("Recipe store created with indexes");
      }
    };
  });
};

/**
 * Calculate nutrition totals and per-serving values (includes micronutrients)
 */
const calculateNutrition = (ingredients, servings) => {
  const totalNutrition = ingredients.reduce(
    (acc, ingredient) => ({
      // Macronutrients
      calories: acc.calories + (ingredient.calories || 0),
      protein: acc.protein + (ingredient.protein || 0),
      carbs: acc.carbs + (ingredient.carbs || 0),
      fat: acc.fat + (ingredient.fat || 0),
      // Micronutrients
      fiber: acc.fiber + (ingredient.fiber || 0),
      sodium: acc.sodium + (ingredient.sodium || 0),
      sugar: acc.sugar + (ingredient.sugar || 0),
      cholesterol: acc.cholesterol + (ingredient.cholesterol || 0),
      vitaminA: acc.vitaminA + (ingredient.vitaminA || 0),
      vitaminC: acc.vitaminC + (ingredient.vitaminC || 0),
      vitaminD: acc.vitaminD + (ingredient.vitaminD || 0),
      vitaminE: acc.vitaminE + (ingredient.vitaminE || 0),
      vitaminK: acc.vitaminK + (ingredient.vitaminK || 0),
      vitaminB1: acc.vitaminB1 + (ingredient.vitaminB1 || 0),
      vitaminB2: acc.vitaminB2 + (ingredient.vitaminB2 || 0),
      vitaminB3: acc.vitaminB3 + (ingredient.vitaminB3 || 0),
      vitaminB6: acc.vitaminB6 + (ingredient.vitaminB6 || 0),
      vitaminB12: acc.vitaminB12 + (ingredient.vitaminB12 || 0),
      folate: acc.folate + (ingredient.folate || 0),
      calcium: acc.calcium + (ingredient.calcium || 0),
      iron: acc.iron + (ingredient.iron || 0),
      magnesium: acc.magnesium + (ingredient.magnesium || 0),
      zinc: acc.zinc + (ingredient.zinc || 0),
      potassium: acc.potassium + (ingredient.potassium || 0),
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0,
      cholesterol: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminK: 0,
      vitaminB1: 0,
      vitaminB2: 0,
      vitaminB3: 0,
      vitaminB6: 0,
      vitaminB12: 0,
      folate: 0,
      calcium: 0,
      iron: 0,
      magnesium: 0,
      zinc: 0,
      potassium: 0,
    },
  );

  const servingCount = servings || 1;
  const nutritionPerServing = {
    // Macronutrients
    calories: Math.round(totalNutrition.calories / servingCount),
    protein: Math.round((totalNutrition.protein / servingCount) * 10) / 10,
    carbs: Math.round((totalNutrition.carbs / servingCount) * 10) / 10,
    fat: Math.round((totalNutrition.fat / servingCount) * 10) / 10,
    // Micronutrients
    fiber: Math.round((totalNutrition.fiber / servingCount) * 10) / 10,
    sodium: Math.round(totalNutrition.sodium / servingCount),
    sugar: Math.round((totalNutrition.sugar / servingCount) * 10) / 10,
    cholesterol: Math.round(totalNutrition.cholesterol / servingCount),
    vitaminA: Math.round(totalNutrition.vitaminA / servingCount),
    vitaminC: Math.round((totalNutrition.vitaminC / servingCount) * 10) / 10,
    vitaminD: Math.round((totalNutrition.vitaminD / servingCount) * 10) / 10,
    vitaminE: Math.round((totalNutrition.vitaminE / servingCount) * 100) / 100,
    vitaminK: Math.round((totalNutrition.vitaminK / servingCount) * 10) / 10,
    vitaminB1:
      Math.round((totalNutrition.vitaminB1 / servingCount) * 100) / 100,
    vitaminB2:
      Math.round((totalNutrition.vitaminB2 / servingCount) * 100) / 100,
    vitaminB3: Math.round((totalNutrition.vitaminB3 / servingCount) * 10) / 10,
    vitaminB6:
      Math.round((totalNutrition.vitaminB6 / servingCount) * 100) / 100,
    vitaminB12:
      Math.round((totalNutrition.vitaminB12 / servingCount) * 100) / 100,
    folate: Math.round(totalNutrition.folate / servingCount),
    calcium: Math.round(totalNutrition.calcium / servingCount),
    iron: Math.round((totalNutrition.iron / servingCount) * 100) / 100,
    magnesium: Math.round(totalNutrition.magnesium / servingCount),
    zinc: Math.round((totalNutrition.zinc / servingCount) * 100) / 100,
    potassium: Math.round(totalNutrition.potassium / servingCount),
  };

  return { totalNutrition, nutritionPerServing };
};

/**
 * Save a new recipe
 */
export const saveRecipe = async (recipeData) => {
  await initRecipeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const { totalNutrition, nutritionPerServing } = calculateNutrition(
      recipeData.ingredients,
      recipeData.servings,
    );

    const recipe = {
      id: recipeData.id || Date.now(),
      name: recipeData.name,
      category: recipeData.category || "snack",
      servings: recipeData.servings || 1,
      ingredients: recipeData.ingredients || [],
      totalNutrition,
      nutritionPerServing,
      notes: recipeData.notes || "",
      createdAt: recipeData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const request = store.put(recipe);

    request.onsuccess = () => {
      devLog.log("Recipe saved:", recipe.name);
      triggerRecipeSync();
      resolve(recipe);
    };

    request.onerror = (event) => {
      devLog.error("Failed to save recipe:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Get all recipes
 */
export const getAllRecipes = async () => {
  await initRecipeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const recipes = request.result.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
      resolve(recipes);
    };

    request.onerror = (event) => {
      devLog.error("Failed to get recipes:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Get a single recipe by ID
 */
export const getRecipeById = async (id) => {
  await initRecipeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      devLog.error("Failed to get recipe:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Get recipes by category
 */
export const getRecipesByCategory = async (category) => {
  await initRecipeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("category");
    const request = index.getAll(category);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      devLog.error("Failed to get recipes by category:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Search recipes by name
 */
export const searchRecipes = async (searchTerm) => {
  const allRecipes = await getAllRecipes();
  const term = searchTerm.toLowerCase();

  return allRecipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(term) ||
      recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(term)),
  );
};

/**
 * Delete a recipe
 */
export const deleteRecipe = async (id) => {
  await initRecipeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      devLog.log("Recipe deleted:", id);
      triggerRecipeSync();
      resolve(true);
    };

    request.onerror = (event) => {
      devLog.error("Failed to delete recipe:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Update an existing recipe
 */
export const updateRecipe = async (id, updates) => {
  const existingRecipe = await getRecipeById(id);

  if (!existingRecipe) {
    throw new Error("Recipe not found");
  }

  const updatedRecipe = {
    ...existingRecipe,
    ...updates,
    id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString(),
  };

  // Recalculate nutrition if ingredients or servings changed
  if (updates.ingredients || updates.servings) {
    const { totalNutrition, nutritionPerServing } = calculateNutrition(
      updatedRecipe.ingredients,
      updatedRecipe.servings,
    );
    updatedRecipe.totalNutrition = totalNutrition;
    updatedRecipe.nutritionPerServing = nutritionPerServing;
  }

  return saveRecipe(updatedRecipe);
};

/**
 * Export recipes as JSON (for backup)
 */
export const exportRecipes = async () => {
  const recipes = await getAllRecipes();
  return JSON.stringify(recipes, null, 2);
};

/**
 * Import recipes from JSON
 */
export const importRecipes = async (jsonString) => {
  const recipes = JSON.parse(jsonString);

  for (const recipe of recipes) {
    await saveRecipe({
      ...recipe,
      id: Date.now() + Math.random(), // Generate new IDs to avoid conflicts
    });
  }

  return recipes.length;
};

/**
 * Get recipe count
 */
export const getRecipeCount = async () => {
  const recipes = await getAllRecipes();
  return recipes.length;
};

// Default export as named object
const recipeDatabase = {
  initRecipeDB,
  saveRecipe,
  getAllRecipes,
  getRecipeById,
  getRecipesByCategory,
  searchRecipes,
  deleteRecipe,
  updateRecipe,
  exportRecipes,
  importRecipes,
  getRecipeCount,
};

export default recipeDatabase;
