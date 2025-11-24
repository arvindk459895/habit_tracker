import React, { useEffect, useState } from 'react';
import { X, Trophy, ArrowLeft, UserPlus, UserCheck, Trash2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChallengeStore } from '../../store/challengeStore';
import { useAuthStore } from '../../store/authStore';
import { useFriendStore } from '../../store/friendStore';
import { ChallengeCard } from './ChallengeCard';
import { Leaderboard } from './Leaderboard';

interface SocialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose }) => {
    const { challenges, fetchChallenges, joinChallenge, isLoading } = useChallengeStore();
    const { friends, pendingRequests, sendFriendRequest, acceptFriendRequest, removeFriend } = useFriendStore();
    const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'explore' | 'my' | 'friends'>('explore');
    const [friendEmail, setFriendEmail] = useState('');
    const { user } = useAuthStore();

    useEffect(() => {
        if (isOpen) {
            fetchChallenges();
        }
    }, [isOpen, fetchChallenges]);

    const handleJoin = async (id: string) => {
        await joinChallenge(id);
    };

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (friendEmail.trim()) {
            await sendFriendRequest(friendEmail);
            setFriendEmail('');
        }
    };

    const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);

    const filteredChallenges = challenges.filter(c => {
        if (activeTab === 'explore') return true;
        if (activeTab === 'my') return user && c.participants.includes(user.uid);
        return false;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {selectedChallengeId ? (
                                <button
                                    onClick={() => setSelectedChallengeId(null)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                                </button>
                            ) : (
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Trophy className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {selectedChallengeId ? selectedChallenge?.title : 'Community Hub'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {!selectedChallengeId && (
                        <div className="flex border-b border-gray-100 dark:border-gray-800">
                            {['explore', 'my', 'friends'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${activeTab === tab
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {tab === 'explore' ? 'Explore' : tab === 'my' ? 'My Challenges' : 'Friends'}
                                    {activeTab === tab && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : selectedChallengeId && selectedChallenge ? (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Leaderboard</h3>
                                <p className="text-sm text-gray-500 mb-4">Top performers in this challenge</p>
                                <Leaderboard entries={selectedChallenge.leaderboard} />
                            </div>
                        </div>
                    ) : activeTab === 'friends' ? (
                        <div className="space-y-6">
                            {/* Add Friend */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                    <UserPlus size={18} className="text-blue-500" />
                                    Add Friend
                                </h3>
                                <form onSubmit={handleAddFriend} className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter friend's email..."
                                        value={friendEmail}
                                        onChange={(e) => setFriendEmail(e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!friendEmail.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        Add
                                    </button>
                                </form>
                            </div>

                            {/* Pending Requests */}
                            {pendingRequests.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-sm uppercase tracking-wider text-gray-500">Pending Requests</h3>
                                    <div className="space-y-3">
                                        {pendingRequests.map(req => (
                                            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <div className="font-medium text-gray-800 dark:text-white">{req.name}</div>
                                                        <div className="text-xs text-gray-500">{req.email}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => acceptFriendRequest(req.id)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                    title="Accept Request"
                                                >
                                                    <UserCheck size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Friends List */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-sm uppercase tracking-wider text-gray-500">My Friends ({friends.length})</h3>
                                {friends.length > 0 ? (
                                    <div className="space-y-3">
                                        {friends.map(friend => (
                                            <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <div className="font-medium text-gray-800 dark:text-white">{friend.name}</div>
                                                        <div className="text-xs text-gray-500">{friend.email}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFriend(friend.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove Friend"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <User size={48} className="mx-auto mb-2 opacity-20" />
                                        <p>No friends yet. Add someone to get started!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredChallenges.length > 0 ? (
                                filteredChallenges.map(challenge => (
                                    <ChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        onJoin={handleJoin}
                                        onViewLeaderboard={(id) => setSelectedChallengeId(id)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    {activeTab === 'my'
                                        ? "You haven't joined any challenges yet. Check the Explore tab!"
                                        : "No challenges found."}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
