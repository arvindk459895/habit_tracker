import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { generateInsights } from '../../utils/smartInsights';
import { Sparkles, AlertTriangle, Info, PartyPopper, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SmartInsightsWidget: React.FC = () => {
    const { habits, logs } = useHabitStore();

    const insights = useMemo(() => generateInsights(habits, logs), [habits, logs]);

    if (insights.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <PartyPopper className="text-green-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-orange-500" size={20} />;
            case 'info': return <Info className="text-blue-500" size={20} />;
            default: return <Lightbulb className="text-purple-500" size={20} />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800';
            case 'warning': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800';
            case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800';
            default: return 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800';
        }
    };

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-yellow-500" size={18} />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Smart Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnimatePresence>
                    {insights.map((insight, index) => (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border ${getBgColor(insight.type)} shadow-sm relative overflow-hidden`}
                        >
                            <div className="flex items-start gap-3 relative z-10">
                                <div className="mt-0.5 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    {getIcon(insight.type)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">{insight.title}</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {insight.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
