/**
 * LoginPage - Sign in with Google or Email for cloud sync
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cloud, LogIn, Loader2 } from "lucide-react";
import { M3Button, Main } from "../components/common";
import { useAuth } from "../contexts/AuthContext";
import "./LoginPage.css";

function LoginPage() {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    isFirebaseConfigured,
  } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("google"); // google | email | forgot
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured()) {
      setError("Sign-in is not configured.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setPasswordResetSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseConfigured()) {
    return (
      <Main className="login-page">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Cloud size={48} className="login-icon" aria-hidden />
          <h1>Cloud Sync</h1>
          <p className="login-subtitle">
            Sign in with Google to sync your data across devices.
          </p>
          <div className="login-unavailable" role="alert">
            <p>Firebase is not configured. Add environment variables to enable accounts:</p>
            <code>VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, ...</code>
          </div>
          <M3Button variant="outlined" onClick={() => navigate(-1)}>
            Go back
          </M3Button>
        </motion.div>
      </Main>
    );
  }

  return (
    <Main className="login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Cloud size={48} className="login-icon" aria-hidden />
        <h1>Sign in to NutriNote</h1>
        <p className="login-subtitle">
          Sync your food logs, recipes, and preferences across all your devices.
        </p>

        <div className="login-tabs" role="tablist">
          <button
            type="button"
            className={`login-tab ${mode === "google" ? "active" : ""}`}
            onClick={() => { setMode("google"); setError(null); }}
            role="tab"
          >
            Google
          </button>
          <button
            type="button"
            className={`login-tab ${mode === "email" || mode === "forgot" || mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("email"); setError(null); setPasswordResetSent(false); }}
            role="tab"
          >
            Email
          </button>
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {passwordResetSent && (
          <div className="login-success" role="status">
            Check your email for a password reset link.
          </div>
        )}

        {mode === "google" && (
          <>
            <M3Button
              variant="filled"
              fullWidth
              leadingIcon={loading ? <Loader2 size={20} className="spin" /> : <LogIn size={20} />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              aria-label={loading ? "Signing in..." : "Sign in with Google"}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </M3Button>
          </>
        )}

        {(mode === "email" || mode === "forgot" || mode === "signup") && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (mode === "forgot") handleForgotPassword(e);
              else if (mode === "email") handleEmailSubmit(e);
              else handleSignUpSubmit(e);
            }}
            className="login-form"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              autoComplete="email"
              required
            />
            {mode !== "forgot" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                autoComplete={mode === "email" ? "current-password" : "new-password"}
                required
              />
            )}
            {mode === "forgot" && (
              <M3Button
                type="submit"
                variant="filled"
                fullWidth
                disabled={loading}
              >
                {loading ? "Sending…" : "Send reset link"}
              </M3Button>
            )}
            {mode === "email" && (
              <>
                <M3Button
                  type="submit"
                  variant="filled"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </M3Button>
                <div className="login-email-links">
                  <button
                    type="button"
                    className="login-link"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    className="login-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setMode("signup");
                      setError(null);
                    }}
                  >
                    Create account
                  </button>
                </div>
              </>
            )}
            {mode === "signup" && (
              <>
                <M3Button
                  type="submit"
                  variant="filled"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? "Creating account…" : "Create account"}
                </M3Button>
                <button
                  type="button"
                  className="login-link"
                  onClick={() => { setMode("email"); setError(null); }}
                >
                  Already have an account? Sign in
                </button>
              </>
            )}
          </form>
        )}

        <button
          type="button"
          className="login-skip"
          onClick={() => navigate(-1)}
        >
          Continue without account
        </button>
      </motion.div>
    </Main>
  );
}

export default LoginPage;
