import React, { useState } from 'react';
import { Calendar as CalendarIcon, Snowflake, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface VacationModeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentVacation?: {
        enabled: boolean;
        startDate: string;
        endDate: string;
    };
    onSave: (vacation: { enabled: boolean; startDate: string; endDate: string } | null) => void;
}

export const VacationModeModal: React.FC<VacationModeModalProps> = ({
    isOpen,
    onClose,
    currentVacation,
    onSave
}) => {
    const [startDate, setStartDate] = useState(currentVacation?.startDate || '');
    const [endDate, setEndDate] = useState(currentVacation?.endDate || '');

    const handleSave = () => {
        if (startDate && endDate) {
            onSave({
                enabled: true,
                startDate,
                endDate
            });
        }
        onClose();
    };

    const handleRemove = () => {
        onSave(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Snowflake className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Vacation Mode</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            ❄️ <strong>Vacation mode</strong> freezes your streaks during planned breaks.
                            Your progress is protected and streaks continue through frozen dates!
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Start Date
                            </label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                End Date
                            </label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {currentVacation?.enabled && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                Current vacation: {currentVacation.startDate} to {currentVacation.endDate}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    {currentVacation?.enabled && (
                        <button
                            onClick={handleRemove}
                            className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            Remove Vacation
                        </button>
                    )}
                    <div className="flex-1" />
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!startDate || !endDate}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Vacation
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
