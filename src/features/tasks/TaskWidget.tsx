import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TaskWidget: React.FC = () => {
    const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();
    const [newTask, setNewTask] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const todaysTasks = tasks.filter(t => t.date === today);
    const yesterdaysTasks = tasks.filter(t => t.date === yesterday && !t.completed);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim()) {
            addTask(newTask, today);
            setNewTask('');
        }
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

            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
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
                                        onClick={() => toggleTask(task.id)}
                                        className={`text-gray-400 hover:text-blue-500 transition-colors ${task.completed ? 'text-blue-500' : ''}`}
                                    >
                                        {task.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                                    </button>
                                    <span className={`flex-1 text-sm text-gray-700 dark:text-gray-200 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                        {task.text}
                                    </span>
                                    <button
                                        onClick={() => deleteTask(task.id)}
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

                {/* Yesterday's Incomplete Tasks */}
                {yesterdaysTasks.length > 0 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase mb-2">Yesterday (Incomplete)</h3>
                        <div className="space-y-2">
                            <AnimatePresence mode='popLayout'>
                                {yesterdaysTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        layout
                                        className="flex items-center gap-3 p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg group hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors border border-orange-100 dark:border-orange-900/30"
                                    >
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className="text-orange-400 hover:text-orange-600 transition-colors"
                                        >
                                            <Circle size={18} />
                                        </button>
                                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                                            {task.text}
                                        </span>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
