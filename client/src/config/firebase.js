import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only these four are required for Auth to work. storageBucket and
// messagingSenderId are included above for completeness (Firebase's
// own setup snippet provides them) but nothing in this app uses them
// yet, so their absence isn't worth warning about.
const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'];

const missingKeys = REQUIRED_KEYS.filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.warn(
    `⚠️ Firebase config is missing: ${missingKeys.join(', ')}.\n` +
    'Copy client/.env.example to client/.env and fill in your Firebase project values.'
  );
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
