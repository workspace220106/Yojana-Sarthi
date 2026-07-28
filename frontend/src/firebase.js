import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdfQc5slI2GfEis2TBPbCUuj6HHV02rdc",
  authDomain: "yojana-sarthi.firebaseapp.com",
  projectId: "yojana-sarthi",
  storageBucket: "yojana-sarthi.firebasestorage.app",
  messagingSenderId: "718499824002",
  appId: "1:718499824002:web:2f102e4cfb9d4f389d0f9b",
  measurementId: "G-25SSNENHFE"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 1. Citizen Database (Default Instance)
export const db = getFirestore(app); 

// 2. Administrator Database (Separate Named Instance)
// Note: Ensure the "admin-db" database is created in the Firestore console under yojana-sarthi
export const adminDb = getFirestore(app, "admin-db");

export default app;
