// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQ2Ly1EHHpgUCHIMEsVRiSuyYxBrEa8dg",
  authDomain: "fitty-af564.firebaseapp.com",
  projectId: "fitty-af564",
  storageBucket: "fitty-af564.appspot.com",
  messagingSenderId: "594001481986",
  appId: "1:594001481986:web:dccb3e8f2f9ba637e1321b",
  measurementId: "G-TW8XWBRCMB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and export it
const auth = getAuth(app);

export { auth };
