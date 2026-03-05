import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCM09hfTog_9LdnKxDjXpfOwyQpYlEHOaQ",
    authDomain: "surxondaryoyuridikkutubhonasi.firebaseapp.com",
    projectId: "surxondaryoyuridikkutubhonasi",
    storageBucket: "surxondaryoyuridikkutubhonasi.firebasestorage.app",
    messagingSenderId: "1029107483153",
    appId: "1:1029107483153:web:c9eca152e270f3dc6aa7b0",
    measurementId: "G-M8MX3DD8YQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
