// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyACuMLB0-uq8G604Fk0W2rXr3yqY8_SM9E",
  authDomain: "link-shortener-37148.firebaseapp.com",
  projectId: "link-shortener-37148",
  storageBucket: "link-shortener-37148.appspot.com",
  messagingSenderId: "736642322529",
  appId: "1:736642322529:web:4e451ec543a66ab4a39a20",
  measurementId: "G-L79DVWGXY3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, updateProfile, serverTimestamp, storage };
