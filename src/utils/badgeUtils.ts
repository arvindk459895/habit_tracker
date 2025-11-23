import { Habit, HabitLog } from '../types';
import { calculateStreak, calculateBestStreak } from './streakUtils';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (habits: Habit[], logs: Record<string, HabitLog>) => boolean;
}

export const BADGES: Badge[] = [
    {
        id: 'first-step',
        name: 'First Step',
        description: 'Complete your first habit',
        icon: '🎯',
        condition: (_, logs) => Object.values(logs).some(log => log.completed),
    },
    {
        id: 'on-fire',
        name: 'On Fire',
        description: 'Reach a 3-day streak',
        icon: '🔥',
        condition: (habits, logs) => habits.some(habit => calculateBestStreak(logs, habit.id) >= 3),
    },
    {
        id: '7-day-streak',
        name: 'Week Warrior',
        description: 'Reach a 7-day streak',
        icon: '⭐',
        condition: (habits, logs) => habits.some(habit => calculateBestStreak(logs, habit.id) >= 7),
    },
    {
        id: 'consistency',
        name: 'Consistent',
        description: 'Reach a 30-day streak',
        icon: '💎',
        condition: (habits, logs) => habits.some(habit => calculateBestStreak(logs, habit.id) >= 30),
    },
    {
        id: 'habit-master',
        name: 'Habit Master',
        description: 'Complete habits 100 times',
        icon: '👑',
        condition: (_, logs) => Object.values(logs).filter(log => log.completed).length >= 100,
    },
    {
        id: 'multi-tasker',
        name: 'Multi-Tasker',
        description: 'Maintain streaks on 3 habits',
        icon: '🤹',
        condition: (habits, logs) => habits.filter(habit => calculateStreak(logs, habit.id) >= 3).length >= 3,
    },
];

export const getEarnedBadges = (habits: Habit[], logs: Record<string, HabitLog>): string[] => {
    return BADGES.filter(badge => badge.condition(habits, logs)).map(badge => badge.id);
};
