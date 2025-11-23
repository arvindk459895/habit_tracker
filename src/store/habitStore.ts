import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Habit, HabitLog } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface HabitStore {
    habits: Habit[];
    logs: Record<string, HabitLog>;
    dayNotes: Record<string, string>;
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'frequency' | 'daysOfWeek' | 'interval' | 'strength'> & Partial<Pick<Habit, 'frequency' | 'daysOfWeek' | 'interval' | 'strength'>>) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    toggleHabit: (habitId: string, date: string) => void;
    skipHabit: (habitId: string, date: string) => void;
    logHabitValue: (habitId: string, date: string, value: number) => void;
    setDayNote: (date: string, note: string) => void;
    syncWithCloud: () => Promise<void>;
}

export const useHabitStore = create<HabitStore>()(
    persist(
        (set, get) => ({
            habits: [],
            logs: {},
            dayNotes: {},

            addHabit: (habitData) => {
                const newHabit: Habit = {
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    archived: false,
                    frequency: 'daily',
                    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                    interval: 1,
                    strength: 0,
                    ...habitData,
                };
                set((state) => {
                    const newState = { habits: [...state.habits, newHabit] };
                    saveToCloud(newState);
                    return newState;
                });
            },

            updateHabit: (id, updates) => {
                set((state) => {
                    const newState = {
                        habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
                    };
                    saveToCloud(newState);
                    return newState;
                });
            },

            deleteHabit: (id) => {
                set((state) => {
                    const newState = {
                        habits: state.habits.filter((h) => h.id !== id),
                    };
                    saveToCloud(newState);
                    return newState;
                });
            },

            toggleHabit: (habitId, date) => {
                set((state) => {
                    const key = `${habitId}-${date}`;
                    const existingLog = state.logs[key];
                    const newLogs = { ...state.logs };
                    const habit = state.habits.find(h => h.id === habitId);
                    let newStrength = habit?.strength || 0;

                    if (existingLog) {
                        if (existingLog.completed) {
                            delete newLogs[key];
                            // Revert strength (approximate)
                            newStrength = Math.max(0, (newStrength - 10) / 0.9);
                        } else {
                            // Was skipped or failed, now completed
                            newLogs[key] = { ...existingLog, completed: true, status: 'completed' as const, value: 1 };
                            newStrength = newStrength * 0.9 + 10;
                        }
                    } else {
                        newLogs[key] = {
                            habitId,
                            date,
                            completed: true,
                            status: 'completed' as const,
                            value: 1,
                        };
                        newStrength = newStrength * 0.9 + 10;
                    }

                    const newHabits = state.habits.map(h =>
                        h.id === habitId ? { ...h, strength: Math.min(100, newStrength) } : h
                    );

                    const newState = { logs: newLogs, habits: newHabits };
                    saveToCloud(newState);
                    return newState;
                });
            },

            skipHabit: (habitId, date) => {
                set((state) => {
                    const key = `${habitId}-${date}`;
                    const newLogs = {
                        ...state.logs,
                        [key]: {
                            habitId,
                            date,
                            completed: false,
                            status: 'skipped' as const,
                            value: 0,
                        },
                    };
                    // Skipping doesn't change strength
                    const newState = { logs: newLogs };
                    saveToCloud(newState);
                    return newState;
                });
            },

            logHabitValue: (habitId, date, value) => {
                set((state) => {
                    const key = `${habitId}-${date}`;
                    const newLogs = {
                        ...state.logs,
                        [key]: {
                            habitId,
                            date,
                            completed: true,
                            value,
                        },
                    };
                    const newState = { logs: newLogs };
                    saveToCloud(newState);
                    return newState;
                });
            },

            setDayNote: (date, note) => {
                set((state) => {
                    const newDayNotes = { ...state.dayNotes, [date]: note };
                    if (!note) delete newDayNotes[date];

                    const newState = { dayNotes: newDayNotes };
                    saveToCloud(newState);
                    return newState;
                });
            },

            syncWithCloud: async () => {
                const user = auth.currentUser;
                if (!user) return;

                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Merge strategy: Cloud wins for simplicity in this MVP
                        set({
                            habits: data.habits || [],
                            logs: data.logs || {},
                            dayNotes: data.dayNotes || {},
                        });
                    } else {
                        // If no cloud data, save local data to cloud
                        const state = get();
                        await setDoc(docRef, {
                            habits: state.habits,
                            logs: state.logs,
                            dayNotes: state.dayNotes,
                        });
                    }
                } catch (error) {
                    console.error("Error syncing with cloud:", error);
                }
            }
        }),
        {
            name: 'habit-storage',
        }
    )
);

// Helper to save to cloud
const saveToCloud = async (partialState: Partial<HabitStore>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, partialState, { merge: true });
    } catch (error) {
        console.error("Error saving to cloud:", error);
    }
};

// Listen for auth changes to trigger sync
onAuthStateChanged(auth, (user) => {
    if (user) {
        useHabitStore.getState().syncWithCloud();
    }
});
