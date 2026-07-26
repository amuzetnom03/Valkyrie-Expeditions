import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Scopes for Google Calendar
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/calendar.readonly');

let accessToken: string | null = null;

export const googleSignIn = async (): Promise<UserCredential | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    accessToken = credential?.accessToken || null;
    return result;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return null;
  }
};

export const getAccessToken = () => accessToken;

export const initAuth = (onUser: (user: User | null) => void, onNeedsAuth: () => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onUser(user);
    } else {
      onNeedsAuth();
    }
  });
};
