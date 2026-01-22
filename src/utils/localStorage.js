/**
 * localStorage Utility Functions
 *
 * Purpose: Save and load data from browser's localStorage
 *
 * localStorage is like a permanent notepad in your browser:
 * - Data persists even after closing browser
 * - Stored as strings (we convert objects to/from JSON)
 * - Each user's browser has its own storage
 * - No server needed!
 */

// STORAGE KEYS - Like labels on folders
const STORAGE_KEYS = {
  USER_PROFILE: "hawkfuel_user_profile", // User's age, weight, goals, etc.
  DAILY_TARGET: "hawkfuel_daily_target", // Target calories for the day
  FOOD_LOG: "hawkfuel_food_log", // All food entries
  EXERCISE_LOG: "hawkfuel_exercise_log", // All exercise entries
  CURRENT_DATE: "hawkfuel_current_date", // Today's date (to reset daily)
  WEEKLY_HISTORY: "hawkfuel_weekly_history", // Last 7 days of data
  WATER_LOG: "hawkfuel_water_log", // Daily water intake (NEW!)
};

/**
 * saveToLocalStorage
 *
 * Saves any data to localStorage
 *
 * @param {string} key - The storage key (like a label)
 * @param {any} data - The data to save (object, array, string, number)
 */
export const saveToLocalStorage = (key, data) => {
  try {
    // Convert JavaScript object to JSON string
    const jsonString = JSON.stringify(data);

    // Save to localStorage
    localStorage.setItem(key, jsonString);

    console.log(`✅ Saved to localStorage: ${key}`);
  } catch (error) {
    console.error("❌ Error saving to localStorage:", error);
  }
};

/**
 * loadFromLocalStorage
 *
 * Loads data from localStorage
 *
 * @param {string} key - The storage key to load
 * @param {any} defaultValue - What to return if nothing is saved
 * @returns {any} The saved data or defaultValue
 */
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    // Get the JSON string from localStorage
    const jsonString = localStorage.getItem(key);

    // If nothing saved, return default
    if (jsonString === null) {
      return defaultValue;
    }

    // Convert JSON string back to JavaScript object
    const data = JSON.parse(jsonString);

    console.log(`✅ Loaded from localStorage: ${key}`);
    return data;
  } catch (error) {
    console.error("❌ Error loading from localStorage:", error);
    return defaultValue;
  }
};

/**
 * clearLocalStorage
 *
 * Removes data from localStorage
 *
 * @param {string} key - The storage key to remove
 */
export const clearLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    console.log(`✅ Cleared from localStorage: ${key}`);
  } catch (error) {
    console.error("❌ Error clearing localStorage:", error);
  }
};

/**
 * clearAllData
 *
 * Removes ALL Hawk Fuel data from localStorage
 * Use when user wants to start fresh
 */
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    clearLocalStorage(key);
  });
  console.log("✅ All Hawk Fuel data cleared!");
};

/**
 * getTodaysDate
 *
 * Returns today's date as a string (YYYY-MM-DD)
 * Used to check if we need to reset daily logs
 */
export const getTodaysDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // "2026-01-22"
};

/**
 * checkAndResetDaily
 *
 * Checks if it's a new day, and resets daily logs if so
 *
 * How it works:
 * 1. Load the saved date
 * 2. Compare to today's date
 * 3. If different, clear food/exercise logs
 * 4. Save new date
 */
export const checkAndResetDaily = () => {
  const savedDate = loadFromLocalStorage(STORAGE_KEYS.CURRENT_DATE);
  const todaysDate = getTodaysDate();

  // If it's a new day, reset daily logs
  if (savedDate !== todaysDate) {
    console.log("New day detected! Resetting daily logs...");

    // Clear yesterday's food and exercise
    clearLocalStorage(STORAGE_KEYS.FOOD_LOG);
    clearLocalStorage(STORAGE_KEYS.EXERCISE_LOG);

    // Save today's date
    saveToLocalStorage(STORAGE_KEYS.CURRENT_DATE, todaysDate);
  }
};

/**
 * USER PROFILE FUNCTIONS
 */

export const saveUserProfile = (profile) => {
  saveToLocalStorage(STORAGE_KEYS.USER_PROFILE, profile);
};

export const loadUserProfile = () => {
  return loadFromLocalStorage(STORAGE_KEYS.USER_PROFILE, null);
};

/**
 * DAILY TARGET FUNCTIONS
 */

export const saveDailyTarget = (target) => {
  saveToLocalStorage(STORAGE_KEYS.DAILY_TARGET, target);
};

export const loadDailyTarget = () => {
  return loadFromLocalStorage(STORAGE_KEYS.DAILY_TARGET, 2000); // Default 2000 cal
};

/**
 * FOOD LOG FUNCTIONS
 */

export const saveFoodLog = (foodLog) => {
  saveToLocalStorage(STORAGE_KEYS.FOOD_LOG, foodLog);
};

export const loadFoodLog = () => {
  checkAndResetDaily(); // Reset if new day
  return loadFromLocalStorage(STORAGE_KEYS.FOOD_LOG, []);
};

export const addFoodEntry = (foodEntry) => {
  const currentLog = loadFoodLog();
  const newEntry = {
    id: Date.now(), // Unique ID using timestamp
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

/**
 * EXERCISE LOG FUNCTIONS
 */

export const saveExerciseLog = (exerciseLog) => {
  saveToLocalStorage(STORAGE_KEYS.EXERCISE_LOG, exerciseLog);
};

export const loadExerciseLog = () => {
  checkAndResetDaily(); // Reset if new day
  return loadFromLocalStorage(STORAGE_KEYS.EXERCISE_LOG, []);
};

export const addExerciseEntry = (exerciseEntry) => {
  const currentLog = loadExerciseLog();
  const newEntry = {
    id: Date.now(),
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

/**
 * CALCULATION HELPERS
 */

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

/**
 * WEEKLY HISTORY FUNCTIONS (NEW!)
 *
 * Track daily totals for the last 7 days to show in graph
 *
 * Data Structure:
 * {
 *   "2026-01-22": { eaten: 2100, burned: 450, target: 2000 },
 *   "2026-01-23": { eaten: 1950, burned: 300, target: 2000 },
 *   ...
 * }
 */

/**
 * saveWeeklyHistory
 *
 * Saves the weekly history object to localStorage
 *
 * @param {Object} history - Object with dates as keys
 */
export const saveWeeklyHistory = (history) => {
  saveToLocalStorage(STORAGE_KEYS.WEEKLY_HISTORY, history);
};

/**
 * loadWeeklyHistory
 *
 * Loads the weekly history from localStorage
 *
 * @returns {Object} History object (or empty object if none)
 */
export const loadWeeklyHistory = () => {
  return loadFromLocalStorage(STORAGE_KEYS.WEEKLY_HISTORY, {});
};

/**
 * saveDailyDataToHistory
 *
 * Saves today's totals to the weekly history
 * Called whenever food/exercise is logged
 *
 * How it works:
 * 1. Get today's date (YYYY-MM-DD format)
 * 2. Calculate today's totals
 * 3. Load existing history
 * 4. Add/update today's data
 * 5. Keep only last 7 days
 * 6. Save back to localStorage
 */
export const saveDailyDataToHistory = () => {
  const today = getTodaysDate();
  const eaten = getTotalCaloriesEaten();
  const burned = getTotalCaloriesBurned();
  const target = loadDailyTarget();

  // Load existing history
  const history = loadWeeklyHistory();

  // Add/update today's data
  history[today] = {
    eaten: eaten,
    burned: burned,
    target: target,
  };

  // Keep only last 7 days
  const dates = Object.keys(history).sort(); // Sort dates
  if (dates.length > 7) {
    // Remove oldest dates
    const datesToKeep = dates.slice(-7); // Keep last 7
    const newHistory = {};
    datesToKeep.forEach((date) => {
      newHistory[date] = history[date];
    });
    saveWeeklyHistory(newHistory);
  } else {
    saveWeeklyHistory(history);
  }
};

/**
 * getWeeklyGraphData
 *
 * Formats weekly history into structure needed for Chart.js
 *
 * Returns data for last 7 days (fills missing days with zeros)
 *
 * @returns {Object} Graph data with labels and datasets
 *
 * Structure:
 * {
 *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
 *   datasets: [
 *     { label: 'Eaten', data: [2100, 1950, 2200, ...] },
 *     { label: 'Burned', data: [450, 300, 500, ...] },
 *     { label: 'Target', data: [2000, 2000, 2000, ...] }
 *   ]
 * }
 */
export const getWeeklyGraphData = () => {
  const history = loadWeeklyHistory();

  // Get last 7 days (including today)
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    last7Days.push(date.toISOString().split("T")[0]); // YYYY-MM-DD
  }

  // Create labels (day names)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const labels = last7Days.map((dateStr) => {
    const date = new Date(dateStr + "T12:00:00"); // Add time to avoid timezone issues
    return dayNames[date.getDay()];
  });

  // Extract data for each dataset
  const eatenData = [];
  const burnedData = [];
  const targetData = [];

  last7Days.forEach((dateStr) => {
    const dayData = history[dateStr];
    if (dayData) {
      // We have data for this day
      eatenData.push(dayData.eaten);
      burnedData.push(dayData.burned);
      targetData.push(dayData.target);
    } else {
      // No data for this day (use 0 or null)
      eatenData.push(0);
      burnedData.push(0);
      targetData.push(0);
    }
  });

  // Return Chart.js compatible format
  return {
    labels: labels,
    datasets: [
      {
        label: "Calories Eaten",
        data: eatenData,
        borderColor: "rgb(231, 76, 60)", // Red
        backgroundColor: "rgba(231, 76, 60, 0.1)",
        tension: 0.3, // Curved lines
      },
      {
        label: "Calories Burned",
        data: burnedData,
        borderColor: "rgb(243, 156, 18)", // Orange
        backgroundColor: "rgba(243, 156, 18, 0.1)",
        tension: 0.3,
      },
      {
        label: "Target Calories",
        data: targetData,
        borderColor: "rgb(52, 152, 219)", // Blue
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        tension: 0.3,
        borderDash: [5, 5], // Dashed line for target
      },
    ],
  };
};

/**
 * WATER TRACKING FUNCTIONS
 */

/**
 * loadWaterLog
 * Loads today's water intake (in cups)
 */
export const loadWaterLog = () => {
  return loadFromLocalStorage(STORAGE_KEYS.WATER_LOG, 0);
};

/**
 * saveWaterLog
 * Saves water intake for the day
 */
export const saveWaterLog = (cups) => {
  saveToLocalStorage(STORAGE_KEYS.WATER_LOG, cups);
};

/**
 * addWaterCup
 * Adds one cup to today's water intake
 */
export const addWaterCup = () => {
  const current = loadWaterLog();
  const updated = current + 1;
  saveWaterLog(updated);
  return updated;
};

/**
 * removeWaterCup
 * Removes one cup from today's water intake
 */
export const removeWaterCup = () => {
  const current = loadWaterLog();
  const updated = Math.max(0, current - 1); // Don't go below 0
  saveWaterLog(updated);
  return updated;
};

// Export storage keys for use in components
export { STORAGE_KEYS };
