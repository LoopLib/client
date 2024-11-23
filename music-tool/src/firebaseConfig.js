// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQA9NmhQAZOL3iPEuIU67QVIwfP6WgHYc",
  authDomain: "ai-musictool.firebaseapp.com",
  projectId: "ai-musictool",
  storageBucket: "ai-musictool.firebasestorage.app",
  messagingSenderId: "872745460026",
  appId: "1:872745460026:web:d81c72cc1252aa8359f003",
  measurementId: "G-H59X0J4WMT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 
