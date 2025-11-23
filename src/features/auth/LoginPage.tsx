import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogIn, CheckCircle2, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
    const { signIn } = useAuthStore();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-700" />

            <motion.div
                className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center relative z-10 border border-white/20 dark:border-gray-700/50"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-8 shadow-lg shadow-blue-500/30"
                    variants={itemVariants}
                    whileHover={{ rotate: -10, scale: 1.05 }}
                >
                    H
                </motion.div>

                <motion.h1
                    className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight"
                    variants={itemVariants}
                >
                    HabitFlow
                </motion.h1>
                <motion.p
                    className="text-gray-500 dark:text-gray-400 mb-10 text-lg"
                    variants={itemVariants}
                >
                    Build better habits, one day at a time.
                </motion.p>

                <motion.div className="space-y-4 mb-10 text-left" variants={itemVariants}>
                    <FeatureRow icon={CheckCircle2} text="Track daily habits effortlessly" delay={0} />
                    <FeatureRow icon={TrendingUp} text="Visualize your progress with analytics" delay={0.1} />
                    <FeatureRow icon={Shield} text="Secure cloud sync & backup" delay={0.2} />
                </motion.div>

                <motion.button
                    onClick={signIn}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden"
                    variants={itemVariants}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <LogIn className="w-5 h-5" />
                    <span className="text-lg font-bold">Sign in with Google</span>
                </motion.button>

                <motion.p
                    className="mt-8 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium"
                    variants={itemVariants}
                >
                    Secure • Private • Free
                </motion.p>
            </motion.div>
        </div>
    );
};

const FeatureRow = ({ icon: Icon, text, delay }: { icon: any, text: string, delay: number }) => (
    <motion.div
        className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 + delay }}
    >
        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Icon size={18} />
        </div>
        <span className="font-medium">{text}</span>
    </motion.div>
);
