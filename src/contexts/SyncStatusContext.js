/**
 * SyncStatusContext - Exposes cloud sync state (idle, syncing, success, error)
 * Used by SyncStatusIndicator and for "Last synced X ago" display
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadLastSyncTime, saveLastSyncTime } from "../utils/localStorage";

const SyncStatusContext = createContext(null);

export function SyncStatusProvider({ children }) {
  const [status, setStatus] = useState("idle"); // idle | syncing | success | error
  const [lastSyncTime, setLastSyncTimeState] = useState(null);

  useEffect(() => {
    const saved = loadLastSyncTime();
    if (saved) setLastSyncTimeState(saved);

    const onSyncComplete = (e) => {
      if (e.detail?.time) setLastSyncTimeState(e.detail.time);
    };
    window.addEventListener("nutrinote-sync-complete", onSyncComplete);
    return () => window.removeEventListener("nutrinote-sync-complete", onSyncComplete);
  }, []);

  const setLastSyncTime = useCallback((date) => {
    const ts = date instanceof Date ? date : new Date(date);
    setLastSyncTimeState(ts);
    saveLastSyncTime(ts);
  }, []);

  const value = {
    status,
    setStatus,
    lastSyncTime,
    setLastSyncTime,
  };

  return (
    <SyncStatusContext.Provider value={value}>
      {children}
    </SyncStatusContext.Provider>
  );
}

export function useSyncStatus() {
  const ctx = useContext(SyncStatusContext);
  return ctx || { status: "idle", setStatus: () => {}, lastSyncTime: null, setLastSyncTime: () => {} };
}
