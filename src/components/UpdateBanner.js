/**
 * UpdateBanner - Shows when a new service worker is available
 * Dismissible banner with Refresh button instead of blocking confirm
 */

import React, { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import "./UpdateBanner.css";

export default function UpdateBanner() {
  const [registration, setRegistration] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      setRegistration(e.detail?.registration ?? null);
      setDismissed(false);
    };
    window.addEventListener("sw-update-available", handler);
    return () => window.removeEventListener("sw-update-available", handler);
  }, []);

  const handleRefresh = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!registration?.waiting || dismissed) return null;

  return (
    <div className="update-banner" role="alert">
      <span className="update-banner__text">
        A new version is available.
      </span>
      <div className="update-banner__actions">
        <button
          type="button"
          className="update-banner__btn update-banner__btn--primary"
          onClick={handleRefresh}
        >
          <RefreshCw size={16} aria-hidden />
          Refresh
        </button>
        <button
          type="button"
          className="update-banner__btn update-banner__btn--dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
