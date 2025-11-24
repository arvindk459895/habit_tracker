import { HabitLog } from '../types';
import { subDays, format, differenceInCalendarDays, parseISO, addDays } from 'date-fns';

/**
 * Check if a date is frozen (vacation mode)
 */
const isDateFrozen = (dateStr: string, frozenDates?: string[]): boolean => {
    return frozenDates ? frozenDates.includes(dateStr) : false;
};

/**
 * Calculate current streak, skipping frozen dates
 */
export const calculateStreak = (
    logs: Record<string, HabitLog>,
    habitId: string,
    currentDate: Date = new Date(),
    frozenDates?: string[]
): number => {
    let streak = 0;
    let checkDate = currentDate;

    const todayStr = format(currentDate, 'yyyy-MM-dd');
    const todayLog = logs[`${habitId}-${todayStr}`];

    // If today is frozen, treat as completed
    const todayFrozen = isDateFrozen(todayStr, frozenDates);

    if (todayLog?.completed || todayFrozen) {
        streak++;
        checkDate = subDays(checkDate, 1);
    } else {
        // If today not done or frozen, check yesterday
        checkDate = subDays(checkDate, 1);
        const yesterdayStr = format(checkDate, 'yyyy-MM-dd');
        const yesterdayLog = logs[`${habitId}-${yesterdayStr}`];
        const yesterdayFrozen = isDateFrozen(yesterdayStr, frozenDates);

        if (!yesterdayLog?.completed && !yesterdayFrozen) {
            return 0;
        }
    }

    // Count backwards, treating frozen dates as completed
    while (true) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const log = logs[`${habitId}-${dateStr}`];
        const frozen = isDateFrozen(dateStr, frozenDates);

        if (log?.completed || frozen) {
            streak++;
            checkDate = subDays(checkDate, 1);
        } else {
            break;
        }
    }

    return streak;
};

/**
 * Calculate best streak ever, accounting for frozen dates
 */
export const calculateBestStreak = (
    logs: Record<string, HabitLog>,
    habitId: string,
    frozenDates?: string[]
): number => {
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
            // Consecutive days
            currentStreak++;
        } else if (diff > 1) {
            // Check if gap is filled with frozen dates
            let allFrozen = true;
            for (let d = 1; d < diff; d++) {
                const checkDate = addDays(prevDate, d);
                const checkDateStr = format(checkDate, 'yyyy-MM-dd');
                if (!isDateFrozen(checkDateStr, frozenDates)) {
                    allFrozen = false;
                    break;
                }
            }

            if (allFrozen) {
                // Gap is all frozen, continue streak
                currentStreak++;
            } else {
                // Gap has non-frozen days, streak broken
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }
    }

    return Math.max(maxStreak, currentStreak);
};
