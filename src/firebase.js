import { initializeApp } from "firebase/app";
 import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
 import {getStorage} from "firebase/storage";
 //import { getAnalytics } from "firebase/analytics";
 import { getFirestore, doc, getDoc  } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD4luwWT5h-locwYhH9_oWy7YQR_0HJ5iQ",
    authDomain: "sdp-2024-project.firebaseapp.com",
    databaseURL: "https://sdp-2024-project-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "sdp-2024-project",
    storageBucket: "sdp-2024-project.appspot.com",
    messagingSenderId: "795365387337",
    appId: "1:795365387337:web:46e59d966ee13c40fd2398",
    measurementId: "G-7LGZWXGWEK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 //const analytics = getAnalytics(app);
 const auth = getAuth(app)

 setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });
  
 const db = getFirestore(app);
 const imgDB = getStorage(app);
 export {auth, db, doc, getDoc, imgDB}; 