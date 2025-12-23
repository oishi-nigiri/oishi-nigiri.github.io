import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA__e798LgpiDfoBZXE7mynRxAajhQZT8o",
  authDomain: "oishi-nigiri.firebaseapp.com",
  projectId: "oishi-nigiri",
  storageBucket: "oishi-nigiri.firebasestorage.app",
  messagingSenderId: "235045203402",
  appId: "1:235045203402:web:442b84e7b4720f33d1f333"
}

let app = null
let db = null

export function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  }
  return { app, db }
}

export function getDb() {
  if (!db) {
    initFirebase()
  }
  return db
}

export const ADMIN_IDS = ["317665879443767306"]




