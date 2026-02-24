/**
 * AuthContext for managing user authentication state
 * Provides signInWithGoogle, signOut, and user state
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  deleteUser as firebaseDeleteUser,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleAuthProvider, isFirebaseConfigured } from "../services/firebase";
import { syncOnSignIn } from "../services/syncService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await syncOnSignIn(firebaseUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured()) {
      console.warn("Firebase not configured");
      return;
    }
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email sign-in failed:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email sign-up failed:", error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured()) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!isFirebaseConfigured() || !auth.currentUser) return;
    try {
      await firebaseDeleteUser(auth.currentUser);
    } catch (error) {
      console.error("Account deletion failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    deleteAccount,
    isFirebaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
