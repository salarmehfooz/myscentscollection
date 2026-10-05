import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import rawConfig from "../firebase-applet-config.json";

// Construct Firebase configuration safely using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    rawConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig.appId,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID || rawConfig.firestoreDatabaseId,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "demo-api-key" &&
  firebaseConfig.projectId !== "demo-project-id",
);

// Initialize Firebase
const app = initializeApp(
  isFirebaseConfigured
    ? firebaseConfig
    : {
        apiKey: "demo-api-key",
        projectId: "demo-project-id",
        authDomain: "demo.firebaseapp.com",
      },
);

// Initialize Firestore with high-performance IndexedDB cache so products load in <10ms on localhost
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId || "(default)",
  );
} catch (e) {
  // Fallback to standard getFirestore if persistence is unavailable or already initialized
  try {
    firestoreInstance = getFirestore(
      app,
      firebaseConfig.firestoreDatabaseId || "(default)",
    );
  } catch (err) {
    firestoreInstance = getFirestore(app);
  }
}

export const db = firestoreInstance;
