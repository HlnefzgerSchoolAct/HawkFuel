/**
 * Meal Template Database Service
 * Uses IndexedDB for storing meal templates (larger storage than localStorage)
 *
 * Template Schema:
 * {
 *   id: number (auto-generated timestamp)
 *   name: string
 *   description: string
 *   category: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'custom'
 *   meals: [
 *     {
 *       id: number
 *       mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
 *       name: string
 *       foods: [
 *         {
 *           id: number
 *           name: string
 *           quantity: number
 *           unit: string
 *           calories: number
 *           protein: number
 *           carbs: number
 *           fat: number
 *         }
 *       ]
 *     }
 *   ]
 *   totalNutrition: {
 *     calories: number
 *     protein: number
 *     carbs: number
 *     fat: number
 *   }
 *   isPrebuilt: boolean (true for library templates)
 *   tags: string[] (e.g., ['high-protein', 'low-carb', 'vegetarian'])
 *   createdAt: string (ISO date)
 *   updatedAt: string (ISO date)
 * }
 */

import devLog from "../utils/devLog";

const DB_NAME = "nutrinoteplus_templates_db";
const DB_VERSION = 2; // Bumped for micronutrient support
const STORE_NAME = "templates";

let db = null;

let syncCallback = null;
export const setTemplateSyncCallback = (cb) => {
  syncCallback = cb;
};

const triggerTemplateSync = () => {
  if (syncCallback) {
    getAllTemplates().then(syncCallback).catch(() => {});
  }
};

/**
 * Initialize the IndexedDB database
 */
export const initTemplateDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      devLog.error("Failed to open template database:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      devLog.log("Template database initialized successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create templates object store
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });

        // Create indexes for searching
        store.createIndex("name", "name", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("isPrebuilt", "isPrebuilt", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });

        devLog.log("Template store created with indexes");
      }
    };
  });
};

/**
 * Calculate total nutrition for a template (includes micronutrients)
 */
const calculateTotalNutrition = (meals) => {
  const totals = {
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
  };

  meals.forEach((meal) => {
    meal.foods.forEach((food) => {
      // Macronutrients
      totals.calories += food.calories || 0;
      totals.protein += food.protein || 0;
      totals.carbs += food.carbs || 0;
      totals.fat += food.fat || 0;
      // Micronutrients
      totals.fiber += food.fiber || 0;
      totals.sodium += food.sodium || 0;
      totals.sugar += food.sugar || 0;
      totals.cholesterol += food.cholesterol || 0;
      totals.vitaminA += food.vitaminA || 0;
      totals.vitaminC += food.vitaminC || 0;
      totals.vitaminD += food.vitaminD || 0;
      totals.vitaminE += food.vitaminE || 0;
      totals.vitaminK += food.vitaminK || 0;
      totals.vitaminB1 += food.vitaminB1 || 0;
      totals.vitaminB2 += food.vitaminB2 || 0;
      totals.vitaminB3 += food.vitaminB3 || 0;
      totals.vitaminB6 += food.vitaminB6 || 0;
      totals.vitaminB12 += food.vitaminB12 || 0;
      totals.folate += food.folate || 0;
      totals.calcium += food.calcium || 0;
      totals.iron += food.iron || 0;
      totals.magnesium += food.magnesium || 0;
      totals.zinc += food.zinc || 0;
      totals.potassium += food.potassium || 0;
    });
  });

  return {
    // Macronutrients
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    // Micronutrients
    fiber: Math.round(totals.fiber * 10) / 10,
    sodium: Math.round(totals.sodium),
    sugar: Math.round(totals.sugar * 10) / 10,
    cholesterol: Math.round(totals.cholesterol),
    vitaminA: Math.round(totals.vitaminA),
    vitaminC: Math.round(totals.vitaminC * 10) / 10,
    vitaminD: Math.round(totals.vitaminD * 10) / 10,
    vitaminE: Math.round(totals.vitaminE * 100) / 100,
    vitaminK: Math.round(totals.vitaminK * 10) / 10,
    vitaminB1: Math.round(totals.vitaminB1 * 100) / 100,
    vitaminB2: Math.round(totals.vitaminB2 * 100) / 100,
    vitaminB3: Math.round(totals.vitaminB3 * 10) / 10,
    vitaminB6: Math.round(totals.vitaminB6 * 100) / 100,
    vitaminB12: Math.round(totals.vitaminB12 * 100) / 100,
    folate: Math.round(totals.folate),
    calcium: Math.round(totals.calcium),
    iron: Math.round(totals.iron * 100) / 100,
    magnesium: Math.round(totals.magnesium),
    zinc: Math.round(totals.zinc * 100) / 100,
    potassium: Math.round(totals.potassium),
  };
};

/**
 * Calculate nutrition per meal (includes micronutrients)
 */
export const calculateMealNutrition = (foods) => {
  return foods.reduce(
    (acc, food) => ({
      // Macronutrients
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
      // Micronutrients
      fiber: acc.fiber + (food.fiber || 0),
      sodium: acc.sodium + (food.sodium || 0),
      sugar: acc.sugar + (food.sugar || 0),
      cholesterol: acc.cholesterol + (food.cholesterol || 0),
      vitaminA: acc.vitaminA + (food.vitaminA || 0),
      vitaminC: acc.vitaminC + (food.vitaminC || 0),
      vitaminD: acc.vitaminD + (food.vitaminD || 0),
      vitaminE: acc.vitaminE + (food.vitaminE || 0),
      vitaminK: acc.vitaminK + (food.vitaminK || 0),
      vitaminB1: acc.vitaminB1 + (food.vitaminB1 || 0),
      vitaminB2: acc.vitaminB2 + (food.vitaminB2 || 0),
      vitaminB3: acc.vitaminB3 + (food.vitaminB3 || 0),
      vitaminB6: acc.vitaminB6 + (food.vitaminB6 || 0),
      vitaminB12: acc.vitaminB12 + (food.vitaminB12 || 0),
      folate: acc.folate + (food.folate || 0),
      calcium: acc.calcium + (food.calcium || 0),
      iron: acc.iron + (food.iron || 0),
      magnesium: acc.magnesium + (food.magnesium || 0),
      zinc: acc.zinc + (food.zinc || 0),
      potassium: acc.potassium + (food.potassium || 0),
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
};

/**
 * Save a new template
 */
export const saveTemplate = async (templateData) => {
  await initTemplateDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const totalNutrition = calculateTotalNutrition(templateData.meals || []);

    const template = {
      id: templateData.id || Date.now(),
      name: templateData.name,
      description: templateData.description || "",
      category: templateData.category || "custom",
      meals: templateData.meals || [],
      totalNutrition,
      isPrebuilt: templateData.isPrebuilt || false,
      tags: templateData.tags || [],
      createdAt: templateData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const request = store.put(template);

    request.onsuccess = () => {
      devLog.log("Template saved:", template.name);
      triggerTemplateSync();
      resolve(template);
    };

    request.onerror = (event) => {
      devLog.error("Failed to save template:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Get all templates
 */
export const getAllTemplates = async () => {
  await initTemplateDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const templates = request.result.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
      resolve(templates);
    };

    request.onerror = (event) => {
      devLog.error("Failed to get templates:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Get a single template by ID
 */
export const getTemplateById = async (id) => {
  await initTemplateDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      devLog.error("Failed to get template:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = async (category) => {
  await initTemplateDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("category");
    const request = index.getAll(category);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      devLog.error("Failed to get templates by category:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Get prebuilt templates only
 */
export const getPrebuiltTemplates = async () => {
  await initTemplateDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("isPrebuilt");
    const request = index.getAll(true);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      devLog.error("Failed to get prebuilt templates:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Get custom (user-created) templates only
 */
export const getCustomTemplates = async () => {
  await initTemplateDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("isPrebuilt");
    const request = index.getAll(false);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      devLog.error("Failed to get custom templates:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Search templates by name
 */
export const searchTemplates = async (searchTerm) => {
  const allTemplates = await getAllTemplates();
  const term = searchTerm.toLowerCase();

  return allTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(term) ||
      template.description.toLowerCase().includes(term) ||
      template.tags.some((tag) => tag.toLowerCase().includes(term)),
  );
};

/**
 * Delete a template
 */
export const deleteTemplate = async (id) => {
  await initTemplateDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      devLog.log("Template deleted:", id);
      triggerTemplateSync();
      resolve(true);
    };

    request.onerror = (event) => {
      devLog.error("Failed to delete template:", event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Update an existing template
 */
export const updateTemplate = async (id, updates) => {
  const existingTemplate = await getTemplateById(id);

  if (!existingTemplate) {
    throw new Error("Template not found");
  }

  const updatedTemplate = {
    ...existingTemplate,
    ...updates,
    id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString(),
  };

  // Recalculate nutrition if meals changed
  if (updates.meals) {
    updatedTemplate.totalNutrition = calculateTotalNutrition(updates.meals);
  }

  return saveTemplate(updatedTemplate);
};

/**
 * Export templates as JSON (for sharing/backup)
 */
export const exportTemplates = async (templateIds = null) => {
  let templates;

  if (templateIds && templateIds.length > 0) {
    templates = await Promise.all(templateIds.map((id) => getTemplateById(id)));
    templates = templates.filter((t) => t !== undefined);
  } else {
    templates = await getAllTemplates();
  }

  return JSON.stringify(templates, null, 2);
};

/**
 * Export a single template as JSON
 */
export const exportTemplate = async (templateId) => {
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new Error("Template not found");
  }
  return JSON.stringify(template, null, 2);
};

/**
 * Import templates from JSON
 */
export const importTemplates = async (jsonString) => {
  let templates;

  try {
    const parsed = JSON.parse(jsonString);
    // Handle both single template and array of templates
    templates = Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    throw new Error("Invalid JSON format");
  }

  const imported = [];

  for (const template of templates) {
    const newTemplate = await saveTemplate({
      ...template,
      id: Date.now() + Math.random(), // Generate new IDs to avoid conflicts
      isPrebuilt: false, // Imported templates are not prebuilt
      createdAt: new Date().toISOString(),
    });
    imported.push(newTemplate);
  }

  return imported;
};

/**
 * Get template count
 */
export const getTemplateCount = async () => {
  const templates = await getAllTemplates();
  return templates.length;
};

/**
 * Duplicate a template (useful for creating variations)
 */
export const duplicateTemplate = async (templateId, newName = null) => {
  const original = await getTemplateById(templateId);

  if (!original) {
    throw new Error("Template not found");
  }

  const duplicate = {
    ...original,
    id: Date.now(),
    name: newName || `${original.name} (Copy)`,
    isPrebuilt: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return saveTemplate(duplicate);
};

/**
 * Create template from yesterday's meals
 */
export const createTemplateFromMeals = async (foods, templateName) => {
  // Group foods by meal type
  const mealGroups = {};

  foods.forEach((food) => {
    const mealType = food.mealType || "snack";
    if (!mealGroups[mealType]) {
      mealGroups[mealType] = {
        id: Date.now() + Math.random(),
        mealType,
        name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        foods: [],
      };
    }
    mealGroups[mealType].foods.push({
      id: Date.now() + Math.random(),
      name: food.name,
      quantity: 1,
      unit: "serving",
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
    });
  });

  const template = {
    name: templateName || `Custom Template ${new Date().toLocaleDateString()}`,
    description: "Created from logged meals",
    category: "custom",
    meals: Object.values(mealGroups),
    isPrebuilt: false,
    tags: ["from-log"],
  };

  return saveTemplate(template);
};

// Default export as named object
const templateDatabase = {
  initTemplateDB,
  saveTemplate,
  getAllTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getPrebuiltTemplates,
  getCustomTemplates,
  searchTemplates,
  deleteTemplate,
  updateTemplate,
  exportTemplates,
  exportTemplate,
  importTemplates,
  getTemplateCount,
  duplicateTemplate,
  createTemplateFromMeals,
  calculateMealNutrition,
};

export default templateDatabase;
