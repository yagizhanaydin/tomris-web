import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

function initFirebase() {
  if (typeof window === "undefined") return;
  if (!firebaseConfig.apiKey) return;
  if (app) return;

  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export function getFirebaseAuth(): Auth {
  initFirebase();
  if (!auth) {
    throw new Error(
      "Firebase yapılandırması eksik. .env.local dosyasını kontrol edin."
    );
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  initFirebase();
  if (!db) {
    throw new Error(
      "Firebase yapılandırması eksik. .env.local dosyasını kontrol edin."
    );
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  initFirebase();
  if (!storage) {
    throw new Error(
      "Firebase yapılandırması eksik. .env.local dosyasını kontrol edin."
    );
  }
  return storage;
}
