// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// SDK Firebase utilisés : Firestore (données), Storage (photos), Auth (admin)
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyDC9yC6qS6p3jEvlq9zZSnYjrHD1rYCO_s",
    authDomain: "lacleprovencale-c1c69.firebaseapp.com",
    projectId: "lacleprovencale-c1c69",
    storageBucket: "lacleprovencale-c1c69.firebasestorage.app",
    messagingSenderId: "891304739802",
    appId: "1:891304739802:web:3ef87605a9a076415bf6e3",
    measurementId: "G-6XY95WCKF7"
};

// Initialisation "intelligente" pour Next.js :
// On vérifie si une app existe déjà pour éviter de la relancer deux fois (ce qui crée un bug)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// On initialise la base de données
const db = getFirestore(app);

// Stockage des photos (page Expérience)
const storage = getStorage(app);

// Connexion de l'administratrice (Firebase Authentication)
const auth = getAuth(app);

// On exporte la db pour l'utiliser dans nos formulaires
export { db, storage, auth };