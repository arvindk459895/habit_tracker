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
    getCoachingInsights: async (habits: Habit[], logs: Record<string, HabitLog>) => {
        if (!aiService.isConfigured()) return null;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

            // Prepare context data
            const activeHabits = habits.filter(h => !h.archived).map(h => h.name).join(', ');
            const recentLogs = Object.values(logs).slice(-50).map(l =>
                `${l.habitId} was ${l.status} on ${l.date}`
            ).join('\\n');

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
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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
        console.log('===== MAGIC ADD CALLED =====', text);
        console.log('API Configured:', aiService.isConfigured());

        if (!aiService.isConfigured()) return null;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

            const prompt = `Extract habit details from: "${text}"

Return ONLY valid JSON with these fields:
{
  "name": "Short habit name",
  "frequency": "daily" or "weekly" or "interval",
  "description": "Brief description",
  "emoji": "Single emoji",
  "color": "#hexcolor"
}

Examples:
- "Meditation 10mins" → {"name":"Meditation","frequency":"daily","description":"10 minutes daily","emoji":"🧘","color":"#8b5cf6"}
- "Gym 3x week" → {"name":"Gym Workout","frequency":"weekly","days OfWeek":[1,3,5],"emoji":"💪","color":"#ef4444"}

Return ONLY JSON, no explanations.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let textResponse = response.text();

            console.log('AI Response:', textResponse);

            // Clean response
            textResponse = textResponse.trim();
            textResponse = textResponse.replace(/```json\\s*/g, '');
            textResponse = textResponse.replace(/```\\s*/g, '');

            // Extract JSON object
            const jsonMatch = textResponse.match(/\\{[\\s\\S]*\\}/);
            if (!jsonMatch) {
                console.error('No JSON found in response');
                return null;
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Return formatted habit data
            return {
                name: parsed.name,
                frequency: parsed.frequency || 'daily',
                daysOfWeek: parsed.daysOfWeek,
                interval: parsed.interval,
                icon: parsed.emoji || '✅',
                color: parsed.color || '#3b82f6'
            };
        } catch (error) {
            console.error("Magic Add Error:", error);
            return null;
        }
    }
};
