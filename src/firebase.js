import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, where, query, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASURE_ID
};

// Initialize Firebased
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Set persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // console.log("Persistence set successfully");
  })
  .catch((error) => {
    // console.error("Error setting persistence:", error);
  });

const db = getFirestore(app);
const imgDB = getStorage(app);

export { auth, db, doc, getDoc, setDoc, updateDoc, arrayUnion, imgDB, collection, addDoc, serverTimestamp, where, query, getDocs, deleteDoc };
