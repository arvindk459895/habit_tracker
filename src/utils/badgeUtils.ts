import { Habit, HabitLog } from '../types';
import { calculateStreak, calculateBestStreak } from './streakUtils';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
    condition: (habits: Habit[], logs: Record<string, HabitLog>) => boolean;
}



export const BADGES: Badge[] = [
    // Starter Badges
    {
        id: 'first-step',
        name: 'First Step',
        description: 'Complete your first habit',
        icon: '🎯',
        tier: 'bronze',
        condition: (_, logs) => Object.values(logs).some(log => log.completed),
    },

    // Streak Badges
    {
        id: 'on-fire',
        name: 'On Fire',
        description: 'Reach a 3-day streak',
        icon: '🔥',
        tier: 'bronze',
        condition: (habits, logs) => habits.some(habit => calculateBestStreak(logs, habit.id) >= 3),
    },
    {
        id: '7-day-streak',
        name: 'Week Warrior',
        description: 'Reach a 7-day streak',
        icon: '⭐',
        tier: 'silver',
        condition: (habits, logs) => habits.some(habit => calculateBestStreak(logs, habit.id) >= 7),
    },
    {
        id: 'consistency',
        name: 'Consistent',
        description: 'Reach a 30-day streak',
        icon: '💎',
        tier: 'gold',
        condition: (habits, logs) => habits.some(habit => calculateBestStreak(logs, habit.id) >= 30),
    },
    {
        id: 'consistency-king',
        name: 'Consistency King',
        description: 'Reach a 90-day streak with no missed days',
        icon: '👑',
        tier: 'platinum',
        condition: (habits, logs) => habits.some(habit => calculateBestStreak(logs, habit.id) >= 90),
    },
    {
        id: 'century',
        name: 'Century',
        description: 'Reach a 100-day streak',
        icon: '💯',
        tier: 'platinum',
        condition: (habits, logs) => habits.some(habit => calculateBestStreak(logs, habit.id) >= 100),
    },

    // Milestone Badges
    {
        id: 'habit-master',
        name: 'Habit Master',
        description: 'Complete habits 100 times',
        icon: '🏆',
        tier: 'gold',
        condition: (_, logs) => Object.values(logs).filter(log => log.completed).length >= 100,
    },
    {
        id: 'milestone-500',
        name: 'Milestone Master',
        description: 'Complete habits 500 times',
        icon: '🎖️',
        tier: 'platinum',
        condition: (_, logs) => Object.values(logs).filter(log => log.completed).length >= 500,
    },
    {
        id: 'milestone-1000',
        name: 'Legendary',
        description: 'Complete habits 1000 times',
        icon: '🌟',
        tier: 'platinum',
        condition: (_, logs) => Object.values(logs).filter(log => log.completed).length >= 1000,
    },

    // Multi-Habit Badges
    {
        id: 'multi-tasker',
        name: 'Multi-Tasker',
        description: 'Maintain streaks on 3 habits',
        icon: '🤹',
        tier: 'silver',
        condition: (habits, logs) => habits.filter(habit => calculateStreak(logs, habit.id) >= 3).length >= 3,
    },
    {
        id: 'juggler',
        name: 'Master Juggler',
        description: 'Maintain streaks on 5 habits',
        icon: '🎪',
        tier: 'gold',
        condition: (habits, logs) => habits.filter(habit => calculateStreak(logs, habit.id) >= 7).length >= 5,
    },

    // Perfect Week Badge
    {
        id: 'perfect-week',
        name: 'Perfect Week',
        description: '100% completion for any week',
        icon: '✨',
        tier: 'gold',
        condition: (habits, logs) => {
            // Check if any 7-day period has 100% completion
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const startDate = new Date(today);
                startDate.setDate(startDate.getDate() - i - 6);
                const endDate = new Date(today);
                endDate.setDate(endDate.getDate() - i);

                let totalExpected = 0;
                let totalCompleted = 0;

                habits.forEach(habit => {
                    for (let d = 0; d < 7; d++) {
                        const checkDate = new Date(startDate);
                        checkDate.setDate(checkDate.getDate() + d);
                        const dateStr = checkDate.toISOString().split('T')[0];
                        const key = `${habit.id}-${dateStr}`;

                        totalExpected++;
                        if (logs[key]?.completed) totalCompleted++;
                    }
                });

                if (totalExpected > 0 && totalCompleted === totalExpected && totalExpected >= 7) {
                    return true;
                }
            }
            return false;
        },
    },

    // Recovery Badge
    {
        id: 'comeback-kid',
        name: 'Comeback Kid',
        description: 'Restart a habit after a 7+ day break',
        icon: '🔄',
        tier: 'bronze',
        condition: (habits, logs) => {
            // Check if any habit was restarted after a break
            for (const habit of habits) {
                const streak = calculateStreak(logs, habit.id);
                if (streak >= 3) {
                    // Check if there was a 7+ day break before this streak

                    const streakStart = new Date();
                    streakStart.setDate(streakStart.getDate() - streak);
                    const beforeStreakDate = new Date(streakStart);
                    beforeStreakDate.setDate(beforeStreakDate.getDate() - 1);

                    let breakDays = 0;
                    for (let i = 0; i < 14; i++) {
                        const checkDate = new Date(beforeStreakDate);
                        checkDate.setDate(checkDate.getDate() - i);
                        const dateStr = checkDate.toISOString().split('T')[0];
                        const key = `${habit.id}-${dateStr}`;

                        if (!logs[key]?.completed) {
                            breakDays++;
                        } else {
                            break;
                        }
                    }

                    if (breakDays >= 7) return true;
                }
            }
            return false;
        },
    },
];

export const getEarnedBadges = (habits: Habit[], logs: Record<string, HabitLog>): string[] => {
    return BADGES.filter(badge => badge.condition(habits, logs)).map(badge => badge.id);
};

export const getBadgeByTier = (tier: 'bronze' | 'silver' | 'gold' | 'platinum'): Badge[] => {
    return BADGES.filter(badge => badge.tier === tier);
};
