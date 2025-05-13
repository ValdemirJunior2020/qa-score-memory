// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3_slXHmS1UvN34uzp7acQdqUT576Oj38",
  authDomain: "recipe-6b435.firebaseapp.com",
  projectId: "recipe-6b435",
  storageBucket: "recipe-6b435.appspot.com",
  messagingSenderId: "770810066460",
  appId: "1:770810066460:web:58e523827c92c95bb951d9",
  measurementId: "G-73X637HJGC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
