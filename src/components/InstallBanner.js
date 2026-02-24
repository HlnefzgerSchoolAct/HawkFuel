/**
 * InstallBanner - Non-blocking PWA install prompt
 * Shows on mobile web (non-standalone) with "Install" and "Maybe later" options.
 * Uses native beforeinstallprompt when available (Android Chrome).
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import {
  getInstallPromptDismissed,
  setInstallPromptDismissed,
} from "../utils/localStorage";
import "./InstallBanner.css";

function InstallBanner({ isMobile, isStandalone }) {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (isStandalone || !isMobile) return;
    if (getInstallPromptDismissed()) return;

    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show banner after a short delay (e.g. after user has seen main content)
    const timer = setTimeout(() => setIsVisible(true), 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [isMobile, isStandalone]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    } else if (isIOS) {
      // iOS: scroll to top so user sees Share button in Safari
      window.scrollTo(0, 0);
    }
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    setInstallPromptDismissed();
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="install-banner"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div className="install-banner__content">
          <div className="install-banner__text">
            <strong>Add to Home Screen</strong>
            <span>
              {isIOS
                ? "Tap Share, then Add to Home Screen for the best experience"
                : "Install for offline access and faster performance"}
            </span>
          </div>
          <div className="install-banner__actions">
            <button
              type="button"
              className="install-banner__btn install-banner__btn--primary"
              onClick={handleInstall}
              aria-label="Add to Home Screen"
            >
              <Download size={18} aria-hidden />
              Install
            </button>
            <button
              type="button"
              className="install-banner__btn install-banner__btn--secondary"
              onClick={handleDismiss}
              aria-label="Maybe later"
            >
              Maybe later
            </button>
          </div>
          <button
            type="button"
            className="install-banner__close"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default InstallBanner;
