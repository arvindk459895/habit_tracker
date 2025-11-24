import React from 'react';
import { format, eachDayOfInterval, subDays, startOfDay, getDay } from 'date-fns';
import { useHabitStore } from '../../store/habitStore';

export const Heatmap: React.FC = () => {
    const { logs, habits } = useHabitStore();
    const today = startOfDay(new Date());
    const startDate = subDays(today, 364); // Last 365 days

    const days = eachDayOfInterval({ start: startDate, end: today });

    // Calculate intensity for each day
    const getIntensity = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        let completedCount = 0;
        let activeCount = 0;

        habits.forEach(h => {
            if (!h.archived) {
                activeCount++;
                if (logs[`${h.id}-${dateStr}`]?.completed) {
                    completedCount++;
                }
            }
        });

        if (activeCount === 0) return 0;
        const percentage = completedCount / activeCount;

        if (percentage === 0) return 0;
        if (percentage <= 0.25) return 1;
        if (percentage <= 0.5) return 2;
        if (percentage <= 0.75) return 3;
        return 4;
    };

    // Group days by week for the grid layout
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    days.forEach(day => {
        if (getDay(day) === 0 && currentWeek.length > 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(day);
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return (
        <div className="w-full overflow-x-auto custom-scrollbar pb-2">
            <div className="flex gap-1 min-w-max">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => {
                            const intensity = getIntensity(day);
                            const dateStr = format(day, 'MMM d, yyyy');

                            let colorClass = 'bg-gray-100 dark:bg-gray-800';
                            if (intensity === 1) colorClass = 'bg-green-200 dark:bg-green-900/40';
                            if (intensity === 2) colorClass = 'bg-green-300 dark:bg-green-800/60';
                            if (intensity === 3) colorClass = 'bg-green-400 dark:bg-green-700/80';
                            if (intensity === 4) colorClass = 'bg-green-500 dark:bg-green-600';

                            return (
                                <div
                                    key={dayIndex}
                                    title={`${dateStr}: Level ${intensity}`}
                                    className={`w-3 h-3 rounded-sm ${colorClass}`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-end gap-2 mt-2 text-xs text-gray-400">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40" />
                <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800/60" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700/80" />
                <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
                <span>More</span>
            </div>
        </div>
    );
};
