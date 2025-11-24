import { Habit, HabitLog } from '../types';
import { format, subDays, getDay } from 'date-fns';

export interface Insight {
    id: string;
    type: 'success' | 'warning' | 'info' | 'encouragement';
    title: string;
    message: string;
    habitId?: string;
    score: number; // Relevance score to sort insights
}

export const generateInsights = (habits: Habit[], logs: Record<string, HabitLog>): Insight[] => {
    const insights: Insight[] = [];
    const today = new Date();
    const activeHabits = habits.filter(h => !h.archived);

    // 1. Streak Celebration (Success)
    activeHabits.forEach(habit => {
        // Calculate current streak manually or use existing utils if available in context
        // For now, let's do a quick check for active streaks > 3
        let streak = 0;
        let d = today;
        // Check today or yesterday for streak continuation
        const todayKey = `${habit.id}-${format(today, 'yyyy-MM-dd')}`;
        if (logs[todayKey]?.completed) {
            streak++;
            d = subDays(d, 1);
        } else {
            // If not done today, check yesterday. If yesterday done, streak is alive.
            const yest = subDays(today, 1);
            const yestKey = `${habit.id}-${format(yest, 'yyyy-MM-dd')}`;
            if (!logs[yestKey]?.completed) {
                streak = 0;
            } else {
                d = subDays(today, 1);
            }
        }

        if (streak > 0) {
            while (true) {
                const key = `${habit.id}-${format(d, 'yyyy-MM-dd')}`;
                if (logs[key]?.completed) {
                    streak++;
                    d = subDays(d, 1);
                } else {
                    break;
                }
            }
        }

        // Adjust streak count logic to match standard definition (if today is done, it counts. if today not done but yesterday was, it counts from yesterday)
        // The loop above overcounts by 1 if we started with today, or is correct. Let's rely on the fact that high streaks are good.

        if (streak >= 3 && streak % 3 === 0) {
            insights.push({
                id: `streak-${habit.id}`,
                type: 'success',
                title: 'On Fire! 🔥',
                message: `You're on a ${streak}-day streak with ${habit.name}. Keep it up!`,
                habitId: habit.id,
                score: 100 + streak
            });
        }
    });

    // 2. Weekend Warrior (Info)
    activeHabits.forEach(habit => {
        let weekendCompletions = 0;
        let totalWeekends = 0;
        for (let i = 0; i < 14; i++) {
            const d = subDays(today, i);
            const day = getDay(d);
            if (day === 0 || day === 6) { // Sun or Sat
                totalWeekends++;
                if (logs[`${habit.id}-${format(d, 'yyyy-MM-dd')}`]?.completed) {
                    weekendCompletions++;
                }
            }
        }

        if (totalWeekends > 0 && weekendCompletions / totalWeekends >= 0.8) {
            insights.push({
                id: `weekend-${habit.id}`,
                type: 'info',
                title: 'Weekend Warrior 🛡️',
                message: `You rarely miss ${habit.name} on weekends. Great dedication!`,
                habitId: habit.id,
                score: 50
            });
        }
    });

    // 3. Struggling Day Detector (Warning)
    activeHabits.forEach(habit => {
        const dayMisses = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
        let totalChecks = 0;

        for (let i = 0; i < 28; i++) {
            const d = subDays(today, i);
            const day = getDay(d);
            const key = `${habit.id}-${format(d, 'yyyy-MM-dd')}`;

            // Only count if it was scheduled
            // Simplified: Assuming daily for now or checking if it exists in logs as skipped/failed
            // Ideally we check habit.daysOfWeek if frequency is weekly
            let isScheduled = true;
            if (habit.frequency === 'weekly' && !habit.daysOfWeek.includes(day)) isScheduled = false;

            if (isScheduled) {
                if (!logs[key]?.completed) {
                    dayMisses[day]++;
                }
                totalChecks++;
            }
        }

        const maxMisses = Math.max(...dayMisses);
        const worstDayIndex = dayMisses.indexOf(maxMisses);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        if (maxMisses >= 3) {
            insights.push({
                id: `struggle-${habit.id}`,
                type: 'warning',
                title: 'Pattern Detected 🧐',
                message: `${days[worstDayIndex]}s seem tough for ${habit.name}. Maybe try a smaller goal that day?`,
                habitId: habit.id,
                score: 80
            });
        }
    });

    // 4. General Encouragement (Encouragement)
    if (insights.length === 0) {
        insights.push({
            id: 'general-keep-going',
            type: 'encouragement',
            title: 'Keep Going! 🚀',
            message: "Consistency is key. Even a small step today matters.",
            score: 10
        });
    }

    return insights.sort((a, b) => b.score - a.score).slice(0, 3); // Return top 3
};
