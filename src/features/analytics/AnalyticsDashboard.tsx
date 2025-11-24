import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useAnalytics } from './useAnalytics';
import { useActivityStore } from '../../store/useActivityStore';
import { InfoTooltip } from '../../components/ui/InfoTooltip';
import { Heatmap } from './Heatmap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

interface AnalyticsDashboardProps { }

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
    const {
        habitPerformance,
        totalTimeSpent,
        totalAmount,
        noteCorrelationData,
        chartData
    } = useAnalytics();

    const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'habits'>('overview');
    const { logActivity } = useActivityStore();

    const handleTabChange = (tab: 'overview' | 'trends' | 'habits') => {
        setActiveTab(tab);
        logActivity('VIEW', 'ANALYTICS', 'SWITCH_TAB', { tab });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Lucide.Activity className="text-purple-600 dark:text-purple-400" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Analytics Suite</h2>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                {['overview', 'trends', 'habits'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab as any)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative capitalize ${activeTab === tab
                            ? 'text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="activeTabAnalytics" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50">

                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Heatmap Section */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Lucide.Calendar size={18} className="text-green-500" />
                                Consistency Heatmap
                                <InfoTooltip
                                    title="Consistency Heatmap"
                                    content="Visualizes your daily consistency. Darker squares indicate more habits completed on that day. Data is logged automatically as you check off habits."
                                />
                            </h3>
                            <Heatmap />
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Lucide.Clock size={18} className="text-blue-500" />
                                    Time & Amounts
                                    <InfoTooltip
                                        title="Time & Amounts"
                                        content="Tracks the total time (minutes) and quantities (e.g., pages read, liters drunk) logged for your non-checkbox habits."
                                    />
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-500">Total Time Tracked</div>
                                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalTimeSpent} min</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Total Units Logged</div>
                                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalAmount}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Lucide.Brain size={18} className="text-pink-500" />
                                    Mental State Correlation
                                    <InfoTooltip
                                        title="Mental State Correlation"
                                        content="Discover how your journaling affects your productivity. This chart correlates the length of your daily notes with your habit completion rate. To get started, click any day header in the grid to add a note."
                                    />
                                </h3>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={noteCorrelationData}>
                                            <XAxis dataKey="noteLength" hide />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                labelStyle={{ display: 'none' }}
                                            />
                                            <Line type="monotone" dataKey="completionCount" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">Note Length vs. Daily Completions</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'trends' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-96 animate-in fade-in duration-500">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                            <Lucide.TrendingUp size={18} className="text-blue-500" />
                            Weekly Completion Trend
                            <InfoTooltip
                                title="Weekly Completion Trend"
                                content="Shows your daily habit completion percentage for the current week. Use this to spot trends in your productivity."
                            />
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeTab === 'habits' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        {habitPerformance.map(habit => (
                            <div key={habit.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{habit.emoji}</span>
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-white">{habit.name}</h4>
                                            <div className="text-xs text-gray-500">{habit.category || 'General'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{habit.completionRate}%</div>
                                        <div className="text-xs text-gray-500">Completion Rate</div>
                                    </div>
                                </div>

                                {/* Progress Bar for Goal vs Actual */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Goal Progress (30d)</span>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                            {Math.round((habit.completionRate / 100) * 30)} / 30 days
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${habit.completionRate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Current Streak</div>
                                        <div className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
                                            {habit.currentStreak} <span className="text-xs font-normal text-gray-400">days</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Best Streak</div>
                                        <div className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
                                            {habit.bestStreak} <span className="text-xs font-normal text-gray-400">days</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Interruptions</div>
                                        <div className="font-bold text-red-500 flex items-center gap-1">
                                            {habit.missedDays30d} <span className="text-xs font-normal text-gray-400">days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
