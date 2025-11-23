import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    date: string; // YYYY-MM-DD
    createdAt: string;
}

interface TaskStore {
    tasks: Task[];
    addTask: (text: string, date: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    syncWithCloud: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            tasks: [],

            addTask: (text, date) => {
                const newTask: Task = {
                    id: uuidv4(),
                    text,
                    completed: false,
                    date,
                    createdAt: new Date().toISOString(),
                };
                set((state) => {
                    const newState = { tasks: [...state.tasks, newTask] };
                    saveToCloud(newState);
                    return newState;
                });
            },

            toggleTask: (id) => {
                set((state) => {
                    const newState = {
                        tasks: state.tasks.map((t) =>
                            t.id === id ? { ...t, completed: !t.completed } : t
                        ),
                    };
                    saveToCloud(newState);
                    return newState;
                });
            },

            deleteTask: (id) => {
                set((state) => {
                    const newState = {
                        tasks: state.tasks.filter((t) => t.id !== id),
                    };
                    saveToCloud(newState);
                    return newState;
                });
            },

            syncWithCloud: async () => {
                const user = auth.currentUser;
                if (!user) return;

                try {
                    const docRef = doc(db, 'users', user.uid, 'data', 'tasks');
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        set({ tasks: data.tasks || [] });
                    } else {
                        const state = get();
                        await setDoc(docRef, { tasks: state.tasks });
                    }
                } catch (error) {
                    console.error("Error syncing tasks:", error);
                }
            }
        }),
        {
            name: 'task-storage',
        }
    )
);

const saveToCloud = async (partialState: Partial<TaskStore>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const docRef = doc(db, 'users', user.uid, 'data', 'tasks');
        await setDoc(docRef, partialState, { merge: true });
    } catch (error) {
        console.error("Error saving tasks:", error);
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        useTaskStore.getState().syncWithCloud();
    }
});
