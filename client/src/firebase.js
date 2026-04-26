// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "genweb-ai-a076a.firebaseapp.com",
  projectId: "genweb-ai-a076a",
  storageBucket: "genweb-ai-a076a.firebasestorage.app",
  messagingSenderId: "271327567585",
  appId: "1:271327567585:web:415c4350a5f900e8fd61a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)

const provider=new GoogleAuthProvider()
export {auth,provider}
