import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log('Persistence not supported');
    }
});
export const analytics = getAnalytics(app);
