import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { getAuthClient } from './firebase';

const provider = new GoogleAuthProvider();

// Scopes for Google Calendar
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/calendar.readonly');

let accessToken: string | null = null;

export const googleSignIn = async (): Promise<UserCredential | null> => {
  const auth = getAuthClient();
  if (!auth) return null;

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
  const auth = getAuthClient();
  if (!auth) return () => {};

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onUser(user);
    } else {
      onNeedsAuth();
    }
  });
};
