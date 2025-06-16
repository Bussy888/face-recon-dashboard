// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'; // Usa los métodos modulares
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeT_t8Zsra2KJaoCr0Br0xAA_VrwjyNjs",
  authDomain: "socios-circulo.firebaseapp.com",
  projectId: "socios-circulo",
  storageBucket: "socios-circulo.firebasestorage.app",
  messagingSenderId: "665590696654",
  appId: "1:665590696654:web:1af019d94504f371bcde9f",
  measurementId: "G-7FZWMDNK5Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };