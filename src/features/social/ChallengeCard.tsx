import React from 'react';
import { Challenge } from '../../types';
import { Users, Calendar, Trophy } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface ChallengeCardProps {
    challenge: Challenge;
    onJoin: (id: string) => void;
    onViewLeaderboard: (id: string) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoin, onViewLeaderboard }) => {
    const { user } = useAuthStore();
    const isJoined = user && challenge.participants.includes(user.uid);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{challenge.title}</h3>
                {isJoined && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        Joined
                    </span>
                )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {challenge.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                    <Users size={14} />
                    {challenge.participants.length} joined
                </div>
                <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {challenge.endDate}
                </div>
            </div>

            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg mb-4">
                💡 <strong>How to win:</strong> Complete your {challenge.habitType} habit daily to earn 1 point!
            </div>

            <div className="flex gap-2">
                {!isJoined ? (
                    <button
                        onClick={() => onJoin(challenge.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Join Challenge
                    </button>
                ) : (
                    <button
                        onClick={() => onViewLeaderboard(challenge.id)}
                        className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Trophy size={16} className="text-yellow-500" />
                        View Leaderboard
                    </button>
                )}
            </div>
        </div>
    );
};
