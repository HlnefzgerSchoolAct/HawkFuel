// Import React hooks
import React, { useState, useEffect } from 'react';
import './App.css';

// Import all components
import UserProfile from './components/UserProfile';
import ActivityTracker from './components/ActivityTracker';
import Results from './components/Results';
import Dashboard from './components/Dashboard';

// Import localStorage utilities
import {
  saveUserProfile,
  loadUserProfile,
  saveDailyTarget,
  loadDailyTarget
} from './utils/localStorage';

/**
 * App Component
 * 
 * Main application component that manages the entire user flow:
 * 
 * FLOW:
 * Step 1: User Profile → Collect personal info and goals
 * Step 2: Activity Tracker → Log planned activities
 * Step 3: Results → Show BMR, TDEE, calorie targets
 * Step 4: Dashboard → Daily calorie logging (NEW!)
 * 
 * All data is saved to localStorage automatically
 */
function App() {
  // STATE MANAGEMENT
  // These hold data that changes as user progresses
  
  const [userProfile, setUserProfile] = useState(null);  // User's info
  const [activities, setActivities] = useState([]);      // Activity plans
  const [dailyTarget, setDailyTarget] = useState(2000);  // Target calories (NEW!)
  const [currentStep, setCurrentStep] = useState(1);     // Which screen to show

  /**
   * useEffect Hook
   * 
   * Runs when app first loads
   * Loads saved user profile from localStorage
   * 
   * If user already completed setup, skip to Dashboard
   */
  useEffect(() => {
    const savedProfile = loadUserProfile();
    const savedTarget = loadDailyTarget();
    
    if (savedProfile) {
      setUserProfile(savedProfile);
      setDailyTarget(savedTarget);
      // Skip to dashboard if user already set up
      setCurrentStep(4);
    }
  }, []); // Empty array = only run once on mount

  /**
   * handleProfileSubmit
   * 
   * Called when user completes Step 1 (Profile)
   * Saves profile to localStorage and moves to Step 2
   */
  const handleProfileSubmit = (profile) => {
    setUserProfile(profile);
    saveUserProfile(profile); // Save to localStorage
    setCurrentStep(2);
  };

  /**
   * handleActivitiesSubmit
   * 
   * Called when user completes Step 2 (Activities)
   * Moves to Step 3 (Results)
   */
  const handleActivitiesSubmit = (activityData) => {
    setActivities(activityData);
    setCurrentStep(3);
  };

  /**
   * handleResultsComplete
   * 
   * Called when user finishes Step 3 (Results)
   * Saves daily target and moves to Dashboard
   * 
   * @param {number} target - The calculated daily calorie target
   */
  const handleResultsComplete = (target) => {
    setDailyTarget(target);
    saveDailyTarget(target); // Save to localStorage
    setCurrentStep(4); // Go to Dashboard
  };

  /**
   * resetApp
   * 
   * Completely restart the app
   * Clears all data and returns to Step 1
   */
  const resetApp = () => {
    setCurrentStep(1);
    setUserProfile(null);
    setActivities([]);
    setDailyTarget(2000);
    // Note: localStorage is cleared in Dashboard component
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🔥 Hawk Fuel</h1>
        <p>Your Personal Calorie & Activity Tracker</p>
      </header>

      <div className="container">
        
        {/* PROGRESS BAR - Shows which step user is on */}
        {/* Only show for Steps 1-3, hide on Dashboard */}
        {currentStep <= 3 && (
          <div className="progress-bar">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Profile</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Activities</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Results</span>
            </div>
          </div>
        )}

        {/* STEP 1: User Profile */}
        {currentStep === 1 && (
          <UserProfile onSubmit={handleProfileSubmit} />
        )}

        {/* STEP 2: Activity Tracker */}
        {currentStep === 2 && userProfile && (
          <ActivityTracker 
            userProfile={userProfile} 
            onSubmit={handleActivitiesSubmit}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* STEP 3: Results (BMR, TDEE, Targets) */}
        {currentStep === 3 && userProfile && (
          <Results 
            userProfile={userProfile}
            activities={activities}
            onComplete={handleResultsComplete} // NEW: Continue to Dashboard
            onReset={resetApp}
          />
        )}

        {/* STEP 4: Dashboard (Daily Calorie Logging) - NEW! */}
        {currentStep === 4 && userProfile && (
          <Dashboard
            userProfile={userProfile}
            dailyTarget={dailyTarget}
            onReset={resetApp}
          />
        )}
      </div>

      <footer className="app-footer">
        <p>Hawk Fuel © 2026 - Built with React</p>
      </footer>
    </div>
  );
}

export default App;
