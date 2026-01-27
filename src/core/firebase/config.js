import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for Zetta POS
const firebaseConfig = {
  apiKey: "AIzaSyDV0TkoOeYbX1GdKgCHSdJCIdtls-kkDtI",
  authDomain: "zetta-pos-core.firebaseapp.com",
  projectId: "zetta-pos-core",
  storageBucket: "zetta-pos-core.firebasestorage.app",
  messagingSenderId: "518516197852",
  appId: "1:518516197852:web:3f1b7cc96761d30caca719",
  measurementId: "G-65FLHD6KY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
