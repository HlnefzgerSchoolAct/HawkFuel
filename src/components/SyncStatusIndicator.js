/**
 * SyncStatusIndicator - Shows cloud sync state (syncing, success, error) and last sync time
 * Only visible when user is signed in
 */

import React, { useEffect, useState } from "react";
import { Cloud, CloudOff, Check, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSyncStatus } from "../contexts/SyncStatusContext";
import { uploadLocalToCloud } from "../services/syncService";
import "./SyncStatusIndicator.css";

function formatLastSync(date) {
  if (!date) return null;
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function SyncStatusIndicator() {
  const { user, isFirebaseConfigured } = useAuth();
  const { status, setStatus, setLastSyncTime, lastSyncTime } = useSyncStatus();
  const [retrying, setRetrying] = useState(false);

  // Reset success to idle after a few seconds
  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => setStatus("idle"), 3000);
    return () => clearTimeout(t);
  }, [status, setStatus]);

  const handleRetry = async () => {
    if (!user || retrying) return;
    setRetrying(true);
    setStatus("syncing");
    try {
      await uploadLocalToCloud(user.uid);
      setStatus("success");
      setLastSyncTime(new Date());
    } catch {
      setStatus("error");
    } finally {
      setRetrying(false);
    }
  };

  if (!isFirebaseConfigured() || !user) return null;

  return (
    <div className="sync-status" role="status" aria-live="polite">
      {status === "syncing" && (
        <span className="sync-status__item sync-status__syncing">
          <Loader2 size={14} className="sync-status__spin" aria-hidden />
          <span>Syncing…</span>
        </span>
      )}
      {status === "success" && (
        <span className="sync-status__item sync-status__success">
          <Check size={14} aria-hidden />
          <span>Synced</span>
        </span>
      )}
      {status === "error" && (
        <span className="sync-status__item sync-status__error">
          <CloudOff size={14} aria-hidden />
          <span>Sync failed</span>
          <button
            type="button"
            className="sync-status__retry"
            onClick={handleRetry}
            disabled={retrying}
            aria-label="Retry sync"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </span>
      )}
      {status === "idle" && lastSyncTime && (
        <span className="sync-status__item sync-status__idle">
          <Cloud size={14} aria-hidden />
          <span>Last synced {formatLastSync(lastSyncTime)}</span>
        </span>
      )}
    </div>
  );
}
