import React from 'react';
import './Results.css';

/**
 * Results Component
 * 
 * Shows calculated calorie targets and activity breakdowns
 * Now includes button to continue to daily calorie tracking!
 */
function Results({ userProfile, activities, onComplete, onReset }) {
  // Calculate BMR
  const calculateBMR = () => {
    const weightKg = parseFloat(userProfile.weight) / 2.20462;
    const heightInches = (parseInt(userProfile.heightFeet) * 12) + parseInt(userProfile.heightInches || 0);
    const heightCm = heightInches * 2.54;
    const age = parseInt(userProfile.age);

    let bmr;
    if (userProfile.gender === 'male') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }

    return Math.round(bmr);
  };

  // Calculate TDEE
  const calculateTDEE = (bmr) => {
    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };

    return Math.round(bmr * multipliers[userProfile.activityLevel]);
  };

  // Calculate daily target calories
  const calculateDailyTarget = (tdee) => {
    let adjustment = 0;
    
    if (userProfile.goal === 'lose') {
      adjustment = -parseInt(userProfile.customAdjustment);
    } else if (userProfile.goal === 'gain') {
      adjustment = parseInt(userProfile.customAdjustment);
    }

    return tdee + adjustment;
  };

  // Calculate calories burned from activities
  const calculateActivityCalories = () => {
    const weightKg = parseFloat(userProfile.weight) / 2.20462;
    
    return activities.map(activity => {
      const hours = activity.minutes / 60;
      const calories = Math.round(activity.met * weightKg * hours);
      return {
        ...activity,
        calories
      };
    });
  };

  const bmr = calculateBMR();
  const tdee = calculateTDEE(bmr);
  const dailyTarget = calculateDailyTarget(tdee);
  const activityCalories = calculateActivityCalories();
  const totalActivityCalories = activityCalories.reduce((sum, act) => sum + act.calories, 0);

  return (
    <div className="results">
      <h2>Your Personalized Results</h2>

      {/* BMR Section */}
      <div className="result-section">
        <h3>BMR (Basal Metabolic Rate)</h3>
        <div className="big-number">{bmr.toLocaleString()}</div>
        <p className="description">Calories burned at complete rest per day</p>
      </div>

      {/* TDEE Section */}
      <div className="result-section">
        <h3>TDEE (Total Daily Energy Expenditure)</h3>
        <div className="big-number">{tdee.toLocaleString()}</div>
        <p className="description">
          Your maintenance calories based on {' '}
          {userProfile.activityLevel.replace('_', ' ')} activity level
        </p>
      </div>

      {/* Daily Target Section */}
      <div className="result-section highlight">
        <h3>Your Daily Calorie Target</h3>
        <div className="big-number">{dailyTarget.toLocaleString()}</div>
        <p className="description">
          {userProfile.goal === 'maintain' && 'To maintain your current weight'}
          {userProfile.goal === 'lose' && `To lose ~${parseInt(userProfile.customAdjustment) / 500} lb/week`}
          {userProfile.goal === 'gain' && `To gain ~${parseInt(userProfile.customAdjustment) / 500} lb/week`}
        </p>
      </div>

      {/* Activity Calories Section */}
      {activityCalories.length > 0 && (
        <div className="result-section">
          <h3>Today's Activity Breakdown</h3>
          <div className="activity-breakdown">
            {activityCalories.map(activity => (
              <div key={activity.id} className="activity-result">
                <div className="activity-result-header">
                  <span className="activity-name">{activity.name}</span>
                </div>
                <div className="activity-details">
                  <span>{activity.minutes} minutes</span>
                  <span className="activity-calories">{activity.calories} cal</span>
                </div>
              </div>
            ))}
          </div>
          <div className="total-activity">
            <strong>Total Activity Calories:</strong>
            <span className="total-value">{totalActivityCalories.toLocaleString()} calories</span>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="result-section summary">
        <h3>Daily Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Calorie Target:</span>
            <span className="summary-value">{dailyTarget.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Activities Burned:</span>
            <span className="summary-value">-{totalActivityCalories.toLocaleString()}</span>
          </div>
          <div className="summary-item highlight-item">
            <span className="summary-label">Can Eat Today:</span>
            <span className="summary-value">{(dailyTarget + totalActivityCalories).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="button-group">
        <button 
          onClick={() => onComplete(dailyTarget)} 
          className="btn-continue"
        >
          Continue to Daily Tracker
        </button>
        <button onClick={onReset} className="btn-reset">
          Start Over
        </button>
      </div>
    </div>
  );
}

export default Results;
