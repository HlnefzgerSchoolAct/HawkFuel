import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  loadPreferences,
  savePreferences,
  loadMacroGoals,
  saveMacroGoals,
  getMacroPresets,
  calculateMacroGrams,
  clearAllData,
  resetOnboarding,
  loadUserProfile,
  saveUserProfile,
  saveDailyTarget,
  loadMicronutrientGoals,
  saveMicronutrientGoals,
  calculatePersonalizedMicronutrientGoals,
  MICRONUTRIENT_INFO,
} from "../utils/localStorage";
import { createFocusTrap } from "../utils/a11y";
import DataManagementSheet from "./DataManagement";
import { ConfirmDialog } from "./common";
import { useAuth } from "../contexts/AuthContext";
import { deleteUserCloudData } from "../services/syncService";
import {
  requestPermission,
  startReminderScheduler,
  stopReminderScheduler,
} from "../services/notificationService";
import { useTooltip } from "./OnboardingTooltips";
import { useKeyboardShortcuts } from "./KeyboardShortcuts";
import "./Settings.css";

function Settings({ isOpen, onClose, onProfileUpdate, dailyTarget, onDailyTargetUpdate }) {
  const navigate = useNavigate();
  const { user, signOut, deleteAccount, isFirebaseConfigured } = useAuth();
  const { resetTooltips } = useTooltip();
  const { setShowHelp } = useKeyboardShortcuts();
  const [preferences, setPreferences] = useState(loadPreferences());
  const [macroGoals, setMacroGoals] = useState(loadMacroGoals());
  const [profile, setProfile] = useState(loadUserProfile());
  const [activeTab, setActiveTab] = useState("general");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [customMacros, setCustomMacros] = useState({
    protein: macroGoals.percentages?.protein || 30,
    carbs: macroGoals.percentages?.carbs || 40,
    fat: macroGoals.percentages?.fat || 30,
  });
  const [microGoals, setMicroGoals] = useState(loadMicronutrientGoals());
  const [editingMicros, setEditingMicros] = useState({});
  const modalRef = useRef(null);
  const focusTrapRef = useRef(null);

  const presets = getMacroPresets();

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      focusTrapRef.current = createFocusTrap(modalRef.current, {
        escapeDeactivates: true,
        onDeactivate: onClose,
      });
      focusTrapRef.current.activate();
    }
    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
        focusTrapRef.current = null;
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setPreferences(loadPreferences());
      setMacroGoals(loadMacroGoals());
      setProfile(loadUserProfile());
      setMicroGoals(loadMicronutrientGoals());
    }
  }, [isOpen]);

  const handlePreferenceChange = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    savePreferences(updated);

    // Dispatch event to notify App.js of theme changes
    if (key === "theme") {
      window.dispatchEvent(
        new CustomEvent("preferenceChange", {
          detail: { key, value, type: "preferences" },
        }),
      );
    }
  };

  const handlePresetChange = (presetKey) => {
    const preset = presets[presetKey];
    const newGoals = calculateMacroGrams(dailyTarget, preset);
    setMacroGoals(newGoals);
    saveMacroGoals(newGoals);
    setCustomMacros({
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
    });
  };

  const handleCustomMacroChange = (macro, value) => {
    const numValue = parseInt(value) || 0;
    const updated = { ...customMacros, [macro]: numValue };

    // Ensure total doesn't exceed 100
    const total = updated.protein + updated.carbs + updated.fat;
    if (total <= 100) {
      setCustomMacros(updated);
    }
  };

  const applyCustomMacros = () => {
    const total = customMacros.protein + customMacros.carbs + customMacros.fat;
    if (total !== 100) {
      alert(`Macro percentages must equal 100%. Current total: ${total}%`);
      return;
    }

    const newGoals = calculateMacroGrams(dailyTarget, {
      ...customMacros,
      name: "Custom",
    });
    setMacroGoals(newGoals);
    saveMacroGoals(newGoals);
  };

  const recalculateMacros = () => {
    const currentPercentages = macroGoals.percentages || {
      protein: 30,
      carbs: 40,
      fat: 30,
    };
    const newGoals = calculateMacroGrams(dailyTarget, {
      ...currentPercentages,
      name: macroGoals.preset || "Custom",
    });
    setMacroGoals(newGoals);
    saveMacroGoals(newGoals);
  };

  const handleProfileChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const saveProfileChanges = () => {
    saveUserProfile(profile);
    if (onProfileUpdate) {
      onProfileUpdate(profile);
    }
    // Auto-recalculate TDEE when profile changes
    if (profile && profile.weight && profile.heightFeet && profile.age && profile.gender) {
      const weightKg = parseFloat(profile.weight) / 2.20462;
      const heightInches = parseInt(profile.heightFeet) * 12 + parseInt(profile.heightInches || 0);
      const heightCm = heightInches * 2.54;
      const age = parseInt(profile.age);
      let bmr;
      if (profile.gender === "male") {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
      }
      const multipliers = {
        sedentary: 1.2, light: 1.375, moderate: 1.55,
        active: 1.725, veryActive: 1.9,
      };
      const tdee = Math.round(bmr * (multipliers[profile.activityLevel] || 1.55));
      let adjustment = 0;
      if (profile.goal === "lose") adjustment = -(parseInt(profile.customAdjustment) || 500);
      else if (profile.goal === "gain") adjustment = parseInt(profile.customAdjustment) || 300;
      const newTarget = tdee + adjustment;
      saveDailyTarget(newTarget);
      if (onDailyTargetUpdate) onDailyTargetUpdate(newTarget);
      // Recalculate macros based on new target
      const currentPercentages = macroGoals.percentages || { protein: 30, carbs: 40, fat: 30 };
      const newMacros = calculateMacroGrams(newTarget, { ...currentPercentages, name: macroGoals.preset || "Custom" });
      setMacroGoals(newMacros);
      saveMacroGoals(newMacros);
    }
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    window.location.reload();
  };

  const handleResetTutorial = () => {
    setShowResetConfirm(true);
  };

  const handleResetTutorialConfirm = () => {
    resetOnboarding();
    setShowResetConfirm(false);
    window.location.reload();
  };

  const handleDeleteAccountConfirm = async () => {
    if (!user) return;
    try {
      await deleteUserCloudData(user.uid);
      await deleteAccount();
      clearAllData();
      setShowDeleteAccountConfirm(false);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Delete account failed:", err);
      alert(err.message || "Failed to delete account. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="settings-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="settings-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 id="settings-title">Settings</h2>
          <button
            className="settings-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-tabs" role="tablist">
          <button
            className={`settings-tab ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
            role="tab"
            aria-selected={activeTab === "general"}
            aria-controls="settings-panel-general"
          >
            General
          </button>
          <button
            className={`settings-tab ${activeTab === "macros" ? "active" : ""}`}
            onClick={() => setActiveTab("macros")}
            role="tab"
            aria-selected={activeTab === "macros"}
            aria-controls="settings-panel-macros"
          >
            Macros
          </button>
          <button
            className={`settings-tab ${activeTab === "micros" ? "active" : ""}`}
            onClick={() => setActiveTab("micros")}
            role="tab"
            aria-selected={activeTab === "micros"}
            aria-controls="settings-panel-micros"
          >
            Micros
          </button>
          <button
            className={`settings-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
            role="tab"
            aria-selected={activeTab === "profile"}
            aria-controls="settings-panel-profile"
          >
            Profile
          </button>
          <button
            className={`settings-tab ${activeTab === "data" ? "active" : ""}`}
            onClick={() => setActiveTab("data")}
            role="tab"
            aria-selected={activeTab === "data"}
            aria-controls="settings-panel-data"
          >
            Data
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "general" && (
            <div className="settings-section">
              {isFirebaseConfigured() && (
                <div className="setting-item setting-item-account">
                  <div className="setting-info">
                    <span className="setting-label">Account</span>
                    <span className="setting-description">
                      {user ? `Signed in as ${user.email}` : "Sign in to sync data across devices"}
                    </span>
                  </div>
                  {user ? (
                    <button
                      type="button"
                      className="settings-link"
                      onClick={() => signOut()}
                    >
                      Sign out
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="settings-link settings-link-primary"
                      onClick={() => { onClose(); navigate("/login"); }}
                    >
                      Sign in
                    </button>
                  )}
                </div>
              )}
              <h3>Food Logging</h3>

              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Food Database Search</span>
                  <span className="setting-description">
                    Enable manual search through 5,000+ foods database
                  </span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.databaseEnabled}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "databaseEnabled",
                        e.target.checked,
                      )
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Macro Input Mode</span>
                  <span className="setting-description">
                    How to handle macros for manual/database entries
                  </span>
                </div>
                <select
                  value={preferences.macroInputMode}
                  onChange={(e) =>
                    handlePreferenceChange("macroInputMode", e.target.value)
                  }
                  className="setting-select"
                >
                  <option value="both">Ask me each time</option>
                  <option value="manual">Always enter manually</option>
                  <option value="auto">Estimate from calories</option>
                </select>
              </div>

              <h3>Notifications</h3>

              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Meal reminders</span>
                  <span className="setting-description">
                    Get notified to log breakfast, lunch, and dinner
                  </span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notificationsEnabled ?? false}
                    onChange={async (e) => {
                      const enabled = e.target.checked;
                      if (enabled) {
                        const perm = await requestPermission();
                        if (perm !== "granted") {
                          return;
                        }
                        startReminderScheduler();
                      } else {
                        stopReminderScheduler();
                      }
                      handlePreferenceChange("notificationsEnabled", enabled);
                    }}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {preferences.notificationsEnabled && (
                <div className="reminder-times">
                  <div className="reminder-time-row">
                    <label>Breakfast</label>
                    <input
                      type="time"
                      value={preferences.reminderBreakfast ?? "08:00"}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "reminderBreakfast",
                          e.target.value
                        )
                      }
                      className="setting-time-input"
                    />
                  </div>
                  <div className="reminder-time-row">
                    <label>Lunch</label>
                    <input
                      type="time"
                      value={preferences.reminderLunch ?? "12:30"}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "reminderLunch",
                          e.target.value
                        )
                      }
                      className="setting-time-input"
                    />
                  </div>
                  <div className="reminder-time-row">
                    <label>Dinner</label>
                    <input
                      type="time"
                      value={preferences.reminderDinner ?? "18:30"}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "reminderDinner",
                          e.target.value
                        )
                      }
                      className="setting-time-input"
                    />
                  </div>
                </div>
              )}

              <h3>Appearance</h3>

              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Theme</span>
                  <span className="setting-description">
                    Choose light, dark, or match your system preference
                  </span>
                </div>
                <div className="theme-toggle-group">
                  <button
                    className={`theme-option ${preferences.theme === "light" ? "active" : ""}`}
                    onClick={() => handlePreferenceChange("theme", "light")}
                    aria-label="Light theme"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    <span>Light</span>
                  </button>
                  <button
                    className={`theme-option ${preferences.theme === "dark" ? "active" : ""}`}
                    onClick={() => handlePreferenceChange("theme", "dark")}
                    aria-label="Dark theme"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <span>Dark</span>
                  </button>
                  <button
                    className={`theme-option ${preferences.theme === "system" || !preferences.theme ? "active" : ""}`}
                    onClick={() => handlePreferenceChange("theme", "system")}
                    aria-label="System theme"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="2"
                        y="3"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    <span>System</span>
                  </button>
                </div>
              </div>

              <h3>Help</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Keyboard shortcuts</span>
                  <span className="setting-description">
                    View all available shortcuts (or press Shift+?)
                  </span>
                </div>
                <button
                  type="button"
                  className="setting-action-btn"
                  onClick={() => {
                    onClose();
                    setShowHelp(true);
                  }}
                >
                  Show shortcuts
                </button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Feature tips</span>
                  <span className="setting-description">
                    Re-show the onboarding tips that guide you through app features
                  </span>
                </div>
                <button
                  type="button"
                  className="setting-action-btn"
                  onClick={() => {
                    resetTooltips();
                    onClose();
                  }}
                >
                  Show tips again
                </button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Send feedback</span>
                  <span className="setting-description">
                    Report bugs, suggest features, or contact support
                  </span>
                </div>
                <a
                  href={(() => {
                    const subject = encodeURIComponent("NutriNote+ Feedback");
                    const body = encodeURIComponent(
                      `App version: 2.0.0\nPlatform: ${navigator.userAgent}\n\nDescribe your feedback, bug report, or question:\n`
                    );
                    return `mailto:support@nutrinote.app?subject=${subject}&body=${body}`;
                  })()}
                  className="setting-action-btn setting-action-btn-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Send feedback
                </a>
              </div>
            </div>
          )}

          {activeTab === "macros" && (
            <div className="settings-section">
              <h3>Macro Goals</h3>

              <div className="macro-summary">
                <div className="macro-summary-item">
                  <span className="macro-value">{macroGoals.protein}g</span>
                  <span className="macro-label">Protein</span>
                </div>
                <div className="macro-summary-item">
                  <span className="macro-value">{macroGoals.carbs}g</span>
                  <span className="macro-label">Carbs</span>
                </div>
                <div className="macro-summary-item">
                  <span className="macro-value">{macroGoals.fat}g</span>
                  <span className="macro-label">Fat</span>
                </div>
              </div>

              <p className="setting-note">
                Based on {dailyTarget} calories/day ({macroGoals.preset} preset)
              </p>

              <button className="recalculate-btn" onClick={recalculateMacros}>
                Recalculate from Current Calories
              </button>

              <h4>Preset Distributions</h4>
              <div className="preset-grid">
                {Object.entries(presets)
                  .filter(([key]) => key !== "custom")
                  .map(([key, preset]) => (
                    <button
                      key={key}
                      className={`preset-btn ${macroGoals.preset === preset.name ? "active" : ""}`}
                      onClick={() => handlePresetChange(key)}
                    >
                      <span className="preset-name">{preset.name}</span>
                      <span className="preset-ratio">
                        P:{preset.protein}% C:{preset.carbs}% F:{preset.fat}%
                      </span>
                    </button>
                  ))}
              </div>

              <h4>Custom Distribution</h4>
              <div className="custom-macro-inputs">
                <div className="macro-input-group">
                  <label>Protein %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customMacros.protein}
                    onChange={(e) =>
                      handleCustomMacroChange("protein", e.target.value)
                    }
                  />
                </div>
                <div className="macro-input-group">
                  <label>Carbs %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customMacros.carbs}
                    onChange={(e) =>
                      handleCustomMacroChange("carbs", e.target.value)
                    }
                  />
                </div>
                <div className="macro-input-group">
                  <label>Fat %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customMacros.fat}
                    onChange={(e) =>
                      handleCustomMacroChange("fat", e.target.value)
                    }
                  />
                </div>
              </div>
              <p className="macro-total">
                Total:{" "}
                {customMacros.protein + customMacros.carbs + customMacros.fat}%
                {customMacros.protein +
                  customMacros.carbs +
                  customMacros.fat !==
                  100 && (
                  <span className="macro-warning"> (must equal 100%)</span>
                )}
              </p>
              <button className="apply-btn" onClick={applyCustomMacros}>
                Apply Custom Macros
              </button>
            </div>
          )}

          {activeTab === "micros" && (
            <div className="settings-section">
              <h3>Micronutrient Goals</h3>
              <p className="settings-description">
                Personalized daily goals based on your profile. Adjust as
                needed.
              </p>

              <button
                className="recalculate-btn"
                onClick={() => {
                  const newGoals =
                    calculatePersonalizedMicronutrientGoals(profile);
                  setMicroGoals(newGoals);
                  saveMicronutrientGoals(newGoals);
                  setEditingMicros({});
                }}
              >
                Reset to Recommended Values
              </button>

              <h4>General</h4>
              <div className="micro-goals-grid">
                {["fiber", "sodium", "sugar", "cholesterol"].map((key) => {
                  const info = MICRONUTRIENT_INFO[key];
                  return (
                    <div key={key} className="micro-goal-item">
                      <label>{info?.label || key}</label>
                      <div className="micro-input-wrapper">
                        <input
                          type="number"
                          min="0"
                          value={
                            editingMicros[key] !== undefined
                              ? editingMicros[key]
                              : Math.round(microGoals[key] || 0)
                          }
                          onChange={(e) =>
                            setEditingMicros({
                              ...editingMicros,
                              [key]: e.target.value,
                            })
                          }
                          onBlur={() => {
                            if (editingMicros[key] !== undefined) {
                              const newGoals = {
                                ...microGoals,
                                [key]: parseFloat(editingMicros[key]) || 0,
                              };
                              setMicroGoals(newGoals);
                              saveMicronutrientGoals(newGoals);
                              setEditingMicros({
                                ...editingMicros,
                                [key]: undefined,
                              });
                            }
                          }}
                        />
                        <span className="micro-unit">{info?.unit}</span>
                      </div>
                      {info?.warnHigh && (
                        <span className="micro-hint">Daily limit</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <h4>Vitamins</h4>
              <div className="micro-goals-grid">
                {[
                  "vitaminA",
                  "vitaminC",
                  "vitaminD",
                  "vitaminE",
                  "vitaminK",
                  "vitaminB1",
                  "vitaminB2",
                  "vitaminB3",
                  "vitaminB6",
                  "vitaminB12",
                  "folate",
                ].map((key) => {
                  const info = MICRONUTRIENT_INFO[key];
                  return (
                    <div key={key} className="micro-goal-item">
                      <label>{info?.label || key}</label>
                      <div className="micro-input-wrapper">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={
                            editingMicros[key] !== undefined
                              ? editingMicros[key]
                              : microGoals[key] || 0
                          }
                          onChange={(e) =>
                            setEditingMicros({
                              ...editingMicros,
                              [key]: e.target.value,
                            })
                          }
                          onBlur={() => {
                            if (editingMicros[key] !== undefined) {
                              const newGoals = {
                                ...microGoals,
                                [key]: parseFloat(editingMicros[key]) || 0,
                              };
                              setMicroGoals(newGoals);
                              saveMicronutrientGoals(newGoals);
                              setEditingMicros({
                                ...editingMicros,
                                [key]: undefined,
                              });
                            }
                          }}
                        />
                        <span className="micro-unit">{info?.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h4>Minerals</h4>
              <div className="micro-goals-grid">
                {["calcium", "iron", "magnesium", "zinc", "potassium"].map(
                  (key) => {
                    const info = MICRONUTRIENT_INFO[key];
                    return (
                      <div key={key} className="micro-goal-item">
                        <label>{info?.label || key}</label>
                        <div className="micro-input-wrapper">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={
                              editingMicros[key] !== undefined
                                ? editingMicros[key]
                                : microGoals[key] || 0
                            }
                            onChange={(e) =>
                              setEditingMicros({
                                ...editingMicros,
                                [key]: e.target.value,
                              })
                            }
                            onBlur={() => {
                              if (editingMicros[key] !== undefined) {
                                const newGoals = {
                                  ...microGoals,
                                  [key]: parseFloat(editingMicros[key]) || 0,
                                };
                                setMicroGoals(newGoals);
                                saveMicronutrientGoals(newGoals);
                                setEditingMicros({
                                  ...editingMicros,
                                  [key]: undefined,
                                });
                              }
                            }}
                          />
                          <span className="micro-unit">{info?.unit}</span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="settings-section">
              <h3>Edit Profile</h3>

              <div className="profile-form">
                <div className="form-row">
                  <label>Weight (lbs)</label>
                  <input
                    type="number"
                    value={profile?.weight || ""}
                    onChange={(e) =>
                      handleProfileChange("weight", parseFloat(e.target.value))
                    }
                  />
                </div>

                <div className="form-row">
                  <label>Activity Level</label>
                  <select
                    value={profile?.activityLevel || "moderate"}
                    onChange={(e) =>
                      handleProfileChange("activityLevel", e.target.value)
                    }
                  >
                    <option value="sedentary">
                      Sedentary (little or no exercise)
                    </option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="veryActive">
                      Very Active (hard exercise daily)
                    </option>
                  </select>
                </div>

                <div className="form-row">
                  <label>Goal</label>
                  <select
                    value={profile?.goal || "maintain"}
                    onChange={(e) =>
                      handleProfileChange("goal", e.target.value)
                    }
                  >
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight</option>
                  </select>
                </div>

                <button className="save-btn" onClick={saveProfileChanges}>
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="settings-section">
              <h3>Data Management</h3>

              <div className="data-actions">
                <button className="data-btn export" onClick={() => setShowDataManagement(true)}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Export / Import Data
                </button>

                <button
                  className="data-btn reset"
                  onClick={handleResetTutorial}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                  Restart Setup Wizard
                </button>

                {isFirebaseConfigured() && user && !showDeleteAccountConfirm && (
                  <button
                    className="data-btn danger"
                    onClick={() => setShowDeleteAccountConfirm(true)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Delete Account
                  </button>
                )}
                {!showClearConfirm ? (
                  <button
                    className="data-btn danger"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Clear All Data
                  </button>
                ) : (
                  <div className="confirm-clear">
                    <p>Are you sure? This cannot be undone!</p>
                    <div className="confirm-buttons">
                      <button className="confirm-yes" onClick={handleClearData}>
                        Yes, Delete Everything
                      </button>
                      <button
                        className="confirm-no"
                        onClick={() => setShowClearConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="about-section">
                <h4>About NutriNote+</h4>
                <p>Version 2.0.0</p>
                <p>All data is stored locally on your device.</p>
                <p>Sign in to sync across devices. No personal data is sold.</p>
                <div className="about-links">
                  <button
                    type="button"
                    className="setting-link-btn"
                    onClick={() => { onClose(); navigate("/privacy"); }}
                  >
                    Privacy Policy
                  </button>
                  <span className="about-links-sep">·</span>
                  <button
                    type="button"
                    className="setting-link-btn"
                    onClick={() => { onClose(); navigate("/terms"); }}
                  >
                    Terms of Service
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Tutorial Confirmation */}
      <ConfirmDialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetTutorialConfirm}
        title="Restart setup wizard?"
        message="This will reset your onboarding. You'll need to set up your profile again. Continue?"
        confirmText="Restart"
        cancelText="Cancel"
        destructive
      />

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        open={showDeleteAccountConfirm}
        onClose={() => setShowDeleteAccountConfirm(false)}
        onConfirm={handleDeleteAccountConfirm}
        title="Delete account?"
        message="This will permanently delete your account and all cloud data. Local data will also be cleared. This cannot be undone."
        confirmText="Delete account"
        cancelText="Cancel"
        destructive
      />

      {/* Data Management Sheet */}
      <DataManagementSheet
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
      />
    </div>
  );
}

export default Settings;
