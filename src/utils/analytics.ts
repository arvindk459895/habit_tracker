import { logEvent } from 'firebase/analytics';
import { analytics } from '../lib/firebase';

export type AnalyticsEvent =
    | 'habit_created'
    | 'habit_completed'
    | 'habit_skipped'
    | 'habit_archived'
    | 'habit_unarchived'
    | 'habit_deleted'
    | 'task_created'
    | 'task_completed'
    | 'task_deleted'
    | 'feedback_sent';

export const logAnalyticsEvent = (eventName: AnalyticsEvent, params?: Record<string, any>) => {
    try {
        logEvent(analytics, eventName, params);
    } catch (error) {
        console.error('Error logging analytics event:', error);
    }
};
