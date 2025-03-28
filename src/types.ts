  export interface WordPair {
    id: string;
    bangla: string;
    korean: string;
    partOfSpeech: string; // Kept this field
    examples?: { bangla: string; korean: string }[];
    source?: 'local' | 'google' | 'ai';
  }

  export type Language = 'bangla' | 'korean';

  export type SortOption = 'alphabetical';