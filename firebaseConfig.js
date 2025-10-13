import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHcGmnk3dg8riup3mdun7MKjEvXuNaWCg",
  authDomain: "expo-back2u.firebaseapp.com",
  databaseURL: "https://expo-back2u-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "expo-back2u",
  storageBucket: "expo-back2u.firebasestorage.app",
  messagingSenderId: "1070419092107",
  appId: "1:1070419092107:web:bb9a026e869944a644aa8e",
  measurementId: "G-KWMWLNZ223"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;