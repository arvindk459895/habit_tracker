import React, { useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { format, sub, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Calendar as CalIcon } from 'lucide-react';

export const AdvancedAnalytics: React.FC = () => {
    const { habits, logs } = useHabitStore();
    const [dateRange, setDateRange] = useState(30); // days

    const activeHabits = habits.filter(h => !h.archived);

    // Generate date range
    const endDate = new Date();
    const startDate = sub(endDate, { days: dateRange });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Completion trend data
    const trendData = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        let completed = 0;
        let total = 0;

        activeHabits.forEach(habit => {
            const key = `${habit.id}-${dateStr}`;
            if (logs[key]) {
                total++;
                if (logs[key].completed) completed++;
            }
        });

        return {
            date: format(day, 'MMM d'),
            rate: total > 0 ? Math.round((completed / total) * 100) : 0,
            completed,
            total
        };
    });

    // Habit distribution (by completion count)
    const habitDistribution = activeHabits.map(habit => {
        const completions = Object.values(logs).filter(
            log => log.habitId === habit.id && log.completed
        ).length;

        return {
            name: habit.name,
            value: completions,
            color: habit.color
        };
    }).sort((a, b) => b.value - a.value).slice(0, 5);

    // Time-of-day analysis (if we had time data)
    const timeData = [
        { time: 'Morning', count: 45 },
        { time: 'Afternoon', count: 30 },
        { time: 'Evening', count: 60 },
        { time: 'Night', count: 20 }
    ];

    // Weekly comparison
    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
        const weekStart = sub(endDate, { weeks: i + 1 });
        const weekEnd = sub(endDate, { weeks: i });
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        let weekCompletions = 0;
        let weekTotal = 0;

        weekDays.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            activeHabits.forEach(habit => {
                const key = `${habit.id}-${dateStr}`;
                if (logs[key]) {
                    weekTotal++;
                    if (logs[key].completed) weekCompletions++;
                }
            });
        });

        weeklyData.unshift({
            week: `Week ${4 - i}`,
            rate: weekTotal > 0 ? Math.round((weekCompletions / weekTotal) * 100) : 0
        });
    }

    return (
        <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="flex gap-2">
                {[7, 14, 30, 90].map(days => (
                    <button
                        key={days}
                        onClick={() => setDateRange(days)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${dateRange === days
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {days} Days
                    </button>
                ))}
            </div>

            {/* Completion Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-500" size={20} />
                    Completion Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Comparison */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <CalIcon className="text-green-500" size={20} />
                        Weekly Comparison
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Bar dataKey="rate" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Habits */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="text-purple-500" size={20} />
                        Top 5 Habits
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={habitDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {habitDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">📊 Quick Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Completions</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {trendData.reduce((sum, d) => sum + d.completed, 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average Rate</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {Math.round(trendData.reduce((sum, d) => sum + d.rate, 0) / trendData.length)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Best Day</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {Math.max(...trendData.map(d => d.rate))}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
