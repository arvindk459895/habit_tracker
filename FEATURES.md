# 🚀 HabitFlow Tracker - Feature Documentation

A comprehensive guide to all features implemented in the HabitFlow application.

## 🧠 AI Integration (Powered by Gemini)

### 1. AI Habit Coach
*   **Personalized Insights**: Analyzes your habit history to provide deep insights into your patterns (e.g., "You tend to miss habits on weekends").
*   **Daily Motivation**: Generates unique, context-aware motivational messages based on your current streak and performance.
*   **Actionable Tips**: Offers specific, practical recommendations to improve your consistency.
*   **Widget**: Accessible directly from the dashboard for daily inspiration.

### 2. Magic Add (Natural Language Creation)
*   **Smart Parsing**: Create complex habits by simply typing a sentence.
*   **Examples**:
    *   "Drink 3 liters of water every day" -> Creates a numeric daily habit.
    *   "Go to gym on Mon, Wed, Fri" -> Creates a weekly habit on specific days.
    *   "Read for 30 mins daily" -> Creates a time-based habit.
*   **Auto-Configuration**: Automatically detects habit name, frequency, goal, unit, and even suggests a matching icon and color.

---

## 📊 Analytics & Reviews

### 3. Advanced Analytics Dashboard
*   **Completion Trends**: Line chart showing your completion rate over time (7, 14, 30, or 90 days).
*   **Weekly Comparison**: Bar chart comparing your performance across recent weeks.
*   **Habit Distribution**: Pie chart showing which habits you complete most often.
*   **Quick Stats**: Total completions, average success rate, and best performing day.

### 4. Progress Reviews
*   **Weekly & Monthly Views**: Dedicated page to review your performance for specific periods.
*   **Detailed Breakdown**: Visual progress bars for every single habit.
*   **Auto-Generated Insights**: Highlights perfect days, top habits, and areas for improvement.
*   **Data Export**: Download your review data as a JSON file for external analysis.

---

## 🎮 Gamification & Motivation

### 5. Comprehensive Badge System
*   **14 Unique Badges**: Ranging from "First Step" to "Legendary".
*   **4 Tiers**: Bronze 🥉, Silver 🥈, Gold 🥇, Platinum 💎.
*   **Unlock Conditions**:
    *   **Streak Badges**: 3, 7, 30, 90, 100 days.
    *   **Milestone Badges**: 100, 500, 1000 total completions.
    *   **Special Badges**: "Perfect Week", "Comeback Kid" (returning after a break), "Multi-Tasker".
*   **Visual Widget**: View your latest earned badges directly on the dashboard.

### 6. Streaks & Levels
*   **Streak Tracking**: Tracks current and best streaks for every habit.
*   **Visual Fire**: 🔥 icon lights up when you're on a streak.
*   **Confetti Celebrations**: Bursts of confetti when you complete all habits for the day or unlock a badge.

---

## 🛠️ Core Habit Management

### 7. Flexible Habit Types
*   **Yes/No**: Simple completion (e.g., "Made Bed").
*   **Numeric**: Track specific amounts (e.g., "8 glasses of water").
*   **Time-Based**: Track duration (e.g., "30 mins reading").

### 8. Custom Frequencies
*   **Daily**: Every day.
*   **Weekly**: Specific days (e.g., Mon, Wed, Fri).
*   **Interval**: Every X days (e.g., every 3 days).

### 9. Smart Templates
*   **30+ Pre-built Habits**: One-click setup for popular habits.
*   **Categories**: Health, Productivity, Mindfulness, Social, Chores, Learning.

### 10. Icon Library
*   **100+ Icons**: Categorized searchable library to customize habit appearance.
*   **Color Coding**: Assign custom colors to habits for visual organization.

---

## ⚙️ Advanced Tools

### 11. Vacation Mode
*   **Streak Protection**: Pause habits during vacations without breaking your hard-earned streaks.
*   **Date Range**: Set specific start and end dates for your break.
*   **Visual Indicator**: Habits show a "Frozen" ❄️ status during vacation.

### 12. Offline Mode (PWA)
*   **Works Offline**: Full functionality without an internet connection.
*   **Data Persistence**: Changes made offline are saved and synced when you reconnect.
*   **Installable**: Can be installed as a native-like app on mobile and desktop.
*   **Offline Indicator**: Visual banner notifies you when you're disconnected.

### 13. Day Notes & Logs
*   **Daily Journal**: Add notes to any day to track mood, energy, or context.
*   **Rich Logging**: Track exact values (e.g., "500ml", "15 mins") for numeric habits.

### 14. Theme & Customization
*   **Dark/Light Mode**: Fully supported system-wide dark mode.
*   **Responsive Design**: Optimized for both desktop and mobile usage.
