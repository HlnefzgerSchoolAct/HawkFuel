// Import React hooks
import React, { useState, useEffect } from "react";
import "./App.css";

// Import all components
import UserProfile from "./components/UserProfile";
import ActivityTracker from "./components/ActivityTracker";
import Results from "./components/Results";
import Dashboard from "./components/Dashboard";

// Import localStorage utilities
import {
  saveUserProfile,
  loadUserProfile,
  saveDailyTarget,
  loadDailyTarget,
} from "./utils/localStorage";

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

  const [userProfile, setUserProfile] = useState(null); // User's info
  const [activities, setActivities] = useState([]); // Activity plans
  const [dailyTarget, setDailyTarget] = useState(2000); // Target calories (NEW!)
  const [currentStep, setCurrentStep] = useState(1); // Which screen to show
  const [isStandalone, setIsStandalone] = useState(false); // Check if running as installed app

  /**
   * useEffect Hook - Check Standalone Mode
   *
   * Detects if app is running in standalone mode (added to homescreen)
   * PWA should only work when installed as an app
   */
  useEffect(() => {
    // Check if running in standalone mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(standalone);
  }, []);

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

  // If not in standalone mode, show installation prompt
  if (!isStandalone) {
    return (
      <div className="App">
        <div className="install-prompt">
          <div className="install-prompt-content">
            <div className="install-logo">
              <img src="/LogoWD.jpg" alt="Hawk Fuel Logo" />
            </div>
            <h1>Hawk Fuel</h1>
            <p className="install-subtitle">
              Professional Calorie & Activity Tracker
            </p>

            <div className="install-message">
              <h2>Install Required</h2>
              <p>This app must be installed to your device to work properly.</p>
            </div>

            <div className="install-instructions">
              <h3>iOS (iPhone/iPad):</h3>
              <ol>
                <li>
                  Tap the <strong>Share</strong> button (box with arrow)
                </li>
                <li>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </li>
                <li>
                  Tap <strong>"Add"</strong> in the top right
                </li>
                <li>Open the app from your home screen</li>
              </ol>

              <h3>Android (Chrome):</h3>
              <ol>
                <li>
                  Tap the <strong>three dots</strong> menu (⋮)
                </li>
                <li>
                  Tap <strong>"Add to Home screen"</strong> or{" "}
                  <strong>"Install app"</strong>
                </li>
                <li>
                  Tap <strong>"Add"</strong> or <strong>"Install"</strong>
                </li>
                <li>Open the app from your home screen</li>
              </ol>
            </div>

            <div className="install-benefits">
              <h3>Why Install?</h3>
              <ul>
                <li>Works offline - track anytime, anywhere</li>
                <li>Faster performance</li>
                <li>Full-screen experience</li>
                <li>Easy access from your home screen</li>
                <li>All data stays private on your device</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Hawk Fuel</h1>
        <p>Your Personal Calorie & Activity Tracker</p>
      </header>

      <div className="container">
        {/* PROGRESS BAR - Shows which step user is on */}
        {/* Only show for Steps 1-3, hide on Dashboard */}
        {currentStep <= 3 && (
          <div className="progress-bar">
            <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
              <span className="step-number">1</span>
              <span className="step-label">Profile</span>
            </div>
            <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
              <span className="step-number">2</span>
              <span className="step-label">Activities</span>
            </div>
            <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
              <span className="step-number">3</span>
              <span className="step-label">Results</span>
            </div>
          </div>
        )}

        {/* STEP 1: User Profile */}
        {currentStep === 1 && <UserProfile onSubmit={handleProfileSubmit} />}

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
        <div className="footer-content">
          <p className="footer-brand">Hawk Fuel © 2026 - Built with React</p>

          <div className="footer-disclaimers">
            <p className="privacy-notice">
              <strong>Privacy:</strong> All your data is stored locally on your
              device only. We don't collect, send, or share any of your personal
              information.
            </p>

            <p className="educational-disclaimer">
              <strong>Educational Tool:</strong> This app is designed for
              educational purposes to help you learn about nutrition and
              fitness. It is not medical advice. Please consult a healthcare
              professional, parent, or school nurse for personalized health
              guidance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
