import React from 'react';
import { useHabitStore } from '../../store/habitStore';
import { BADGES, getEarnedBadges } from '../../utils/badgeUtils';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const BadgeList: React.FC = () => {
    const { habits, logs } = useHabitStore();
    const earnedBadgeIds = getEarnedBadges(habits, logs);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Badges & Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {BADGES.map((badge, index) => {
                    const isEarned = earnedBadgeIds.includes(badge.id);
                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={clsx(
                                "p-4 rounded-lg border flex flex-col items-center text-center transition-all",
                                isEarned
                                    ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700"
                                    : "bg-gray-50 border-gray-100 opacity-50 grayscale dark:bg-gray-800 dark:border-gray-700"
                            )}
                        >
                            <div className="text-4xl mb-2">{badge.icon}</div>
                            <div className={clsx("font-bold text-sm mb-1", isEarned ? "text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400")}>
                                {badge.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {badge.description}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
