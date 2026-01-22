import React, { useState, useEffect } from "react";
import {
  loadWaterLog,
  addWaterCup,
  removeWaterCup,
} from "../utils/localStorage";
import "./HydrationTracker.css";

/**
 * HydrationTracker Component
 *
 * Personalized water intake tracker based on body weight
 * Formula: Weight (lbs) / 2 = Ounces needed per day
 * Example: 150 lbs / 2 = 75 oz = ~9-10 cups
 *
 * Features:
 * - Personalized daily goal based on weight
 * - Visual progress bar
 * - Add/remove cups with buttons
 * - Saves to localStorage
 */
function HydrationTracker({ userProfile }) {
  const [waterCups, setWaterCups] = useState(0);
  
  // Calculate personalized daily water goal
  // Formula: weight (lbs) / 2 = ounces per day
  // 1 cup = 8 oz
  const calculateDailyGoal = () => {
    if (!userProfile || !userProfile.weight) {
      return 8; // Default to 8 cups if no profile
    }
    const ouncesNeeded = userProfile.weight / 2;
    const cupsNeeded = Math.ceil(ouncesNeeded / 8);
    return Math.max(6, Math.min(cupsNeeded, 15)); // Between 6-15 cups
  };
  
  const DAILY_GOAL = calculateDailyGoal();
  const OUNCES_GOAL = DAILY_GOAL * 8;

  // Load saved water intake on mount
  useEffect(() => {
    const saved = loadWaterLog();
    setWaterCups(saved);
  }, []);

  // Add a cup
  const handleAddCup = () => {
    const updated = addWaterCup();
    setWaterCups(updated);
  };

  // Remove a cup
  const handleRemoveCup = () => {
    const updated = removeWaterCup();
    setWaterCups(updated);
  };

  // Calculate percentage for progress bar
  const percentage = Math.min((waterCups / DAILY_GOAL) * 100, 100);

  return (
    <div className="hydration-tracker">
      <div className="hydration-header">
        <h3>Hydration Tracker</h3>
        <p className="hydration-goal">
          Your Daily Goal: {DAILY_GOAL} cups ({OUNCES_GOAL} oz)
        </p>
        {userProfile && userProfile.weight && (
          <p className="hydration-personalized">
            Personalized for {userProfile.weight} lbs body weight
          </p>
        )}
      </div>

      <div className="hydration-display">
        <div className="hydration-counter">
          <span className="counter-number">{waterCups}</span>
          <span className="counter-label">/ {DAILY_GOAL} cups</span>
        </div>

        <div className="hydration-progress-bar">
          <div
            className="hydration-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="hydration-status">
          {waterCups >= DAILY_GOAL && (
            <p className="status-message success">
              Excellent! You've reached your hydration goal!
            </p>
          )}
          {waterCups >= DAILY_GOAL * 0.75 && waterCups < DAILY_GOAL && (
            <p className="status-message good">
              Almost there! {DAILY_GOAL - waterCups} cups to go.
            </p>
          )}
          {waterCups >= DAILY_GOAL * 0.5 && waterCups < DAILY_GOAL * 0.75 && (
            <p className="status-message good">
              Good progress. Keep it up!
            </p>
          )}
          {waterCups < DAILY_GOAL * 0.5 && waterCups > 0 && (
            <p className="status-message needs-more">
              You're on track. Continue hydrating throughout the day.
            </p>
          )}
          {waterCups === 0 && (
            <p className="status-message empty">
              Start tracking your water intake.
            </p>
          )}
        </div>
      </div>

      <div className="hydration-controls">
        <button
          className="btn-water-remove"
          onClick={handleRemoveCup}
          disabled={waterCups === 0}
        >
          - Remove Cup
        </button>
        <button className="btn-water-add" onClick={handleAddCup}>
          + Add Cup
        </button>
      </div>

      <p className="hydration-tip">
        <strong>Tip:</strong> Drink water consistently throughout the day, especially before and after exercise.
      </p>
    </div>
  );
}

export default HydrationTracker;
