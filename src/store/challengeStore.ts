import { create } from 'zustand';
import { Challenge } from '../types';
import { auth } from '../lib/firebase';

interface ChallengeStore {
    challenges: Challenge[];
    activeChallengeId: string | null;
    isLoading: boolean;
    fetchChallenges: () => Promise<void>;
    joinChallenge: (challengeId: string) => Promise<void>;
    setActiveChallenge: (id: string | null) => void;
}

// Mock Data for MVP
const MOCK_CHALLENGES: Challenge[] = [
    {
        id: 'challenge-1',
        title: '30-Day Water Challenge 💧',
        description: 'Drink at least 2 liters of water every day for 30 days. Stay hydrated!',
        habitType: 'water',
        startDate: '2023-11-01',
        endDate: '2023-11-30',
        participants: [],
        leaderboard: [
            { userId: 'user-1', userName: 'Alice', score: 28, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
            { userId: 'user-2', userName: 'Bob', score: 25, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
            { userId: 'user-3', userName: 'Charlie', score: 20, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
        ]
    },
    {
        id: 'challenge-2',
        title: 'Early Bird 🌅',
        description: 'Wake up before 7 AM and log it. Start your day right!',
        habitType: 'wakeup',
        startDate: '2023-11-01',
        endDate: '2023-11-30',
        participants: [],
        leaderboard: [
            { userId: 'user-4', userName: 'David', score: 15, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
            { userId: 'user-5', userName: 'Eve', score: 12, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve' },
        ]
    },
    {
        id: 'challenge-3',
        title: 'Read 10 Pages 📚',
        description: 'Read at least 10 pages of a book daily. Knowledge is power.',
        habitType: 'reading',
        startDate: '2023-11-01',
        endDate: '2023-11-30',
        participants: [],
        leaderboard: [
            { userId: 'user-6', userName: 'Frank', score: 5, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank' },
        ]
    }
];

export const useChallengeStore = create<ChallengeStore>((set) => ({
    challenges: [],
    activeChallengeId: null,
    isLoading: false,

    fetchChallenges: async () => {
        set({ isLoading: true });
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Load joined challenges from LocalStorage
            const joinedIds = JSON.parse(localStorage.getItem('joinedChallenges') || '[]');
            const user = auth.currentUser;

            const mergedChallenges = MOCK_CHALLENGES.map(c => {
                if (joinedIds.includes(c.id) && user) {
                    // If user joined locally, ensure they are in participants
                    if (!c.participants.includes(user.uid)) {
                        return {
                            ...c,
                            participants: [...c.participants, user.uid],
                            leaderboard: [
                                ...c.leaderboard,
                                {
                                    userId: user.uid,
                                    userName: user.displayName || 'You',
                                    userAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                                    score: 0 // In a real app, we'd fetch the actual score
                                }
                            ]
                        };
                    }
                }
                return c;
            });

            set({ challenges: mergedChallenges, isLoading: false });
        } catch (error) {
            console.error("Error fetching challenges:", error);
            set({ isLoading: false });
        }
    },

    joinChallenge: async (challengeId) => {
        const user = auth.currentUser;
        if (!user) return;

        set(state => {
            const updatedChallenges = state.challenges.map(c => {
                if (c.id === challengeId) {
                    if (c.participants.includes(user.uid)) return c;

                    return {
                        ...c,
                        participants: [...c.participants, user.uid],
                        leaderboard: [
                            ...c.leaderboard,
                            {
                                userId: user.uid,
                                userName: user.displayName || 'You',
                                userAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                                score: 0
                            }
                        ]
                    };
                }
                return c;
            });

            // Persist to LocalStorage
            const joinedIds = updatedChallenges
                .filter(c => c.participants.includes(user.uid))
                .map(c => c.id);
            localStorage.setItem('joinedChallenges', JSON.stringify(joinedIds));

            return { challenges: updatedChallenges };
        });
    },

    setActiveChallenge: (id) => set({ activeChallengeId: id }),
}));
