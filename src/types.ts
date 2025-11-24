export type HabitType = 'checkbox' | 'time' | 'amount';
export type HabitFrequency = 'daily' | 'weekly' | 'interval';

export interface Habit {
    id: string;
    name: string;
    emoji: string;
    icon?: string;
    type: HabitType;
    goal?: number; // For time/amount types
    unit?: string; // e.g., 'mins', 'ml', 'pages'
    color: string;
    createdAt: string;
    archived: boolean;
    frequency: HabitFrequency;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
    interval: number; // Days between repetitions (for 'interval' frequency)
    endDate?: string;
    strength: number; // 0-100
    category?: string;
}

export interface HabitLog {
    habitId: string;
    date: string; // ISO date string YYYY-MM-DD
    value: number; // 1 for checkbox, or actual value for time/amount
    completed: boolean; // Derived from value >= goal
    status?: 'completed' | 'skipped' | 'failed';
}

export interface DayNote {
    date: string; // YYYY-MM-DD
    note: string;
}

export interface HabitStore {
    habits: Habit[];
    logs: Record<string, HabitLog>; // Key: `${habitId}-${date}`
    dayNotes: Record<string, string>; // Key: date

    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    toggleHabit: (habitId: string, date: string) => void;
    logHabitValue: (habitId: string, date: string, value: number) => void;
    setDayNote: (date: string, note: string) => void;
}

export interface LeaderboardEntry {
    userId: string;
    userName: string;
    userAvatar?: string;
    score: number;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    habitType: string;
    startDate: string;
    endDate: string;
    participants: string[];
    leaderboard: LeaderboardEntry[];
}

export interface Friend {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status: 'pending' | 'accepted';
}
