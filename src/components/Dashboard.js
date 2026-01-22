// Import React hooks
import React, { useState, useEffect } from "react";
import "./Dashboard.css";

// Import WeeklyGraph component (NEW!)
import WeeklyGraph from "./WeeklyGraph";

// Import HydrationTracker component (NEW!)
import HydrationTracker from "./HydrationTracker";

// Import localStorage utility functions
import {
  loadFoodLog,
  loadExerciseLog,
  addFoodEntry,
  addExerciseEntry,
  deleteFoodEntry,
  deleteExerciseEntry,
  getTotalCaloriesEaten,
  getTotalCaloriesBurned,
  saveDailyDataToHistory,
} from "../utils/localStorage";

/**
 * Dashboard Component
 *
 * Purpose: Main calorie tracking interface for daily logging
 *
 * Features:
 * 1. Log food (calories eaten)
 * 2. Log exercise (calories burned)
 * 3. View daily totals
 * 4. See remaining calories
 * 5. Track progress toward goal
 * 6. View 7-day trend graph (NEW!)
 *
 * All data saved to localStorage automatically!
 */
function Dashboard({ userProfile, dailyTarget, onReset }) {
  // STATE MANAGEMENT
  // These variables hold data that can change

  // Food logging state
  const [foodName, setFoodName] = useState("");
  const [foodCalories, setFoodCalories] = useState("");
  const [foodLog, setFoodLog] = useState([]);

  // Exercise logging state
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseCalories, setExerciseCalories] = useState("");
  const [exerciseLog, setExerciseLog] = useState([]);

  // Calculated totals
  const [caloriesEaten, setCaloriesEaten] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [remainingCalories, setRemainingCalories] = useState(0);

  /**
   * useEffect Hook
   *
   * Runs when component first loads
   * Loads saved data from localStorage
   *
   * Dependencies array [] means: only run once on mount
   */
  useEffect(() => {
    loadSavedData();
  }, []);

  /**
   * useEffect Hook #2
   *
   * Recalculates totals whenever food or exercise logs change
   * Also saves daily data to history for the graph (NEW!)
   *
   * Dependencies [foodLog, exerciseLog, dailyTarget] means:
   * Run this whenever those values change
   */
  useEffect(() => {
    calculateTotals();
    saveDailyDataToHistory(); // Save to weekly history for graph
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodLog, exerciseLog, dailyTarget]);

  /**
   * loadSavedData
   *
   * Loads all data from localStorage into state
   */
  const loadSavedData = () => {
    const savedFoodLog = loadFoodLog();
    const savedExerciseLog = loadExerciseLog();

    setFoodLog(savedFoodLog);
    setExerciseLog(savedExerciseLog);
  };

  /**
   * calculateTotals
   *
   * Calculates all daily totals
   * Updates state with new values
   */
  const calculateTotals = () => {
    const eaten = getTotalCaloriesEaten();
    const burned = getTotalCaloriesBurned();
    const remaining = dailyTarget - (eaten - burned);

    setCaloriesEaten(eaten);
    setCaloriesBurned(burned);
    setRemainingCalories(remaining);
  };

  /**
   * handleAddFood
   *
   * Adds a food entry to the log
   *
   * Steps:
   * 1. Validate inputs
   * 2. Create food entry object
   * 3. Save to localStorage
   * 4. Update state
   * 5. Clear form
   */
  const handleAddFood = (e) => {
    e.preventDefault(); // Don't refresh page

    // VALIDATION: Make sure fields are filled
    if (!foodName || !foodCalories || foodCalories <= 0) {
      alert("Please enter food name and calories");
      return;
    }

    // Create food entry object
    const foodEntry = {
      name: foodName,
      calories: parseInt(foodCalories),
    };

    // Save to localStorage (returns entry with ID and timestamp)
    const savedEntry = addFoodEntry(foodEntry);

    // Update state (add to current log)
    setFoodLog((prev) => [...prev, savedEntry]);

    // Clear form
    setFoodName("");
    setFoodCalories("");
  };

  /**
   * handleAddExercise
   *
   * Adds an exercise entry to the log
   * Same pattern as handleAddFood
   */
  const handleAddExercise = (e) => {
    e.preventDefault();

    // VALIDATION
    if (!exerciseName || !exerciseCalories || exerciseCalories <= 0) {
      alert("Please enter exercise name and calories burned");
      return;
    }

    // Create exercise entry
    const exerciseEntry = {
      name: exerciseName,
      calories: parseInt(exerciseCalories),
    };

    // Save and update
    const savedEntry = addExerciseEntry(exerciseEntry);
    setExerciseLog((prev) => [...prev, savedEntry]);

    // Clear form
    setExerciseName("");
    setExerciseCalories("");
  };

  /**
   * handleDeleteFood
   *
   * Removes a food entry from the log
   *
   * @param {number} entryId - The ID of the entry to delete
   */
  const handleDeleteFood = (entryId) => {
    deleteFoodEntry(entryId);
    setFoodLog((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  /**
   * handleDeleteExercise
   *
   * Removes an exercise entry from the log
   */
  const handleDeleteExercise = (entryId) => {
    deleteExerciseEntry(entryId);
    setExerciseLog((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  // RENDER (What shows on screen)
  return (
    <div className="dashboard">
      <h2>Daily Calorie Tracker</h2>

      {/* WEEKLY GRAPH - Shows 7-day trends (NEW!) */}
      <WeeklyGraph onRefresh={foodLog.length + exerciseLog.length} />

      {/* SUMMARY CARDS - Show daily totals */}
      <div className="summary-cards">
        {/* Daily Target Card */}
        <div className="summary-card target">
          <h3>Daily Target</h3>
          <div className="big-number">{dailyTarget.toLocaleString()}</div>
          <p>calories</p>
        </div>

        {/* Calories Eaten Card */}
        <div className="summary-card eaten">
          <h3>Eaten</h3>
          <div className="big-number">{caloriesEaten.toLocaleString()}</div>
          <p>calories</p>
        </div>

        {/* Calories Burned Card */}
        <div className="summary-card burned">
          <h3>Burned</h3>
          <div className="big-number">{caloriesBurned.toLocaleString()}</div>
          <p>calories</p>
        </div>

        {/* Remaining Calories Card */}
        <div
          className={`summary-card remaining ${remainingCalories < 0 ? "over" : ""}`}
        >
          <h3>Remaining</h3>
          <div className="big-number">
            {remainingCalories > 0 ? "+" : ""}
            {remainingCalories.toLocaleString()}
          </div>
          <p>
            {remainingCalories > 0 ? "calories to eat" : "calories over target"}
          </p>
        </div>
      </div>

      {/* LOGGING SECTION - Two columns for food and exercise */}
      <div className="logging-section">
        {/* FOOD LOGGING COLUMN */}
        <div className="log-column">
          <h3>Log Food</h3>

          {/* Food Input Form */}
          <form onSubmit={handleAddFood} className="log-form">
            <input
              type="text"
              placeholder="Food name (e.g., Chicken breast)"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Calories"
              value={foodCalories}
              onChange={(e) => setFoodCalories(e.target.value)}
              min="1"
            />
            <button type="submit" className="btn-add">
              + Add Food
            </button>
          </form>

          {/* Food Log List */}
          <div className="log-list">
            {foodLog.length === 0 ? (
              <p className="empty-message">No food logged yet today</p>
            ) : (
              foodLog.map((entry) => (
                <div key={entry.id} className="log-entry">
                  <div className="entry-info">
                    <strong>{entry.name}</strong>
                    <span>{entry.calories} cal</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFood(entry.id)}
                    className="btn-delete"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Food Total */}
          {foodLog.length > 0 && (
            <div className="log-total">
              <strong>Total:</strong>
              <strong>{caloriesEaten} calories</strong>
            </div>
          )}
        </div>

        {/* EXERCISE LOGGING COLUMN */}
        <div className="log-column">
          <h3>Log Exercise</h3>

          {/* Exercise Input Form */}
          <form onSubmit={handleAddExercise} className="log-form">
            <input
              type="text"
              placeholder="Exercise name (e.g., Running)"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Calories burned"
              value={exerciseCalories}
              onChange={(e) => setExerciseCalories(e.target.value)}
              min="1"
            />
            <button type="submit" className="btn-add">
              + Add Exercise
            </button>
          </form>

          {/* Exercise Log List */}
          <div className="log-list">
            {exerciseLog.length === 0 ? (
              <p className="empty-message">No exercise logged yet today</p>
            ) : (
              exerciseLog.map((entry) => (
                <div key={entry.id} className="log-entry">
                  <div className="entry-info">
                    <strong>{entry.name}</strong>
                    <span>{entry.calories} cal</span>
                  </div>
                  <button
                    onClick={() => handleDeleteExercise(entry.id)}
                    className="btn-delete"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Exercise Total */}
          {exerciseLog.length > 0 && (
            <div className="log-total">
              <strong>Total:</strong>
              <strong>{caloriesBurned} calories</strong>
            </div>
          )}
        </div>
      </div>

      {/* GUIDANCE MESSAGE */}
      <div className="guidance">
        {remainingCalories > 0 ? (
          <p className="success">
            You can eat <strong>{remainingCalories} more calories</strong> to
            reach your goal!
          </p>
        ) : remainingCalories === 0 ? (
          <p className="perfect">Perfect! You've hit your target exactly!</p>
        ) : (
          <p className="warning">
            You're{" "}
            <strong>{Math.abs(remainingCalories)} calories over</strong> your
            target.
          </p>
        )}
      </div>

      {/* HYDRATION TRACKER (NEW!) */}
      <HydrationTracker userProfile={userProfile} />

      {/* RESET BUTTON */}
      <button onClick={onReset} className="btn-reset">
        Start New Calculation
      </button>
    </div>
  );
}

// Export component
export default Dashboard;
