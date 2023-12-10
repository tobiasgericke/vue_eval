// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkX8_lxJwmZ-kp3vKHxz7e7JnEWT9YA18",
  authDomain: "bachelor-tobias.firebaseapp.com",
  projectId: "bachelor-tobias",
  storageBucket: "bachelor-tobias.appspot.com",
  messagingSenderId: "45304260807",
  appId: "1:45304260807:web:f616e423e9f2b93e0d76e2",
  measurementId: "G-N37HE9QYCJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore()

export { db };