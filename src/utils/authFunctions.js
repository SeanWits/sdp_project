import { auth, db, doc, setDoc } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const registerUser = async (name, surname, email, personNum, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await setDoc(doc(db, "users", user.uid), {
        name,
        surname,
        email,
        personNum,
        verified: false,
        user_Id: user.uid,
        wallet: 0
      });
  
      return user;
    } catch (error) {
      throw error;
    }
  };

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
    try {
      await signOut(auth);
      // console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };