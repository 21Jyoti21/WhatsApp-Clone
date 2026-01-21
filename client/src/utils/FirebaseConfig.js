import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyDgaIBe68IAPoGKW-4OFL9JWwunzHQj3Ic",
  authDomain: "whatsapp-clone-8f82b.firebaseapp.com",
  projectId: "whatsapp-clone-8f82b",
  storageBucket: "whatsapp-clone-8f82b.firebasestorage.app",
  messagingSenderId: "60142417138",
  appId: "1:60142417138:web:9f67692d1451f2931d8c6b",
  measurementId: "G-QBRFR6WXMF"
};
const app = initializeApp(firebaseConfig);
export const firebaseAuth=getAuth(app)