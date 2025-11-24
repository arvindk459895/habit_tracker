import { HabitType, HabitFrequency } from '../types';

export type TemplateCategory = 'health' | 'productivity' | 'mindfulness' | 'social' | 'chores' | 'learning';

export interface HabitTemplate {
    id: string;
    category: TemplateCategory;
    name: string;
    emoji: string;
    color: string;
    type: HabitType;
    frequency: HabitFrequency;
    daysOfWeek?: number[];
    goal?: number;
    unit?: string;
    description: string;
}

export const habitTemplates: HabitTemplate[] = [
    // Health Templates
    { id: 'morning-exercise', category: 'health', name: 'Morning Exercise', emoji: '🏃', color: '#10b981', type: 'time', frequency: 'daily', goal: 30, unit: 'mins', description: '30 minutes of cardio or workout' },
    { id: 'drink-water', category: 'health', name: 'Drink Water', emoji: '💧', color: '#3b82f6', type: 'amount', frequency: 'daily', goal: 8, unit: 'glasses', description: 'Stay hydrated throughout the day' },
    { id: 'healthy-meal', category: 'health', name: 'Eat Healthy', emoji: '🥗', color: '#10b981', type: 'checkbox', frequency: 'daily', description: 'Have at least one healthy meal' },
    { id: 'sleep-early', category: 'health', name: 'Sleep by 11 PM', emoji: '💤', color: '#8b5cf6', type: 'checkbox', frequency: 'daily', description: 'Get to bed before 11 PM' },
    { id: 'yoga', category: 'health', name: 'Yoga Practice', emoji: '🧘', color: '#ec4899', type: 'time', frequency: 'daily', goal: 20, unit: 'mins', description: 'Daily yoga or stretching' },
    { id: 'walk', category: 'health', name: 'Daily Walk', emoji: '🚶', color: '#10b981', type: 'amount', frequency: 'daily', goal: 10000, unit: 'steps', description: '10,000 steps per day' },

    // Productivity Templates
    { id: 'deep-work', category: 'productivity', name: 'Deep Work', emoji: '💻', color: '#6366f1', type: 'time', frequency: 'weekly', daysOfWeek: [1, 2, 3, 4, 5], goal: 2, unit: 'hours', description: 'Focused work session' },
    { id: 'plan-day', category: 'productivity', name: 'Plan My Day', emoji: '📅', color: '#f59e0b', type: 'checkbox', frequency: 'daily', description: 'Review and plan daily tasks' },
    { id: 'inbox-zero', category: 'productivity', name: 'Inbox Zero', emoji: '📧', color: '#3b82f6', type: 'checkbox', frequency: 'daily', description: 'Clear email inbox' },
    { id: 'no-social-media', category: 'productivity', name: 'Social Media Free', emoji: '📵', color: '#ef4444', type: 'time', frequency: 'daily', goal: 8, unit: 'hours', description: 'Stay off social media' },
    { id: 'learn-skill', category: 'productivity', name: 'Learn New Skill', emoji: '📚', color: '#8b5cf6', type: 'time', frequency: 'daily', goal: 30, unit: 'mins', description: 'Practice a new skill' },

    // Mindfulness Templates
    { id: 'meditation', category: 'mindfulness', name: 'Meditation', emoji: '🧘‍♀️', color: '#8b5cf6', type: 'time', frequency: 'daily', goal: 10, unit: 'mins', description: 'Daily meditation practice' },
    { id: 'gratitude', category: 'mindfulness', name: 'Gratitude Journal', emoji: '🙏', color: '#f59e0b', type: 'checkbox', frequency: 'daily', description: 'Write 3 things you\'re grateful for' },
    { id: 'no-phone-morning', category: 'mindfulness', name: 'Phone-Free Morning', emoji: '📱', color: '#10b981', type: 'time', frequency: 'daily', goal: 1, unit: 'hour', description: 'No phone for first hour after waking' },
    { id: 'nature-time', category: 'mindfulness', name: 'Time in Nature', emoji: '🌳', color: '#10b981', type: 'time', frequency: 'weekly', daysOfWeek: [0, 6], goal: 30, unit: 'mins', description: 'Spend time outdoors' },
    { id: 'journaling', category: 'mindfulness', name: 'Daily Journaling', emoji: '📝', color: '#6366f1', type: 'checkbox', frequency: 'daily', description: 'Write in journal' },

    // Social Templates
    { id: 'call-family', category: 'social', name: 'Call Family', emoji: '📞', color: '#ec4899', type: 'checkbox', frequency: 'weekly', daysOfWeek: [0], description: 'Weekly family check-in' },
    { id: 'quality-time', category: 'social', name: 'Quality Time', emoji: '👨‍👩‍👧‍👦', color: '#f59e0b', type: 'time', frequency: 'daily', goal: 1, unit: 'hour', description: 'Spend quality time with loved ones' },
    { id: 'reach-out', category: 'social', name: 'Reach Out to Friend', emoji: '💌', color: '#ec4899', type: 'checkbox', frequency: 'weekly', daysOfWeek: [1, 4], description: 'Connect with a friend' },
    { id: 'no-arguing', category: 'social', name: 'Practice Kindness', emoji: '🤝', color: '#10b981', type: 'checkbox', frequency: 'daily', description: 'Respond with kindness and patience' },

    // Chores Templates
    { id: 'make-bed', category: 'chores', name: 'Make Bed', emoji: '🛏️', color: '#64748b', type: 'checkbox', frequency: 'daily', description: 'Make bed every morning' },
    { id: 'clean-kitchen', category: 'chores', name: 'Clean Kitchen', emoji: '🧹', color: '#14b8a6', type: 'checkbox', frequency: 'daily', description: 'Tidy up kitchen before bed' },
    { id: 'laundry', category: 'chores', name: 'Do Laundry', emoji: '🧺', color: '#3b82f6', type: 'checkbox', frequency: 'weekly', daysOfWeek: [6], description: 'Weekly laundry day' },
    { id: 'groceries', category: 'chores', name: 'Grocery Shopping', emoji: '🛒', color: '#10b981', type: 'checkbox', frequency: 'weekly', daysOfWeek: [0], description: 'Weekly grocery run' },
    { id: 'meal-prep', category: 'chores', name: 'Meal Prep', emoji: '🍳', color: '#f59e0b', type: 'checkbox', frequency: 'weekly', daysOfWeek: [0], description: 'Prepare meals for the week' },

    // Learning Templates
    { id: 'read-book', category: 'learning', name: 'Read Book', emoji: '📖', color: '#6366f1', type: 'amount', frequency: 'daily', goal: 20, unit: 'pages', description: 'Daily reading habit' },
    { id: 'learn-language', category: 'learning', name: 'Language Learning', emoji: '🗣️', color: '#ec4899', type: 'time', frequency: 'daily', goal: 15, unit: 'mins', description: 'Practice new language' },
    { id: 'online-course', category: 'learning', name: 'Online Course', emoji: '🎓', color: '#8b5cf6', type: 'time', frequency: 'weekly', daysOfWeek: [1, 3, 5], goal: 30, unit: 'mins', description: 'Work on online course' },
    { id: 'podcast', category: 'learning', name: 'Listen to Podcast', emoji: '🎧', color: '#f59e0b', type: 'checkbox', frequency: 'weekly', daysOfWeek: [1, 2, 3, 4, 5], description: 'Educational podcast' },
    { id: 'write-blog', category: 'learning', name: 'Write/Blog', emoji: '✍️', color: '#3b82f6', type: 'checkbox', frequency: 'weekly', daysOfWeek: [0], description: 'Write a blog post or article' },
];

export const templateCategories: Record<TemplateCategory, { name: string; icon: string; color: string }> = {
    health: { name: 'Health & Fitness', icon: '❤️', color: '#10b981' },
    productivity: { name: 'Productivity', icon: '⚡', color: '#6366f1' },
    mindfulness: { name: 'Mindfulness', icon: '🧘', color: '#8b5cf6' },
    social: { name: 'Social & Family', icon: '👥', color: '#ec4899' },
    chores: { name: 'Chores & Home', icon: '🏠', color: '#14b8a6' },
    learning: { name: 'Learning & Growth', icon: '🧠', color: '#f59e0b' },
};

export const getTemplatesByCategory = (category: TemplateCategory): HabitTemplate[] => {
    return habitTemplates.filter(t => t.category === category);
};

export const getAllCategories = (): TemplateCategory[] => {
    return Object.keys(templateCategories) as TemplateCategory[];
};
