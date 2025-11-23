// VocabularyContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WordPair } from '@/types';
import { useAuth } from './AuthContext';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  getCountFromServer,
  getDocs, // Added for fetchAdminOverview
  where // Added for fetchAdminOverview if needed for pending requests
} from 'firebase/firestore';
import { db } from '../firebase';

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
  selectedSuggestion: WordPair | null;

  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setFilteredWords: (words: WordPair[]) => void;
  setSelectedSuggestion: (word: WordPair | null) => void;
  toggleLanguage: () => void;
  translate: (key: string) => string;
  addWordPair: (word: Omit<WordPair, 'id'>) => Promise<void>;
  updateWordPair: (word: WordPair) => Promise<void>;
  removeWordPair: (id: string) => Promise<void>;
  requestWordPair: (bangla: string, korean: string, submittedBy: string) => Promise<void>;
  fetchAdminOverview: () => Promise<void>;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

// Translation data
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
    banglaWord: "বাংলা",
    koreanWord: "কোরিয়ান",
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
    //app-download
    appDownload: "অ্যাপ ডাউনলোড",
    downloadNow: "এখন ডাউনলোড করুন",
    downloadApp: "অ্যাপ ডাউনলোড করুন",
    downloadLink: "ডাউনলোড লিঙ্ক",
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
    banglaWord: "벵골어",
    koreanWord: "한국어",
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
    //app-download
    appDownload: "앱 다운로드",
    downloadNow: "지금 다운로드",
    downloadApp: "앱 다운로드",
    downloadLink: "다운로드 링크",
  }
};

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allWords, setAllWords] = useState<WordPair[]>([]);
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]); // Paginated words
  const [filteredWords, setFilteredWords] = useState<WordPair[]>([]); // Filtered and paginated words (or selected suggestion)
  const [selectedLanguage, setSelectedLanguage] = useState<'bangla' | 'korean'>('bangla');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [adminOverview, setAdminOverview] = useState<AdminOverviewData | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<WordPair | null>(null);
  const itemsPerPage = 10;
  const { user } = useAuth(); // No need for token with Firestore client SDK

  // Real-time subscription to word_pairs
  useEffect(() => {
    setIsLoading(true);
    const wordsCollectionRef = collection(db, 'word_pairs');
    let q = query(wordsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const words = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WordPair[];

      setAllWords(words);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching words from Firestore:", error);
      // Fallback: try without ordering if index is missing
      if (error.code === 'failed-precondition') {
        console.warn("Firestore query failed, likely missing index. Retrying without orderBy.");
        const fallbackQ = collection(db, 'word_pairs');
        const fallbackUnsubscribe = onSnapshot(fallbackQ, (snap) => {
          const words = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as WordPair[];
          setAllWords(words);
          setIsLoading(false);
        }, (fallbackError) => {
          console.error("Fallback Firestore query also failed:", fallbackError);
          setIsLoading(false);
        });
        return fallbackUnsubscribe; // Return fallback unsubscribe
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter and Pagination Logic
  useEffect(() => {
    let result = [...allWords];

    // 1. Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(word =>
        word.bangla?.toLowerCase().includes(lowerTerm) ||
        word.korean?.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Sort
    result.sort((a, b) => {
      const first = selectedLanguage === 'bangla' ? a.bangla : a.korean;
      const second = selectedLanguage === 'bangla' ? b.bangla : b.korean;
      return (first || '').localeCompare(second || '');
    });

    // 3. Update Total Pages
    const newTotalPages = Math.ceil(result.length / itemsPerPage) || 1;
    setTotalPages(newTotalPages);

    // 4. Pagination
    // If currentPage is out of bounds (e.g. after search), reset it
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (currentPage === 0 && newTotalPages > 0) { // Handle case where currentPage might be 0
      setCurrentPage(1);
    } else if (newTotalPages === 0) { // No words found, reset page to 1
      setCurrentPage(1);
    }


    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = result.slice(startIndex, startIndex + itemsPerPage);

    setWordPairs(paginated);

    // If a suggestion is selected, we might want to show only that,
    // but usually filteredWords is what's shown in the list.
    // The original logic had a check for selectedSuggestion.
    if (selectedSuggestion) {
      setFilteredWords([selectedSuggestion]);
    } else {
      setFilteredWords(paginated);
    }

  }, [allWords, searchTerm, currentPage, selectedLanguage, selectedSuggestion, itemsPerPage]);

  const toggleLanguage = () => {
    setSelectedLanguage(prev => (prev === 'bangla' ? 'korean' : 'bangla'));
  };

  const translate = (key: string) => {
    return translations[selectedLanguage][key] || key;
  };

  const addWordPair = useCallback(async (word: Omit<WordPair, 'id'>) => {
    if (!user) {
      console.warn('Not authenticated to add word pair.');
      throw new Error('Authentication required to add word pair.');
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'word_pairs'), {
        ...word,
        createdAt: serverTimestamp(),
        source: 'local' // Or 'user-submitted'
      });
      // No need to manually update state, onSnapshot will handle it
    } catch (error) {
      console.error('Error adding word:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateWordPair = useCallback(async (word: WordPair) => {
    if (!user) {
      throw new Error('You must be logged in to update a word.');
    }

    setIsLoading(true);
    try {
      const wordRef = doc(db, 'word_pairs', word.id);
      const { id, ...data } = word;
      await updateDoc(wordRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error updating word:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const removeWordPair = useCallback(async (id: string) => {
    if (!user) {
      console.warn('Not authenticated to remove word pair.');
      throw new Error('Authentication required to remove word pair.');
    }

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'word_pairs', id));
    } catch (error) {
      console.error('Error deleting word:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const requestWordPair = async (bangla: string, korean: string, submittedBy: string) => {
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'word_requests'), {
        bangla,
        korean,
        submittedBy,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      localStorage.setItem('LangoBridge-email-for-add-new-word', submittedBy);
    } catch (error) {
      console.error('Error requesting word pair:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminOverview = useCallback(async () => {
    if (!user) {
      console.warn('No user available for admin overview');
      return;
    }

    setIsLoading(true);
    try {
      // Total words count is simply the length of allWords
      const totalWords = allWords.length;

      // Get pending requests count
      const pendingRequestsQuery = query(collection(db, 'word_requests'), where("status", "==", "pending"));
      const pendingRequestsSnapshot = await getCountFromServer(pendingRequestsQuery);
      const pendingRequests = pendingRequestsSnapshot.data().count;

      // Recent activity from allWords (which is already loaded and sorted by createdAt desc if index exists)
      const recentActivity = allWords.slice(0, 5).map(w => ({
        id: w.id,
        bangla: w.bangla || '',
        korean: w.korean || '',
        timestamp: (w as any).createdAt?.toDate ? (w as any).createdAt.toDate().toISOString() : new Date().toISOString() // Use Firestore timestamp if available
      }));

      setAdminOverview({
        totalWords: totalWords,
        pendingRequests: pendingRequests,
        activeUsers: 0, // Placeholder, would require more complex logic (e.g., last login, custom claims)
        lastUpdate: new Date().toISOString(),
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      setAdminOverview(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, allWords]);

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
        selectedSuggestion,
        setSearchTerm,
        setCurrentPage,
        setFilteredWords,
        setSelectedSuggestion,
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
