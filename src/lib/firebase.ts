import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDiIjP1W40qB9wVpajihvqXWPp5H31MX1g",
  authDomain: "seba-digital-oms.firebaseapp.com",
  projectId: "seba-digital-oms",
  storageBucket: "seba-digital-oms.firebasestorage.app",
  messagingSenderId: "1087671043620",
  appId: "1:1087671043620:web:01fe0c3ed56d1daf3a7ab1",
  measurementId: "G-M6E7BWTW9H"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
