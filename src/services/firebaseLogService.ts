import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ActivityLog } from '../store/useActivityStore';

export const syncLogToFirestore = async (log: ActivityLog) => {
    try {
        const user = auth.currentUser;
        if (!user) return; // Only log if user is authenticated

        const logEntry = {
            ...log,
            userId: user.uid,
            userEmail: user.email,
            syncedAt: Date.now()
        };

        await addDoc(collection(db, 'activity_logs'), logEntry);
    } catch (error) {
        console.error("Error syncing log to Firestore:", error);
    }
};
