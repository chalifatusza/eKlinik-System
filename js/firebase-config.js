// js/firebase-config.js
// ============================================================
// FIREBASE CONFIGURATION — E-Klinik UNESA
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, 
  signInAnonymously 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdWyP7X9r5rM-NRGbQjXc_P0uCst7suCs",
  authDomain: "eklinik-unesa.firebaseapp.com",
  projectId: "eklinik-unesa",
  storageBucket: "eklinik-unesa.firebasestorage.app",
  messagingSenderId: "478294820133",
  appId: "1:478294820133:web:4396a3163436ffe10c46cc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const fbAuth = getAuth(app);

export { 
  db, fbAuth, 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
  query, where, orderBy, limit, onSnapshot, 
  serverTimestamp, Timestamp 
};
