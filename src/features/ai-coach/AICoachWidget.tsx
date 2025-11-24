import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, TrendingUp, RefreshCw } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useHabitStore } from '../../store/habitStore';
import { motion } from 'framer-motion';

interface CoachData {
    motivation: string;
    insight: string;
    recommendation: string;
}

export const AICoachWidget: React.FC = () => {
    const { habits, logs } = useHabitStore();
    const [data, setData] = useState<CoachData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = async () => {
        if (!aiService.isConfigured()) {
            setError("API Key missing");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await aiService.getCoachingInsights(habits, logs);
            if (result) {
                setData(result);
            } else {
                setError("Failed to generate insights");
            }
        } catch (err) {
            setError("Error connecting to AI Coach");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch if configured
        if (aiService.isConfigured() && !data) {
            fetchInsights();
        }
    }, []);

    if (!aiService.isConfigured()) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Sparkles className="text-yellow-300" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">AI Coach</h3>
                        <p className="text-indigo-100 text-xs">Powered by Gemini</p>
                    </div>
                </div>
                <button
                    onClick={fetchInsights}
                    disabled={loading}
                    className={`p-2 hover:bg-white/20 rounded-full transition-colors ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {loading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                </div>
            ) : error ? (
                <div className="text-red-200 text-sm">{error}</div>
            ) : data ? (
                <div className="space-y-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                    >
                        <p className="text-lg font-medium leading-snug">"{data.motivation}"</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex gap-3 items-start"
                        >
                            <TrendingUp className="text-green-300 shrink-0 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Insight</p>
                                <p className="text-sm text-white/90">{data.insight}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-3 items-start"
                        >
                            <Lightbulb className="text-yellow-300 shrink-0 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Tip</p>
                                <p className="text-sm text-white/90">{data.recommendation}</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <div className="text-indigo-100 text-sm">
                    Ready to analyze your habits! Click refresh to start.
                </div>
            )}
        </div>
    );
};
