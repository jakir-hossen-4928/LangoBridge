import React from 'react';
import { Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import Navbar from '@/components/Navbar';
import EnhancedSearchBar from '@/components/EnhancedSearchBar';
import WordCard from '@/components/WordCard';
import LanguageToggle from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardDescription
import { useLocation } from 'react-router-dom';

const VocabularyListPage: React.FC = () => {
  const {
    filteredWords,
    selectedLanguage,
    translate,
    currentPage,
    totalPages,
    setCurrentPage,
    isLoading,
    searchTerm,
  } = useVocabulary();
  const location = useLocation();
  const searchResults = (location.state as { searchResults?: WordPair[] })?.searchResults || [];

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                <Book className="mr-2 h-6 w-6 text-primary" />
                {translate('vocabulary')}
              </h1>
              <LanguageToggle />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              {translate('appDescription') || 'Browse your vocabulary list'}
            </p>
          </header>

          <div className="mb-6">
            <EnhancedSearchBar
              placeholder={translate('searchWords') || 'Search words...'}
              className="w-full"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-4">
              <svg
                className="animate-spin h-5 w-5 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-muted-foreground">Loading vocabulary...</span>
            </div>
          ) : searchResults.length > 0 && searchTerm.length > 1 ? (
            <div className="space-y-4">
              {searchResults.map(word => (
                <WordCard key={word.id} word={word} />
              ))}
            </div>
          ) : filteredWords.length > 0 && searchTerm.length <= 1 ? (
            <div className="space-y-4">
              {filteredWords.map(word => (
                <WordCard key={word.id} word={word} />
              ))}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentPage === 1 || isLoading}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentPage === totalPages || isLoading}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No words yet</CardTitle>
                <CardDescription>Search or add a word to start building your vocabulary!</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default VocabularyListPage;