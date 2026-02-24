/**
 * AccountBanner - Prompts user to sign in for cloud sync
 * Shown when user is not signed in
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cloud, ChevronRight } from "lucide-react";
import { M3Button } from "./common";
import "./AccountBanner.css";

function AccountBanner({ onDismiss, dismissed }) {
  const navigate = useNavigate();

  if (dismissed) return null;

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <motion.div
      className="account-banner"
      role="region"
      aria-label="Sign in to sync"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Cloud size={20} className="account-banner__icon" aria-hidden />
      <div className="account-banner__content">
        <p className="account-banner__title">Sign in to sync across devices</p>
        <p className="account-banner__subtitle">
          Your food logs, recipes, and preferences will be available everywhere.
        </p>
      </div>
      <div className="account-banner__actions">
        <M3Button
          variant="filled"
          size="small"
          onClick={handleSignIn}
          trailingIcon={<ChevronRight size={16} />}
        >
          Sign in
        </M3Button>
        {onDismiss && (
          <button
            type="button"
            className="account-banner__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss sign-in prompt"
          >
            Not now
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default AccountBanner;
