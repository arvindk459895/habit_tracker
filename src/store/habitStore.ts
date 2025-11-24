import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Habit, HabitLog } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { logAnalyticsEvent } from '../utils/analytics';
import { migrateStore, MigrationConfig } from '../utils/storeMigration';

interface HabitStore {
    version: number;
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
    isLoading: boolean;
}

// Migration configuration
const CURRENT_VERSION = 1;
const habitStoreMigrations: MigrationConfig<HabitStore> = {
    storeName: 'habit-storage',
    currentVersion: CURRENT_VERSION,
    migrations: [
        {
            version: 1,
            description: 'Add version field to habit store',
            migrate: (data: any) => ({
                ...data,
                version: 1,
                habits: data.habits || [],
                logs: data.logs || {},
                dayNotes: data.dayNotes || {},
                isLoading: false
            })
        }
    ]
};

export const useHabitStore = create<HabitStore>()(
    persist(
        (set, get) => ({
            version: CURRENT_VERSION,
            habits: [],
            logs: {},
            dayNotes: {},
            isLoading: true,

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
                    logAnalyticsEvent('habit_created', { habit_id: newHabit.id, type: newHabit.type });
                    return newState;
                });
            },

            updateHabit: (id, updates) => {
                set((state) => {
                    const newState = {
                        habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
                    };
                    saveToCloud(newState);
                    if (updates.archived !== undefined) {
                        logAnalyticsEvent(updates.archived ? 'habit_archived' : 'habit_unarchived', { habit_id: id });
                    }
                    return newState;
                });
            },

            deleteHabit: (id) => {
                set((state) => {
                    const newState = {
                        habits: state.habits.filter((h) => h.id !== id),
                    };
                    saveToCloud(newState);
                    logAnalyticsEvent('habit_deleted', { habit_id: id });
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

                    if (!existingLog || !existingLog.completed) {
                        logAnalyticsEvent('habit_completed', { habit_id: habitId, date });
                    }

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
                    logAnalyticsEvent('habit_skipped', { habit_id: habitId, date });
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
                set({ isLoading: true });
                const user = auth.currentUser;
                if (!user) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const cloudData = docSnap.data();
                        const localState = get();

                        // Merge Habits
                        const cloudHabits = (cloudData.habits || []) as Habit[];
                        const localHabits = localState.habits;

                        // Create a map of habits by ID
                        const habitMap = new Map<string, Habit>();

                        // Add local habits first
                        localHabits.forEach(h => habitMap.set(h.id, h));

                        // Add/Overwrite with cloud habits (Cloud is source of truth for existing items)
                        // BUT if we want to preserve "newly created local habits that failed to sync", 
                        // we should only overwrite if the cloud version is "newer" or if we accept cloud as truth.
                        // Given the "deletion" bug, it's likely cloud is empty/stale. 
                        // Let's use a Union: Keep everything. If ID exists in both, use Cloud (assuming it might have updates from other devices),
                        // UNLESS Cloud is missing it, then keep Local.
                        cloudHabits.forEach(h => habitMap.set(h.id, h));

                        // Merge Logs
                        const mergedLogs = { ...localState.logs, ...(cloudData.logs || {}) };

                        // Merge DayNotes
                        const mergedDayNotes = { ...localState.dayNotes, ...(cloudData.dayNotes || {}) };

                        set({
                            habits: Array.from(habitMap.values()),
                            logs: mergedLogs,
                            dayNotes: mergedDayNotes,
                            isLoading: false,
                        });
                    } else {
                        // Cloud is empty, push local state
                        const state = get();
                        await setDoc(docRef, {
                            habits: state.habits,
                            logs: state.logs,
                            dayNotes: state.dayNotes,
                        });
                        set({ isLoading: false });
                    }
                } catch (error) {
                    console.error("Error syncing with cloud:", error);
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: 'habit-storage',
            version: CURRENT_VERSION,
            migrate: (persistedState: any) => {
                return migrateStore(habitStoreMigrations, persistedState) || persistedState;
            }
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
