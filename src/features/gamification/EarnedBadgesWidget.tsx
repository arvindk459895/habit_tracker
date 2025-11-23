import React from 'react';
import { useHabitStore } from '../../store/habitStore';
import { BADGES, getEarnedBadges } from '../../utils/badgeUtils';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export const EarnedBadgesWidget: React.FC = () => {
    const { habits, logs } = useHabitStore();
    const earnedBadgeIds = getEarnedBadges(habits, logs);
    const earnedBadges = BADGES.filter(b => earnedBadgeIds.includes(b.id));

    if (earnedBadges.length === 0) return null;

    return (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30 flex items-center gap-4 overflow-x-auto">
            <div className="flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-full">
                <Trophy size={20} />
            </div>
            <div className="flex gap-3">
                {earnedBadges.map((badge, index) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-yellow-100 dark:border-yellow-800/30 flex-shrink-0"
                        title={badge.description}
                    >
                        <span className="text-lg">{badge.icon}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{badge.name}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
