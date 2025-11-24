import React, { useState } from 'react';
import { LeaderboardEntry } from '../../types';
import { Medal, User, Users, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useFriendStore } from '../../store/friendStore';

interface LeaderboardProps {
    entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
    const { user } = useAuthStore();
    const { friends } = useFriendStore();
    const [filter, setFilter] = useState<'global' | 'friends'>('global');

    const filteredEntries = entries.filter(entry => {
        if (filter === 'global') return true;
        if (!user) return true;
        // Show self and friends
        // For demo purposes, we check if the entry's user name matches any friend's name or email
        // In a real app, this would be a strict ID check: entry.userId === user.uid || friends.some(f => f.id === entry.userId)
        return entry.userId === user.uid || friends.some(f =>
            f.id === entry.userId ||
            f.name.toLowerCase() === entry.userName.toLowerCase() ||
            f.email.toLowerCase().includes(entry.userName.toLowerCase())
        );
    });

    const sortedEntries = [...filteredEntries].sort((a, b) => b.score - a.score);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="flex justify-end mb-4 px-2">
                <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-xs font-medium">
                    <button
                        onClick={() => setFilter('global')}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-all ${filter === 'global'
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        <Globe size={14} />
                        Global
                    </button>
                    <button
                        onClick={() => setFilter('friends')}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-all ${filter === 'friends'
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        <Users size={14} />
                        Friends
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
                {sortedEntries.length > 0 ? (
                    sortedEntries.map((entry, index) => {
                        const isCurrentUser = user && entry.userId === user.uid;
                        const rank = index + 1;

                        let rankIcon;
                        if (rank === 1) rankIcon = <Medal className="text-yellow-400" size={24} />;
                        else if (rank === 2) rankIcon = <Medal className="text-gray-400" size={24} />;
                        else if (rank === 3) rankIcon = <Medal className="text-orange-400" size={24} />;
                        else rankIcon = <span className="text-gray-500 font-bold w-6 text-center">{rank}</span>;

                        return (
                            <div
                                key={entry.userId}
                                className={`flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 ${isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                            >
                                <div className="flex-shrink-0 w-8 flex justify-center">
                                    {rankIcon}
                                </div>

                                <div className="flex-shrink-0">
                                    {entry.userAvatar ? (
                                        <img src={entry.userAvatar} alt={entry.userName} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                            <User size={20} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow">
                                    <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        {entry.userName}
                                        {isCurrentUser && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-bold text-blue-600 dark:text-blue-400">{entry.score}</div>
                                    <div className="text-xs text-gray-500">points</div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Users size={32} className="mx-auto mb-2 opacity-20" />
                        <p>No friends in this challenge yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
