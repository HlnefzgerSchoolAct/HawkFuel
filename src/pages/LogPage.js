/**
 * Log Page — M3 Redesign with Tailwind
 * Food & exercise logging with AI input, barcode scanner, quick add, and meal grouping
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Utensils,
  Dumbbell,
  Star,
  ChevronDown,
  Search,
  Sparkles,
  ScanLine,
  Copy,
} from "lucide-react";
import "./LogPage.css";

// M3 Design System Components
import {
  M3Card,
  M3CardContent,
  M3Button,
  M3SearchField,
  Section,
  Main,
  SegmentedButton,
  Chip,
  ChipGroup,
  EmptyState,
  SwipeableItem,
  showToast,
  StaggerContainer,
  StaggerItem,
  CompactMacros,
  CompactMicronutrients,
  VisuallyHidden,
  useAnnounce,
} from "../components/common";

import SegmentedButtonGroup from "../components/common/SegmentedButton";
import AIFoodInput from "../components/AIFoodInput";
import BarcodeScanner from "../components/BarcodeScanner";
import EditFoodModal from "../components/EditFoodModal";
import CopyMealsSheet from "../components/CopyMealsSheet";
import { quickAddFoods, foodsDatabase } from "../data/foods";
import {
  loadFoodLog,
  loadExerciseLog,
  addFoodEntry,
  addExerciseEntry,
  deleteFoodEntry,
  deleteExerciseEntry,
  updateFoodEntry,
  getTotalCaloriesEaten,
  getTotalCaloriesBurned,
  saveDailyDataToHistory,
  loadPreferences,
  loadRecentFoods,
  addRecentFood,
  loadFavoriteFoods,
  toggleFavoriteFood,
  isFavoriteFood,
  getMealTypeByTime,
} from "../utils/localStorage";
import { haptics } from "../utils/haptics";

const TAB_SEGMENTS = [
  { value: "food", label: "Food", icon: <Utensils size={18} /> },
  { value: "exercise", label: "Exercise", icon: <Dumbbell size={18} /> },
];

const INPUT_MODE_SEGMENTS = [
  { value: "ai", label: "AI Estimator", icon: <Sparkles size={16} /> },
  { value: "scan", label: "Scan Barcode", icon: <ScanLine size={16} /> },
];

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack", "other"];

function LogPage({ userProfile, dailyTarget }) {
  const location = useLocation();
  const announce = useAnnounce();
  const initialMode = location.state?.mode || "ai";

  const [activeTab, setActiveTab] = useState(
    initialMode === "exercise" ? "exercise" : "food",
  );
  const [inputMode, setInputMode] = useState(
    initialMode === "scan" ? "scan" : "ai",
  );
  const [prefillFoodDescription, setPrefillFoodDescription] = useState("");

  // Food state
  const [foodLog, setFoodLog] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [foodCalories, setFoodCalories] = useState("");

  // Exercise state
  const [exerciseLog, setExerciseLog] = useState([]);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseCalories, setExerciseCalories] = useState("");

  // Quick add state
  const [recentFoods, setRecentFoods] = useState([]);
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [quickAddTab, setQuickAddTab] = useState("recent");
  const [quickAddSearch, setQuickAddSearch] = useState("");

  // Edit/Copy state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [copySheetOpen, setCopySheetOpen] = useState(false);

  // Collapsible sections
  const [showQuickAdd, setShowQuickAdd] = useState(true);
  const [showFoodLog, setShowFoodLog] = useState(true);

  const isMobile =
    window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
  const preferences = loadPreferences();

  // #region agent log
  fetch('http://127.0.0.1:7478/ingest/a61803e4-33fd-4e07-8277-6c1c53f64fc5', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '893c3b',
    },
    body: JSON.stringify({
      sessionId: '893c3b',
      runId: 'pre-fix-1',
      hypothesisId: 'H2',
      location: 'LogPage.js:init',
      message: 'LogPage initial state',
      data: {
        isMobile,
        databaseEnabled: preferences.databaseEnabled,
        activeTab,
        inputMode,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  // ===== Data Loading =====
  const loadData = useCallback(() => {
    setFoodLog(loadFoodLog());
    setExerciseLog(loadExerciseLog());
    setRecentFoods(loadRecentFoods());
    setFavoriteFoods(loadFavoriteFoods());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (location.state?.mode === "scan") {
      setActiveTab("food");
      setInputMode("scan");
    } else if (location.state?.mode === "ai") {
      setActiveTab("food");
      setInputMode("ai");
    } else if (location.state?.mode === "exercise") {
      setActiveTab("exercise");
    }
  }, [location.state]);

  useEffect(() => {
    saveDailyDataToHistory();
  }, [foodLog, exerciseLog]);

  // ===== Computed =====
  const totalEaten = getTotalCaloriesEaten();
  const totalBurned = getTotalCaloriesBurned();

  const groupedFood = useMemo(() => {
    return foodLog.reduce((acc, entry) => {
      const meal = entry.mealType || "other";
      if (!acc[meal]) acc[meal] = [];
      acc[meal].push(entry);
      return acc;
    }, {});
  }, [foodLog]);

  const filteredFoods = useMemo(() => {
    if (!quickAddSearch.trim()) return [];
    const allFoods = [...quickAddFoods, ...foodsDatabase];
    const term = quickAddSearch.toLowerCase();
    return allFoods.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term),
    );
  }, [quickAddSearch]);

  // ===== Handlers =====
  const handleAddAIFood = useCallback(
    (foodEntry) => {
      const entryWithMeal = { ...foodEntry, mealType: getMealTypeByTime() };
      const saved = addFoodEntry(entryWithMeal);
      setFoodLog((prev) => [...prev, saved]);
      addRecentFood({
        name: foodEntry.name,
        calories: foodEntry.calories,
        protein: foodEntry.protein || 0,
        carbs: foodEntry.carbs || 0,
        fat: foodEntry.fat || 0,
      });
      setRecentFoods(loadRecentFoods());
      showToast.success("Food logged!", `${foodEntry.name} - ${foodEntry.calories} cal`);
      announce(`Logged ${foodEntry.name}, ${foodEntry.calories} calories`, "assertive");
    },
    [announce],
  );

  const handleAddFood = useCallback(
    (e) => {
      e.preventDefault();
      if (!foodName || !foodCalories || foodCalories <= 0) return;
      const entry = { name: foodName, calories: parseInt(foodCalories), mealType: getMealTypeByTime() };
      const saved = addFoodEntry(entry);
      setFoodLog((prev) => [...prev, saved]);
      setFoodName("");
      setFoodCalories("");
      showToast.success("Food logged!", `${foodName} - ${foodCalories} cal`);
    },
    [foodName, foodCalories],
  );

  const handleAddExercise = useCallback(
    (e) => {
      e.preventDefault();
      if (!exerciseName || !exerciseCalories || exerciseCalories <= 0) return;
      const saved = addExerciseEntry({
        name: exerciseName,
        calories: parseInt(exerciseCalories),
      });
      setExerciseLog((prev) => [...prev, saved]);
      setExerciseName("");
      setExerciseCalories("");
      showToast.success("Exercise logged!", `${exerciseName} - ${exerciseCalories} cal burned`);
    },
    [exerciseName, exerciseCalories],
  );

  const handleDeleteFood = useCallback((entry) => {
    deleteFoodEntry(entry.id);
    setFoodLog((prev) => prev.filter((e) => e.id !== entry.id));
    showToast.undo(`Deleted ${entry.name}`, () => {
      const restored = addFoodEntry(entry);
      setFoodLog((prev) => [...prev, restored]);
    });
  }, []);

  const handleDeleteExercise = useCallback((entry) => {
    deleteExerciseEntry(entry.id);
    setExerciseLog((prev) => prev.filter((e) => e.id !== entry.id));
    showToast.undo(`Deleted ${entry.name}`, () => {
      const restored = addExerciseEntry(entry);
      setExerciseLog((prev) => [...prev, restored]);
    });
  }, []);

  const handleToggleFavorite = useCallback((food) => {
    toggleFavoriteFood(food);
    setFavoriteFoods(loadFavoriteFoods());
    if (isFavoriteFood(food.name)) {
      showToast.success("Added to favorites", food.name);
    }
  }, []);

  const handleEditFood = useCallback((entry) => {
    setEditingEntry(entry);
    setEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback((updatedEntry) => {
    const saved = updateFoodEntry(updatedEntry.id, updatedEntry);
    if (saved) {
      setFoodLog((prev) => prev.map((e) => (e.id === updatedEntry.id ? saved : e)));
      showToast.success("Entry updated", updatedEntry.name);
    }
    setEditModalOpen(false);
    setEditingEntry(null);
  }, []);

  const handleDuplicateFood = useCallback((newEntry) => {
    const saved = addFoodEntry(newEntry);
    setFoodLog((prev) => [...prev, saved]);
    showToast.success("Entry duplicated", newEntry.name);
    setEditModalOpen(false);
    setEditingEntry(null);
  }, []);

  const handleCopyMealsClose = useCallback(
    (success) => {
      setCopySheetOpen(false);
      if (success) {
        loadData();
        showToast.success("Meals copied!", "Food entries added to today");
      }
    },
    [loadData],
  );

  const addQuickFood = useCallback(
    (food, multiplier = 1) => {
      const entry = addFoodEntry({
        name: multiplier !== 1 ? `${food.name} x${multiplier}` : food.name,
        calories: Math.round(food.cal * multiplier),
        mealType: getMealTypeByTime(),
      });
      setFoodLog((prev) => [...prev, entry]);
      setQuickAddSearch("");
      showToast.success("Food logged!", `${food.name} - ${food.cal} cal`);
    },
    [],
  );

  // ===== Render =====
  return (
    <Main className="log-page px-4 pt-6 pb-24 max-w-150 mx-auto md:max-w-210 lg:pb-8 lg:pl-70">
      <VisuallyHidden>
        <h1>Food &amp; Exercise Log</h1>
      </VisuallyHidden>

      {/* ===== Tab Selector ===== */}
      <div className="mb-4">
        <SegmentedButtonGroup
          segments={TAB_SEGMENTS}
          value={activeTab}
          onChange={(val) => {
            setActiveTab(val);
            haptics.selection();
          }}
          fullWidth
        />
      </div>

      {/* ===== Food Tab ===== */}
      <AnimatePresence mode="wait">
        {activeTab === "food" && (
          <motion.div
            key="food-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Input Mode Toggle (mobile) */}
            {isMobile && (
              <div className="mb-4">
                <SegmentedButtonGroup
                  segments={INPUT_MODE_SEGMENTS}
                  value={inputMode}
                  onChange={(val) => {
                    setInputMode(val);
                    haptics.selection();
                  }}
                  fullWidth
                  size="sm"
                />
              </div>
            )}

            {/* AI Food Input */}
            <AnimatePresence mode="wait">
              {(inputMode === "ai" || !isMobile) && (
                <motion.div
                  key="ai-input"
                  className="mb-4 overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AIFoodInput
                    onAddFood={handleAddAIFood}
                    userWeight={userProfile?.weight}
                    prefillDescription={prefillFoodDescription}
                    onDescriptionUsed={() => setPrefillFoodDescription("")}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Barcode Scanner */}
            <AnimatePresence mode="wait">
              {inputMode === "scan" && isMobile && (
                <motion.div
                  key="scan-input"
                  className="mb-4 overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <BarcodeScanner
                    onAddFood={handleAddAIFood}
                    onSwitchToAI={(productName) => {
                      setInputMode("ai");
                      if (productName) setPrefillFoodDescription(productName);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Add Section */}
            <QuickAddSection
              recentFoods={recentFoods}
              favoriteFoods={favoriteFoods}
              quickAddTab={quickAddTab}
              setQuickAddTab={setQuickAddTab}
              showQuickAdd={showQuickAdd}
              setShowQuickAdd={setShowQuickAdd}
              onQuickAdd={handleAddAIFood}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Database Search */}
            {preferences.databaseEnabled && (
              <DatabaseSearch
                search={quickAddSearch}
                setSearch={setQuickAddSearch}
                results={filteredFoods}
                onAdd={addQuickFood}
              />
            )}

            {/* Food Log */}
            <FoodLogSection
              foodLog={foodLog}
              groupedFood={groupedFood}
              totalEaten={totalEaten}
              showFoodLog={showFoodLog}
              setShowFoodLog={setShowFoodLog}
              onEditFood={handleEditFood}
              onDeleteFood={handleDeleteFood}
              onToggleFavorite={handleToggleFavorite}
              onCopyMeals={() => setCopySheetOpen(true)}
              onEmptyAction={() => setInputMode("ai")}
            />

            {/* Manual Entry */}
            <ManualEntry
              foodName={foodName}
              setFoodName={setFoodName}
              foodCalories={foodCalories}
              setFoodCalories={setFoodCalories}
              onSubmit={handleAddFood}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Exercise Tab ===== */}
      <AnimatePresence mode="wait">
        {activeTab === "exercise" && (
          <motion.div
            key="exercise-tab"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ExerciseSection
              exerciseLog={exerciseLog}
              totalBurned={totalBurned}
              exerciseName={exerciseName}
              setExerciseName={setExerciseName}
              exerciseCalories={exerciseCalories}
              setExerciseCalories={setExerciseCalories}
              onAddExercise={handleAddExercise}
              onDeleteExercise={handleDeleteExercise}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <EditFoodModal
        open={editModalOpen}
        entry={editingEntry}
        onClose={() => {
          setEditModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEdit}
        onDelete={(entry) => {
          handleDeleteFood(entry);
          setEditModalOpen(false);
          setEditingEntry(null);
        }}
        onDuplicate={handleDuplicateFood}
      />

      <CopyMealsSheet
        isOpen={copySheetOpen}
        onClose={handleCopyMealsClose}
        targetDate={new Date()}
      />
    </Main>
  );
}

/* =============================================
   SUB-COMPONENTS — Decomposed from the monolith
   ============================================= */

/** Quick Add panel — Recent + Favorites */
function QuickAddSection({
  recentFoods,
  favoriteFoods,
  quickAddTab,
  setQuickAddTab,
  showQuickAdd,
  setShowQuickAdd,
  onQuickAdd,
  onToggleFavorite,
}) {
  if (recentFoods.length === 0 && favoriteFoods.length === 0) return null;

  const foods = quickAddTab === "recent" ? recentFoods : favoriteFoods;

  return (
    <M3Card variant="filled" className="mb-4">
      {/* Header toggle */}
      <button
        className="flex items-center justify-between w-full px-4 py-3 bg-transparent border-none cursor-pointer text-on-surface"
        onClick={() => setShowQuickAdd(!showQuickAdd)}
        aria-expanded={showQuickAdd}
      >
        <span className="flex items-center gap-2 text-title-sm font-semibold">
          Quick Add
        </span>
        <motion.div animate={{ rotate: showQuickAdd ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Tabs */}
            <div className="flex gap-2 px-4 pb-3 border-b border-outline-variant">
              <Chip
                variant="filter"
                selected={quickAddTab === "recent"}
                onClick={() => setQuickAddTab("recent")}
              >
                Recent
              </Chip>
              <Chip
                variant="filter"
                selected={quickAddTab === "favorites"}
                onClick={() => setQuickAddTab("favorites")}
              >
                <Star size={14} className="mr-1" /> Favorites
              </Chip>
            </div>

            {/* List */}
            <div className="px-3 py-3 max-h-80 overflow-y-auto">
              {foods.length > 0 ? (
                <StaggerContainer staggerDelay={0.03}>
                  {(quickAddTab === "recent" ? foods.slice(0, 8) : foods).map(
                    (food, index) => (
                      <StaggerItem key={`${quickAddTab}-${index}`}>
                        <QuickFoodItem
                          food={food}
                          onAdd={() =>
                            onQuickAdd({
                              name: food.name,
                              calories: food.calories,
                              protein: food.protein,
                              carbs: food.carbs,
                              fat: food.fat,
                            })
                          }
                          onToggleFavorite={() => onToggleFavorite(food)}
                          isFavorite={isFavoriteFood(food.name)}
                        />
                      </StaggerItem>
                    ),
                  )}
                </StaggerContainer>
              ) : (
                <p className="text-center text-on-surface-variant text-body-sm py-4">
                  {quickAddTab === "recent"
                    ? "Log foods to see them here"
                    : "Star foods to add them here"}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </M3Card>
  );
}

/** Single quick-add food item */
function QuickFoodItem({ food, onAdd, onToggleFavorite, isFavorite }) {
  return (
    <motion.button
      className="flex items-center justify-between w-full px-3 py-3 mb-2 last:mb-0 bg-surface-container rounded-lg border-none cursor-pointer text-left transition-colors duration-150 hover:bg-surface-container-high"
      onClick={onAdd}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-body-sm font-medium text-on-surface truncate">
          {food.name}
        </span>
        <CompactMacros
          calories={food.calories}
          protein={food.protein}
          carbs={food.carbs}
          fat={food.fat}
        />
      </div>
      <button
        className={`flex items-center justify-center w-9 h-9 bg-transparent border-none rounded-md cursor-pointer shrink-0 ml-2 transition-colors duration-150 ${
          isFavorite
            ? "text-warning"
            : "text-on-surface-variant hover:text-warning hover:bg-surface-container-high"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
      </button>
    </motion.button>
  );
}

/** Database search  */
function DatabaseSearch({ search, setSearch, results, onAdd }) {
  return (
    <M3Card variant="outlined" className="mb-4 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Search size={18} className="text-on-surface-variant shrink-0" />
        <input
          type="text"
          placeholder="Search food database..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-body-md text-on-surface placeholder:text-on-surface-variant"
        />
      </div>

      <AnimatePresence>
        {search.trim() && (
          <motion.div
            className="border-t border-outline-variant max-h-75 overflow-y-auto"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {results.length === 0 ? (
              <p className="text-center text-on-surface-variant text-body-sm py-4">
                No foods found
              </p>
            ) : (
              results.slice(0, 10).map((food) => (
                <motion.button
                  key={food.name}
                  className="flex items-center justify-between w-full px-4 py-3 bg-transparent border-none border-b border-outline-variant last:border-b-0 cursor-pointer text-left transition-colors duration-150 hover:bg-surface-container text-on-surface"
                  onClick={() => onAdd(food, 1)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-sm font-medium">{food.name}</span>
                    <span className="text-label-sm text-on-surface-variant">
                      {food.cal} cal • P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                    </span>
                  </div>
                  <Plus size={18} className="text-primary shrink-0" />
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </M3Card>
  );
}

/** Food log with meal groups */
function FoodLogSection({
  foodLog,
  groupedFood,
  totalEaten,
  showFoodLog,
  setShowFoodLog,
  onEditFood,
  onDeleteFood,
  onToggleFavorite,
  onCopyMeals,
  onEmptyAction,
}) {
  return (
    <M3Card variant="filled" className="mb-4">
      {/* Header row */}
      <div className="flex items-center">
        <button
          className="flex-1 flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer text-on-surface min-w-0"
          onClick={() => setShowFoodLog(!showFoodLog)}
          aria-expanded={showFoodLog}
        >
          <span className="flex items-center gap-2 text-title-sm font-semibold">
            <Utensils size={18} aria-hidden="true" />
            Today's Food
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 bg-surface-container-high rounded-full text-label-sm font-medium text-on-surface-variant">
              {foodLog.length}
            </span>
          </span>
          <motion.div animate={{ rotate: showFoodLog ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} />
          </motion.div>
        </button>

        <button
          className="flex items-center justify-center w-10 h-10 mr-2 bg-transparent border border-outline-variant rounded-md text-on-surface-variant cursor-pointer shrink-0 transition-colors duration-150 hover:bg-surface-container hover:text-on-surface hover:border-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          onClick={onCopyMeals}
          aria-label="Copy meals from another day"
          title="Copy meals from another day"
        >
          <Copy size={16} />
        </button>
      </div>

      <AnimatePresence>
        {showFoodLog && (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {foodLog.length === 0 ? (
              <EmptyState type="food-log" onAction={onEmptyAction} className="compact" />
            ) : (
              <>
                {MEAL_ORDER.map((meal) =>
                  groupedFood[meal]?.length > 0 ? (
                    <MealGroup
                      key={meal}
                      meal={meal}
                      entries={groupedFood[meal]}
                      onEdit={onEditFood}
                      onDelete={onDeleteFood}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ) : null,
                )}
                <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant text-body-sm font-medium text-on-surface-variant">
                  <span>Total</span>
                  <span className="text-body-md font-bold text-primary tabular-nums">
                    {totalEaten.toLocaleString()} cal
                  </span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </M3Card>
  );
}

/** Single meal group (Breakfast, Lunch, etc.) */
function MealGroup({ meal, entries, onEdit, onDelete, onToggleFavorite }) {
  return (
    <div className="px-3 py-3 border-b border-outline-variant last:border-b-0">
      <h4 className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
        {meal.charAt(0).toUpperCase() + meal.slice(1)}
      </h4>
      <div className="flex flex-col gap-2">
        {entries.map((entry) => (
          <SwipeableItem
            key={entry.id}
            onDelete={() => onDelete(entry)}
            onFavorite={() =>
              onToggleFavorite({
                name: entry.name,
                calories: entry.calories,
                protein: entry.protein || 0,
                carbs: entry.carbs || 0,
                fat: entry.fat || 0,
              })
            }
          >
            <div
              className="flex items-center justify-between px-3 py-3 bg-surface-container rounded-lg cursor-pointer transition-colors duration-150 hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2 focus-visible:rounded-sm"
              onClick={() => onEdit(entry)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onEdit(entry)}
              aria-label={`Edit ${entry.name}`}
            >
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-body-sm font-medium text-on-surface truncate">
                  {entry.name}
                </span>
                <span className="text-label-sm text-on-surface-variant">
                  {entry.calories} cal
                  {(entry.protein || entry.carbs || entry.fat) && (
                    <> • P:{entry.protein || 0}g C:{entry.carbs || 0}g F:{entry.fat || 0}g</>
                  )}
                </span>
                {(entry.fiber || entry.sodium || entry.sugar) && (
                  <CompactMicronutrients
                    fiber={entry.fiber}
                    sodium={entry.sodium}
                    sugar={entry.sugar}
                  />
                )}
              </div>
              <span className="text-body-sm font-semibold text-primary ml-3 tabular-nums shrink-0">
                {entry.calories}
              </span>
            </div>
          </SwipeableItem>
        ))}
      </div>
    </div>
  );
}

/** Manual entry form */
function ManualEntry({ foodName, setFoodName, foodCalories, setFoodCalories, onSubmit }) {
  return (
    <M3Card variant="outlined" className="mb-4">
      <M3CardContent>
        <h4 className="text-title-sm font-semibold text-on-surface-variant mb-3">
          Manual Entry
        </h4>
        <form onSubmit={onSubmit} className="flex gap-2 items-stretch flex-wrap">
          <input
            type="text"
            placeholder="Food name"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="flex-1 min-w-0 px-3 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface outline-none transition-colors duration-150 focus:border-primary placeholder:text-on-surface-variant"
          />
          <input
            type="number"
            placeholder="Calories"
            value={foodCalories}
            onChange={(e) => setFoodCalories(e.target.value)}
            min="1"
            className="w-24 min-w-20 px-3 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface outline-none transition-colors duration-150 focus:border-primary placeholder:text-on-surface-variant"
          />
          <M3Button type="submit" variant="filled" icon={<Plus size={18} />}>
            Add
          </M3Button>
        </form>
      </M3CardContent>
    </M3Card>
  );
}

/** Exercise tab content */
function ExerciseSection({
  exerciseLog,
  totalBurned,
  exerciseName,
  setExerciseName,
  exerciseCalories,
  setExerciseCalories,
  onAddExercise,
  onDeleteExercise,
}) {
  return (
    <>
      {/* Input */}
      <M3Card variant="filled" className="mb-4">
        <M3CardContent>
          <h3 className="text-title-md font-semibold text-on-surface mb-4">
            Log Exercise
          </h3>
          <form onSubmit={onAddExercise} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Exercise name (e.g., Running, Cycling)"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full px-3 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface outline-none transition-colors duration-150 focus:border-primary placeholder:text-on-surface-variant"
            />
            <input
              type="number"
              placeholder="Calories burned"
              value={exerciseCalories}
              onChange={(e) => setExerciseCalories(e.target.value)}
              min="1"
              className="w-full px-3 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface outline-none transition-colors duration-150 focus:border-primary placeholder:text-on-surface-variant"
            />
            <M3Button type="submit" variant="filled" fullWidth icon={<Plus size={18} />}>
              Add Exercise
            </M3Button>
          </form>
        </M3CardContent>
      </M3Card>

      {/* Log */}
      <M3Card variant="filled" className="mb-4">
        <div className="px-4 py-3 border-b border-outline-variant">
          <h4 className="text-title-sm font-semibold text-on-surface m-0">
            Today's Exercise
          </h4>
        </div>

        {exerciseLog.length === 0 ? (
          <EmptyState type="exercises" className="compact" />
        ) : (
          <>
            <div className="px-3 py-3 flex flex-col gap-2">
              {exerciseLog.map((entry) => (
                <SwipeableItem key={entry.id} onDelete={() => onDeleteExercise(entry)}>
                  <div className="flex items-center justify-between px-3 py-3 bg-surface-container rounded-lg">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-body-sm font-medium text-on-surface truncate">
                        {entry.name}
                      </span>
                      <span className="text-label-sm text-on-surface-variant">
                        {entry.calories} cal burned
                      </span>
                    </div>
                    <span className="text-body-sm font-semibold text-info ml-3 tabular-nums shrink-0">
                      {entry.calories}
                    </span>
                  </div>
                </SwipeableItem>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant text-body-sm font-medium text-on-surface-variant">
              <span>Total Burned</span>
              <span className="text-body-md font-bold text-info tabular-nums">
                {totalBurned.toLocaleString()} cal
              </span>
            </div>
          </>
        )}
      </M3Card>
    </>
  );
}

export default LogPage;
