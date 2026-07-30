import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDdfQc5slI2GfEis2TBPbCUuj6HHV02rdc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yojana-sarthi.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yojana-sarthi",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yojana-sarthi.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "718499824002",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:718499824002:web:2f102e4cfb9d4f389d0f9b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-25SSNENHFE"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// 1. Citizen Database (Default Instance)
export const db = getFirestore(app); 

// 2. Administrator Database (Separate Named Instance)
// Note: Ensure the "admin-db" database is created in the Firestore console under yojana-sarthi
export const adminDb = getFirestore(app, "admin-db");

export default app;
