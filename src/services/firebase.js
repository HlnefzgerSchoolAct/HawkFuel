/**
 * Firebase initialization and exports
 * Used for Auth (Google sign-in) and Firestore (cloud sync)
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVHl9hW1RxQH-MibvLwWPJ0VHQMVi9U9g",
  authDomain: "nutrinote-274cc.firebaseapp.com",
  projectId: "nutrinote-274cc",
  storageBucket: "nutrinote-274cc.firebasestorage.app",
  messagingSenderId: "13916425761",
  appId: "1:13916425761:web:1b178bf1bf84a8b1059d60",
  measurementId: "G-TRDVDJY0LY",
};

const isFirebaseConfigured = () => true;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firestore with offline persistence (multi-tab safe)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const googleAuthProvider = new GoogleAuthProvider();

export { app, auth, db, isFirebaseConfigured };
