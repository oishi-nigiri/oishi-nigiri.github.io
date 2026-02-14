import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBilKLe_JmQREulXmtZK5dBxNdTTzFhX3w",
  authDomain: "oishinigiri-app.firebaseapp.com",
  projectId: "oishinigiri-app",
  storageBucket: "oishinigiri-app.firebasestorage.app",
  messagingSenderId: "120740998032",
  appId: "1:120740998032:web:c500851136eb47b29ca115",
};

let app = null;
let db = null;
let auth = null;

export function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
  return { app, db, auth };
}

export function getDb() {
  if (!db) {
    initFirebase();
  }
  return db;
}

export function getFirebaseAuth() {
  if (!auth) {
    initFirebase();
  }
  return auth;
}

export const ADMIN_IDS = ["317665879443767306"];
