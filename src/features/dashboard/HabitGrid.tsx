import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../../store/habitStore';
import { getDaysInMonth, formatDate, formatDayName, formatDayNumber, isDateToday, formatMonthYear } from '../../utils/dateUtils';
import { Check, Plus, Trash2, Flame, Archive, Snowflake } from 'lucide-react';
import { clsx } from 'clsx';
import { HabitModal } from './HabitModal';
import { LogModal } from './LogModal';
import { NoteModal } from './NoteModal';
import { VacationModeModal } from '../../components/VacationModeModal';
import { Habit } from '../../types';
import { calculateStreak } from '../../utils/streakUtils';
import { EarnedBadgesWidget } from '../gamification/EarnedBadgesWidget';
import { TaskWidget } from '../tasks/TaskWidget';
import { AnalyticsStats } from '../analytics/AnalyticsStats';
import { SmartInsightsWidget } from '../insights/SmartInsightsWidget';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { useActivityStore } from '../../store/useActivityStore';
import { AICoachWidget } from '../ai-coach/AICoachWidget';
import { MagicHabitModal } from '../ai-coach/MagicHabitModal';

export const HabitGrid: React.FC = () => {
    const { habits, logs, dayNotes, toggleHabit, deleteHabit, addHabit, logHabitValue, setDayNote, skipHabit, updateHabit, isLoading } = useHabitStore();
    const [currentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logModalState, setLogModalState] = useState<{ isOpen: boolean; habit?: Habit; date?: string }>({ isOpen: false });
    const [noteModalState, setNoteModalState] = useState<{ isOpen: boolean; date?: string }>({ isOpen: false });
    const [vacationModalState, setVacationModalState] = useState<{ isOpen: boolean; habitId: string | null }>({ isOpen: false, habitId: null });
    const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);

    const days = getDaysInMonth(currentDate);
    const [showArchived, setShowArchived] = useState(false);


    const { logActivity } = useActivityStore();

    const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
        addHabit(habitData);
        logActivity('ACTION', 'HABIT', 'CREATE_HABIT', { name: habitData.name });
        setIsModalOpen(false);
    };

    const handleCellClick = (habit: Habit, dateStr: string) => {
        if (habit.type === 'checkbox') {
            toggleHabit(habit.id, dateStr);
            logActivity('ACTION', 'HABIT', 'TOGGLE_HABIT', { habitId: habit.id, date: dateStr });
        } else {
            setLogModalState({ isOpen: true, habit, date: dateStr });
            logActivity('ACTION', 'UI', 'OPEN_LOG_MODAL', { habitId: habit.id });
        }
    };

    const handleCellContextMenu = (e: React.MouseEvent, habit: Habit, dateStr: string) => {
        e.preventDefault();
        skipHabit(habit.id, dateStr);
    };

    const isScheduled = (habit: Habit, date: Date) => {
        if (habit.endDate && new Date(habit.endDate) < date) return false;
        if (habit.frequency === 'daily') return true;
        if (habit.frequency === 'weekly') {
            return (habit.daysOfWeek || []).includes(date.getDay());
        }
        if (habit.frequency === 'interval') {
            const start = new Date(habit.createdAt);
            const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return diff % habit.interval === 0;
        }
        return true;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <AICoachWidget />
                        <EarnedBadgesWidget />
                        <SmartInsightsWidget />
                        <AnalyticsStats />
                    </div>
                    <div>
                        <TaskWidget />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Habit Tracker</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatMonthYear(currentDate)}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setShowArchived(!showArchived)}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm",
                                    showArchived
                                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                )}
                            >
                                <Archive size={18} />
                                <span className="hidden sm:inline">{showArchived ? 'Hide Archived' : 'Archived'}</span>
                            </button>
                            <button
                                onClick={() => setIsMagicModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm shadow-sm"
                            >
                                <Snowflake size={18} className="text-yellow-300" />
                                <span className="hidden sm:inline">Magic Add</span>
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm ml-auto sm:ml-0"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Add Habit</span>
                                <span className="sm:hidden">Add</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-20 bg-white dark:bg-gray-800 p-4 text-left min-w-[150px] sm:min-w-[200px] border-b border-r border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Habit</th>
                                    {days.map((day) => {
                                        const dateStr = formatDate(day);
                                        const isToday = isDateToday(dateStr);
                                        const hasNote = !!dayNotes[dateStr];
                                        return (
                                            <th
                                                key={dateStr}
                                                className={clsx(
                                                    "p-2 text-center min-w-[40px] border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative",
                                                    isToday && "bg-blue-50 dark:bg-blue-900/20"
                                                )}
                                                onClick={() => setNoteModalState({ isOpen: true, date: dateStr })}
                                            >
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{formatDayName(day)}</div>
                                                <div className={clsx("text-sm font-medium", isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200")}>
                                                    {formatDayNumber(day)}
                                                </div>
                                                {hasNote && (
                                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {habits.filter(h => showArchived ? h.archived : !h.archived).map((habit, index) => (
                                    <motion.tr
                                        key={habit.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 p-4 border-b border-r border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-opacity-10"
                                                    style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                                                >
                                                    {habit.emoji}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-700 dark:text-gray-200">{habit.name}</div>
                                                    <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                                                        <Flame size={12} fill="currentColor" />
                                                        {calculateStreak(logs, habit.id, new Date(), habit.frozenDates)}
                                                    </div>
                                                    <div className="hidden sm:block sm:w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                                                            style={{ width: `${habit.strength}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setVacationModalState({ isOpen: true, habitId: habit.id })}
                                                    className={`p-1 ${habit.vacationMode?.enabled ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                                                    title={habit.vacationMode?.enabled ? "Vacation Mode Active" : "Set Vacation Mode"}
                                                >
                                                    <Snowflake size={16} />
                                                </button>
                                                <button
                                                    onClick={() => updateHabit(habit.id, { archived: !habit.archived })}
                                                    className="text-gray-400 hover:text-blue-500 p-1"
                                                    title={habit.archived ? "Unarchive Habit" : "Archive Habit"}
                                                >
                                                    <Archive size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteHabit(habit.id)}
                                                    className="text-gray-400 hover:text-red-500 p-1"
                                                    title="Delete Habit"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        {days.map((day) => {
                                            const dateStr = formatDate(day);
                                            const logKey = `${habit.id}-${dateStr}`;
                                            const log = logs[logKey];
                                            const isCompleted = log?.completed;

                                            const isScheduledDay = isScheduled(habit, day);
                                            const isSkipped = log?.status === 'skipped';

                                            return (
                                                <td key={dateStr} className="p-1 border-b border-gray-100 dark:border-gray-700 text-center">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleCellClick(habit, dateStr)}
                                                        onContextMenu={(e) => handleCellContextMenu(e, habit, dateStr)}
                                                        className={clsx(
                                                            "w-8 h-8 rounded-md flex items-center justify-center transition-all text-xs font-medium",
                                                            !isScheduledDay && !isCompleted && !isSkipped && "opacity-30 cursor-not-allowed bg-gray-50 dark:bg-gray-800",
                                                            isCompleted
                                                                ? "text-white"
                                                                : isSkipped
                                                                    ? "bg-gray-200 dark:bg-gray-600 text-gray-500"
                                                                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-transparent hover:text-gray-400"
                                                        )}
                                                        style={isCompleted ? { backgroundColor: habit.color } : undefined}
                                                        disabled={!isScheduledDay && !isCompleted && !isSkipped}
                                                    >
                                                        {habit.type === 'checkbox' ? (
                                                            isSkipped ? (
                                                                <span className="text-xs">⏭️</span>
                                                            ) : (
                                                                <Check size={16} />
                                                            )
                                                        ) : (
                                                            <span className="text-gray-700 dark:text-gray-200">{log?.value || ''}</span>
                                                        )}
                                                    </motion.button>
                                                </td>
                                            );
                                        })}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <AnalyticsDashboard />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <HabitModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveHabit}
                    />
                )}
                {isMagicModalOpen && (
                    <MagicHabitModal
                        isOpen={isMagicModalOpen}
                        onClose={() => setIsMagicModalOpen(false)}
                        onSave={handleSaveHabit}
                    />
                )}
            </AnimatePresence>

            {logModalState.habit && logModalState.date && (
                <LogModal
                    isOpen={logModalState.isOpen}
                    onClose={() => setLogModalState({ ...logModalState, isOpen: false })}
                    onSave={(value) => {
                        logHabitValue(logModalState.habit!.id, logModalState.date!, value);
                        setLogModalState({ ...logModalState, isOpen: false });
                    }}
                    habit={logModalState.habit}
                    date={logModalState.date}
                    initialValue={logs[`${logModalState.habit.id}-${logModalState.date}`]?.value}
                />
            )}

            {noteModalState.date && (
                <NoteModal
                    isOpen={noteModalState.isOpen}
                    onClose={() => setNoteModalState({ ...noteModalState, isOpen: false })}
                    onSave={(note) => {
                        setDayNote(noteModalState.date!, note);
                        setNoteModalState({ ...noteModalState, isOpen: false });
                    }}
                    date={noteModalState.date}
                    initialNote={dayNotes[noteModalState.date]}
                />
            )}

            <VacationModeModal
                isOpen={vacationModalState.isOpen}
                onClose={() => setVacationModalState({ isOpen: false, habitId: null })}
                currentVacation={vacationModalState.habitId ? habits.find(h => h.id === vacationModalState.habitId)?.vacationMode : undefined}
                onSave={(vacation) => {
                    if (vacationModalState.habitId) {
                        if (vacation) {
                            // Generate frozen dates array from vacation period
                            const frozenDates: string[] = [];
                            const start = new Date(vacation.startDate);
                            const end = new Date(vacation.endDate);
                            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                frozenDates.push(d.toISOString().split('T')[0]);
                            }
                            updateHabit(vacationModalState.habitId, { vacationMode: vacation, frozenDates });
                        } else {
                            // Remove vacation mode
                            updateHabit(vacationModalState.habitId, { vacationMode: undefined, frozenDates: undefined });
                        }
                    }
                }}
            />
        </div>
    );
};
