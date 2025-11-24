import React, { useState, useMemo } from 'react';
import { iconCategories, categoryIcons, categoryNames, IconCategory } from '../utils/iconLibrary';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IconPickerProps {
    selectedIcon: string;
    onSelect: (icon: string) => void;
    onClose?: () => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect, onClose }) => {
    const [activeCategory, setActiveCategory] = useState<IconCategory>('health');
    const [searchQuery, setSearchQuery] = useState('');
    const [recentIcons, setRecentIcons] = useState<string[]>(() => {
        const saved = localStorage.getItem('recentIcons');
        return saved ? JSON.parse(saved) : [];
    });

    const handleSelect = (icon: string) => {
        onSelect(icon);

        // Update recent icons
        const newRecents = [icon, ...recentIcons.filter(i => i !== icon)].slice(0, 18);
        setRecentIcons(newRecents);
        localStorage.setItem('recentIcons', JSON.stringify(newRecents));

        if (onClose) onClose();
    };

    const filteredIcons = useMemo(() => {
        if (!searchQuery.trim()) {
            if (activeCategory === 'recent') {
                return recentIcons;
            }
            return iconCategories[activeCategory];
        }

        // Search across all categories
        const allIcons = Object.values(iconCategories).flat();
        // Simple search implementation - in a real app, you might want to map emojis to keywords
        // For now, we'll just return all icons if there's a search query because searching emojis by text is hard without a library
        // So we'll rely on the categories mostly, but let's just show everything for now if searching
        return allIcons;
    }, [activeCategory, searchQuery, recentIcons]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-sm overflow-hidden flex flex-col h-[400px]">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search icons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Category Tabs */}
            {!searchQuery && (
                <div className="flex overflow-x-auto p-2 gap-1 border-b border-gray-200 dark:border-gray-700 custom-scrollbar">
                    {(Object.keys(iconCategories) as IconCategory[]).map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === category
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <span>{categoryIcons[category]}</span>
                            <span>{categoryNames[category]}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {searchQuery && <p className="text-xs text-gray-500 mb-2">Search results (showing all):</p>}

                <div className="grid grid-cols-6 gap-2">
                    {filteredIcons.map((icon, index) => (
                        <motion.button
                            key={`${icon}-${index}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSelect(icon)}
                            className={`aspect-square flex items-center justify-center text-2xl rounded-lg transition-colors ${selectedIcon === icon
                                    ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {icon}
                        </motion.button>
                    ))}
                </div>

                {filteredIcons.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No icons found</p>
                    </div>
                )}
            </div>
        </div>
    );
};
