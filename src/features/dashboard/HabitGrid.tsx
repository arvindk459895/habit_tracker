import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../../store/habitStore';
import { getDaysInMonth, formatDate, formatDayName, formatDayNumber, isDateToday } from '../../utils/dateUtils';
import { Check, Plus, Trash2, Flame, Archive } from 'lucide-react';
import { clsx } from 'clsx';
import { HabitModal } from './HabitModal';
import { LogModal } from './LogModal';
import { NoteModal } from './NoteModal';
import { Habit } from '../../types';
import { calculateStreak } from '../../utils/streakUtils';
import { EarnedBadgesWidget } from '../gamification/EarnedBadgesWidget';
import { TaskWidget } from '../tasks/TaskWidget';

export const HabitGrid: React.FC = () => {
    const { habits, logs, dayNotes, toggleHabit, deleteHabit, addHabit, logHabitValue, setDayNote, skipHabit, updateHabit } = useHabitStore();
    const [currentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logModalState, setLogModalState] = useState<{ isOpen: boolean; habit?: Habit; date?: string }>({ isOpen: false });
    const [noteModalState, setNoteModalState] = useState<{ isOpen: boolean; date?: string }>({ isOpen: false });
    const days = getDaysInMonth(currentDate);

    const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
        addHabit(habitData);
        setIsModalOpen(false);
    };

    const handleCellClick = (habit: Habit, dateStr: string) => {
        if (habit.type === 'checkbox') {
            toggleHabit(habit.id, dateStr);
        } else {
            setLogModalState({ isOpen: true, habit, date: dateStr });
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
            return habit.daysOfWeek.includes(date.getDay());
        }
        if (habit.frequency === 'interval') {
            const start = new Date(habit.createdAt);
            const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return diff % habit.interval === 0;
        }
        return true;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <EarnedBadgesWidget />
                    </div>
                    <div>
                        <TaskWidget />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Habit Tracker</h1>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Add Habit
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-20 bg-white dark:bg-gray-800 p-4 text-left min-w-[200px] border-b border-r border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200">Habit</th>
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
                                {habits.filter(h => !h.archived).map((habit, index) => (
                                    <motion.tr
                                        key={habit.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 p-4 border-b border-r border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{habit.emoji}</span>
                                                <div>
                                                    <div className="font-medium text-gray-700 dark:text-gray-200">{habit.name}</div>
                                                    <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                                                        <Flame size={12} fill="currentColor" />
                                                        {calculateStreak(logs, habit.id)}
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                                                            style={{ width: `${habit.strength}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => updateHabit(habit.id, { archived: true })}
                                                    className="text-gray-400 hover:text-blue-500 p-1"
                                                    title="Archive Habit"
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
                                                                ? "bg-blue-500 text-white"
                                                                : isSkipped
                                                                    ? "bg-gray-200 dark:bg-gray-600 text-gray-500"
                                                                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-transparent hover:text-gray-400"
                                                        )}
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
                        {habits.length === 0 && (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No habits yet. Click "Add Habit" to get started!
                            </div>
                        )}
                    </div>
                </div>

                <HabitModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveHabit}
                />

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
            </div>
        </div>
    );
};
