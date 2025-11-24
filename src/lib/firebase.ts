import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAhRMGu_0UydWGmJJKTeylPqq1rYWtm-Gs",
    authDomain: "habit-tracker-cb5ff.firebaseapp.com",
    projectId: "habit-tracker-cb5ff",
    storageBucket: "habit-tracker-cb5ff.firebasestorage.app",
    messagingSenderId: "466017067538",
    appId: "1:466017067538:web:8baf542a37a2dcddf0aecb",
    measurementId: "G-XFNZFJ9ZBZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
