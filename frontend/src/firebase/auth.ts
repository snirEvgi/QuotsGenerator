import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      user: result.user,
      error: null
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return {
      user: null,
      error: error
    };
  }
};

export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};
