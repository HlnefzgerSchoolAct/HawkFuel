/**
 * Notification Service - Meal reminder notifications via Notification API
 * Uses local scheduling (no FCM server required for reminders)
 */

import { loadPreferences } from "../utils/localStorage";

const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute
let intervalId = null;

function parseTime(str) {
  if (!str || typeof str !== "string") return null;
  const [h, m] = str.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return { hour: h, minute: m };
}

function shouldFireReminder(now, timeStr) {
  const t = parseTime(timeStr);
  if (!t) return false;
  return now.getHours() === t.hour && now.getMinutes() === t.minute;
}

function getLastFiredKey(timeStr) {
  return `nutrinote_reminder_fired_${timeStr.replace(":", "")}`;
}

function wasFiredToday(timeStr) {
  const key = getLastFiredKey(timeStr);
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return false;
    const date = new Date(saved);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
}

function markFiredToday(timeStr) {
  const key = getLastFiredKey(timeStr);
  localStorage.setItem(key, new Date().toISOString());
}

function getReminderMessage(timeStr) {
  if (timeStr === "08:00" || timeStr?.startsWith("0") || (parseTime(timeStr)?.hour ?? 0) < 10) {
    return "Time to log breakfast!";
  }
  const h = parseTime(timeStr)?.hour ?? 12;
  if (h >= 11 && h < 15) return "Time to log lunch!";
  return "Time to log dinner!";
}

function showReminder(timeStr) {
  if (wasFiredToday(timeStr)) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const msg = getReminderMessage(timeStr);
  try {
    new Notification("NutriNote+", {
      body: msg,
      icon: "/icon-192x192.png",
    });
    markFiredToday(timeStr);
  } catch (err) {
    console.warn("Notification failed:", err);
  }
}

function checkReminders() {
  const prefs = loadPreferences();
  if (!prefs?.notificationsEnabled) return;

  const now = new Date();
  const times = [
    prefs.reminderBreakfast,
    prefs.reminderLunch,
    prefs.reminderDinner,
  ].filter(Boolean);

  times.forEach((t) => {
    if (shouldFireReminder(now, t)) showReminder(t);
  });
}

/**
 * Request notification permission
 */
export async function requestPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

/**
 * Start the reminder scheduler
 */
export function startReminderScheduler() {
  stopReminderScheduler();
  intervalId = setInterval(checkReminders, CHECK_INTERVAL_MS);
  checkReminders(); // Run once immediately
}

/**
 * Stop the reminder scheduler
 */
export function stopReminderScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
