import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncLogToFirestore } from '../services/firebaseLogService';

export interface ActivityLog {
    id: string;
    timestamp: number;
    sessionId: string;
    type: 'ACTION' | 'VIEW' | 'SYSTEM' | 'ERROR' | 'NAVIGATION' | 'PERFORMANCE';
    category: string;
    action: string;
    details?: any;
    metadata?: {
        // User context
        userId?: string;
        userEmail?: string;

        // Session info
        sessionDuration?: number;

        // Device/Browser info
        userAgent?: string;
        platform?: string;
        screenWidth?: number;
        screenHeight?: number;
        deviceType?: 'mobile' | 'tablet' | 'desktop';
        isMobile?: boolean;
        isTablet?: boolean;

        // Location (from existing implementation)
        ip?: string;
        city?: string;
        region?: string;
        country?: string;

        // Performance metrics
        pageLoadTime?: number;
        renderTime?: number;
        memoryUsage?: number;

        // Navigation
        previousPage?: string;
        currentPage?: string;
        referrer?: string;

        // Network
        connectionType?: string;
        onlineStatus?: boolean;
    };
}

interface SessionInfo {
    sessionId: string;
    startTime: number;
    lastActivityTime: number;
}

interface ActivityStore {
    logs: ActivityLog[];
    session: SessionInfo | null;
    logActivity: (
        type: ActivityLog['type'],
        category: string,
        action: string,
        details?: any,
        metadata?: ActivityLog['metadata']
    ) => void;
    clearLogs: () => void;
    exportLogs: () => string;
    startSession: () => void;
    endSession: () => void;
}

// Helper to detect device type
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

// Helper to get device/browser metadata
const getDeviceMetadata = () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    deviceType: getDeviceType(),
    isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
    isTablet: /Tablet|iPad/i.test(navigator.userAgent),
    onlineStatus: navigator.onLine,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    memoryUsage: (performance as any).memory?.usedJSHeapSize,
});

// Generate session ID
const generateSessionId = () => `session_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

export const useActivityStore = create<ActivityStore>()(
    persist(
        (set, get) => ({
            logs: [],
            session: null,

            startSession: () => {
                const sessionId = generateSessionId();
                const sessionInfo: SessionInfo = {
                    sessionId,
                    startTime: Date.now(),
                    lastActivityTime: Date.now(),
                };

                set({ session: sessionInfo });

                // Log session start
                get().logActivity('SYSTEM', 'SESSION', 'SESSION_START', {
                    sessionId,
                    timestamp: sessionInfo.startTime,
                });
            },

            endSession: () => {
                const session = get().session;
                if (session) {
                    const duration = Date.now() - session.startTime;
                    get().logActivity('SYSTEM', 'SESSION', 'SESSION_END', {
                        sessionId: session.sessionId,
                        duration,
                        timestamp: Date.now(),
                    });
                    set({ session: null });
                }
            },

            logActivity: (type, category, action, details, metadata) => {
                const state = get();
                let session = state.session;

                // Auto-start session if not exists
                if (!session) {
                    const sessionId = generateSessionId();
                    session = {
                        sessionId,
                        startTime: Date.now(),
                        lastActivityTime: Date.now(),
                    };
                    set({ session });
                }

                // Update last activity time
                set({
                    session: {
                        ...session,
                        lastActivityTime: Date.now(),
                    },
                });

                const sessionDuration = Date.now() - session.startTime;
                const deviceMetadata = getDeviceMetadata();

                const newLog: ActivityLog = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    sessionId: session.sessionId,
                    type,
                    category,
                    action,
                    details,
                    metadata: {
                        ...deviceMetadata,
                        sessionDuration,
                        currentPage: window.location.pathname,
                        referrer: document.referrer,
                        ...metadata,
                    },
                };

                // Sync to Firestore
                syncLogToFirestore(newLog);

                set((state) => ({
                    logs: [newLog, ...state.logs].slice(0, 1000), // Keep last 1000 logs
                }));

                // Console log for dev debugging
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Activity] ${type} - ${category}: ${action}`, details);
                }
            },

            clearLogs: () => set({ logs: [] }),
            exportLogs: () => JSON.stringify(get().logs, null, 2),
        }),
        {
            name: 'activity-logs',
        }
    )
);

// Auto-end session on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        useActivityStore.getState().endSession();
    });

    // Auto-start session on load
    useActivityStore.getState().startSession();
}
