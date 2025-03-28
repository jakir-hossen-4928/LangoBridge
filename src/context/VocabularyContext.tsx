// VocabularyContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WordPair } from '@/types';
import { useAuth } from './AuthContext';

interface AdminOverviewData {
  totalWords: number;
  pendingRequests: number;
  activeUsers: number;
  lastUpdate: string;
  recentActivity: { id: string; bangla: string; korean: string; timestamp: string }[];
}

interface VocabularyContextType {
  wordPairs: WordPair[];
  filteredWords: WordPair[];
  selectedLanguage: 'bangla' | 'korean';
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  adminOverview: AdminOverviewData | null;
  selectedSuggestion: WordPair | null; // Add this to track the selected suggestion

  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setFilteredWords: (words: WordPair[]) => void; // Expose this
  setSelectedSuggestion: (word: WordPair | null) => void; // Add this to set the selected suggestion
  toggleLanguage: () => void;
  translate: (key: string) => string;
  addWordPair: (word: Omit<WordPair, 'id'>) => Promise<void>;
  updateWordPair: (word: WordPair) => Promise<void>;
  removeWordPair: (id: string) => Promise<void>;
  requestWordPair: (bangla: string, korean: string, submittedBy: string) => Promise<void>;
  fetchAdminOverview: () => Promise<void>;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

// Translation data (unchanged)
const translations = {
  bangla: {
    home: "হোম",
    vocabulary: "শব্দভাণ্ডার",
    requestword: "শব্দ অনুরোধ করুন",
    admin: "অ্যাডমিন",
    login: "লগইন",
    logout: "লগআউট",
    vocabularyBuilder: "শব্দভাণ্ডার নির্মাতা",
    banglaTile: "বাংলা-কোরিয়ান ভাষা সেতু",
    buildVocabulary: "বাংলা এবং কোরিয়ান ভাষার মধ্যে আপনার শব্দভাণ্ডার তৈরি করুন।",
    searchAddLearn: "আমাদের সুন্দর ইন্টারফেস দিয়ে নতুন শব্দ অনুসন্ধান, যোগ করুন এবং শিখুন।",
    browseVocabulary: "শব্দভাণ্ডার দেখুন",
    addNewWords: "নতুন শব্দ যোগ করুন",
    keyFeatures: "মূল বৈশিষ্ট্য",
    appDescription: "আমাদের শব্দভাণ্ডার অ্যাপ বাংলা এবং কোরিয়ান শব্দভাণ্ডার শেখার এবং পরিচালনা করার জন্য একটি নিরবিচ্ছিন্ন অভিজ্ঞতা প্রদান করে।",
    getStarted: "শুরু করুন",
    expandVocabulary: "আপনার শব্দভাণ্ডার বাড়াতে প্রস্তুত?",
    bridgeGap: "আপনার সংগ্রহে শব্দ যোগ করা শুরু করুন এবং বাংলা এবং কোরিয়ান ভাষার মধ্যে ব্যবধান পূরণ করুন।",
    allRightsReserved: "সর্বস্বত্ব সংরক্ষিত।",
    searchWords: "শব্দ অনুসন্ধান করুন...",
    sortBy: "সাজানোর ক্রম",
    dateAdded: "যোগ করার তারিখ",
    alphabetical: "বর্ণানুক্রমিক",
    requestWord: "শব্দ অনুরোধ করুন",
    noWordsFound: "কোন শব্দ পাওয়া যায়নি",
    tryAdjusting: "আপনার অনুসন্ধান সামঞ্জস্য করার চেষ্টা করুন বা উপরের ফর্মটি ব্যবহার করে একটি নতুন শব্দ অনুরোধ করুন।",
    requestNewWord: "নতুন শব্দ অনুরোধ করুন",
    banglaWord: "বাংলা শব্দ",
    koreanWord: "কোরিয়ান শব্দ",
    submit: "জমা দিন",
    pleaseFillFields: "অনুগ্রহ করে সব ক্ষেত্র পূরণ করুন",
    invalidEmail: "অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা দিন",
    invalidBangla: "বাংলা শব্দে বাংলা লিপির অক্ষর থাকতে হবে",
    invalidKorean: "কোরিয়ান শব্দে হাঙ্গুল অক্ষর থাকতে হবে",
    yourEmail: "আপনার ইমেইল",
    submitting: "জমা দেওয়া হচ্ছে...",
    dashboard: "ড্যাশবোর্ড",
    overview: "ওভারভিউ",
    requests: "অনুরোধ",
    settings: "সেটিংস",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    loginButton: "লগইন",
    loggingIn: "লগইন হচ্ছে...",
    credentials: "পরিচয়পত্র:",
    demoCredentials: "ডেমো পরিচয়পত্র:",
    enterCredentials: "আপনার অ্যাকাউন্ট অ্যাক্সেস করতে আপনার পরিচয়পত্র লিখুন",
  },
  korean: {
    home: "홈",
    vocabulary: "어휘",
    requestword: "요청 단어",
    admin: "관리자",
    login: "로그인",
    logout: "로그아웃",
    vocabularyBuilder: "어휘 빌더",
    banglaTile: "벵골어-한국어 언어 다리",
    buildVocabulary: "벵골어와 한국어 사이의 어휘력을 키우세요.",
    searchAddLearn: "우리의 우아한 인터페이스로 새로운 단어를 검색하고, 추가하고, 배우세요.",
    browseVocabulary: "어휘 둘러보기",
    addNewWords: "새 단어 추가",
    keyFeatures: "주요 기능",
    appDescription: "우리의 어휘 앱은 벵골어와 한국어 어휘를 학습하고 관리하기 위한 원활한 경험을 제공합니다。",
    getStarted: "시작하기",
    expandVocabulary: "어휘력을 확장할 준비가 되셨나요?",
    bridgeGap: "컬렉션에 단어를 추가하기 시작하고 벵골어와 한국어 사이의 언어 격차를 해소하세요。",
    allRightsReserved: "모든 권리 보유.",
    searchWords: "단어 검색...",
    sortBy: "정렬 기준",
    dateAdded: "추가된 날짜",
    alphabetical: "알파벳순",
    requestWord: "단어 요청",
    noWordsFound: "단어를 찾을 수 없습니다",
    tryAdjusting: "검색을 조정하거나 위의 양식을 사용하여 새 단어를 요청하십시오.",
    requestNewWord: "새 단어 요청",
    banglaWord: "벵골어 단어",
    koreanWord: "한국어 단어",
    submit: "제출",
    pleaseFillFields: "모든 필드를 채워주세요",
    invalidEmail: "유효한 이메일 주소를 입력해주세요",
    invalidBangla: "방글라 단어는 방글라 문자를 포함해야 합니다",
    invalidKorean: "한국어 단어는 한글을 포함해야 합니다",
    yourEmail: "당신의 이메일",
    submitting: "제출 중...",
    dashboard: "대시보드",
    overview: "개요",
    requests: "요청",
    settings: "설정",
    email: "이메일",
    password: "비밀번호",
    loginButton: "로그인",
    loggingIn: "로그인 중...",
    credentials: "자격 증명:",
    demoCredentials: "데모 자격 증명:",
    enterCredentials: "계정에 액세스하려면 자격 증명을 입력하세요",
  }
};

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [filteredWords, setFilteredWords] = useState<WordPair[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'bangla' | 'korean'>('bangla');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [adminOverview, setAdminOverview] = useState<AdminOverviewData | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<WordPair | null>(null); // Track selected suggestion
  const itemsPerPage = 10;
  const { user, token } = useAuth();

  const fetchWords = useCallback(async (page: number = currentPage, search: string = searchTerm) => {
    setIsLoading(true);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/bangla-korean-word-pair?page=${page}&limit=${itemsPerPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const { data, total } = await response.json();
      console.log('Fetch Words Response:', { data, total, page, search });

      const formattedWords: WordPair[] = (data || []).map((row: any) => ({
        id: row.id || `local-${Date.now()}`,
        bangla: row.bangla || "",
        korean: row.korean || "",
        partOfSpeech: row.partOfSpeech || null,
        examples: row.banglaExample || row.koreanExample ? [{
          bangla: row.banglaExample || "",
          korean: row.koreanExample || ""
        }] : [],
        source: 'server',
      }));

      setWordPairs(formattedWords);
      setFilteredWords(formattedWords);
      setTotalPages(Math.ceil(total / itemsPerPage) || 1);
    } catch (error) {
      console.error('Error fetching words:', error);
      setWordPairs([]);
      setFilteredWords([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchAdminOverview = useCallback(async () => {
    if (!user || !token) {
      console.warn('No auth token or user available for admin overview');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/overview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Admin Overview Data:', data);
      setAdminOverview(data);
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      setAdminOverview(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    // If a suggestion has been clicked, don't override filteredWords
    if (selectedSuggestion) {
      setFilteredWords([selectedSuggestion]);
      return;
    }

    // Otherwise, filter based on searchTerm
    if (!searchTerm) {
      setFilteredWords(wordPairs);
      return;
    }

    const filtered = wordPairs
      .filter(word =>
        word.bangla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.korean?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const first = selectedLanguage === 'bangla' ? a.bangla : a.korean;
        const second = selectedLanguage === 'bangla' ? b.bangla : b.korean;
        return (first || '').localeCompare(second || '');
      });

    setFilteredWords(filtered);
  }, [searchTerm, selectedLanguage, wordPairs, selectedSuggestion]);

  const toggleLanguage = () => {
    setSelectedLanguage(prev => (prev === 'bangla' ? 'korean' : 'bangla'));
  };

  const translate = (key: string) => {
    return translations[selectedLanguage][key] || key;
  };

  const addWordPair = useCallback(async (word: Omit<WordPair, 'id'>) => {
    if (!user || !token) {
      console.warn('Not authenticated to add word pair.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Adding word payload:', word);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bangla-korean-word-pair`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...word, partOfSpeech: word.partOfSpeech || null }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add word: ${response.status}`);
      }
      const newWord = await response.json();
      console.log('Added word response:', newWord);
      setWordPairs(prev => [newWord, ...prev]);
      await fetchWords();
    } catch (error) {
      console.error('Error adding word:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWords, token, user]);

  const updateWordPair = useCallback(async (word: WordPair) => {
    if (!user || !token) {
      const error = new Error('You must be logged in to update a word.');
      console.error('Authentication error:', error);
      throw error;
    }

    setIsLoading(true);
    try {
      console.log('Updating word payload:', word);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bangla-korean-word-pair/${word.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(word),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to update word: ${response.status}`);
      }

      // Update state with the returned data
      setWordPairs(prev => prev.map(w => w.id === word.id ? responseData : w));
      await fetchWords(); // Refresh data after update

      return responseData; // Always return the response data
    } catch (error: any) {
      console.error('Error updating word:', error);
      throw error; // Re-throw the error to be caught by the caller
    } finally {
      setIsLoading(false);
    }
  }, [fetchWords, token, user]);

  const removeWordPair = useCallback(async (id: string) => {
    if (!user || !token) {
      console.warn('Not authenticated to remove word pair.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Deleting word with id:', id);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bangla-korean-word-pair/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete word: ${response.status}`);
      }
      setWordPairs(prev => prev.filter(word => word.id !== id));
      await fetchWords();
    } catch (error) {
      console.error('Error deleting word:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWords, token, user]);

  const requestWordPair = async (bangla: string, korean: string, submittedBy: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/word-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bangla,
          korean,
          submittedBy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit word request');
      }

      const newRequest = await response.json();
      console.log('Word request submitted:', newRequest);
      localStorage.setItem('LangoBridge-email-for-add-new-word', submittedBy);
    } catch (error) {
      console.error('Error requesting word pair:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VocabularyContext.Provider
      value={{
        wordPairs,
        filteredWords,
        selectedLanguage,
        searchTerm,
        currentPage,
        totalPages,
        isLoading,
        adminOverview,
        selectedSuggestion, // Expose this
        setSearchTerm,
        setCurrentPage,
        setFilteredWords,
        setSelectedSuggestion, // Expose this
        toggleLanguage,
        translate,
        addWordPair,
        updateWordPair,
        removeWordPair,
        requestWordPair,
        fetchAdminOverview,
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
};

export const useVocabulary = () => {
  const context = useContext(VocabularyContext);
  if (!context) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
};