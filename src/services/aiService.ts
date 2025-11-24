import { GoogleGenerativeAI } from "@google/generative-ai";
import { Habit, HabitLog } from "../types";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

export const aiService = {
    // Check if API key is configured
    isConfigured: () => {
        return !!API_KEY && API_KEY !== 'YOUR_API_KEY_HERE';
    },

    // 1. AI Habit Coach & 2. Intelligent Insights
    getCoachingInsights: async (habits: Habit[], logs: Record<string, HabitLog>, period: 'week' | 'month' = 'week') => {
        if (!aiService.isConfigured()) return null;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            // Prepare context data
            const activeHabits = habits.filter(h => !h.archived).map(h => h.name).join(', ');
            const recentLogs = Object.values(logs).slice(-50).map(l =>
                `${l.habitId} was ${l.status} on ${l.date}`
            ).join('\n');

            const prompt = `
                You are an encouraging and analytical Habit Coach.
                
                User's Active Habits: ${activeHabits}
                Recent Activity Log:
                ${recentLogs}

                Please provide a JSON response with the following fields:
                1. "motivation": A short, punchy motivational message based on their recent performance.
                2. "insight": A deep analytical insight about their patterns (e.g., "You tend to miss habits on weekends" or "You're on a 5-day streak with X").
                3. "recommendation": A specific, actionable tip to improve.
                
                Format: JSON only, no markdown.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Error generating coaching insights:", error);
            return null;
        }
    },

    // 3. Smart Recommendations
    getHabitSuggestions: async (currentHabits: Habit[]) => {
        if (!aiService.isConfigured()) return [];

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const habitNames = currentHabits.map(h => h.name).join(', ');

            const prompt = `
                Based on the user's current habits: ${habitNames}
                
                Suggest 3 new complementary habits that would fit well with their routine.
                For each suggestion, provide:
                1. "name": Habit name
                2. "reason": Why this fits
                3. "difficulty": "Easy", "Medium", or "Hard"
                
                Format: JSON array of objects.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Error getting suggestions:", error);
            return [];
        }
    },

    // 4. Natural Language Habit Creation
    parseHabitFromText: async (text: string): Promise<Partial<Habit> | null> => {
        if (!aiService.isConfigured()) return null;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `
                Extract habit details from this text: "${text}"
                
                Return a JSON object with:
                - name: Short, clear habit name
                - frequency: "daily", "weekly", or "interval"
                - daysOfWeek: Array of numbers 0-6 (0=Sun) if weekly
                - interval: number if interval
                - description: Optional description
                - icon: A single emoji character that best fits the habit
                - color: A hex color code that fits the habit vibe
                
                If the text is not a habit request, return null.
                Format: JSON only.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();
            const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Error parsing habit:", error);
            return null;
        }
    }
};
