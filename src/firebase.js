import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, query , where , getDocs , deleteDoc , serverTimestamp } from "firebase/firestore";


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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Wrap setPersistence in a try-catch block
try {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Error setting persistence:", error);
    });
} catch (error) {
  console.error("Error setting persistence:", error);
}

const db = getFirestore(app);
const imgDB = getStorage(app);


export { auth, db, doc, getDoc, setDoc, updateDoc, arrayUnion, imgDB, collection, addDoc, query , where , getDocs , deleteDoc , serverTimestamp };

