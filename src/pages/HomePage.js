/**
 * Home Page — M3 Redesign with Tailwind
 * Dashboard with calorie progress, macros, widgets, and recent foods
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Utensils,
  ChevronRight,
  Sparkles,
  Droplets,
  Scale,
  Activity,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

// M3 Design System Components
import {
  Section,
  Main,
  Grid,
  WidgetGrid,
  HydrationWidget,
  WeightWidget,
  ActivityWidget,
  MealsWidget,
  M3ProgressRing,
  MacroRings,
  M3Card,
  M3CardContent,
  M3Button,
  Chip,
  ChipGroup,
  AnimatedCounter,
  StaggerContainer,
  StaggerItem,
  MicronutrientPanel,
  NutrientWarnings,
  VisuallyHidden,
  useAnnounce,
  SkeletonPage,
} from "../components/common";

import {
  loadFoodLog,
  loadExerciseLog,
  getTotalCaloriesEaten,
  getTotalCaloriesBurned,
  loadStreakData,
  loadWaterLog,
  loadWeightLog,
  getTotalMicronutrients,
  loadMicronutrientGoals,
} from "../utils/localStorage";

import { haptics } from "../utils/haptics";
import { FeatureHighlight, APP_TOOLTIPS } from "../components/OnboardingTooltips";

function HomePage({ userProfile, dailyTarget, macroGoals }) {
  const navigate = useNavigate();
  const announce = useAnnounce();

  const [isLoading, setIsLoading] = useState(true);
  const [caloriesEaten, setCaloriesEaten] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [streakData, setStreakData] = useState({ currentStreak: 0 });
  const [recentFoods, setRecentFoods] = useState([]);
  const [currentMacros, setCurrentMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [currentMicros, setCurrentMicros] = useState({});
  const [microGoals, setMicroGoals] = useState({});
  const [hydrationData, setHydrationData] = useState({ current: 0, goal: 8 });
  const [weightData, setWeightData] = useState({ current: null, trend: [] });
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");

  // Computed values
  const remainingCalories = useMemo(
    () => dailyTarget - (caloriesEaten - caloriesBurned),
    [dailyTarget, caloriesEaten, caloriesBurned],
  );
  const isOverTarget = remainingCalories < 0;
  const netCalories = caloriesEaten - caloriesBurned;
  const calorieProgress = Math.min((netCalories / dailyTarget) * 100, 100);

  // Load data
  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const savedFoodLog = loadFoodLog();
      loadExerciseLog();

      setCaloriesEaten(getTotalCaloriesEaten());
      setCaloriesBurned(getTotalCaloriesBurned());
      setStreakData(loadStreakData());
      setRecentFoods(savedFoodLog.slice(-5).reverse());

      const macros = savedFoodLog.reduce(
        (acc, entry) => ({
          protein: acc.protein + (entry.protein || 0),
          carbs: acc.carbs + (entry.carbs || 0),
          fat: acc.fat + (entry.fat || 0),
        }),
        { protein: 0, carbs: 0, fat: 0 },
      );
      setCurrentMacros(macros);

      setCurrentMicros(getTotalMicronutrients());
      setMicroGoals(loadMicronutrientGoals());

      const hydration = loadWaterLog();
      setHydrationData({
        current: hydration?.glasses || 0,
        goal: hydration?.goal || 8,
      });

      const weights = loadWeightLog();
      if (weights?.length > 0) {
        setWeightData({
          current: weights[weights.length - 1]?.weight,
          trend: weights.slice(-7).map((w) => w.weight),
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) loadData();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadData]);

  // Screen reader announcement
  useEffect(() => {
    if (!isLoading) {
      const status = isOverTarget
        ? `You are ${Math.abs(remainingCalories)} calories over your goal`
        : `${remainingCalories} calories remaining`;
      announce(status, "polite");
    }
  }, [isLoading, isOverTarget, remainingCalories, announce]);

  if (isLoading) {
    return <SkeletonPage type="home" />;
  }

  return (
    <Main className="home-page px-4 pt-6 pb-24 max-w-150 mx-auto md:max-w-210 lg:pb-8 lg:pl-70">
      <VisuallyHidden>
        <h1>Dashboard - {remainingCalories} calories remaining</h1>
      </VisuallyHidden>

      <StaggerContainer staggerDelay={0.04}>
        {/* ===== Streak Banner ===== */}
        <AnimatePresence>
          {streakData.currentStreak > 0 && (
            <StaggerItem>
              <FeatureHighlight tooltip={APP_TOOLTIPS.STREAK_COUNTER} showBadge={false}>
              <motion.div
                className="streak-banner flex items-center gap-3 px-4 py-3 mb-4 rounded-full cursor-pointer select-none"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/history")}
                role="button"
                tabIndex={0}
                aria-label={`${streakData.currentStreak} day streak. Tap to view history.`}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-tertiary text-on-tertiary">
                  <Flame size={20} aria-hidden="true" />
                </div>
                <div className="flex-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-on-tertiary-container tabular-nums">
                    <AnimatedCounter value={streakData.currentStreak} />
                  </span>
                  <span className="text-body-sm font-medium text-on-tertiary-container opacity-80">
                    day streak!
                  </span>
                </div>
                <Sparkles
                  size={16}
                  className="text-tertiary animate-sparkle"
                  aria-hidden="true"
                />
              </motion.div>
              </FeatureHighlight>
            </StaggerItem>
          )}
        </AnimatePresence>

        {/* ===== Calorie Progress Card ===== */}
        <StaggerItem>
          <FeatureHighlight tooltip={APP_TOOLTIPS.CALORIE_RING} showBadge={false}>
          <M3Card variant="elevated" className="mb-4">
            <M3CardContent>
              <div className="flex flex-col items-center gap-6 py-4 md:flex-row md:justify-around md:py-6">
                <M3ProgressRing
                  value={netCalories}
                  max={dailyTarget}
                  size={200}
                  strokeWidth={16}
                  color={isOverTarget ? "error" : "primary"}
                  showText={false}
                  animated
                  aria-label={`${calorieProgress.toFixed(0)}% of daily calorie goal`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <motion.span
                      className={`text-5xl font-bold leading-none tabular-nums ${isOverTarget ? "text-error" : "text-on-surface"}`}
                      key={remainingCalories}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <AnimatedCounter
                        value={Math.abs(remainingCalories)}
                        duration={800}
                      />
                    </motion.span>
                    <span className="text-body-sm text-on-surface-variant uppercase tracking-wider mt-1">
                      {isOverTarget ? "over" : "remaining"}
                    </span>
                  </div>
                </M3ProgressRing>

                {/* Quick Stats */}
                <div
                  className="flex items-center justify-center gap-6 w-full py-2 md:flex-col md:w-auto md:gap-4"
                  role="list"
                >
                  <QuickStat label="eaten" value={caloriesEaten} animated />
                  <div className="w-px h-8 bg-outline-variant md:w-20 md:h-px" aria-hidden="true" />
                  <QuickStat label="goal" value={dailyTarget} />
                  <div className="w-px h-8 bg-outline-variant md:w-20 md:h-px" aria-hidden="true" />
                  <QuickStat label="burned" value={caloriesBurned} animated />
                </div>
              </div>
            </M3CardContent>
          </M3Card>
          </FeatureHighlight>
        </StaggerItem>

        {/* ===== Timeframe Selector ===== */}
        <StaggerItem>
          <div className="flex justify-center mb-4">
            <ChipGroup
              value={selectedTimeframe}
              onChange={(value) => {
                setSelectedTimeframe(value);
                haptics.selection();
              }}
              aria-label="Select timeframe"
            >
              <Chip value="today" variant="filter">Today</Chip>
              <Chip value="week" variant="filter">This Week</Chip>
              <Chip value="month" variant="filter">This Month</Chip>
            </ChipGroup>
          </div>
        </StaggerItem>

        {/* ===== Macro Rings ===== */}
        {macroGoals && macroGoals.protein > 0 && (
          <StaggerItem>
            <Section
              title="Macros"
              action={
                <M3Button
                  variant="text"
                  size="small"
                  onClick={() => navigate("/log")}
                  aria-label="View macro details"
                >
                  Details <ChevronRight size={16} />
                </M3Button>
              }
            >
              <M3Card variant="filled">
                <M3CardContent>
                  <MacroRings
                    protein={{
                      current: currentMacros.protein,
                      goal: macroGoals.protein,
                    }}
                    carbs={{
                      current: currentMacros.carbs,
                      goal: macroGoals.carbs,
                    }}
                    fat={{ current: currentMacros.fat, goal: macroGoals.fat }}
                    size={80}
                    showLabels
                    animated
                  />

                  {/* Micronutrients (collapsible panel) */}
                  <div className="mt-4 pt-4 border-t border-outline-variant">
                    <MicronutrientPanel
                      totals={currentMicros}
                      goals={microGoals}
                      defaultOpen={false}
                    />
                  </div>
                </M3CardContent>
              </M3Card>
            </Section>
          </StaggerItem>
        )}

        {/* ===== Widget Grid ===== */}
        <StaggerItem>
          <Section title="Quick Overview">
            <WidgetGrid>
              <HydrationWidget
                current={hydrationData.current}
                goal={hydrationData.goal}
                onAdd={() => haptics.light()}
                size="small"
              />
              {weightData.current && (
                <WeightWidget
                  current={weightData.current}
                  trend={weightData.trend}
                  unit={userProfile?.weightUnit || "kg"}
                  size="small"
                />
              )}
              <ActivityWidget burned={caloriesBurned} goal={500} size="small" />
              <MealsWidget
                meals={recentFoods.length}
                lastMeal={recentFoods[0]?.name}
                size="small"
              />
            </WidgetGrid>
          </Section>
        </StaggerItem>

        {/* ===== Recent Foods ===== */}
        {recentFoods.length > 0 && (
          <StaggerItem>
            <Section
              title="Recent Foods"
              action={
                <M3Button
                  variant="text"
                  size="small"
                  onClick={() => navigate("/log")}
                >
                  See All <ChevronRight size={16} />
                </M3Button>
              }
            >
              <div className="flex flex-col gap-1">
                {recentFoods.slice(0, 3).map((food, index) => (
                  <motion.div
                    key={food.id || index}
                    className="flex items-center gap-4 px-4 py-3 bg-surface-container rounded-md cursor-pointer transition-colors duration-150 hover:bg-surface-container-high focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/log")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-primary-container text-on-primary-container rounded-sm shrink-0">
                      <Utensils size={18} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[0.9375rem] font-medium text-on-surface truncate">
                        {food.name}
                      </span>
                      <span className="block text-body-sm text-on-surface-variant mt-0.5">
                        {food.calories} cal • {food.portion || food.servingSize || "1 serving"}
                      </span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-on-surface-variant shrink-0"
                      aria-hidden="true"
                    />
                  </motion.div>
                ))}
              </div>
            </Section>
          </StaggerItem>
        )}

        {/* ===== Guidance Message ===== */}
        <StaggerItem>
          <GuidanceCard remaining={remainingCalories} isOver={isOverTarget} />
        </StaggerItem>

        {/* ===== Quick Actions ===== */}
        <StaggerItem>
          <Section title="Quick Actions">
            <Grid columns={2} gap={12}>
              <FeatureHighlight tooltip={APP_TOOLTIPS.ADD_FOOD_BUTTON} showBadge={false}>
              <M3Button
                variant="tonal"
                icon={<Plus size={20} />}
                onClick={() => navigate("/log")}
                fullWidth
              >
                Log Food
              </M3Button>
              </FeatureHighlight>
              <M3Button
                variant="tonal"
                icon={<Activity size={20} />}
                onClick={() => navigate("/log", { state: { tab: "exercise" } })}
                fullWidth
              >
                Log Exercise
              </M3Button>
              <M3Button
                variant="outlined"
                icon={<Droplets size={20} />}
                onClick={() => navigate("/log", { state: { tab: "hydration" } })}
                fullWidth
              >
                Log Water
              </M3Button>
              <M3Button
                variant="outlined"
                icon={<Scale size={20} />}
                onClick={() => navigate("/profile")}
                fullWidth
              >
                Log Weight
              </M3Button>
            </Grid>
          </Section>
        </StaggerItem>
      </StaggerContainer>

      {/* Micronutrient Warnings */}
      <NutrientWarnings show={true} autoHide={true} autoHideDelay={15000} />
    </Main>
  );
}

/* ===== Sub-components ===== */

function QuickStat({ label, value, animated = false }) {
  return (
    <div className="flex flex-col items-center text-center min-w-17.5" role="listitem">
      <span className="text-title-lg font-semibold text-on-surface tabular-nums">
        {animated ? <AnimatedCounter value={value} /> : value.toLocaleString()}
      </span>
      <span className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  );
}

function GuidanceCard({ remaining, isOver }) {
  const isPerfect = remaining === 0;

  let containerClass =
    "px-4 py-4 rounded-xl text-center mb-4 text-body-sm leading-relaxed border ";
  if (isOver) {
    containerClass +=
      "bg-error-container/30 border-error-container text-error";
  } else if (isPerfect) {
    containerClass +=
      "bg-primary-container/30 border-primary-container text-primary";
  } else {
    containerClass +=
      "bg-success-container/30 border-success-container text-success";
  }

  return (
    <motion.div className={containerClass} layout>
      {remaining > 0 ? (
        <p className="m-0">
          You have <strong>{remaining.toLocaleString()} calories</strong>{" "}
          remaining today
        </p>
      ) : isPerfect ? (
        <p className="m-0">You've reached your daily target exactly! 🎯</p>
      ) : (
        <p className="m-0">
          You've exceeded your target by{" "}
          <strong>{Math.abs(remaining).toLocaleString()} calories</strong>
        </p>
      )}
    </motion.div>
  );
}

export default HomePage;
