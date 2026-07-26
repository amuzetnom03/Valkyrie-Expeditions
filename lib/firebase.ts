import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export const getFirebaseApp = () => {
  if (!app && typeof window !== 'undefined') {
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase API key missing. Real-time features disabled.');
      return null;
    }
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
};

export const getDb = () => {
  const firebaseApp = getFirebaseApp();
  if (!db && firebaseApp) {
    // Enable offline persistence with persistentLocalCache
    db = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  }
  return db;
};

export const getAuthClient = () => {
  const firebaseApp = getFirebaseApp();
  if (!auth && firebaseApp) {
    auth = getAuth(firebaseApp);
  }
  return auth;
};
