import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncLogToFirestore } from '../services/firebaseLogService';

export interface ActivityLog {
    id: string;
    timestamp: number;
    type: 'ACTION' | 'VIEW' | 'SYSTEM' | 'ERROR';
    category: string;
    action: string;
    details?: any;
    metadata?: {
        ip?: string;
        city?: string;
        region?: string;
        country?: string;
        userAgent?: string;
    };
}

interface ActivityStore {
    logs: ActivityLog[];
    logActivity: (
        type: ActivityLog['type'],
        category: string,
        action: string,
        details?: any,
        metadata?: ActivityLog['metadata']
    ) => void;
    clearLogs: () => void;
    exportLogs: () => string;
}

export const useActivityStore = create<ActivityStore>()(
    persist(
        (set, get) => ({
            logs: [],
            logActivity: (type, category, action, details, metadata) => {
                const newLog: ActivityLog = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    type,
                    category,
                    action,
                    details,
                    metadata,
                };
                // Sync to Firestore
                syncLogToFirestore(newLog);

                set((state) => ({
                    logs: [newLog, ...state.logs].slice(0, 1000), // Keep last 1000 logs
                }));
                // Optional: Console log for dev debugging
                // console.log(`[Activity] ${type} - ${category}: ${action}`, details);
            },
            clearLogs: () => set({ logs: [] }),
            exportLogs: () => JSON.stringify(get().logs, null, 2),
        }),
        {
            name: 'activity-logs',
        }
    )
);
