import React from 'react';
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { useAnalytics } from './useAnalytics';

export const AnalyticsStats: React.FC = () => {
    const { bestCurrentStreak, bestStreakAllTime, totalCompletions, activeHabits } = useAnalytics();

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Flame size={18} className="text-orange-500" />
                    <span className="text-sm font-medium">Best Current Streak</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{bestCurrentStreak} <span className="text-sm font-normal text-gray-400">days</span></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Trophy size={18} className="text-yellow-500" />
                    <span className="text-sm font-medium">All-Time Best</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{bestStreakAllTime} <span className="text-sm font-normal text-gray-400">days</span></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <TrendingUp size={18} className="text-blue-500" />
                    <span className="text-sm font-medium">Total Completions</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalCompletions}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar size={18} className="text-purple-500" />
                    <span className="text-sm font-medium">Active Habits</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{activeHabits}</div>
            </div>
        </div>
    );
};
