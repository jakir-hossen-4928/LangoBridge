// History management for vocabulary lookups
export interface HistoryItem {
    id: string;
    bangla: string;
    korean: string;
    timestamp: string;
    examples?: { bangla: string; korean: string }[];
}

const HISTORY_KEY = 'vocabulary_history';
const MAX_HISTORY_ITEMS = 50;

export const getHistory = (): HistoryItem[] => {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading history:', error);
        return [];
    }
};

export const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>): void => {
    try {
        const history = getHistory();

        // Check if item already exists (avoid duplicates)
        const existingIndex = history.findIndex(
            h => h.bangla === item.bangla && h.korean === item.korean
        );

        if (existingIndex !== -1) {
            // Remove existing item to re-add it at the top
            history.splice(existingIndex, 1);
        }

        const newItem: HistoryItem = {
            ...item,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
        };

        // Add to beginning of array
        history.unshift(newItem);

        // Keep only the most recent items
        const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
        console.error('Error adding to history:', error);
    }
};

export const clearHistory = (): void => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
};

export const removeFromHistory = (id: string): void => {
    try {
        const history = getHistory();
        const filtered = history.filter(item => item.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error removing from history:', error);
    }
};

export const formatHistoryDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};
