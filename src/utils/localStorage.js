import devLog from "./devLog";

const STORAGE_KEYS = {
  USER_PROFILE: "nutrinoteplus_user_profile",
  DAILY_TARGET: "nutrinoteplus_daily_target",
  FOOD_LOG: "nutrinoteplus_food_log",
  EXERCISE_LOG: "nutrinoteplus_exercise_log",
  CURRENT_DATE: "nutrinoteplus_current_date",
  WEEKLY_HISTORY: "nutrinoteplus_weekly_history",
  FOOD_HISTORY: "nutrinoteplus_food_history",
  WATER_LOG: "nutrinoteplus_water_log",
  PREFERENCES: "nutrinoteplus_preferences",
  ONBOARDING: "nutrinoteplus_onboarding",
  INSTALL_PROMPT_DISMISSED: "nutrinoteplus_install_prompt_dismissed",
  RECENT_FOODS: "nutrinoteplus_recent_foods",
  FAVORITE_FOODS: "nutrinoteplus_favorite_foods",
  WEIGHT_LOG: "nutrinoteplus_weight_log",
  STREAK_DATA: "nutrinoteplus_streak_data",
  MACRO_GOALS: "nutrinoteplus_macro_goals",
  MICRONUTRIENT_GOALS: "nutrinoteplus_micronutrient_goals",
  LAST_SYNC_TIME: "nutrinoteplus_last_sync_time",
};

// ============================================
// MICRONUTRIENT CONSTANTS & RDA VALUES
// ============================================

// Default daily values based on FDA/USDA recommendations for adults
const DEFAULT_MICRONUTRIENT_GOALS = {
  fiber: 28, // grams
  sodium: 2300, // mg
  sugar: 50, // grams (added sugars limit)
  cholesterol: 300, // mg
  vitaminA: 900, // mcg RAE
  vitaminC: 90, // mg
  vitaminD: 20, // mcg
  vitaminE: 15, // mg
  vitaminK: 120, // mcg
  vitaminB1: 1.2, // mg (Thiamin)
  vitaminB2: 1.3, // mg (Riboflavin)
  vitaminB3: 16, // mg (Niacin)
  vitaminB6: 1.7, // mg
  vitaminB12: 2.4, // mcg
  folate: 400, // mcg DFE
  calcium: 1000, // mg
  iron: 18, // mg
  magnesium: 420, // mg
  zinc: 11, // mg
  potassium: 4700, // mg
};

// RDA adjustments by gender (multiplier from male baseline)
const GENDER_ADJUSTMENTS = {
  male: {
    iron: 8,
    vitaminA: 900,
    vitaminC: 90,
    vitaminK: 120,
    magnesium: 420,
    zinc: 11,
  },
  female: {
    iron: 18,
    vitaminA: 700,
    vitaminC: 75,
    vitaminK: 90,
    magnesium: 320,
    zinc: 8,
  },
};

// Age-based adjustments
const AGE_ADJUSTMENTS = {
  // Under 18
  teen: {
    calcium: 1300,
    vitaminD: 15,
    iron: 15,
  },
  // 19-50
  adult: {
    calcium: 1000,
    vitaminD: 15,
  },
  // Over 50
  senior: {
    calcium: 1200,
    vitaminD: 20,
    vitaminB12: 2.4,
  },
};

// Micronutrient metadata for UI display
export const MICRONUTRIENT_INFO = {
  fiber: {
    label: "Fiber",
    unit: "g",
    category: "general",
    warnHigh: false,
    warnLow: true,
  },
  sodium: {
    label: "Sodium",
    unit: "mg",
    category: "general",
    warnHigh: true,
    warnLow: false,
    threshold: 2300,
  },
  sugar: {
    label: "Sugar",
    unit: "g",
    category: "general",
    warnHigh: true,
    warnLow: false,
    threshold: 50,
  },
  cholesterol: {
    label: "Cholesterol",
    unit: "mg",
    category: "general",
    warnHigh: true,
    warnLow: false,
    threshold: 300,
  },
  vitaminA: {
    label: "Vitamin A",
    unit: "mcg",
    category: "vitamins",
    warnHigh: true,
    warnLow: true,
  },
  vitaminC: {
    label: "Vitamin C",
    unit: "mg",
    category: "vitamins",
    warnHigh: false,
    warnLow: true,
  },
  vitaminD: {
    label: "Vitamin D",
    unit: "mcg",
    category: "vitamins",
    warnHigh: true,
    warnLow: true,
  },
  vitaminE: {
    label: "Vitamin E",
    unit: "mg",
    category: "vitamins",
    warnHigh: false,
    warnLow: true,
  },
  vitaminK: {
    label: "Vitamin K",
    unit: "mcg",
    category: "vitamins",
    warnHigh: false,
    warnLow: true,
  },
  vitaminB1: {
    label: "Thiamin (B1)",
    unit: "mg",
    category: "vitamins",
    warnHigh: false,
    warnLow: true,
  },
  vitaminB2: {
    label: "Riboflavin (B2)",
    unit: "mg",
    category: "vitamins",
    warnHigh: false,
    warnLow: true,
  },
  vitaminB3: {
    label: "Niacin (B3)",
    unit: "mg",
    category: "vitamins",
    warnHigh: false,
    warnLow: true,
  },
  vitaminB6: {
    label: "Vitamin B6",
    unit: "mg",
    category: "vitamins",
    warnHigh: false,
    warnLow: true,
  },
  vitaminB12: {
    label: "Vitamin B12",
    unit: "mcg",
    category: "vitamins",
    warnHigh: false,
    warnLow: true,
  },
  folate: {
    label: "Folate",
    unit: "mcg",
    category: "vitamins",
    warnHigh: false,
    warnLow: true,
  },
  calcium: {
    label: "Calcium",
    unit: "mg",
    category: "minerals",
    warnHigh: false,
    warnLow: true,
  },
  iron: {
    label: "Iron",
    unit: "mg",
    category: "minerals",
    warnHigh: true,
    warnLow: true,
  },
  magnesium: {
    label: "Magnesium",
    unit: "mg",
    category: "minerals",
    warnHigh: false,
    warnLow: true,
  },
  zinc: {
    label: "Zinc",
    unit: "mg",
    category: "minerals",
    warnHigh: true,
    warnLow: true,
  },
  potassium: {
    label: "Potassium",
    unit: "mg",
    category: "minerals",
    warnHigh: false,
    warnLow: true,
  },
};

// Empty micronutrient object for defaults
export const EMPTY_MICRONUTRIENTS = {
  fiber: null,
  sodium: null,
  sugar: null,
  cholesterol: null,
  vitaminA: null,
  vitaminC: null,
  vitaminD: null,
  vitaminE: null,
  vitaminK: null,
  vitaminB1: null,
  vitaminB2: null,
  vitaminB3: null,
  vitaminB6: null,
  vitaminB12: null,
  folate: null,
  calcium: null,
  iron: null,
  magnesium: null,
  zinc: null,
  potassium: null,
};

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    // Handle quota exceeded error
    if (error.name === "QuotaExceededError" || error.code === 22) {
      devLog.warn("localStorage quota exceeded, attempting cleanup...");

      // Try to clear old cached data to make room
      try {
        // Remove old AI nutrition cache entries (oldest first)
        const aiCacheKey = "nutrinoteplus_ai_nutrition_cache";
        const aiCache = localStorage.getItem(aiCacheKey);
        if (aiCache) {
          const parsed = JSON.parse(aiCache);
          const entries = Object.entries(parsed);
          // Keep only the 50 most recent entries
          if (entries.length > 50) {
            const sorted = entries.sort(
              (a, b) => b[1].timestamp - a[1].timestamp,
            );
            const trimmed = Object.fromEntries(sorted.slice(0, 50));
            localStorage.setItem(aiCacheKey, JSON.stringify(trimmed));
          }
        }

        // Remove barcode cache if still too full
        const barcodeCacheKey = "nutrinoteplus_barcode_cache";
        const barcodeCache = localStorage.getItem(barcodeCacheKey);
        if (barcodeCache) {
          const parsed = JSON.parse(barcodeCache);
          const entries = Object.entries(parsed);
          if (entries.length > 50) {
            const sorted = entries.sort(
              (a, b) => b[1].timestamp - a[1].timestamp,
            );
            const trimmed = Object.fromEntries(sorted.slice(0, 50));
            localStorage.setItem(barcodeCacheKey, JSON.stringify(trimmed));
          }
        }

        // Retry the save
        localStorage.setItem(key, JSON.stringify(data));
        devLog.log("localStorage save succeeded after cleanup");
        return true;
      } catch (retryError) {
        devLog.error(
          "localStorage save failed even after cleanup:",
          retryError,
        );
        return false;
      }
    }

    devLog.error("Error saving to localStorage:", error);
    return false;
  }
};

const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const jsonString = localStorage.getItem(key);
    if (jsonString === null) {
      return defaultValue;
    }
    return JSON.parse(jsonString);
  } catch (error) {
    devLog.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

const clearLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    devLog.error("Error clearing localStorage:", error);
  }
};

// Sync bridge: when set, notifies cloud sync after saves (no circular dep with syncService)
let syncBridge = null;
export const setSyncBridge = (fn) => {
  syncBridge = fn;
};
const notifySync = (type, payload) => {
  if (syncBridge) syncBridge(type, payload);
};

const getTodaysDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const checkAndResetDaily = () => {
  const savedDate = loadFromLocalStorage(STORAGE_KEYS.CURRENT_DATE);
  const todaysDate = getTodaysDate();

  if (savedDate !== todaysDate) {
    // Save yesterday's food log to history before clearing
    const currentFoodLog = loadFromLocalStorage(STORAGE_KEYS.FOOD_LOG, []);
    if (currentFoodLog.length > 0 && savedDate) {
      const history = loadFromLocalStorage(STORAGE_KEYS.FOOD_HISTORY, {});
      history[savedDate] = currentFoodLog;

      // Keep only last 7 days of detailed food history
      const dates = Object.keys(history).sort();
      if (dates.length > 7) {
        const datesToKeep = dates.slice(-7);
        const newHistory = {};
        datesToKeep.forEach((date) => {
          newHistory[date] = history[date];
        });
        saveToLocalStorage(STORAGE_KEYS.FOOD_HISTORY, newHistory);
      } else {
        saveToLocalStorage(STORAGE_KEYS.FOOD_HISTORY, history);
      }
    }

    clearLocalStorage(STORAGE_KEYS.FOOD_LOG);
    clearLocalStorage(STORAGE_KEYS.EXERCISE_LOG);
    clearLocalStorage(STORAGE_KEYS.WATER_LOG);
    saveToLocalStorage(STORAGE_KEYS.CURRENT_DATE, todaysDate);
  }
};

export const saveUserProfile = (profile) => {
  saveToLocalStorage(STORAGE_KEYS.USER_PROFILE, profile);
  notifySync("profile", {
    userProfile: profile,
    dailyTarget: loadFromLocalStorage(STORAGE_KEYS.DAILY_TARGET, 2000),
    macroGoals: loadFromLocalStorage(STORAGE_KEYS.MACRO_GOALS, null),
    micronutrientGoals: loadFromLocalStorage(STORAGE_KEYS.MICRONUTRIENT_GOALS, null),
    preferences: loadFromLocalStorage(STORAGE_KEYS.PREFERENCES, {}),
    onboarding: loadFromLocalStorage(STORAGE_KEYS.ONBOARDING, false),
  });
};

export const loadUserProfile = () => {
  return loadFromLocalStorage(STORAGE_KEYS.USER_PROFILE, null);
};

export const saveDailyTarget = (target) => {
  saveToLocalStorage(STORAGE_KEYS.DAILY_TARGET, target);
  notifySync("profile", {
    userProfile: loadFromLocalStorage(STORAGE_KEYS.USER_PROFILE, null),
    dailyTarget: target,
    macroGoals: loadFromLocalStorage(STORAGE_KEYS.MACRO_GOALS, null),
    micronutrientGoals: loadFromLocalStorage(STORAGE_KEYS.MICRONUTRIENT_GOALS, null),
    preferences: loadFromLocalStorage(STORAGE_KEYS.PREFERENCES, {}),
    onboarding: loadFromLocalStorage(STORAGE_KEYS.ONBOARDING, false),
  });
};

export const loadDailyTarget = () => {
  return loadFromLocalStorage(STORAGE_KEYS.DAILY_TARGET, 2000);
};

export const saveFoodLog = (foodLog) => {
  saveToLocalStorage(STORAGE_KEYS.FOOD_LOG, foodLog);
  notifySync("foodLog", {
    entries: foodLog,
    exercise: loadFromLocalStorage(STORAGE_KEYS.EXERCISE_LOG, []),
    water: loadFromLocalStorage(STORAGE_KEYS.WATER_LOG, 0),
  });
};

export const loadFoodLog = () => {
  checkAndResetDaily();
  return loadFromLocalStorage(STORAGE_KEYS.FOOD_LOG, []);
};

export const addFoodEntry = (foodEntry) => {
  const currentLog = loadFoodLog();
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    ...foodEntry,
    timestamp: new Date().toISOString(),
  };
  currentLog.push(newEntry);
  saveFoodLog(currentLog);
  return newEntry;
};

export const deleteFoodEntry = (entryId) => {
  const currentLog = loadFoodLog();
  const updatedLog = currentLog.filter((entry) => entry.id !== entryId);
  saveFoodLog(updatedLog);
};

export const saveExerciseLog = (exerciseLog) => {
  saveToLocalStorage(STORAGE_KEYS.EXERCISE_LOG, exerciseLog);
  notifySync("foodLog", {
    entries: loadFromLocalStorage(STORAGE_KEYS.FOOD_LOG, []),
    exercise: exerciseLog,
    water: loadFromLocalStorage(STORAGE_KEYS.WATER_LOG, 0),
  });
};

export const loadExerciseLog = () => {
  checkAndResetDaily();
  return loadFromLocalStorage(STORAGE_KEYS.EXERCISE_LOG, []);
};

export const addExerciseEntry = (exerciseEntry) => {
  const currentLog = loadExerciseLog();
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    ...exerciseEntry,
    timestamp: new Date().toISOString(),
  };
  currentLog.push(newEntry);
  saveExerciseLog(currentLog);
  return newEntry;
};

export const deleteExerciseEntry = (entryId) => {
  const currentLog = loadExerciseLog();
  const updatedLog = currentLog.filter((entry) => entry.id !== entryId);
  saveExerciseLog(updatedLog);
};

export const getTotalCaloriesEaten = () => {
  const foodLog = loadFoodLog();
  return foodLog.reduce((total, entry) => total + entry.calories, 0);
};

export const getTotalCaloriesBurned = () => {
  const exerciseLog = loadExerciseLog();
  return exerciseLog.reduce((total, entry) => total + entry.calories, 0);
};

export const getNetCalories = () => {
  return getTotalCaloriesEaten() - getTotalCaloriesBurned();
};

export const getRemainingCalories = () => {
  const target = loadDailyTarget();
  const net = getNetCalories();
  return target - net;
};

export const saveWeeklyHistory = (history) => {
  saveToLocalStorage(STORAGE_KEYS.WEEKLY_HISTORY, history);
  notifySync("history", history);
};

export const loadWeeklyHistory = () => {
  return loadFromLocalStorage(STORAGE_KEYS.WEEKLY_HISTORY, {});
};

export const saveDailyDataToHistory = () => {
  const today = getTodaysDate();
  const eaten = getTotalCaloriesEaten();
  const burned = getTotalCaloriesBurned();
  const target = loadDailyTarget();

  const history = loadWeeklyHistory();

  history[today] = {
    eaten: eaten,
    burned: burned,
    target: target,
  };

  // Keep 30 days of summary history for monthly calendar view
  const dates = Object.keys(history).sort();
  if (dates.length > 30) {
    const datesToKeep = dates.slice(-30);
    const newHistory = {};
    datesToKeep.forEach((date) => {
      newHistory[date] = history[date];
    });
    saveWeeklyHistory(newHistory);
  } else {
    saveWeeklyHistory(history);
  }
};

export const getWeeklyGraphData = () => {
  const history = loadWeeklyHistory();

  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    last7Days.push(date.toISOString().split("T")[0]);
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const labels = last7Days.map((dateStr) => {
    const date = new Date(dateStr + "T12:00:00");
    return dayNames[date.getDay()];
  });

  const eatenData = [];
  const burnedData = [];
  const targetData = [];

  last7Days.forEach((dateStr) => {
    const dayData = history[dateStr];
    if (dayData) {
      eatenData.push(dayData.eaten);
      burnedData.push(dayData.burned);
      targetData.push(dayData.target);
    } else {
      eatenData.push(0);
      burnedData.push(0);
      targetData.push(0);
    }
  });

  return {
    labels: labels,
    datasets: [
      {
        label: "Calories Eaten",
        data: eatenData,
        borderColor: "rgb(231, 76, 60)",
        backgroundColor: "rgba(231, 76, 60, 0.1)",
        tension: 0.3,
      },
      {
        label: "Calories Burned",
        data: burnedData,
        borderColor: "rgb(243, 156, 18)",
        backgroundColor: "rgba(243, 156, 18, 0.1)",
        tension: 0.3,
      },
      {
        label: "Target Calories",
        data: targetData,
        borderColor: "rgb(52, 152, 219)",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        tension: 0.3,
        borderDash: [5, 5],
      },
    ],
  };
};

export const loadWaterLog = () => {
  checkAndResetDaily();
  return loadFromLocalStorage(STORAGE_KEYS.WATER_LOG, 0);
};

export const saveWaterLog = (ounces) => {
  saveToLocalStorage(STORAGE_KEYS.WATER_LOG, ounces);
  notifySync("foodLog", {
    entries: loadFromLocalStorage(STORAGE_KEYS.FOOD_LOG, []),
    exercise: loadFromLocalStorage(STORAGE_KEYS.EXERCISE_LOG, []),
    water: ounces,
  });
};

export const addWaterCup = () => {
  const current = loadWaterLog();
  const updated = current + 8; // Add 8 oz (1 cup)
  saveWaterLog(updated);
  return updated;
};

export const removeWaterCup = () => {
  const current = loadWaterLog();
  const updated = Math.max(0, current - 8); // Remove 8 oz (1 cup)
  saveWaterLog(updated);
  return updated;
};

/**
 * Get total macronutrient information from food log
 * @returns {Object} Object with protein, carbs, and fat totals
 */
export const getTotalMacros = () => {
  const foodLog = loadFoodLog();
  return foodLog.reduce(
    (totals, entry) => ({
      protein: totals.protein + (entry.protein || 0),
      carbs: totals.carbs + (entry.carbs || 0),
      fat: totals.fat + (entry.fat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );
};

/**
 * Get total micronutrient information from food log
 * @returns {Object} Object with all micronutrient totals
 */
export const getTotalMicronutrients = () => {
  const foodLog = loadFoodLog();
  return foodLog.reduce(
    (totals, entry) => ({
      fiber: totals.fiber + (entry.fiber || 0),
      sodium: totals.sodium + (entry.sodium || 0),
      sugar: totals.sugar + (entry.sugar || 0),
      cholesterol: totals.cholesterol + (entry.cholesterol || 0),
      vitaminA: totals.vitaminA + (entry.vitaminA || 0),
      vitaminC: totals.vitaminC + (entry.vitaminC || 0),
      vitaminD: totals.vitaminD + (entry.vitaminD || 0),
      vitaminE: totals.vitaminE + (entry.vitaminE || 0),
      vitaminK: totals.vitaminK + (entry.vitaminK || 0),
      vitaminB1: totals.vitaminB1 + (entry.vitaminB1 || 0),
      vitaminB2: totals.vitaminB2 + (entry.vitaminB2 || 0),
      vitaminB3: totals.vitaminB3 + (entry.vitaminB3 || 0),
      vitaminB6: totals.vitaminB6 + (entry.vitaminB6 || 0),
      vitaminB12: totals.vitaminB12 + (entry.vitaminB12 || 0),
      folate: totals.folate + (entry.folate || 0),
      calcium: totals.calcium + (entry.calcium || 0),
      iron: totals.iron + (entry.iron || 0),
      magnesium: totals.magnesium + (entry.magnesium || 0),
      zinc: totals.zinc + (entry.zinc || 0),
      potassium: totals.potassium + (entry.potassium || 0),
    }),
    {
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
 * Get combined nutrition totals (macros + micros)
 * @returns {Object} Complete nutrition breakdown
 */
export const getTotalNutrition = () => {
  return {
    ...getTotalMacros(),
    ...getTotalMicronutrients(),
    calories: getTotalCaloriesEaten(),
  };
};

// ============================================
// PREFERENCES & SETTINGS
// ============================================

const DEFAULT_PREFERENCES = {
  databaseEnabled: false,
  theme: "system", // 'system', 'light', 'dark'
  macroInputMode: "both", // 'manual', 'auto', 'both'
  tutorialComplete: false,
  notificationsEnabled: false,
  reminderBreakfast: "08:00",
  reminderLunch: "12:30",
  reminderDinner: "18:30",
};

export const loadPreferences = () => {
  return loadFromLocalStorage(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
};

export const savePreferences = (preferences) => {
  const merged = { ...DEFAULT_PREFERENCES, ...preferences };
  saveToLocalStorage(STORAGE_KEYS.PREFERENCES, merged);
  notifySync("profile", {
    userProfile: loadFromLocalStorage(STORAGE_KEYS.USER_PROFILE, null),
    dailyTarget: loadFromLocalStorage(STORAGE_KEYS.DAILY_TARGET, 2000),
    macroGoals: loadFromLocalStorage(STORAGE_KEYS.MACRO_GOALS, null),
    micronutrientGoals: loadFromLocalStorage(STORAGE_KEYS.MICRONUTRIENT_GOALS, null),
    preferences: merged,
    onboarding: loadFromLocalStorage(STORAGE_KEYS.ONBOARDING, false),
  });
};

export const updatePreference = (key, value) => {
  const current = loadPreferences();
  current[key] = value;
  savePreferences(current);
  return current;
};

// ============================================
// ONBOARDING
// ============================================

export const hasCompletedOnboarding = () => {
  return loadFromLocalStorage(STORAGE_KEYS.ONBOARDING, false);
};

export const markOnboardingComplete = () => {
  saveToLocalStorage(STORAGE_KEYS.ONBOARDING, true);
  notifySync("profile", {
    userProfile: loadFromLocalStorage(STORAGE_KEYS.USER_PROFILE, null),
    dailyTarget: loadFromLocalStorage(STORAGE_KEYS.DAILY_TARGET, 2000),
    macroGoals: loadFromLocalStorage(STORAGE_KEYS.MACRO_GOALS, null),
    micronutrientGoals: loadFromLocalStorage(STORAGE_KEYS.MICRONUTRIENT_GOALS, null),
    preferences: loadFromLocalStorage(STORAGE_KEYS.PREFERENCES, {}),
    onboarding: true,
  });
};

export const resetOnboarding = () => {
  saveToLocalStorage(STORAGE_KEYS.ONBOARDING, false);
};

// ============================================
// INSTALL PROMPT (PWA)
// ============================================

export const getInstallPromptDismissed = () => {
  return loadFromLocalStorage(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED, false);
};

export const setInstallPromptDismissed = () => {
  saveToLocalStorage(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED, true);
};

export const loadLastSyncTime = () => {
  const val = loadFromLocalStorage(STORAGE_KEYS.LAST_SYNC_TIME);
  return val ? new Date(val) : null;
};

export const saveLastSyncTime = (date) => {
  const ts = date instanceof Date ? date.toISOString() : date;
  saveToLocalStorage(STORAGE_KEYS.LAST_SYNC_TIME, ts);
};

// ============================================
// ONBOARDING PROGRESS (draft persistence)
// ============================================

const ONBOARDING_DRAFT_KEY = "nutrinoteplus_onboarding_draft";

export const loadOnboardingDraft = () => {
  return loadFromLocalStorage(ONBOARDING_DRAFT_KEY, null);
};

export const saveOnboardingDraft = (draft) => {
  saveToLocalStorage(ONBOARDING_DRAFT_KEY, draft);
};

export const clearOnboardingDraft = () => {
  clearLocalStorage(ONBOARDING_DRAFT_KEY);
};

// ============================================
// MACRO GOALS
// ============================================

const MACRO_PRESETS = {
  balanced: { protein: 30, carbs: 40, fat: 30, name: "Balanced" },
  highProtein: { protein: 40, carbs: 30, fat: 30, name: "High Protein" },
  lowCarb: { protein: 40, carbs: 25, fat: 35, name: "Low Carb" },
  athletic: { protein: 30, carbs: 50, fat: 20, name: "Athletic" },
  custom: { protein: 30, carbs: 40, fat: 30, name: "Custom" },
};

export const getMacroPresets = () => MACRO_PRESETS;

export const loadMacroGoals = () => {
  const saved = loadFromLocalStorage(STORAGE_KEYS.MACRO_GOALS, null);
  if (saved) return saved;

  // Calculate default from daily target using balanced preset
  const target = loadDailyTarget();
  return calculateMacroGrams(target, MACRO_PRESETS.balanced);
};

export const saveMacroGoals = (goals) => {
  saveToLocalStorage(STORAGE_KEYS.MACRO_GOALS, goals);
  notifySync("profile", {
    userProfile: loadFromLocalStorage(STORAGE_KEYS.USER_PROFILE, null),
    dailyTarget: loadFromLocalStorage(STORAGE_KEYS.DAILY_TARGET, 2000),
    macroGoals: goals,
    micronutrientGoals: loadFromLocalStorage(STORAGE_KEYS.MICRONUTRIENT_GOALS, null),
    preferences: loadFromLocalStorage(STORAGE_KEYS.PREFERENCES, {}),
    onboarding: loadFromLocalStorage(STORAGE_KEYS.ONBOARDING, false),
  });
};

export const calculateMacroGrams = (calories, percentages) => {
  return {
    protein: Math.round((calories * (percentages.protein / 100)) / 4),
    carbs: Math.round((calories * (percentages.carbs / 100)) / 4),
    fat: Math.round((calories * (percentages.fat / 100)) / 9),
    preset: percentages.name || "Custom",
    percentages: {
      protein: percentages.protein,
      carbs: percentages.carbs,
      fat: percentages.fat,
    },
  };
};

// ============================================
// MICRONUTRIENT GOALS
// ============================================

/**
 * Calculate personalized micronutrient goals based on user profile
 * @param {Object} profile - User profile with age, gender, activityLevel
 * @returns {Object} Personalized micronutrient daily goals
 */
export const calculatePersonalizedMicronutrientGoals = (profile = null) => {
  if (!profile) {
    profile = loadUserProfile();
  }

  // Start with defaults
  let goals = { ...DEFAULT_MICRONUTRIENT_GOALS };

  // Apply gender adjustments
  if (profile?.gender) {
    const genderKey = profile.gender.toLowerCase();
    if (GENDER_ADJUSTMENTS[genderKey]) {
      goals = { ...goals, ...GENDER_ADJUSTMENTS[genderKey] };
    }
  }

  // Apply age adjustments
  if (profile?.age) {
    const age = parseInt(profile.age, 10);
    let ageCategory = "adult";
    if (age < 19) ageCategory = "teen";
    else if (age >= 50) ageCategory = "senior";

    if (AGE_ADJUSTMENTS[ageCategory]) {
      goals = { ...goals, ...AGE_ADJUSTMENTS[ageCategory] };
    }
  }

  // Activity level adjustments (higher activity = higher needs for some nutrients)
  if (profile?.activityLevel) {
    const level = profile.activityLevel.toLowerCase();
    if (level === "very_active" || level === "extra_active" || level === "active" || level === "veryactive") {
      goals.potassium = Math.round(goals.potassium * 1.1);
      goals.magnesium = Math.round(goals.magnesium * 1.1);
      goals.iron = Math.round(goals.iron * 1.1);
      goals.sodium = Math.round(goals.sodium * 1.15); // Allow slightly more for athletes
    }
  }

  return goals;
};

export const loadMicronutrientGoals = () => {
  const saved = loadFromLocalStorage(STORAGE_KEYS.MICRONUTRIENT_GOALS, null);
  if (saved) return saved;

  // Calculate personalized defaults from profile
  return calculatePersonalizedMicronutrientGoals();
};

export const saveMicronutrientGoals = (goals) => {
  saveToLocalStorage(STORAGE_KEYS.MICRONUTRIENT_GOALS, goals);
  notifySync("profile", {
    userProfile: loadFromLocalStorage(STORAGE_KEYS.USER_PROFILE, null),
    dailyTarget: loadFromLocalStorage(STORAGE_KEYS.DAILY_TARGET, 2000),
    macroGoals: loadFromLocalStorage(STORAGE_KEYS.MACRO_GOALS, null),
    micronutrientGoals: goals,
    preferences: loadFromLocalStorage(STORAGE_KEYS.PREFERENCES, {}),
    onboarding: loadFromLocalStorage(STORAGE_KEYS.ONBOARDING, false),
  });
};

/**
 * Check for micronutrient warnings (too high or too low)
 * @returns {Array} Array of warning objects {nutrient, level, message}
 */
export const getMicronutrientWarnings = () => {
  const totals = getTotalMicronutrients();
  const goals = loadMicronutrientGoals();
  const warnings = [];

  // Don't show warnings if no food has been logged yet
  const hasAnyData = Object.values(totals).some(
    (v) => v !== null && v !== undefined && v > 0,
  );
  if (!hasAnyData) return warnings;

  // High sodium warning
  if (totals.sodium > goals.sodium) {
    warnings.push({
      nutrient: "sodium",
      level: "high",
      message: `Sodium intake (${Math.round(totals.sodium)}mg) exceeds daily limit of ${goals.sodium}mg`,
    });
  } else if (totals.sodium > goals.sodium * 0.8) {
    warnings.push({
      nutrient: "sodium",
      level: "warning",
      message: `Approaching sodium limit (${Math.round(totals.sodium)}/${goals.sodium}mg)`,
    });
  }

  // High sugar warning
  if (totals.sugar > goals.sugar) {
    warnings.push({
      nutrient: "sugar",
      level: "high",
      message: `Sugar intake (${Math.round(totals.sugar)}g) exceeds daily limit of ${goals.sugar}g`,
    });
  }

  // High cholesterol warning
  if (totals.cholesterol > goals.cholesterol) {
    warnings.push({
      nutrient: "cholesterol",
      level: "high",
      message: `Cholesterol (${Math.round(totals.cholesterol)}mg) exceeds daily limit of ${goals.cholesterol}mg`,
    });
  }

  // Low fiber warning
  if (totals.fiber < goals.fiber * 0.5) {
    warnings.push({
      nutrient: "fiber",
      level: "low",
      message: `Fiber intake is low (${Math.round(totals.fiber)}/${goals.fiber}g)`,
    });
  }

  return warnings;
};

// ============================================
// RECENT FOODS
// ============================================

const MAX_RECENT_FOODS = 20;

export const loadRecentFoods = () => {
  return loadFromLocalStorage(STORAGE_KEYS.RECENT_FOODS, []);
};

export const addRecentFood = (food) => {
  const recent = loadRecentFoods();

  // Remove if already exists (will add to top)
  const filtered = recent.filter(
    (f) => f.name.toLowerCase() !== food.name.toLowerCase(),
  );

  // Add to beginning with all nutrition data
  filtered.unshift({
    id: Date.now(),
    name: food.name,
    calories: food.calories,
    protein: food.protein || 0,
    carbs: food.carbs || 0,
    fat: food.fat || 0,
    // Micronutrients
    fiber: food.fiber || null,
    sodium: food.sodium || null,
    sugar: food.sugar || null,
    cholesterol: food.cholesterol || null,
    vitaminA: food.vitaminA || null,
    vitaminC: food.vitaminC || null,
    vitaminD: food.vitaminD || null,
    vitaminE: food.vitaminE || null,
    vitaminK: food.vitaminK || null,
    vitaminB1: food.vitaminB1 || null,
    vitaminB2: food.vitaminB2 || null,
    vitaminB3: food.vitaminB3 || null,
    vitaminB6: food.vitaminB6 || null,
    vitaminB12: food.vitaminB12 || null,
    folate: food.folate || null,
    calcium: food.calcium || null,
    iron: food.iron || null,
    magnesium: food.magnesium || null,
    zinc: food.zinc || null,
    potassium: food.potassium || null,
    addedAt: new Date().toISOString(),
  });

  // Keep only max items
  const trimmed = filtered.slice(0, MAX_RECENT_FOODS);
  saveToLocalStorage(STORAGE_KEYS.RECENT_FOODS, trimmed);
  notifySync("recentFoods", trimmed);
  return trimmed;
};

export const clearRecentFoods = () => {
  saveToLocalStorage(STORAGE_KEYS.RECENT_FOODS, []);
  notifySync("recentFoods", []);
};

// ============================================
// FAVORITE FOODS
// ============================================

export const loadFavoriteFoods = () => {
  return loadFromLocalStorage(STORAGE_KEYS.FAVORITE_FOODS, []);
};

export const addFavoriteFood = (food) => {
  const favorites = loadFavoriteFoods();

  // Check if already exists
  if (favorites.some((f) => f.name.toLowerCase() === food.name.toLowerCase())) {
    return favorites;
  }

  favorites.push({
    id: Date.now(),
    name: food.name,
    calories: food.calories,
    protein: food.protein || 0,
    carbs: food.carbs || 0,
    fat: food.fat || 0,
    // Micronutrients
    fiber: food.fiber || null,
    sodium: food.sodium || null,
    sugar: food.sugar || null,
    cholesterol: food.cholesterol || null,
    vitaminA: food.vitaminA || null,
    vitaminC: food.vitaminC || null,
    vitaminD: food.vitaminD || null,
    vitaminE: food.vitaminE || null,
    vitaminK: food.vitaminK || null,
    vitaminB1: food.vitaminB1 || null,
    vitaminB2: food.vitaminB2 || null,
    vitaminB3: food.vitaminB3 || null,
    vitaminB6: food.vitaminB6 || null,
    vitaminB12: food.vitaminB12 || null,
    folate: food.folate || null,
    calcium: food.calcium || null,
    iron: food.iron || null,
    magnesium: food.magnesium || null,
    zinc: food.zinc || null,
    potassium: food.potassium || null,
    addedAt: new Date().toISOString(),
  });

  saveToLocalStorage(STORAGE_KEYS.FAVORITE_FOODS, favorites);
  notifySync("favorites", favorites);
  return favorites;
};

export const removeFavoriteFood = (foodId) => {
  const favorites = loadFavoriteFoods();
  const updated = favorites.filter((f) => f.id !== foodId);
  saveToLocalStorage(STORAGE_KEYS.FAVORITE_FOODS, updated);
  notifySync("favorites", updated);
  return updated;
};

export const isFavoriteFood = (foodName) => {
  const favorites = loadFavoriteFoods();
  return favorites.some((f) => f.name.toLowerCase() === foodName.toLowerCase());
};

export const toggleFavoriteFood = (food) => {
  if (isFavoriteFood(food.name)) {
    const favorites = loadFavoriteFoods();
    const toRemove = favorites.find(
      (f) => f.name.toLowerCase() === food.name.toLowerCase(),
    );
    if (toRemove) {
      return { favorites: removeFavoriteFood(toRemove.id), isFavorite: false };
    }
  }
  return { favorites: addFavoriteFood(food), isFavorite: true };
};

// ============================================
// WEIGHT TRACKING
// ============================================

export const loadWeightLog = () => {
  return loadFromLocalStorage(STORAGE_KEYS.WEIGHT_LOG, []);
};

export const addWeightEntry = (weight, unit = "lbs") => {
  const log = loadWeightLog();
  const today = getTodaysDate();

  // Remove today's entry if exists (replace)
  const filtered = log.filter((entry) => entry.date !== today);

  filtered.push({
    date: today,
    weight: parseFloat(weight),
    unit,
    timestamp: new Date().toISOString(),
  });

  // Sort by date and keep last 90 days
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  const trimmed = filtered.slice(-90);

  saveToLocalStorage(STORAGE_KEYS.WEIGHT_LOG, trimmed);
  notifySync("weightLog", trimmed);
  return trimmed;
};

export const getWeightTrend = () => {
  const log = loadWeightLog();
  if (log.length < 2) return null;

  const recent = log.slice(-7);
  const first = recent[0].weight;
  const last = recent[recent.length - 1].weight;
  const change = last - first;

  return {
    change: Math.round(change * 10) / 10,
    direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
    entries: log,
  };
};

// ============================================
// STREAK TRACKING
// ============================================

export const loadStreakData = () => {
  return loadFromLocalStorage(STORAGE_KEYS.STREAK_DATA, {
    currentStreak: 0,
    longestStreak: 0,
    lastLogDate: null,
  });
};

export const updateStreak = () => {
  const data = loadStreakData();
  const today = getTodaysDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (data.lastLogDate === today) {
    // Already logged today
    return data;
  }

  if (data.lastLogDate === yesterdayStr) {
    // Consecutive day
    data.currentStreak += 1;
  } else if (data.lastLogDate !== today) {
    // Streak broken or first log
    data.currentStreak = 1;
  }

  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
  data.lastLogDate = today;

  saveToLocalStorage(STORAGE_KEYS.STREAK_DATA, data);
  notifySync("streakData", data);
  return data;
};

// ============================================
// FOOD LOG ENHANCEMENTS
// ============================================

export const addFoodEntryWithMeal = (foodEntry, mealType = null) => {
  // Auto-detect meal type based on time if not provided
  if (!mealType) {
    const hour = new Date().getHours();
    if (hour < 11) mealType = "breakfast";
    else if (hour < 16) mealType = "lunch";
    else if (hour < 21) mealType = "dinner";
    else mealType = "snack";
  }

  const currentLog = loadFoodLog();
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    ...foodEntry,
    mealType,
    timestamp: new Date().toISOString(),
  };
  currentLog.push(newEntry);
  saveFoodLog(currentLog);

  // Update recent foods and streak
  addRecentFood(foodEntry);
  updateStreak();

  return newEntry;
};

export const updateFoodEntry = (entryId, updates) => {
  const currentLog = loadFoodLog();
  const index = currentLog.findIndex((entry) => entry.id === entryId);

  if (index === -1) return null;

  currentLog[index] = { ...currentLog[index], ...updates };
  saveFoodLog(currentLog);
  return currentLog[index];
};

export const getFoodLogByMeal = () => {
  const log = loadFoodLog();
  return {
    breakfast: log.filter((e) => e.mealType === "breakfast"),
    lunch: log.filter((e) => e.mealType === "lunch"),
    dinner: log.filter((e) => e.mealType === "dinner"),
    snack: log.filter((e) => e.mealType === "snack"),
  };
};

// ============================================
// DATA EXPORT & MANAGEMENT
// ============================================

export const exportAllData = () => {
  const data = {
    exportDate: new Date().toISOString(),
    version: "3.0.0", // Updated for micronutrient support
    userProfile: loadUserProfile(),
    dailyTarget: loadDailyTarget(),
    macroGoals: loadMacroGoals(),
    micronutrientGoals: loadMicronutrientGoals(),
    preferences: loadPreferences(),
    foodLog: loadFoodLog(),
    exerciseLog: loadExerciseLog(),
    weeklyHistory: loadWeeklyHistory(),
    waterLog: loadWaterLog(),
    recentFoods: loadRecentFoods(),
    favoriteFoods: loadFavoriteFoods(),
    weightLog: loadWeightLog(),
    streakData: loadStreakData(),
  };

  return JSON.stringify(data, null, 2);
};

/**
 * Validate import data before importing
 * @param {Object} data - The data to validate
 * @returns {Object} - { valid: boolean, message: string, errors: string[] }
 */
export const validateImportData = (data) => {
  const errors = [];

  // Check if data is an object
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      message: "Invalid data format",
      errors: ["Data must be a valid JSON object"],
    };
  }

  // Check version compatibility
  if (data.version) {
    const [major] = data.version.split(".").map(Number);
    if (major < 1) {
      errors.push("Data version may be incompatible");
    }
  }

  // Check for expected fields (at least some should exist)
  const expectedFields = [
    "userProfile",
    "dailyTarget",
    "foodLog",
    "preferences",
  ];
  const hasValidFields = expectedFields.some(
    (field) => data[field] !== undefined
  );

  if (!hasValidFields) {
    return {
      valid: false,
      message: "This doesn't appear to be a NutriNote backup file",
      errors: ["Missing expected data fields"],
    };
  }

  // Validate userProfile structure if present
  if (data.userProfile && typeof data.userProfile !== "object") {
    errors.push("Invalid userProfile format");
  }

  // Validate foodLog structure if present
  if (data.foodLog && typeof data.foodLog !== "object") {
    errors.push("Invalid foodLog format");
  }

  // Validate dailyTarget
  if (data.dailyTarget !== undefined) {
    const target = Number(data.dailyTarget);
    if (isNaN(target) || target < 100 || target > 10000) {
      errors.push("Invalid calorie target value");
    }
  }

  return {
    valid: errors.length === 0,
    message:
      errors.length === 0
        ? "Data validation passed"
        : "Data has validation warnings",
    errors,
  };
};

/**
 * Import all data from a backup file
 * @param {Object} data - The data to import
 * @returns {Object} - { success: boolean, message: string, imported: string[] }
 */
export const importAllData = (data) => {
  const imported = [];

  try {
    // Import user profile
    if (data.userProfile) {
      saveToLocalStorage(STORAGE_KEYS.USER_PROFILE, data.userProfile);
      imported.push("User Profile");
    }

    // Import daily target
    if (data.dailyTarget) {
      saveDailyTarget(data.dailyTarget);
      imported.push("Daily Target");
    }

    // Import macro goals
    if (data.macroGoals) {
      saveMacroGoals(data.macroGoals);
      imported.push("Macro Goals");
    }

    // Import micronutrient goals
    if (data.micronutrientGoals) {
      saveMicronutrientGoals(data.micronutrientGoals);
      imported.push("Micronutrient Goals");
    }

    // Import preferences
    if (data.preferences) {
      saveToLocalStorage(STORAGE_KEYS.PREFERENCES, data.preferences);
      imported.push("Preferences");
    }

    // Import food log
    if (data.foodLog) {
      saveToLocalStorage(STORAGE_KEYS.FOOD_LOG, data.foodLog);
      imported.push("Food Log");
    }

    // Import exercise log
    if (data.exerciseLog) {
      saveToLocalStorage(STORAGE_KEYS.EXERCISE_LOG, data.exerciseLog);
      imported.push("Exercise Log");
    }

    // Import weekly history
    if (data.weeklyHistory) {
      saveToLocalStorage(STORAGE_KEYS.WEEKLY_HISTORY, data.weeklyHistory);
      imported.push("Weekly History");
    }

    // Import water log
    if (data.waterLog) {
      saveWaterLog(data.waterLog);
      imported.push("Water Log");
    }

    // Import recent foods
    if (data.recentFoods) {
      saveToLocalStorage(STORAGE_KEYS.RECENT_FOODS, data.recentFoods);
      imported.push("Recent Foods");
    }

    // Import favorite foods
    if (data.favoriteFoods) {
      saveToLocalStorage(STORAGE_KEYS.FAVORITE_FOODS, data.favoriteFoods);
      imported.push("Favorite Foods");
    }

    // Import weight log
    if (data.weightLog) {
      saveToLocalStorage(STORAGE_KEYS.WEIGHT_LOG, data.weightLog);
      imported.push("Weight Log");
    }

    // Import streak data
    if (data.streakData) {
      saveToLocalStorage(STORAGE_KEYS.STREAK_DATA, data.streakData);
      imported.push("Streak Data");
    }

    return {
      success: true,
      message: `Successfully imported ${imported.length} data sections`,
      imported,
    };
  } catch (error) {
    console.error("Import error:", error);
    return {
      success: false,
      message: "Failed to import data: " + error.message,
      imported,
    };
  }
};

// Get meal type based on current time
export const getMealTypeByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "snack";
  if (hour >= 17 && hour < 21) return "dinner";
  return "snack"; // Late night snack
};

// Save today's food log to history (called at end of day or before reset)
export const saveFoodLogToHistory = () => {
  const today = getTodaysDate();
  const foodLog = loadFromLocalStorage(STORAGE_KEYS.FOOD_LOG, []);

  if (foodLog.length === 0) return;

  const history = loadFromLocalStorage(STORAGE_KEYS.FOOD_HISTORY, {});
  history[today] = foodLog;

  // Keep only last 7 days of detailed food history (to conserve localStorage space)
  const dates = Object.keys(history).sort();
  let toSave = history;
  if (dates.length > 7) {
    const datesToKeep = dates.slice(-7);
    toSave = {};
    datesToKeep.forEach((date) => {
      toSave[date] = history[date];
    });
  }
  saveToLocalStorage(STORAGE_KEYS.FOOD_HISTORY, toSave);
  notifySync("foodHistory", toSave);
};

// Get yesterday's food log
export const getYesterdaysFoodLog = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const history = loadFromLocalStorage(STORAGE_KEYS.FOOD_HISTORY, {});
  return history[yesterdayStr] || [];
};

// Get food log for a specific date
export const getFoodLogByDate = (dateStr) => {
  const history = loadFromLocalStorage(STORAGE_KEYS.FOOD_HISTORY, {});
  return history[dateStr] || [];
};

export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    clearLocalStorage(key);
  });
};

export { STORAGE_KEYS };
