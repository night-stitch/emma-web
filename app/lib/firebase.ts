// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCSH3qCa-4CocFIRdm3IRNbIvRCW4vKNmY",
    authDomain: "emma-web-6c203.firebaseapp.com",
    projectId: "emma-web-6c203",
    storageBucket: "emma-web-6c203.firebasestorage.app",
    messagingSenderId: "383714487743",
    appId: "1:383714487743:web:9ac466bcb82ee17e58850a",
    measurementId: "G-YWGHTNHB7T"
};

// Initialisation "intelligente" pour Next.js :
// On vérifie si une app existe déjà pour éviter de la relancer deux fois (ce qui crée un bug)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// On initialise la base de données
const db = getFirestore(app);

// On exporte la db pour l'utiliser dans nos formulaires
export { db };