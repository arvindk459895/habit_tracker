import React, { useState } from 'react';
import { Calendar, TrendingUp, Award, Target, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, eachDayOfInterval } from 'date-fns';
import { calculateStreak } from '../../utils/streakUtils';
import { motion } from 'framer-motion';

type ReviewPeriod = 'week' | 'month';

export const ReviewsPage: React.FC = () => {
    const { habits, logs } = useHabitStore();
    const [period, setPeriod] = useState<ReviewPeriod>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const activeHabits = habits.filter(h => !h.archived);

    // Calculate date range
    const getDateRange = () => {
        if (period === 'week') {
            return {
                start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                end: endOfWeek(currentDate, { weekStartsOn: 1 })
            };
        } else {
            return {
                start: startOfMonth(currentDate),
                end: endOfMonth(currentDate)
            };
        }
    };

    const { start, end } = getDateRange();
    const days = eachDayOfInterval({ start, end });

    // Calculate statistics
    const stats = {
        totalCompletions: 0,
        totalPossible: 0,
        perfectDays: 0,
        averageStreak: 0,
        topHabit: null as { name: string; rate: number } | null,
        improvementRate: 0
    };

    // Track habit performance
    const habitPerformance: Record<string, { completed: number; total: number; name: string; emoji: string }> = {};

    activeHabits.forEach(habit => {
        habitPerformance[habit.id] = {
            completed: 0,
            total: 0,
            name: habit.name,
            emoji: habit.emoji
        };
    });

    // Calculate completions
    days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        let dayCompletions = 0;
        let dayTotal = 0;

        activeHabits.forEach(habit => {
            const key = `${habit.id}-${dateStr}`;
            const log = logs[key];

            if (habit.frequency === 'daily' || (habit.frequency === 'weekly' && habit.daysOfWeek.includes(day.getDay()))) {
                habitPerformance[habit.id].total++;
                dayTotal++;
                stats.totalPossible++;

                if (log?.completed) {
                    habitPerformance[habit.id].completed++;
                    dayCompletions++;
                    stats.totalCompletions++;
                }
            }
        });

        if (dayTotal > 0 && dayCompletions === dayTotal) {
            stats.perfectDays++;
        }
    });

    // Find top habit
    let maxRate = 0;
    Object.values(habitPerformance).forEach(perf => {
        if (perf.total > 0) {
            const rate = (perf.completed / perf.total) * 100;
            if (rate > maxRate) {
                maxRate = rate;
                stats.topHabit = { name: perf.name, rate };
            }
        }
    });

    // Calculate average streak
    const streaks = activeHabits.map(h => calculateStreak(logs, h.id, new Date(), h.frozenDates));
    stats.averageStreak = streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0;

    const completionRate = stats.totalPossible > 0 ? Math.round((stats.totalCompletions / stats.totalPossible) * 100) : 0;

    // Navigation handlers
    const goToPrevious = () => {
        setCurrentDate(period === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1));
    };

    const goToNext = () => {
        setCurrentDate(period === 'week' ? subWeeks(currentDate, -1) : subMonths(currentDate, -1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Export data
    const exportData = () => {
        const data = {
            period: period === 'week' ? 'Weekly' : 'Monthly',
            dateRange: `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`,
            stats,
            habitPerformance: Object.entries(habitPerformance).map(([id, perf]) => ({
                habit: perf.name,
                completed: perf.completed,
                total: perf.total,
                rate: perf.total > 0 ? Math.round((perf.completed / perf.total) * 100) : 0
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `habit-review-${format(start, 'yyyy-MM-dd')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">📊 Progress Reviews</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your progress and celebrate your wins!</p>
                </div>

                {/* Period Selector & Navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPeriod('week')}
                                className={`px-4 py-2 rounded-lg transition-colors ${period === 'week'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setPeriod('month')}
                                className={`px-4 py-2 rounded-lg transition-colors ${period === 'month'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                Monthly
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={goToPrevious} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[200px] text-center">
                                {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
                            </span>
                            <button onClick={goToNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <ChevronRight size={20} />
                            </button>
                            <button onClick={goToToday} className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50">
                                Today
                            </button>
                        </div>

                        <button
                            onClick={exportData}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download size={18} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Target size={24} />
                            <span className="text-3xl font-bold">{completionRate}%</span>
                        </div>
                        <p className="text-blue-100 text-sm">Completion Rate</p>
                        <p className="text-xs text-blue-200 mt-1">{stats.totalCompletions} / {stats.totalPossible} tasks</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Calendar size={24} />
                            <span className="text-3xl font-bold">{stats.perfectDays}</span>
                        </div>
                        <p className="text-green-100 text-sm">Perfect Days</p>
                        <p className="text-xs text-green-200 mt-1">100% completion</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={24} />
                            <span className="text-3xl font-bold">{stats.averageStreak}</span>
                        </div>
                        <p className="text-orange-100 text-sm">Avg Streak</p>
                        <p className="text-xs text-orange-200 mt-1">Days in a row</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Award size={24} />
                            <span className="text-2xl font-bold">{stats.topHabit ? `${Math.round(stats.topHabit.rate)}%` : 'N/A'}</span>
                        </div>
                        <p className="text-purple-100 text-sm">Top Habit</p>
                        <p className="text-xs text-purple-200 mt-1 truncate">{stats.topHabit?.name || 'None yet'}</p>
                    </motion.div>
                </div>

                {/* Habit Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Habit Breakdown</h2>
                    <div className="space-y-3">
                        {Object.values(habitPerformance)
                            .sort((a, b) => (b.completed / b.total || 0) - (a.completed / a.total || 0))
                            .map((perf, idx) => {
                                const rate = perf.total > 0 ? (perf.completed / perf.total) * 100 : 0;
                                return (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className="text-2xl">{perf.emoji}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{perf.name}</span>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {perf.completed}/{perf.total} ({Math.round(rate)}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${rate}%` }}
                                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Insights */}
                <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">✨ Insights</h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        {completionRate >= 80 && (
                            <li>🎉 Excellent work! You're maintaining over 80% completion rate.</li>
                        )}
                        {stats.perfectDays > 0 && (
                            <li>⭐ You had {stats.perfectDays} perfect day{stats.perfectDays > 1 ? 's' : ''} this {period}!</li>
                        )}
                        {stats.averageStreak >= 7 && (
                            <li>🔥 You're on fire with an average {stats.averageStreak}-day streak!</li>
                        )}
                        {completionRate < 50 && (
                            <li>💪 Keep pushing! Small steps lead to big changes.</li>
                        )}
                        {stats.topHabit && stats.topHabit.rate >= 90 && (
                            <li>🏆 "{stats.topHabit.name}" is your strongest habit at {Math.round(stats.topHabit.rate)}%!</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};
