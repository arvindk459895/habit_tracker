import React from 'react';
import { useHabitStore } from '../../store/habitStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Flame, Target } from 'lucide-react';
import { calculateStreak } from '../../utils/streakUtils';
import { BadgeList } from '../gamification/BadgeList';

export const AnalysisPanel: React.FC = () => {
    const { habits, logs } = useHabitStore();

    const stats = habits.map((habit) => {
        const habitLogs = Object.values(logs).filter((log) => log.habitId === habit.id);
        const completedCount = habitLogs.filter((log) => log.completed).length;
        const totalDays = 30; // Assuming monthly view for simplicity
        const completionRate = Math.round((completedCount / totalDays) * 100);

        const currentStreak = calculateStreak(logs, habit.id);

        return {
            name: habit.name,
            completed: completedCount,
            rate: completionRate,
            streak: currentStreak,
            color: habit.color,
        };
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-[1400px] mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics & Insights</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Total Completions</div>
                            <div className="text-2xl font-bold">
                                {Object.values(logs).filter(l => l.completed).length}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                            <Flame size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Best Streak</div>
                            <div className="text-2xl font-bold">
                                {Math.max(...stats.map(s => s.streak), 0)} Days
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <Target size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Avg. Completion</div>
                            <div className="text-2xl font-bold">
                                {Math.round(stats.reduce((acc, curr) => acc + curr.rate, 0) / (stats.length || 1))}%
                            </div>
                        </div>
                    </div>
                </div>

                <BadgeList />

                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Completion Rates</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
