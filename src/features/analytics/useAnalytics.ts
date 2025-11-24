import { useHabitStore } from '../../store/habitStore';
import { calculateStreak, calculateBestStreak } from '../../utils/streakUtils';
import { format, subDays, startOfDay } from 'date-fns';

export const useAnalytics = () => {
    const { habits, logs, dayNotes } = useHabitStore();

    // 1. Calculate Overall Stats
    const activeHabits = habits.filter(h => !h.archived).length;

    let totalCompletions = 0;
    let bestStreakAllTime = 0;
    let bestCurrentStreak = 0;

    habits.forEach(habit => {
        const current = calculateStreak(logs, habit.id, new Date(), habit.frozenDates);
        const best = calculateBestStreak(logs, habit.id, habit.frozenDates);

        bestCurrentStreak = Math.max(bestCurrentStreak, current);
        bestStreakAllTime = Math.max(bestStreakAllTime, best);

        // Count completions
        Object.values(logs).forEach(log => {
            if (log.habitId === habit.id && log.completed) {
                totalCompletions++;
            }
        });
    });

    // 2. Prepare Chart Data (Last 7 Days)
    const chartData = [];
    const today = startOfDay(new Date());

    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayName = format(date, 'EEE'); // Mon, Tue...

        let completedCount = 0;
        habits.filter(h => !h.archived).forEach(habit => {
            const log = logs[`${habit.id}-${dateStr}`];
            if (log?.completed) completedCount++;
        });

        chartData.push({
            name: dayName,
            completed: completedCount,
            total: activeHabits,
        });
    }

    // 4. Advanced Analytics

    // Calculate total time/amount
    let totalTimeSpent = 0; // in minutes
    let totalAmount = 0; // generic unit

    // Note Correlation
    const noteCorrelationData: { noteLength: number; completionCount: number }[] = [];

    Object.entries(dayNotes).forEach(([date, note]) => {
        let dailyCompletions = 0;
        habits.forEach(h => {
            if (logs[`${h.id}-${date}`]?.completed) dailyCompletions++;
        });
        noteCorrelationData.push({ noteLength: note.length, completionCount: dailyCompletions });
    });

    // Detailed Habit Stats
    const detailedHabitStats = habits.filter(h => !h.archived).map(habit => {
        const currentStreak = calculateStreak(logs, habit.id, new Date(), habit.frozenDates);
        const bestStreak = calculateBestStreak(logs, habit.id, habit.frozenDates);

        // Calculate interruptions (days where streak broke)
        // Simple logic: if yesterday was completed but today isn't (and it's not today yet), or gaps in history
        // For MVP, let's count "missed days" in the last 30 days
        let missedDays30d = 0;
        let completions30d = 0;
        let totalValue30d = 0;

        for (let i = 0; i < 30; i++) {
            const d = subDays(today, i);
            const dStr = format(d, 'yyyy-MM-dd');
            const log = logs[`${habit.id}-${dStr}`];

            if (log?.completed) {
                completions30d++;
                totalValue30d += log.value || 0;
            } else {
                // Check if it was a scheduled day
                const dayOfWeek = parseInt(format(d, 'i')) % 7; // 0-6
                if (habit.daysOfWeek.includes(dayOfWeek)) {
                    missedDays30d++;
                }
            }
        }

        const completionRate = Math.round((completions30d / (completions30d + missedDays30d || 1)) * 100);

        if (habit.type === 'time') totalTimeSpent += totalValue30d;
        else if (habit.type === 'amount') totalAmount += totalValue30d;

        return {
            ...habit,
            currentStreak,
            bestStreak,
            completionRate,
            missedDays30d,
            totalValue30d
        };
    }).sort((a, b) => b.completionRate - a.completionRate);

    return {
        activeHabits,
        totalCompletions,
        bestStreakAllTime,
        bestCurrentStreak,
        chartData,
        habitPerformance: detailedHabitStats,
        totalTimeSpent,
        totalAmount,
        noteCorrelationData
    };
};
