// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUVv6ouQqHFlf8--fXltNRYuvkJzlyZHw",
    authDomain: "jewelryuploads.firebaseapp.com",
    projectId: "jewelryuploads",
    storageBucket: "jewelryuploads.firebasestorage.app",
    messagingSenderId: "459716209890",
    appId: "1:459716209890:web:e7a5dbc2686330319d02bb",
    measurementId: "G-6X57JTRDSV"
};

// Initialize Firebase - check if already initialized
let app;
const existingApps = getApps();
if (existingApps.length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = existingApps[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
