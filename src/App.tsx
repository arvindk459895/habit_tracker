import { useState } from 'react';
import { HabitGrid } from './features/dashboard/HabitGrid';
import { AnalysisPanel } from './features/analytics/AnalysisPanel';
import { DataControls } from './features/settings/DataControls';
import { LayoutGrid, BarChart2, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './features/auth/LoginPage';

function App() {
    const [view, setView] = useState<'grid' | 'analysis'>('grid');
    const { theme, toggleTheme } = useTheme();
    const { user, loading, logout } = useAuthStore();

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        H
                    </div>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">HabitFlow</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <DataControls />

                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                            onClick={() => setView('grid')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'grid'
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <LayoutGrid size={18} />
                            Grid
                        </button>
                        <button
                            onClick={() => setView('analysis')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'analysis'
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <BarChart2 size={18} />
                            Analysis
                        </button>
                    </div>

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

            <main>
                {view === 'grid' ? <HabitGrid /> : <AnalysisPanel />}
            </main>
        </div>
    );
}

export default App;
