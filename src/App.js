import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SyncStatusProvider, useSyncStatus } from "./contexts/SyncStatusContext";
import { Analytics } from "@vercel/analytics/react";
import { WifiOff, X } from "lucide-react";
import "./App.css";

// Design System
import { ToastProvider, SnackbarProvider, A11yProvider } from "./components/common";

// Usability Components
import {
  KeyboardShortcutsProvider,
  useKeyboardShortcuts,
  QuickSearch,
  SkipLinks,
  LiveRegion,
} from "./components/usability";

// Components
import BottomNavBar from "./components/BottomNavBar";
import DesktopSidebar from "./components/DesktopSidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import "./components/ErrorBoundary.css";
import FloatingActionButton from "./components/FloatingActionButton";
import InstallBanner from "./components/InstallBanner";
import UpdateBanner from "./components/UpdateBanner";
import Onboarding from "./components/Onboarding";
import { TooltipProvider } from "./components/OnboardingTooltips";

// Pages
import HomePage from "./pages/HomePage";
import LogPage from "./pages/LogPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import RecipesPage from "./pages/RecipesPage";
import TemplatesPage from "./pages/TemplatesPage";
import LoginPage from "./pages/LoginPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CoachPage from "./pages/CoachPage";

// Utils
import {
  saveUserProfile,
  loadUserProfile,
  saveDailyTarget,
  loadDailyTarget,
  hasCompletedOnboarding,
  markOnboardingComplete,
  loadMacroGoals,
  saveMacroGoals,
  calculateMacroGrams,
  getMacroPresets,
  updateStreak,
  getTotalCaloriesEaten,
  getTotalCaloriesBurned,
  loadStreakData,
  loadPreferences,
  setSyncBridge,
} from "./utils/localStorage";
import {
  syncToCloud,
  syncRecipesToCloud,
  syncTemplatesToCloud,
  uploadLocalToCloud,
} from "./services/syncService";
import { setRecipeSyncCallback } from "./services/recipeDatabase";
import { setTemplateSyncCallback } from "./services/templateDatabase";
import {
  startReminderScheduler,
  stopReminderScheduler,
} from "./services/notificationService";

// Registers sync bridge when user is signed in; updates sync status
function SyncBridgeSetup() {
  const { user } = useAuth();
  const { setStatus, setLastSyncTime } = useSyncStatus();
  useEffect(() => {
    if (user) {
      const uid = user.uid;
      setSyncBridge((type, payload) => {
        setStatus("syncing");
        syncToCloud(uid, type, payload)
          .then(() => {
            setStatus("success");
            setLastSyncTime(new Date());
          })
          .catch(() => {
            setStatus("error");
          });
      });
      setRecipeSyncCallback((recipes) => syncRecipesToCloud(uid, recipes));
      setTemplateSyncCallback((templates) => syncTemplatesToCloud(uid, templates));
    } else {
      setSyncBridge(null);
      setRecipeSyncCallback(null);
      setTemplateSyncCallback(null);
    }
    return () => {
      setSyncBridge(null);
      setRecipeSyncCallback(null);
      setTemplateSyncCallback(null);
    };
  }, [user, setStatus, setLastSyncTime]);
  return null;
}

// Page transition wrapper — animations disabled to avoid blank page on tab switch
function PageWrapper({ children }) {
  return (
    <div className="page-wrapper">
      {children}
    </div>
  );
}

// QuickSearch wrapper with keyboard shortcut integration
function QuickSearchWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    // Register keyboard shortcuts for navigation
    registerShortcut("ctrl+k", () => setIsOpen(true), "Open quick search");
    registerShortcut("ctrl+/", () => setIsOpen(true), "Open quick search");
    registerShortcut("ctrl+h", () => navigate("/"), "Go to Home");
    registerShortcut("ctrl+l", () => navigate("/log"), "Go to Log");
    registerShortcut("ctrl+r", () => navigate("/recipes"), "Go to Recipes");
    registerShortcut("ctrl+p", () => navigate("/profile"), "Go to Profile");
    registerShortcut("ctrl+shift+c", () => navigate("/coach"), "Go to AI Coach");

    return () => {
      unregisterShortcut("ctrl+k");
      unregisterShortcut("ctrl+/");
      unregisterShortcut("ctrl+h");
      unregisterShortcut("ctrl+l");
      unregisterShortcut("ctrl+r");
      unregisterShortcut("ctrl+p");
      unregisterShortcut("ctrl+shift+c");
    };
  }, [registerShortcut, unregisterShortcut, navigate]);

  const handleSelect = (item) => {
    if (item.type === "navigation" || item.type === "page") {
      navigate(item.path);
    } else if (item.type === "food") {
      // Navigate to log page with food to add
      navigate("/log", { state: { addFood: item } });
    }
    setIsOpen(false);
  };

  return (
    <QuickSearch
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSelect={handleSelect}
      placeholder="Search foods or navigate..."
    />
  );
}

// Main app content with routing
function AppContent({
  userProfile,
  setUserProfile,
  dailyTarget,
  setDailyTarget,
  macroGoals,
  setMacroGoals,
  isOnboarding,
  setIsOnboarding,
  onboardingStep,
  setOnboardingStep,
  activities,
  setActivities,
  isMobile,
  isStandalone,
}) {
  const location = useLocation();
  const [caloriesData, setCaloriesData] = useState({ eaten: 0, burned: 0 });
  const [streakDays, setStreakDays] = useState(0);

  // Load calories and streak data
  useEffect(() => {
    const loadDashboardData = () => {
      setCaloriesData({
        eaten: getTotalCaloriesEaten(),
        burned: getTotalCaloriesBurned(),
      });

      const streak = loadStreakData();
      setStreakDays(streak.currentStreak || 0);
    };

    loadDashboardData();

    // Refresh data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [location.pathname]);

  const handleProfileUpdate = (profile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
  };

  const handleNewOnboardingComplete = (data) => {
    // Map Onboarding.js output to app state (profile stores imperial)
    let weightLbs, heightFeet, heightInches;
    if (data.units === "imperial") {
      weightLbs = Math.round(parseFloat(data.weight) || 160);
      heightFeet = data.heightFeet?.toString() || "5";
      heightInches = data.heightInches?.toString() || "10";
    } else {
      weightLbs = data.weight ? Math.round(parseFloat(data.weight) * 2.20462) : 150;
      const heightCm = parseFloat(data.height) || 170;
      const heightTotalInches = Math.round(heightCm / 2.54);
      heightFeet = Math.floor(heightTotalInches / 12).toString();
      heightInches = (heightTotalInches % 12).toString();
    }

    const profile = {
      name: data.name || '',
      age: data.age || '30',
      gender: data.sex || 'male',
      weight: weightLbs.toString(),
      heightFeet: heightFeet.toString(),
      heightInches: heightInches.toString(),
      activityLevel: data.activityLevel || 'moderate',
      goal: data.goal || 'maintain',
      customAdjustment: data.goal === 'lose' ? '500' : data.goal === 'gain' ? '300' : '0',
    };

    setUserProfile(profile);
    saveUserProfile(profile);

    const target = data.calorieGoal || 2000;
    setDailyTarget(target);
    saveDailyTarget(target);

    // Save macro goals
    if (data.macroGoals) {
      const totalCal = (data.macroGoals.protein * 4) + (data.macroGoals.carbs * 4) + (data.macroGoals.fat * 9);
      const proteinPct = totalCal > 0 ? Math.round((data.macroGoals.protein * 4 / totalCal) * 100) : 30;
      const carbsPct = totalCal > 0 ? Math.round((data.macroGoals.carbs * 4 / totalCal) * 100) : 40;
      const fatPct = 100 - proteinPct - carbsPct;
      const macros = {
        protein: data.macroGoals.protein,
        carbs: data.macroGoals.carbs,
        fat: data.macroGoals.fat,
        preset: 'Custom',
        percentages: { protein: proteinPct, carbs: carbsPct, fat: fatPct },
      };
      saveMacroGoals(macros);
      setMacroGoals(macros);
    }

    markOnboardingComplete();
    setIsOnboarding(false);
    setOnboardingStep(4);
  };

  const handleOnboardingSkip = () => {
    // Set sensible defaults
    const defaultProfile = {
      age: '30', gender: 'male', weight: '160',
      heightFeet: '5', heightInches: '10',
      activityLevel: 'moderate', goal: 'maintain', customAdjustment: '0',
    };
    setUserProfile(defaultProfile);
    saveUserProfile(defaultProfile);
    setDailyTarget(2000);
    saveDailyTarget(2000);
    const defaultMacros = calculateMacroGrams(2000, getMacroPresets().balanced);
    saveMacroGoals(defaultMacros);
    setMacroGoals(defaultMacros);
    markOnboardingComplete();
    setIsOnboarding(false);
    setOnboardingStep(4);
  };

  // Show onboarding flow
  if (isOnboarding) {
    return (
      <div className="onboarding-container">
        <Onboarding
          onComplete={handleNewOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    );
  }

  // Main app with routing
  const showNavigation = !location.pathname.startsWith("/onboarding");

  return (
    <>
      <SyncBridgeSetup />
      <InstallBanner
        isMobile={isMobile}
        isStandalone={isStandalone}
      />
      <DesktopSidebar
        dailyTarget={dailyTarget}
        caloriesEaten={caloriesData.eaten}
        caloriesBurned={caloriesData.burned}
        streakDays={streakDays}
      />

      <main id="main-content" className="main-content">
        <PageWrapper>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  userProfile={userProfile}
                  dailyTarget={dailyTarget}
                  macroGoals={macroGoals}
                />
              }
            />
            <Route
              path="/log"
              element={
                <LogPage userProfile={userProfile} dailyTarget={dailyTarget} />
              }
            />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route
              path="/history"
              element={
                <HistoryPage
                  userProfile={userProfile}
                  dailyTarget={dailyTarget}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProfilePage
                  userProfile={userProfile}
                  dailyTarget={dailyTarget}
                  onProfileUpdate={handleProfileUpdate}
                  onDailyTargetUpdate={(t) => setDailyTarget(t)}
                />
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/coach" element={<CoachPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageWrapper>
      </main>

      {showNavigation && (
        <>
          <FloatingActionButton />
          <BottomNavBar />
        </>
      )}
    </>
  );
}

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [dailyTarget, setDailyTarget] = useState(2000);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [macroGoals, setMacroGoals] = useState(loadMacroGoals());
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineBannerDismissed, setOfflineBannerDismissed] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(standalone);

    // Detect mobile devices (touch primary pointer AND smaller screen)
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const isSmallScreen = window.innerWidth < 1024;
    setIsMobile(isTouchDevice && isSmallScreen);
  }, []);

  useEffect(() => {
    const savedProfile = loadUserProfile();
    const savedTarget = loadDailyTarget();
    const completedOnboarding = hasCompletedOnboarding();

    if (savedProfile) {
      setUserProfile(savedProfile);
      setDailyTarget(savedTarget);
      setMacroGoals(loadMacroGoals());
      setIsOnboarding(false);
      setOnboardingStep(4);
      // Update streak on app load
      updateStreak();
    } else if (!completedOnboarding) {
      setIsOnboarding(true);
      setOnboardingStep(0);
    } else {
      setIsOnboarding(true);
      setOnboardingStep(1);
    }

    setIsLoading(false);
  }, []);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setOfflineBannerDismissed(false);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Theme initialization and system preference listener
  useEffect(() => {
    const applyTheme = (theme) => {
      const root = document.documentElement;

      if (theme === "system" || !theme) {
        // Remove explicit theme, let CSS media query handle it
        root.removeAttribute("data-theme");
      } else {
        // Apply explicit light or dark theme
        root.setAttribute("data-theme", theme);
      }
    };

    // Load and apply saved theme preference
    const preferences = loadPreferences();
    applyTheme(preferences.theme);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      const currentPrefs = loadPreferences();
      if (currentPrefs.theme === "system" || !currentPrefs.theme) {
        // Force re-render of CSS variables by toggling attribute
        document.documentElement.removeAttribute("data-theme");
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);

    // Listen for storage changes (theme changed in settings)
    const handleStorageChange = () => {
      const currentPrefs = loadPreferences();
      applyTheme(currentPrefs.theme);
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event when preferences change within the same tab
    const handlePreferenceChange = (e) => {
      if (e.detail?.key === "theme" || e.detail?.type === "preferences") {
        const currentPrefs = loadPreferences();
        applyTheme(currentPrefs.theme);
        if (currentPrefs.notificationsEnabled) {
          startReminderScheduler();
        } else {
          stopReminderScheduler();
        }
      }
    };
    window.addEventListener("preferenceChange", handlePreferenceChange);

    // Start reminder scheduler if notifications enabled
    if (preferences.notificationsEnabled) {
      startReminderScheduler();
    }

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("preferenceChange", handlePreferenceChange);
      stopReminderScheduler();
    };
  }, []);

  // Show loading state - branded experience
  if (isLoading) {
    return (
      <div className="App loading">
        <div className="loading-screen">
          <div className="loading-screen__logo">
            <img src="/NutriNote.png" alt="" aria-hidden />
          </div>
          <div className="loading-screen__spinner" aria-hidden />
          <p className="loading-screen__label">Loading NutriNote+</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
      <KeyboardShortcutsProvider>
        <A11yProvider>
        <SnackbarProvider>
        <ErrorBoundary>
          <SyncStatusProvider>
          <div className="App">
            {/* Enhanced skip links for accessibility */}
            <SkipLinks
              links={[
                { target: "main-content", label: "Skip to main content" },
                { target: "navigation", label: "Skip to navigation" },
              ]}
            />

            {/* Live region for screen reader announcements */}
            <LiveRegion />

            <UpdateBanner />

            {/* Offline indicator */}
            {isOffline && !offlineBannerDismissed && (
              <div className="offline-banner" role="alert">
                <WifiOff size={16} aria-hidden />
                <span>You're offline. Some features may be limited.</span>
                <button
                  type="button"
                  className="offline-banner__dismiss"
                  onClick={() => setOfflineBannerDismissed(true)}
                  aria-label="Dismiss offline notice"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <ToastProvider />
            <TooltipProvider>
              <QuickSearchWrapper />
              <AppContent
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                dailyTarget={dailyTarget}
                setDailyTarget={setDailyTarget}
                macroGoals={macroGoals}
                setMacroGoals={setMacroGoals}
                isOnboarding={isOnboarding}
                setIsOnboarding={setIsOnboarding}
                onboardingStep={onboardingStep}
                setOnboardingStep={setOnboardingStep}
                activities={activities}
                setActivities={setActivities}
                isMobile={isMobile}
                isStandalone={isStandalone}
              />
            </TooltipProvider>
          </div>
          </SyncStatusProvider>
        </ErrorBoundary>
        </SnackbarProvider>
        </A11yProvider>
      </KeyboardShortcutsProvider>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
