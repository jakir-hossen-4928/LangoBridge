import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2, Volume2, VolumeX } from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import { WordPair } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { speakKorean, stopSpeech, isTTSAvailable } from '@/utils/textToSpeech';
import { addToHistory } from '@/utils/history';

interface WordCardProps {
  word?: WordPair;
  showAdmin?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ word, showAdmin = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { selectedLanguage } = useVocabulary();
  const ttsAvailable = isTTSAvailable();

  useEffect(() => {
    // Add to history when word is viewed
    if (word) {
      addToHistory({
        bangla: word.bangla,
        korean: word.korean,
        examples: word.examples
      });
    }
  }, [word]);

  if (!word) {
    return (
      <Card className="p-4 text-muted-foreground">
        <p>Word data is unavailable.</p>
      </Card>
    );
  }

  const toggleExpand = () => setExpanded(!expanded);
  const hasExamples = word.examples && word.examples.length > 0;

  const handleSpeak = (text: string, isExample: boolean = false) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakKorean(text);
      setIsSpeaking(true);

      // Reset speaking state after speech ends
      setTimeout(() => {
        setIsSpeaking(false);
      }, text.length * 100); // Rough estimate
    }
  };

  const getSourceBadge = () => {
    switch (word.source) {
      case 'google':
        return <Badge className="bg-blue-500 text-white text-xs">Google</Badge>;
      case 'ai':
        return <Badge className="bg-green-500 text-white text-xs">AI</Badge>;
      case 'local':
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 border border-border/50">
        <CardContent className="p-0">
          <div className="p-3 sm:p-4">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {getSourceBadge()}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-medium break-words">
                      {selectedLanguage === 'bangla' ? word.bangla : word.korean}
                    </h3>
                    {selectedLanguage === 'korean' && ttsAvailable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                        onClick={() => handleSpeak(word.korean)}
                        title="Listen to Korean pronunciation"
                      >
                        {isSpeaking ? (
                          <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm sm:text-base text-foreground/80 break-words">
                  {selectedLanguage === 'bangla' ? word.korean : word.bangla}
                </p>
              </div>

              {showAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log('Remove not implemented', word.id)}
                  className="text-muted-foreground hover:text-destructive flex-shrink-0 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {hasExamples && expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50"
              >
                <h4 className="text-xs sm:text-sm font-medium mb-2">Examples:</h4>
                <ul className="space-y-2">
                  {word.examples.map((example, index) => (
                    <li key={index} className="text-xs sm:text-sm">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground break-words">
                            {selectedLanguage === 'bangla' ? example.bangla : example.korean}
                          </p>
                          <p className="text-muted-foreground mt-1 break-words">
                            {selectedLanguage === 'bangla' ? example.korean : example.bangla}
                          </p>
                        </div>
                        {selectedLanguage === 'korean' && ttsAvailable && example.korean && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => handleSpeak(example.korean, true)}
                            title="Listen to example"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {hasExamples && (
            <div
              className="p-2 border-t border-border/50 bg-muted/30 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={toggleExpand}
            >
              <button className="text-xs text-muted-foreground flex items-center justify-center w-full">
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show Examples
                  </>
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WordCard;