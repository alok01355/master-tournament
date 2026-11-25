import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Add your Firebase Web App config from Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyCal0ZGPIx7NXA6EhvgmbDj4xdLOTwYZFs",
  authDomain: "master-8fa5c.firebaseapp.com",
  projectId: "master-8fa5c",
  storageBucket: "master-8fa5c.firebasestorage.app",
  messagingSenderId: "561083915920",
  appId: "1:561083915920:web:0e423fb7809783b3ed8215"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
