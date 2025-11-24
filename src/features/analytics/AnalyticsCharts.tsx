import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAnalytics } from './useAnalytics';

export const AnalyticsCharts: React.FC = () => {
    const { habitPerformance, chartData } = useAnalytics();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Habit Performance List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Habit Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {habitPerformance.map(habit => (
                        <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-lg"
                                    style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                                >
                                    {habit.emoji}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">{habit.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Flame size={10} className="text-orange-500" />
                                            {habit.currentStreak} day streak
                                        </div>
                                        <div className="flex items-center gap-1" title="Best Streak">
                                            <Trophy size={10} className="text-yellow-500" />
                                            {habit.bestStreak} best
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-800 dark:text-white">{habit.completionRate}%</div>
                                <div className="text-xs text-gray-400">30d rate</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Weekly Completion</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 6 ? '#3B82F6' : '#E5E7EB'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
