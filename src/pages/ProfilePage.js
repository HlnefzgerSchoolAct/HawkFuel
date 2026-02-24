/**
 * Profile Page — M3 Redesign with Tailwind
 * User profile, streak, stats, achievements, hydration, settings
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Settings as SettingsIcon,
  Target,
  Flame,
  TrendingUp,
  TrendingDown,
  Calendar,
  Scale,
  Award,
  ChevronRight,
  Droplets,
  Activity,
  Ruler,
  Sparkles,
  Cloud,
  LogOut,
} from "lucide-react";
import {
  M3Card,
  M3CardContent,
  M3Button,
  M3ProgressRing,
  StaggerContainer,
  StaggerItem,
  SkeletonPage,
  Main,
  VisuallyHidden,
} from "../components/common";
import AccountBanner from "../components/AccountBanner";
import HydrationTracker from "../components/HydrationTracker";
import Settings from "../components/Settings";
import { useAuth } from "../contexts/AuthContext";
import {
  loadStreakData,
  loadWeeklyHistory,
  loadWeightLog,
} from "../utils/localStorage";
import "./ProfilePage.css";

const ACHIEVEMENTS = [
  { id: "streak3",  name: "3 Day Streak",    icon: Flame,    check: (d) => d.currentStreak >= 3 },
  { id: "streak7",  name: "Week Warrior",    icon: Award,    check: (d) => d.currentStreak >= 7 },
  { id: "days14",   name: "2 Weeks Strong",  icon: Calendar, check: (d) => d.daysTracked >= 14 },
  { id: "days30",   name: "Monthly Master",  icon: Sparkles, check: (d) => d.daysTracked >= 30 },
  { id: "streak14", name: "Fortnight Fire",  icon: Flame,    check: (d) => d.longestStreak >= 14 },
  { id: "days60",   name: "Power User",      icon: Award,    check: (d) => d.daysTracked >= 60 },
];

const ACTIVITY_LABELS = {
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  moderately_active: "Moderately Active",
  very_active: "Very Active",
  extra_active: "Extra Active",
};

function ProfilePage({ userProfile, dailyTarget, onProfileUpdate, onDailyTargetUpdate }) {
  const navigate = useNavigate();
  const { user, signOut, isFirebaseConfigured } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [accountBannerDismissed, setAccountBannerDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
  const [stats, setStats] = useState({ daysTracked: 0, avgCalories: 0, weightChange: null, totalCaloriesBurned: 0 });

  const loadStats = useCallback(() => {
    const streak = loadStreakData();
    setStreakData(streak);

    const history = loadWeeklyHistory();
    const dates = Object.keys(history);
    const daysTracked = dates.length;
    let totalCalories = 0, totalBurned = 0;
    dates.forEach((date) => {
      totalCalories += history[date]?.eaten || 0;
      totalBurned += history[date]?.burned || 0;
    });

    const weightLog = loadWeightLog();
    let weightChange = null;
    if (weightLog?.length >= 2) {
      const sorted = [...weightLog].sort((a, b) => new Date(a.date) - new Date(b.date));
      weightChange = sorted[sorted.length - 1].weight - sorted[0].weight;
    }

    setStats({
      daysTracked,
      avgCalories: daysTracked > 0 ? Math.round(totalCalories / daysTracked) : 0,
      weightChange,
      totalCaloriesBurned: totalBurned,
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStats();
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [loadStats]);

  // ===== Helpers =====
  const heightDisplay = useMemo(() => {
    if (!userProfile) return "—";
    return `${userProfile.heightFeet || 0}'${userProfile.heightInches || 0}"`;
  }, [userProfile]);

  const goalDisplay = useMemo(() => {
    if (!userProfile) return "—";
    return userProfile.goal === "lose" ? "Lose Weight" : userProfile.goal === "gain" ? "Gain Weight" : "Maintain Weight";
  }, [userProfile]);

  const GoalIcon = useMemo(() => {
    if (!userProfile) return Target;
    return userProfile.goal === "lose" ? TrendingDown : userProfile.goal === "gain" ? TrendingUp : Target;
  }, [userProfile]);

  const activityDisplay = useMemo(() => {
    return ACTIVITY_LABELS[userProfile?.activityLevel] || "—";
  }, [userProfile]);

  const unlockedCount = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.check({ ...streakData, ...stats })).length,
    [streakData, stats],
  );

  if (loading) return <SkeletonPage />;

  return (
    <Main className="px-4 pt-6 pb-24 max-w-150 mx-auto md:max-w-210 lg:pb-8 lg:pl-70">
      <VisuallyHidden>
        <h1>Your Profile</h1>
      </VisuallyHidden>

      {/* Account / Sign-in banner */}
      {isFirebaseConfigured() && !user && (
        <AccountBanner
          dismissed={accountBannerDismissed}
          onDismiss={() => setAccountBannerDismissed(true)}
        />
      )}

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => { setShowSettings(false); loadStats(); }}
        onProfileUpdate={onProfileUpdate}
        dailyTarget={dailyTarget}
        onDailyTargetUpdate={onDailyTargetUpdate}
      />

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <M3Card variant="elevated" className="mb-5">
          <M3CardContent className="flex items-center gap-4 relative">
            {/* Avatar */}
            <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-on-primary shrink-0 shadow-lg">
              <User size={32} />
              {streakData.currentStreak >= 7 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-linear-to-br from-warning to-warning/80 rounded-full flex items-center justify-center text-on-primary border-2 border-surface shadow-sm">
                  <Flame size={12} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-title-lg font-bold text-on-surface m-0 mb-1">Your Profile</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full text-label-sm font-medium text-primary">
                <GoalIcon size={14} /> {goalDisplay}
              </span>
            </div>

            {/* Settings button */}
            <motion.button
              className="flex items-center justify-center w-11 h-11 bg-surface-container border border-outline-variant rounded-xl text-on-surface-variant cursor-pointer transition-colors duration-150 hover:border-primary hover:text-primary"
              onClick={() => setShowSettings(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open settings"
            >
              <SettingsIcon size={22} />
            </motion.button>
          </M3CardContent>
        </M3Card>
      </motion.div>

      {/* Streak Hero */}
      <motion.div className="mb-5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <M3Card variant="filled" className="flex flex-col items-center py-8 px-6 gap-4">
          <M3ProgressRing value={Math.min(streakData.currentStreak, 30)} max={30} size={140} strokeWidth={12} color="primary" showGlow>
            <div className="flex flex-col items-center gap-1">
              <Flame size={24} className="text-primary streak-icon" />
              <span className="text-display-sm font-bold text-on-surface leading-none tabular-nums">{streakData.currentStreak}</span>
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">day streak</span>
            </div>
          </M3ProgressRing>
          <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
            <Award size={16} className="text-warning" />
            <span>Best: {streakData.longestStreak} days</span>
          </div>
        </M3Card>
      </motion.div>

      {/* Quick Stats Grid */}
      <StaggerContainer className="grid grid-cols-2 gap-3 mb-5 max-[400px]:grid-cols-1">
        <StaggerItem>
          <QuickStat icon={<Target size={20} />} iconClass="bg-primary/15 text-primary" value={dailyTarget?.toLocaleString()} label="Daily Goal" />
        </StaggerItem>
        <StaggerItem>
          <QuickStat icon={<Calendar size={20} />} iconClass="bg-info/15 text-info" value={stats.daysTracked} label="Days Tracked" />
        </StaggerItem>
        <StaggerItem>
          <QuickStat icon={<TrendingUp size={20} />} iconClass="bg-success/15 text-success" value={stats.avgCalories?.toLocaleString()} label="Avg Intake" />
        </StaggerItem>
        <StaggerItem>
          <QuickStat icon={<Activity size={20} />} iconClass="bg-info/15 text-info" value={stats.totalCaloriesBurned?.toLocaleString()} label="Total Burned" />
        </StaggerItem>
      </StaggerContainer>

      {/* Weight Progress */}
      {stats.weightChange !== null && (
        <motion.section className="mb-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <M3Card variant="elevated">
            <M3CardContent>
              <div className="flex items-center gap-3 text-body-sm font-medium text-on-surface-variant mb-3">
                <div className="flex items-center justify-center w-9 h-9 bg-tertiary/15 text-tertiary rounded-xl">
                  <Scale size={20} />
                </div>
                <span>Weight Progress</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className={`text-display-sm font-bold tabular-nums ${stats.weightChange < 0 ? "text-success" : stats.weightChange > 0 ? "text-primary" : "text-on-surface"}`}>
                  {stats.weightChange > 0 ? "+" : ""}{stats.weightChange.toFixed(1)} lbs
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  {stats.weightChange < 0 ? "Lost so far" : stats.weightChange > 0 ? "Gained so far" : "No change yet"}
                </span>
              </div>
            </M3CardContent>
          </M3Card>
        </motion.section>
      )}

      {/* Personal Info */}
      <motion.section className="mb-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <SectionHeader icon={<User size={18} />} title="Personal Info" />
        <M3Card variant="elevated" className="overflow-hidden">
          <DetailRow icon={<Calendar size={16} />} label="Age" value={`${userProfile?.age || "—"} years`} />
          <DetailRow icon={<User size={16} />} label="Gender" value={userProfile?.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : "—"} />
          <DetailRow icon={<Ruler size={16} />} label="Height" value={heightDisplay} />
          <DetailRow icon={<Scale size={16} />} label="Weight" value={`${userProfile?.weight || "—"} lbs`} />
          <DetailRow icon={<Activity size={16} />} label="Activity" value={activityDisplay} last />
        </M3Card>
      </motion.section>

      {/* Hydration */}
      <motion.section className="mb-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <SectionHeader icon={<Droplets size={18} />} title="Daily Hydration" iconClass="text-info" />
        <M3Card variant="elevated">
          <HydrationTracker userProfile={userProfile} />
        </M3Card>
      </motion.section>

      {/* Achievements */}
      <motion.section className="mb-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="flex items-center gap-2 mb-3">
          <Award size={18} className="text-warning" aria-hidden="true" />
          <h2 className="text-title-md font-semibold text-on-surface m-0 flex-1">Achievements</h2>
          <span className="text-body-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 max-[400px]:grid-cols-2 lg:grid-cols-6">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = achievement.check({ ...streakData, ...stats });
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.id}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-200 ${
                  isUnlocked
                    ? "bg-warning/8 border-warning/30"
                    : "bg-surface-container border-outline-variant opacity-50"
                }`}
                whileHover={isUnlocked ? { scale: 1.05, y: -2 } : undefined}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                  isUnlocked
                    ? "bg-linear-to-br from-warning to-warning/80 text-on-primary shadow-md"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}>
                  <Icon size={24} />
                </div>
                <span className="text-label-sm font-medium text-on-surface-variant leading-tight">
                  {achievement.name}
                </span>
                {isUnlocked && (
                  <span className="absolute top-2 right-2 w-4.5 h-4.5 bg-success text-on-primary rounded-full text-label-sm flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Account section */}
      {isFirebaseConfigured() && (
        <motion.section className="mb-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <SectionHeader icon={<Cloud size={18} />} title="Account" iconClass="text-info" />
          <M3Card variant="elevated">
            <M3CardContent>
              {user ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-on-surface truncate">{user.email}</p>
                    <p className="text-label-sm text-on-surface-variant">Synced across devices</p>
                  </div>
                  <M3Button variant="outlined" size="small" onClick={() => signOut()} leadingIcon={<LogOut size={18} />}>
                    Sign out
                  </M3Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-body-sm text-on-surface-variant">Sign in to sync your data across all your devices.</p>
                  <M3Button variant="filled" onClick={() => navigate("/login")} className="justify-center">
                    Sign in with Google
                  </M3Button>
                </div>
              )}
            </M3CardContent>
          </M3Card>
        </motion.section>
      )}

      {/* Settings Link */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <M3Button
          variant="outlined"
          fullWidth
          onClick={() => setShowSettings(true)}
          className="justify-between mb-4"
        >
          <span className="flex items-center gap-3">
            <SettingsIcon size={20} /> Settings &amp; Preferences
          </span>
          <ChevronRight size={20} />
        </M3Button>
      </motion.div>
    </Main>
  );
}

/* =============================================
   SUB-COMPONENTS
   ============================================= */

function SectionHeader({ icon, title, iconClass = "text-primary" }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={iconClass} aria-hidden="true">{icon}</span>
      <h2 className="text-title-md font-semibold text-on-surface m-0">{title}</h2>
    </div>
  );
}

function QuickStat({ icon, iconClass, value, label }) {
  return (
    <M3Card variant="filled" className="flex items-center gap-3 p-4">
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${iconClass}`}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-title-md font-bold text-on-surface leading-tight tabular-nums">{value}</span>
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
    </M3Card>
  );
}

function DetailRow({ icon, label, value, last = false }) {
  return (
    <div className={`flex items-center justify-between px-4 py-4 transition-colors duration-150 hover:bg-surface-container ${last ? "" : "border-b border-outline-variant"}`}>
      <div className="flex items-center gap-3">
        <span className="text-on-surface-variant">{icon}</span>
        <span className="text-body-sm text-on-surface-variant">{label}</span>
      </div>
      <span className="text-body-sm font-semibold text-on-surface">{value}</span>
    </div>
  );
}

export default ProfilePage;
