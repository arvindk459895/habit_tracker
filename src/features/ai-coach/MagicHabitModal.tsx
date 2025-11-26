import React, { useState } from 'react';
import { Sparkles, Send, X, Loader } from 'lucide-react';
import { aiService } from '../../services/aiService';

import { motion } from 'framer-motion';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (habit: any) => void;
}

export const MagicHabitModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const habitData = await aiService.parseHabitFromText(input);
            if (habitData) {
                onSave(habitData);
                setInput('');
                onClose();
            } else {
                setError("Couldn't understand that. Try being more specific!");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDirectSubmit = async (text: string) => {
        if (!text.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const habitData = await aiService.parseHabitFromText(text);
            if (habitData) {
                onSave(habitData);
                setInput('');
                onClose();
            } else {
                setError("Couldn't understand that. Try being more specific!");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="text-yellow-300" />
                        <h2 className="text-xl font-bold">Magic Create</h2>
                    </div>
                    <p className="text-purple-100 text-sm">
                        Describe your habit in plain English, and AI will set it up for you.
                    </p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g., 'I want to read for 30 minutes every night' or 'Go to gym Mon, Wed, Fri'"
                                className="w-full p-4 pr-12 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-all outline-none resize-none h-32 text-gray-800 dark:text-white placeholder-gray-400"
                                disabled={loading}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="absolute bottom-3 right-3 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Try:</span>
                            {['Drink 2L water daily', 'Meditation 10mins', 'Gym 3x a week'].map(suggestion => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => {
                                        setInput(suggestion);
                                        handleDirectSubmit(suggestion);
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </form>
                </div>
            </motion.div >
        </div >
    );
};
