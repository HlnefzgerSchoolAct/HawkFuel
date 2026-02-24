/**
 * Sync Service - Cloud sync for NutriNote data
 * Local-first: writes to localStorage immediately, syncs to Firestore in background
 */

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import {
  loadUserProfile,
  saveLastSyncTime,
  saveUserProfile,
  loadDailyTarget,
  saveDailyTarget,
  loadMacroGoals,
  saveMacroGoals,
  loadMicronutrientGoals,
  saveMicronutrientGoals,
  loadPreferences,
  savePreferences,
  saveFoodLog,
  saveExerciseLog,
  loadWeeklyHistory,
  saveWeeklyHistory,
  saveWaterLog,
  loadRecentFoods,
  loadFavoriteFoods,
  loadWeightLog,
  loadStreakData,
  markOnboardingComplete,
  STORAGE_KEYS,
} from "../utils/localStorage";
import { getAllRecipes, saveRecipe } from "./recipeDatabase";
import { getAllTemplates, saveTemplate } from "./templateDatabase";

const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const jsonString = localStorage.getItem(key);
    if (jsonString === null) return defaultValue;
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

const USER_DATA_KEYS = [
  "foodHistory",
  "currentDate",
  "onboarding",
  "recentFoods",
  "favoriteFoods",
  "weightLog",
  "streakData",
];

const STORAGE_KEY_MAP = {
  foodHistory: STORAGE_KEYS.FOOD_HISTORY,
  currentDate: STORAGE_KEYS.CURRENT_DATE,
  onboarding: STORAGE_KEYS.ONBOARDING,
  recentFoods: STORAGE_KEYS.RECENT_FOODS,
  favoriteFoods: STORAGE_KEYS.FAVORITE_FOODS,
  weightLog: STORAGE_KEYS.WEIGHT_LOG,
  streakData: STORAGE_KEYS.STREAK_DATA,
};

/**
 * Upload local data to Firestore (migration for existing users).
 * Also used for manual retry when sync fails.
 */
export async function uploadLocalToCloud(userId) {
  if (!db || !isFirebaseConfigured()) return;

  const userRef = doc(db, "users", userId);
  const profile = loadUserProfile();
  const dailyTarget = loadDailyTarget();
  const macroGoals = loadMacroGoals();
  const microGoals = loadMicronutrientGoals();
  const preferences = loadPreferences();
  const foodLog = loadFromLocalStorage(STORAGE_KEYS.FOOD_LOG, []);
  const exerciseLog = loadFromLocalStorage(STORAGE_KEYS.EXERCISE_LOG, []);
  const weeklyHistory = loadWeeklyHistory();
  const waterLog = loadFromLocalStorage(STORAGE_KEYS.WATER_LOG, 0);
  const recentFoods = loadRecentFoods();
  const favoriteFoods = loadFavoriteFoods();
  const weightLog = loadWeightLog();
  const streakData = loadStreakData();
  const foodHistory = loadFromLocalStorage(STORAGE_KEYS.FOOD_HISTORY, {});
  const currentDate = loadFromLocalStorage(STORAGE_KEYS.CURRENT_DATE, null);
  const onboarding = loadFromLocalStorage(STORAGE_KEYS.ONBOARDING, false);

  const profileDoc = {
    userProfile: profile,
    dailyTarget,
    macroGoals,
    micronutrientGoals: microGoals,
    preferences,
    onboarding,
    currentDate,
    updatedAt: new Date().toISOString(),
  };

  const today = new Date().toISOString().split("T")[0];
  const foodLogDoc = {
    [today]: {
      entries: foodLog,
      exercise: exerciseLog,
      water: waterLog,
    },
    updatedAt: new Date().toISOString(),
  };

  const batch = writeBatch(db);
  batch.set(doc(db, "users", userId, "data", "profile"), profileDoc);
  batch.set(doc(db, "users", userId, "data", "foodLog"), foodLogDoc);
  batch.set(
    doc(db, "users", userId, "data", "history"),
    { ...weeklyHistory, updatedAt: new Date().toISOString() }
  );
  batch.set(
    doc(db, "users", userId, "data", "foodHistory"),
    { ...foodHistory, updatedAt: new Date().toISOString() }
  );
  batch.set(
    doc(db, "users", userId, "data", "favorites"),
    { items: favoriteFoods, updatedAt: new Date().toISOString() }
  );
  batch.set(
    doc(db, "users", userId, "data", "recentFoods"),
    { items: recentFoods, updatedAt: new Date().toISOString() }
  );
  batch.set(
    doc(db, "users", userId, "data", "weightLog"),
    { items: weightLog, updatedAt: new Date().toISOString() }
  );
  batch.set(
    doc(db, "users", userId, "data", "streakData"),
    { ...streakData, updatedAt: new Date().toISOString() }
  );

  await batch.commit();
  const now = new Date();
  saveLastSyncTime(now);
  window.dispatchEvent(new CustomEvent("nutrinote-sync-complete", { detail: { time: now } }));

  // Sync recipes and templates (async, separate writes)
  try {
    const recipes = await getAllRecipes();
    await syncRecipesToCloud(userId, recipes);
    const templates = await getAllTemplates();
    await syncTemplatesToCloud(userId, templates);
  } catch (err) {
    console.error("Recipe/template upload failed:", err);
  }
}

/**
 * Fetch all user data from Firestore and hydrate local storage
 */
async function syncFromCloud(userId) {
  if (!db || !isFirebaseConfigured()) return;

  try {
    const profileSnap = await getDoc(doc(db, "users", userId, "data", "profile"));
    const foodLogSnap = await getDoc(doc(db, "users", userId, "data", "foodLog"));
    const historySnap = await getDoc(doc(db, "users", userId, "data", "history"));
    const foodHistorySnap = await getDoc(
      doc(db, "users", userId, "data", "foodHistory")
    );
    const favoritesSnap = await getDoc(
      doc(db, "users", userId, "data", "favorites")
    );
    const recentSnap = await getDoc(
      doc(db, "users", userId, "data", "recentFoods")
    );
    const weightSnap = await getDoc(
      doc(db, "users", userId, "data", "weightLog")
    );
    const streakSnap = await getDoc(
      doc(db, "users", userId, "data", "streakData")
    );

    if (profileSnap.exists()) {
      const d = profileSnap.data();
      if (d.userProfile) saveUserProfile(d.userProfile);
      if (d.dailyTarget != null) saveDailyTarget(d.dailyTarget);
      if (d.macroGoals) saveMacroGoals(d.macroGoals);
      if (d.micronutrientGoals) saveMicronutrientGoals(d.micronutrientGoals);
      if (d.preferences) savePreferences(d.preferences);
      if (d.onboarding != null) {
        if (d.onboarding) markOnboardingComplete();
      }
    }

    if (foodLogSnap.exists()) {
      const d = foodLogSnap.data();
      const today = new Date().toISOString().split("T")[0];
      const todayData = d[today];
      if (todayData) {
        if (todayData.entries) saveFoodLog(todayData.entries);
        if (todayData.exercise) saveExerciseLog(todayData.exercise);
        if (todayData.water != null) saveWaterLog(todayData.water);
      }
    }

    if (historySnap.exists()) {
      const d = historySnap.data();
      const { updatedAt, ...history } = d;
      saveWeeklyHistory(history);
    }

    if (foodHistorySnap.exists()) {
      const d = foodHistorySnap.data();
      const { updatedAt, ...foodHistory } = d;
      saveToLocalStorage(STORAGE_KEYS.FOOD_HISTORY, foodHistory);
    }

    if (favoritesSnap.exists()) {
      const items = favoritesSnap.data().items || [];
      saveToLocalStorage(STORAGE_KEYS.FAVORITE_FOODS, items);
    }

    if (recentSnap.exists()) {
      const items = recentSnap.data().items || [];
      saveToLocalStorage(STORAGE_KEYS.RECENT_FOODS, items);
    }

    if (weightSnap.exists()) {
      const items = weightSnap.data().items || [];
      saveToLocalStorage(STORAGE_KEYS.WEIGHT_LOG, items);
    }

    if (streakSnap.exists()) {
      const d = streakSnap.data();
      const { updatedAt, ...streakData } = d;
      saveToLocalStorage(STORAGE_KEYS.STREAK_DATA, streakData);
    }

    // Load recipes and templates
    const recipesSnap = await getDoc(doc(db, "users", userId, "data", "recipes"));
    if (recipesSnap.exists() && recipesSnap.data().items?.length > 0) {
      for (const recipe of recipesSnap.data().items) {
        await saveRecipe({ ...recipe, id: recipe.id || Date.now() + Math.random() });
      }
    }

    const templatesSnap = await getDoc(doc(db, "users", userId, "data", "templates"));
    if (templatesSnap.exists() && templatesSnap.data().items?.length > 0) {
      for (const template of templatesSnap.data().items) {
        await saveTemplate({ ...template, id: template.id || Date.now() + Math.random() });
      }
    }
    const now = new Date();
    saveLastSyncTime(now);
    window.dispatchEvent(new CustomEvent("nutrinote-sync-complete", { detail: { time: now } }));
  } catch (err) {
    console.error("syncFromCloud failed:", err);
  }
}

/**
 * Called when user signs in. Merge strategy:
 * - If cloud has data: pull from cloud (overwrite local)
 * - If cloud is empty but local has data: upload local to cloud (migration)
 */
export async function syncOnSignIn(user) {
  if (!user || !isFirebaseConfigured()) return;

  const userId = user.uid;
  const profileSnap = await getDoc(doc(db, "users", userId, "data", "profile"));

  if (profileSnap.exists()) {
    await syncFromCloud(userId);
  } else {
    const hasLocalData =
    loadUserProfile() ||
    loadFromLocalStorage(STORAGE_KEYS.FOOD_LOG, []).length > 0;
    if (hasLocalData) {
      await uploadLocalToCloud(userId);
    }
  }
}

/**
 * Sync a single data type to cloud (called after local save)
 */
export async function syncToCloud(userId, dataType, payload) {
  if (!db || !userId || !isFirebaseConfigured()) return;

  try {
    const updatedAt = new Date().toISOString();

    switch (dataType) {
      case "profile":
        await setDoc(doc(db, "users", userId, "data", "profile"), {
          ...payload,
          updatedAt,
        });
        break;
      case "foodLog": {
        const today = new Date().toISOString().split("T")[0];
        const foodLogRef = doc(db, "users", userId, "data", "foodLog");
        const snap = await getDoc(foodLogRef);
        const existing = snap.exists() ? snap.data() : {};
        existing[today] = {
          entries: payload.entries || [],
          exercise: payload.exercise || [],
          water: payload.water ?? 0,
        };
        existing.updatedAt = updatedAt;
        await setDoc(foodLogRef, existing);
        break;
      }
      case "history":
        await setDoc(doc(db, "users", userId, "data", "history"), {
          ...payload,
          updatedAt,
        });
        break;
      case "foodHistory":
        await setDoc(doc(db, "users", userId, "data", "foodHistory"), {
          ...payload,
          updatedAt,
        });
        break;
      case "favorites":
        await setDoc(doc(db, "users", userId, "data", "favorites"), {
          items: payload,
          updatedAt,
        });
        break;
      case "recentFoods":
        await setDoc(doc(db, "users", userId, "data", "recentFoods"), {
          items: payload,
          updatedAt,
        });
        break;
      case "weightLog":
        await setDoc(doc(db, "users", userId, "data", "weightLog"), {
          items: payload,
          updatedAt,
        });
        break;
      case "streakData":
        await setDoc(doc(db, "users", userId, "data", "streakData"), {
          ...payload,
          updatedAt,
        });
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("syncToCloud failed:", err);
    throw err;
  }
}

export { syncFromCloud };

const USER_DATA_DOCS = [
  "profile",
  "foodLog",
  "history",
  "foodHistory",
  "favorites",
  "recentFoods",
  "weightLog",
  "streakData",
  "recipes",
  "templates",
];

/**
 * Delete all user data from Firestore (for account deletion / GDPR)
 */
export async function deleteUserCloudData(userId) {
  if (!db || !userId || !isFirebaseConfigured()) return;
  const promises = USER_DATA_DOCS.map((docId) =>
    deleteDoc(doc(db, "users", userId, "data", docId))
  );
  await Promise.allSettled(promises);
}

/**
 * Sync recipes to Firestore
 */
export async function syncRecipesToCloud(userId, recipes) {
  if (!db || !userId || !isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, "users", userId, "data", "recipes"), {
      items: recipes,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("syncRecipesToCloud failed:", err);
  }
}

/**
 * Sync templates to Firestore (user-created only, not prebuilt)
 */
export async function syncTemplatesToCloud(userId, templates) {
  if (!db || !userId || !isFirebaseConfigured()) return;
  try {
    const userTemplates = (templates || []).filter((t) => !t.isPrebuilt);
    await setDoc(doc(db, "users", userId, "data", "templates"), {
      items: userTemplates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("syncTemplatesToCloud failed:", err);
  }
}

/**
 * Load recipes from Firestore (for syncOnSignIn)
 */
export async function loadRecipesFromCloud(userId) {
  if (!db || !userId || !isFirebaseConfigured()) return null;
  try {
    const snap = await getDoc(doc(db, "users", userId, "data", "recipes"));
    return snap.exists() ? snap.data().items || [] : null;
  } catch (err) {
    console.error("loadRecipesFromCloud failed:", err);
    return null;
  }
}

/**
 * Load templates from Firestore (for syncOnSignIn)
 */
export async function loadTemplatesFromCloud(userId) {
  if (!db || !userId || !isFirebaseConfigured()) return null;
  try {
    const snap = await getDoc(doc(db, "users", userId, "data", "templates"));
    return snap.exists() ? snap.data().items || [] : null;
  } catch (err) {
    console.error("loadTemplatesFromCloud failed:", err);
    return null;
  }
}
