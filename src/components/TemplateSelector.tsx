import React, { useState } from 'react';
import { HabitTemplate, TemplateCategory, habitTemplates, templateCategories, getAllCategories, getTemplatesByCategory } from '../data/habitTemplates';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface TemplateSelectorProps {
    onSelectTemplate: (template: HabitTemplate) => void;
    onClose?: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, onClose }) => {
    const [activeCategory, setActiveCategory] = useState<TemplateCategory>('health');

    const categories = getAllCategories();
    const templates = getTemplatesByCategory(activeCategory);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Habit Templates</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quick-start with pre-configured habits</p>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto p-3 gap-2 border-b border-gray-200 dark:border-gray-700 custom-scrollbar">
                {categories.map(category => {
                    const categoryInfo = templateCategories[category];
                    return (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === category
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            style={activeCategory === category ? {
                                backgroundColor: `${categoryInfo.color}20`,
                                color: categoryInfo.color
                            } : {}}
                        >
                            <span>{categoryInfo.icon}</span>
                            <span>{categoryInfo.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map(template => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => onSelectTemplate(template)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: `${template.color}20` }}
                                    >
                                        {template.emoji}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {template.name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                            <span className="capitalize">{template.type}</span>
                                            <span>•</span>
                                            <span className="capitalize">{template.frequency}</span>
                                            {template.goal && template.unit && (
                                                <>
                                                    <span>•</span>
                                                    <span>{template.goal} {template.unit}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {template.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
