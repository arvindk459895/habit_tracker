import React, { useState, useMemo, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { Plus, Trash2, CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useActivityStore } from '../../store/useActivityStore';

export const TaskWidget: React.FC = () => {
    const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();
    const { logActivity } = useActivityStore();
    const [newTask, setNewTask] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const today = new Date().toISOString().split('T')[0];

    const todaysTasks = tasks.filter(t => t.date === today);
    const previousTasks = tasks.filter(t => t.date < today);

    // Log widget view on mount
    useEffect(() => {
        logActivity('VIEW', 'TASK', 'VIEW_WIDGET', {
            todayTaskCount: todaysTasks.length,
            totalTaskCount: tasks.length,
            previousTaskCount: previousTasks.length
        });
    }, []);

    // Group previous tasks by date
    const tasksByDate = useMemo(() => {
        const grouped = previousTasks.reduce((acc, task) => {
            if (!acc[task.date]) {
                acc[task.date] = [];
            }
            acc[task.date].push(task);
            return acc;
        }, {} as Record<string, typeof tasks>);

        // Sort dates in reverse chronological order
        return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
    }, [previousTasks]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim()) {
            addTask(newTask, today);
            logActivity('ACTION', 'TASK', 'CREATE_TASK', {
                taskText: newTask,
                date: today,
                existingTaskCount: todaysTasks.length
            });
            setNewTask('');
        }
    };

    const handleToggleHistory = () => {
        const newState = !showHistory;
        setShowHistory(newState);
        logActivity('ACTION', 'TASK', 'TOGGLE_HISTORY', {
            expanded: newState,
            previousTaskCount: previousTasks.length,
            dateCount: tasksByDate.length
        });
    };

    const handleToggleTask = (taskId: string, date: string) => {
        toggleTask(taskId);
        const task = tasks.find(t => t.id === taskId);
        logActivity('ACTION', 'TASK', 'TOGGLE_TASK', {
            taskId,
            date,
            completed: !task?.completed,
            isHistorical: date < today
        });
    };

    const handleDeleteTask = (taskId: string, date: string) => {
        deleteTask(taskId);
        logActivity('ACTION', 'TASK', 'DELETE_TASK', {
            taskId,
            date,
            isHistorical: date < today
        });
    };

    const formatDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (dateStr === yesterday) {
            return 'Yesterday';
        }
        return format(date, 'MMMM d, yyyy');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-full">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span>✅</span> Today's Tasks
            </h2>

            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a task..."
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </form>

            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {/* Today's Tasks */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Today</h3>
                    <div className="space-y-2">
                        <AnimatePresence mode='popLayout'>
                            {todaysTasks.map(task => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    layout
                                    className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <button
                                        onClick={() => handleToggleTask(task.id, task.date)}
                                        className={`text-gray-400 hover:text-blue-500 transition-colors ${task.completed ? 'text-blue-500' : ''}`}
                                    >
                                        {task.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                                    </button>
                                    <span className={`flex-1 text-sm text-gray-700 dark:text-gray-200 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                        {task.text}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteTask(task.id, task.date)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {todaysTasks.length === 0 && (
                            <p className="text-center text-gray-400 dark:text-gray-500 text-xs py-2 italic">
                                No tasks yet. Add one to get started!
                            </p>
                        )}
                    </div>
                </div>

                {/* Previous Days Toggle Button */}
                {previousTasks.length > 0 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleToggleHistory}
                            className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                Previous Days ({previousTasks.length} tasks)
                            </span>
                            {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {/* Previous Days Tasks */}
                        <AnimatePresence>
                            {showHistory && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-3 mt-3">
                                        {tasksByDate.map(([date, dateTasks]) => (
                                            <div key={date}>
                                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                                    {formatDateLabel(date)}
                                                </h4>
                                                <div className="space-y-1.5">
                                                    {dateTasks.map(task => (
                                                        <motion.div
                                                            key={task.id}
                                                            layout
                                                            className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/20 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
                                                        >
                                                            <button
                                                                onClick={() => handleToggleTask(task.id, task.date)}
                                                                className={`text-gray-400 hover:text-blue-500 transition-colors ${task.completed ? 'text-blue-500' : ''}`}
                                                            >
                                                                {task.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                            </button>
                                                            <span className={`flex-1 text-xs text-gray-700 dark:text-gray-200 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                                                {task.text}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteTask(task.id, task.date)}
                                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};
