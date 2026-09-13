import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBd3mEj2VBkfX6gVh5XbjPohsN1FwC2WeA",
  authDomain: "unicafemockapp.firebaseapp.com",
  projectId: "unicafemockapp",
  storageBucket: "unicafemockapp.firebasestorage.app",
  messagingSenderId: "314711711007",
  appId: "1:314711711007:web:33856379a479ccf8d4242a",
  measurementId: "G-C3ELSVBVP4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
