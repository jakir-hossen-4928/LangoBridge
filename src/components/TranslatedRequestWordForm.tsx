import React, { useState, useEffect } from 'react';
import { useVocabulary } from '@/context/VocabularyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

const TranslatedRequestWordForm: React.FC = () => {
  const location = useLocation();
  const { bangla: initialBangla = '', korean: initialKorean = '' } = location.state || {};
  const [banglaWord, setBanglaWord] = useState(initialBangla);
  const [koreanWord, setKoreanWord] = useState(initialKorean);
  const [submittedBy, setSubmittedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestWordPair, translate } = useVocabulary();

  useEffect(() => {
    const storedEmail = localStorage.getItem('LangoBridge-email-for-add-new-word');
    if (storedEmail) setSubmittedBy(storedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!banglaWord.trim() || !koreanWord.trim() || !submittedBy.trim()) {
      toast.error(translate('pleaseFillFields') || 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submittedBy)) {
      toast.error(translate('invalidEmail') || 'Please enter a valid email address');
      return;
    }

    const banglaRegex = /[\u0980-\u09FF]/;
    const koreanRegex = /[\uAC00-\uD7AF  const koreanRegex = /[\uAC00-\uD7AF]/;
    if (!banglaRegex.test(banglaWord)) {
      toast.error(translate('invalidBangla') || 'Bangla word must contain Bangla script characters');
      return;
    }
    if (!koreanRegex.test(koreanWord)) {
      toast.error(translate('invalidKorean') || 'Korean word must contain Hangul characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestWordPair(banglaWord, koreanWord, submittedBy);
      localStorage.setItem('LangoBridge-email-for-add-new-word', submittedBy);
      toast.success(translate('requestSubmitted') || 'Word pair request submitted successfully!');
      setBanglaWord('');
      setKoreanWord('');
    } catch (error) {
      toast.error(translate('requestFailed') || `Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{translate('requestNewWord')}</CardTitle>
          <CardDescription>{translate('tryAdjusting')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="bangla-word" className="text-sm font-medium">
                  {translate('banglaWord')}
                </label>
                <Input
                  id="bangla-word"
                  value={banglaWord}
                  onChange={(e) => setBanglaWord(e.target.value)}
                  placeholder="বাংলা"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="korean-word" className="text-sm font-medium">
                  {translate('koreanWord')}
                </label>
                <Input
                  id="korean-word"
                  value={koreanWord}
                  onChange={(e) => setKoreanWord(e.target.value)}
                  placeholder="한국어"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="submitted-by" className="text-sm font-medium">
                {translate('yourEmail') || 'Your Email'}
              </label>
              <Input
                id="submitted-by"
                type="email"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                  </svg>
                  {translate('submitting') || 'Submitting...'}
                </>
              ) : (
                translate('submit')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslatedRequestWordForm;