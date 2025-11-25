import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HabitGrid } from './features/dashboard/HabitGrid';
import { DataControls } from './features/settings/DataControls';
import { Moon, Sun, LogOut, MessageSquare, Users } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './features/auth/LoginPage';
import { FeedbackModal } from './features/feedback/FeedbackModal';
import { SocialModal } from './features/social/SocialModal';
import { ReviewsPage } from './features/reviews/ReviewsPage';
import { AdvancedAnalytics } from './features/analytics/AdvancedAnalytics';
import { useActivityStore } from './store/useActivityStore';
import { fetchUserMetadata } from './services/userInfoService';
import { OfflineIndicator } from './components/OfflineIndicator';

function App() {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isSocialOpen, setIsSocialOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'reviews' | 'analytics'>('dashboard');
    const { theme, toggleTheme } = useTheme();
    const { user, loading, logout } = useAuthStore();
    const { logActivity } = useActivityStore();

    useEffect(() => {
        const initLogging = async () => {
            const metadata = await fetchUserMetadata();
            logActivity('SYSTEM', 'APP', 'APP_INIT', { theme }, metadata);
        };
        initLogging();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <Router basename="/habit_tracker">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <OfflineIndicator />
                <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            H
                        </div>
                        <span className="text-xl font-bold text-gray-800 dark:text-white">HabitFlow</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSocialOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium"
                        >
                            <Users size={18} />
                            <span className="hidden sm:inline">Community</span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        <DataControls />

                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors hidden sm:block"
                            title="Send Feedback"
                        >
                            <MessageSquare size={20} />
                        </button>

                        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                            <img
                                src={user.photoURL || ''}
                                alt={user.displayName || 'User'}
                                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                                title={user.displayName || 'User'}
                            />
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Navigation Tabs */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex gap-8">
                            <button
                                onClick={() => setCurrentPage('dashboard')}
                                className={`py-4 px-2 border-b-2 transition-colors ${currentPage === 'dashboard'
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                    }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setCurrentPage('reviews')}
                                className={`py-4 px-2 border-b-2 transition-colors ${currentPage === 'reviews'
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                    }`}
                            >
                                Reviews
                            </button>
                            <button
                                onClick={() => setCurrentPage('analytics')}
                                className={`py-4 px-2 border-b-2 transition-colors ${currentPage === 'analytics'
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                    }`}
                            >
                                Analytics
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main>
                    {currentPage === 'dashboard' && <HabitGrid />}
                    {currentPage === 'reviews' && <ReviewsPage />}
                    {currentPage === 'analytics' && (
                        <div className="p-6">
                            <div className="max-w-6xl mx-auto">
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">📈 Advanced Analytics</h1>
                                <AdvancedAnalytics />
                            </div>
                        </div>
                    )}
                </main>

                <FeedbackModal
                    isOpen={isFeedbackOpen}
                    onClose={() => setIsFeedbackOpen(false)}
                />

                <SocialModal
                    isOpen={isSocialOpen}
                    onClose={() => setIsSocialOpen(false)}
                />
            </div>
        </Router>
    );
}

export default App;
