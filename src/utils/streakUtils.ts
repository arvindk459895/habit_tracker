import { HabitLog } from '../types';
import { subDays, format, differenceInCalendarDays, parseISO } from 'date-fns';

export const calculateStreak = (logs: Record<string, HabitLog>, habitId: string, currentDate: Date = new Date()): number => {
    let streak = 0;
    let checkDate = currentDate;

    // Check if today is completed (or yesterday if today is not yet logged/completed)
    // Actually, for streak, if today is not done, we check yesterday.
    // If today is done, streak includes today.

    const todayStr = format(currentDate, 'yyyy-MM-dd');
    const todayLog = logs[`${habitId}-${todayStr}`];

    if (todayLog?.completed) {
        streak++;
        checkDate = subDays(checkDate, 1);
    } else {
        // If today not done, check yesterday. If yesterday not done, streak is 0.
        checkDate = subDays(checkDate, 1);
        const yesterdayStr = format(checkDate, 'yyyy-MM-dd');
        const yesterdayLog = logs[`${habitId}-${yesterdayStr}`];
        if (!yesterdayLog?.completed) {
            return 0;
        }
    }

    // Count backwards
    while (true) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const log = logs[`${habitId}-${dateStr}`];
        if (log?.completed) {
            streak++;
            checkDate = subDays(checkDate, 1);
        } else {
            break;
        }
    }

    return streak;
};

export const calculateBestStreak = (logs: Record<string, HabitLog>, habitId: string): number => {
    const habitLogs = Object.values(logs)
        .filter(log => log.habitId === habitId && log.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (habitLogs.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < habitLogs.length; i++) {
        const prevDate = parseISO(habitLogs[i - 1].date);
        const currDate = parseISO(habitLogs[i].date);

        const diff = differenceInCalendarDays(currDate, prevDate);

        if (diff === 1) {
            currentStreak++;
        } else if (diff > 1) {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
        }
    }

    return Math.max(maxStreak, currentStreak);
};
