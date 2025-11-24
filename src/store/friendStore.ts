import { create } from 'zustand';
import { Friend } from '../types';

interface FriendStore {
    friends: Friend[];
    pendingRequests: Friend[];
    isLoading: boolean;
    sendFriendRequest: (email: string) => Promise<void>;
    acceptFriendRequest: (id: string) => void;
    removeFriend: (id: string) => void;
}

// Mock Data
const MOCK_FRIENDS: Friend[] = [
    {
        id: 'friend-1',
        name: 'Sarah Jenkins',
        email: 'sarah@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        status: 'accepted'
    },
    {
        id: 'friend-2',
        name: 'Mike Ross',
        email: 'mike@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        status: 'accepted'
    }
];

const MOCK_REQUESTS: Friend[] = [
    {
        id: 'friend-3',
        name: 'Jessica Pearson',
        email: 'jessica@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
        status: 'pending'
    }
];

export const useFriendStore = create<FriendStore>((set) => {
    // Load from LocalStorage
    const storedFriends = JSON.parse(localStorage.getItem('friends') || 'null');
    const initialFriends = storedFriends || MOCK_FRIENDS;

    return {
        friends: initialFriends,
        pendingRequests: MOCK_REQUESTS,
        isLoading: false,

        sendFriendRequest: async (email: string) => {
            set({ isLoading: true });
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newRequest: Friend = {
                id: `friend-${Date.now()}`,
                name: email.split('@')[0],
                email: email,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                status: 'pending'
            };

            set(state => {
                const newFriend: Friend = { ...newRequest, status: 'accepted' };
                const newFriends = [...state.friends, newFriend];
                localStorage.setItem('friends', JSON.stringify(newFriends));
                return {
                    isLoading: false,
                    friends: newFriends
                };
            });
        },

        acceptFriendRequest: (id: string) => {
            set(state => {
                const request = state.pendingRequests.find(r => r.id === id);
                if (!request) return state;

                const newFriend: Friend = { ...request, status: 'accepted' };
                const newFriends = [...state.friends, newFriend];
                localStorage.setItem('friends', JSON.stringify(newFriends));

                return {
                    friends: newFriends,
                    pendingRequests: state.pendingRequests.filter(r => r.id !== id)
                };
            });
        },

        removeFriend: (id: string) => {
            set(state => {
                const newFriends = state.friends.filter(f => f.id !== id);
                localStorage.setItem('friends', JSON.stringify(newFriends));
                return { friends: newFriends };
            });
        }
    };
});
