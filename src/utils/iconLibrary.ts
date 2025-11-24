export const iconCategories = {
    recent: [], // Will be populated dynamically
    health: ['💪', '🏃', '🧘', '🥗', '💤', '🚰', '🚴', '🏊', '🍎', '💊', '🦷', '🛁', '🚶', '🏋️', '🤸', '🥒', '🥕', '🥑'],
    productivity: ['📚', '✍️', '💻', '📊', '🎯', '⏰', '📝', '📅', '📧', '📞', '🧠', '💡', '🔋', '🚀', '⭐', '🏆', '💼', '💰'],
    mindfulness: ['🧘‍♀️', '📿', '🙏', '🌅', '🕯️', '🌳', '🍃', '🌸', '☁️', '🌙', '✨', '🎵', '🎨', '🎭', '🎪', '🎫', '🎟️', '🎼'],
    social: ['👨‍👩‍👧‍👦', '👫', '🤝', '💌', '📱', '🗣️', '🎉', '🎁', '🎈', '🧸', '🎲', '🎮', '🎳', '🎤', '🎧', '🎷', '🎸', '🎹'],
    chores: ['🧹', '🧺', '🧽', '🧼', '🛒', '🍳', '🗑️', '🔧', '🔨', '🪴', '🐶', '🐱', '🚗', '🚲', '🏠', '🛏️', '🚪', '🔑'],
    learning: ['📖', '🎓', '🏫', '🎒', '🔬', '🔭', '🧪', '🧬', '🌍', '🗺️', '🧭', '📐', '📏', '📎', '📌', '🖍️', '🖌️', '🖊️']
};

export type IconCategory = keyof typeof iconCategories;

export const categoryIcons: Record<IconCategory, string> = {
    recent: '🕒',
    health: '❤️',
    productivity: '⚡',
    mindfulness: '🧘',
    social: '👥',
    chores: '🏠',
    learning: '🧠'
};

export const categoryNames: Record<IconCategory, string> = {
    recent: 'Recent',
    health: 'Health',
    productivity: 'Productivity',
    mindfulness: 'Mindfulness',
    social: 'Social',
    chores: 'Chores',
    learning: 'Learning'
};
