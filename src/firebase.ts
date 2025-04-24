// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3cTbYctfGet1PryKOCHvYqHvQqXLsJ8M",
  authDomain: "kvitto-ab.firebaseapp.com",
  projectId: "kvitto-ab",
  storageBucket: "kvitto-ab.firebasestorage.app",
  messagingSenderId: "749346089222",
  appId: "1:749346089222:web:8a32a80c2215ec2d01d687",
  measurementId: "G-DCKFDL1TMY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
