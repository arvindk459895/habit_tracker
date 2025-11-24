import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Habit, HabitType, HabitFrequency } from '../../types';

interface HabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
    initialData?: Habit;
}

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('📝');
    const [type, setType] = useState<HabitType>('checkbox');
    const [goal, setGoal] = useState<number | undefined>(undefined);
    const [unit, setUnit] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [frequency, setFrequency] = useState<HabitFrequency>('daily');
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
    const [interval, setInterval] = useState(1);
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmoji(initialData.emoji);
            setType(initialData.type);
            setGoal(initialData.goal);
            setUnit(initialData.unit || '');
            setColor(initialData.color);
            setFrequency(initialData.frequency);
            setDaysOfWeek(initialData.daysOfWeek);
            setInterval(initialData.interval);
            setEndDate(initialData.endDate || '');
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const resetForm = () => {
        setName('');
        setEmoji('📝');
        setType('checkbox');
        setGoal(undefined);
        setUnit('');
        setColor('#3b82f6');
        setFrequency('daily');
        setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
        setInterval(1);
        setEndDate('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            emoji,
            type,
            goal: type === 'checkbox' ? undefined : goal,
            unit: type === 'checkbox' ? undefined : unit,
            color,
            frequency,
            daysOfWeek,
            interval,
            endDate: endDate || undefined,
            strength: initialData?.strength || 0,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {initialData ? 'Edit Habit' : 'New Habit'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="habit-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g., Read Books"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                <div className="grid grid-cols-8 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-40 overflow-y-auto custom-scrollbar">
                                    {['📝', '💪', '💧', '🏃', '📚', '🧘', '💰', '🥗', '💤', '🎸', '🎨', '💻', '🧹', '💊', '🌱', '🚶', '🚴', '🏋️', '🍎', '🍳', '🦷', '🚿', '📵', '🚭', '🍺', '🍷', '🎮', '📱', '⏰', '📅', '✉️', '📞', '🛒', '🎁', '🐶', '🐱', '🪴', '☀️', '🌙', '⭐'].map((e) => (
                                        <button
                                            key={e}
                                            type="button"
                                            onClick={() => setEmoji(e)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-md text-xl transition-all ${emoji === e ? 'bg-white shadow-sm scale-110 ring-2 ring-blue-500' : 'hover:bg-gray-200 hover:scale-110'}`}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <div className="flex gap-2 overflow-x-auto p-1">
                                    {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#64748b'].map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['checkbox', 'time', 'amount'] as HabitType[]).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${type === t
                                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {type !== 'checkbox' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Goal</label>
                                    <input
                                        type="number"
                                        value={goal || ''}
                                        onChange={(e) => setGoal(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., 30"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <input
                                        type="text"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={type === 'time' ? 'mins' : 'pages'}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    {(['daily', 'weekly', 'interval'] as HabitFrequency[]).map((f) => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => setFrequency(f)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${frequency === f
                                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>

                                {frequency === 'weekly' && (
                                    <div className="flex justify-between gap-1">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    if (daysOfWeek.includes(i)) {
                                                        setDaysOfWeek(daysOfWeek.filter(d => d !== i));
                                                    } else {
                                                        setDaysOfWeek([...daysOfWeek, i]);
                                                    }
                                                }}
                                                className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${daysOfWeek.includes(i)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {frequency === 'interval' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Every</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={interval}
                                            onChange={(e) => setInterval(Number(e.target.value))}
                                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                                        />
                                        <span className="text-sm text-gray-600">days</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">End Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="habit-form"
                            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Save Habit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
