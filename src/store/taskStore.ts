import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { logAnalyticsEvent } from '../utils/analytics';
import { migrateStore, MigrationConfig } from '../utils/storeMigration';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    date: string; // YYYY-MM-DD
    createdAt: string;
}

interface TaskStore {
    version: number;
    tasks: Task[];
    addTask: (text: string, date: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    syncWithCloud: () => Promise<void>;
}

// Migration configuration
const CURRENT_VERSION = 1;
const taskStoreMigrations: MigrationConfig<TaskStore> = {
    storeName: 'task-storage',
    currentVersion: CURRENT_VERSION,
    migrations: [
        {
            version: 1,
            description: 'Add version field to task store',
            migrate: (data: any) => ({
                ...data,
                version: 1,
                tasks: data.tasks || []
            })
        }
    ]
};

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            version: CURRENT_VERSION,
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
                    logAnalyticsEvent('task_created', { task_id: newTask.id });
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

                    const task = newState.tasks.find(t => t.id === id);
                    if (task && task.completed) {
                        logAnalyticsEvent('task_completed', { task_id: id });
                    }

                    return newState;
                });
            },

            deleteTask: (id) => {
                set((state) => {
                    const newState = {
                        tasks: state.tasks.filter((t) => t.id !== id),
                    };
                    saveToCloud(newState);
                    logAnalyticsEvent('task_deleted', { task_id: id });
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
                        const cloudData = docSnap.data();
                        const localState = get();

                        const cloudTasks = (cloudData.tasks || []) as Task[];
                        const localTasks = localState.tasks;

                        const taskMap = new Map<string, Task>();

                        // Add local tasks first
                        localTasks.forEach(t => taskMap.set(t.id, t));

                        // Add/Overwrite with cloud tasks
                        cloudTasks.forEach(t => taskMap.set(t.id, t));

                        set({ tasks: Array.from(taskMap.values()) });
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
            version: CURRENT_VERSION,
            migrate: (persistedState: any) => {
                return migrateStore(taskStoreMigrations, persistedState) || persistedState;
            }
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
