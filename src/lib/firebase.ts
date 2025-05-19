
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // If auth is needed

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing project ID, which is crucial for Firestore.
if (!firebaseConfig.projectId) {
  console.error(
    "Firebase projectId is not defined in environment variables. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set correctly in your .env.local file. " +
    "Firestore operations will likely fail."
  );
}


let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db: Firestore = getFirestore(app);
// const auth = getAuth(app); // If auth is needed

export { app, db };
