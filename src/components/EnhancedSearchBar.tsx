import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import { Input } from '@/components/ui/input';
import { WordPair } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface EnhancedSearchBarProps {
  placeholder?: string;
  className?: string;
}

const detectLanguage = (text: string): { sourceLang: string; targetLang: string } => {
  const isBangla = /[\u0980-\u09FF]/.test(text);
  return { sourceLang: isBangla ? 'bn' : 'ko', targetLang: isBangla ? 'ko' : 'bn' };
};

const fetchGoogleTranslate = async (text: string): Promise<string> => {
  const { sourceLang, targetLang } = detectLanguage(text);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/google-translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang, targetLang }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const result = await response.json();
    if (result.status === 'success') return result.translatedText;
    throw new Error(result.message || 'Translation failed');
  } catch (error) {
    console.error('Google Translate error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Translation request timed out after 10 seconds');
    }
    throw error instanceof Error ? error : new Error('Unknown error in Google Translate');
  }
};

const generateAIExample = async (word: Partial<WordPair>): Promise<{ bangla: string; korean: string } | null> => {
  if (!word.bangla || !word.korean) return null;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_AI_API_KEY}`,
        'HTTP-Referer': 'https://langobridge.netlify.app',
        'X-Title': 'Vocabulary Builder',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'user',
            content: `Generate one example sentence in Bangla using "${word.bangla}" and one in Korean using "${word.korean}". Do not include English translations. Return in format: Bangla: [sentence]\nKorean: [sentence]`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error('Failed to generate AI example');
    const data = await response.json();
    const content = data.choices[0].message.content;
    const [banglaLine, koreanLine] = content.split('\n');
    const banglaExample = banglaLine.replace('Bangla: ', '').trim();
    const koreanExample = koreanLine.replace('Korean: ', '').trim();
    return { bangla: banglaExample, korean: koreanExample };
  } catch (error) {
    console.error('AI fetch error:', error);
    return null;
  }
};

const fetchFromAI = async (term: string, selectedLanguage: string): Promise<WordPair | null> => {
  const { sourceLang } = detectLanguage(term);
  const baseWord = { bangla: sourceLang === 'bn' ? term : '', korean: sourceLang === 'ko' ? term : '' };
  try {
    const translation = await fetchGoogleTranslate(term);
    baseWord.bangla = sourceLang === 'bn' ? term : translation;
    baseWord.korean = sourceLang === 'ko' ? term : translation;
    const examples = await generateAIExample(baseWord);
    return {
      id: `ai-${Date.now()}`,
      bangla: baseWord.bangla,
      korean: baseWord.korean,
      partOfSpeech: '',
      examples: examples ? [examples] : [],
      source: 'ai',
    };
  } catch (error) {
    console.error('Failed to fetch from AI with Google Translate:', error);
    return null; // Return null to indicate failure, handled in updateSuggestions
  }
};

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  placeholder = 'Search words...',
  className = '',
}) => {
  const {
    searchTerm,
    setSearchTerm,
    wordPairs,
    setWordPairs,
    selectedLanguage,
    addWordPair,
    user,
    token,
  } = useVocabulary();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<WordPair[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateSuggestions = async () => {
      if (localSearchTerm.length < 2) {
        setSuggestions([]);
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      const searchTermLower = localSearchTerm.toLowerCase();

      const filteredLocal = wordPairs
        .filter(word => word.source === 'local')
        .filter(word => {
          const banglaMatch = word.bangla.toLowerCase().includes(searchTermLower);
          const koreanMatch = word.korean.toLowerCase().includes(searchTermLower);
          return banglaMatch || koreanMatch;
        })
        .slice(0, 5);

      if (filteredLocal.length > 0) {
        setSuggestions(filteredLocal.map(word => ({ ...word, source: 'local' })));
        setIsFetching(false);
      } else {
        try {
          const aiResult = await fetchFromAI(localSearchTerm, selectedLanguage);
          setSuggestions(aiResult ? [aiResult] : []);
          if (aiResult) {
            navigate('/vocabulary', { state: { searchResults: [aiResult] } });
          } else {
            toast.error('No translation found or server timed out');
          }
        } catch (error) {
          setSuggestions([]);
          toast.error(error instanceof Error ? error.message : 'Failed to fetch suggestions');
        } finally {
          setIsFetching(false);
        }
      }
    };

    updateSuggestions();
  }, [localSearchTerm, wordPairs, selectedLanguage, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(localSearchTerm), 300);
    return () => clearTimeout(timer);
  }, [localSearchTerm, setSearchTerm]);

  const handleClear = () => {
    setLocalSearchTerm('');
    setSearchTerm('');
    setSuggestions([]);
  };

  const handleAddGeneratedWord = (word: WordPair) => {
    navigate('/request-word', { state: { bangla: word.bangla, korean: word.korean } });
  };


  return (
    <div className={`w-full max-w-4xl mx-auto px-4 ${className}`} ref={searchContainerRef}>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localSearchTerm}
          onChange={e => setLocalSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full pl-10 pr-10 h-12 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        {localSearchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {localSearchTerm.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {isFetching ? (
              <Card className="border-dashed border-gray-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                    </svg>
                    Searching...
                  </CardTitle>
                </CardHeader>
              </Card>
            ) : suggestions.length > 0 ? (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Search Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestions.map(word => (
                    <div key={word.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <div>
                            <div className="font-medium text-gray-800">
                              {selectedLanguage === 'bangla' ? word.bangla : word.korean}
                            </div>
                            <div className="text-sm text-gray-600">
                              {selectedLanguage === 'bangla' ? word.korean : word.bangla}
                            </div>
                            {word.examples?.[0] && (
                              <div className="text-xs text-gray-500 mt-1 italic">
                                "{word.examples[0][selectedLanguage === 'bangla' ? 'bangla' : 'korean']}"
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddGeneratedWord(word)}
                            className="w-full sm:w-auto"
                          >
                            Add
                          </Button>

                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-gray-300">
                <CardHeader>
                  <CardTitle className="text-lg">No results found</CardTitle>
                </CardHeader>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSearchBar;