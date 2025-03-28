import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useVocabulary } from '@/context/VocabularyContext';
import { WordPair } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WordCardProps {
  word?: WordPair; // Made optional to handle undefined cases
  showAdmin?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ word, showAdmin = false }) => {
  const [expanded, setExpanded] = useState(false);
  const { selectedLanguage } = useVocabulary();

  // Return null or a fallback UI if word is undefined
  if (!word) {
    return (
      <Card className="p-4 text-muted-foreground">
        <p>Word data is unavailable.</p>
      </Card>
    );
  }

  const toggleExpand = () => setExpanded(!expanded);
  const hasExamples = word.examples && word.examples.length > 0;

  const getSourceBadge = () => {
    switch (word.source) {
      case 'google':
        return <Badge className="bg-blue-500 text-white">Google</Badge>;
      case 'ai':
        return <Badge className="bg-green-500 text-white">AI</Badge>;
      case 'local':
      default:
        return null; // No badge for local data
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
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {word.partOfSpeech && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {word.partOfSpeech}
                    </span>
                  )}
                  {getSourceBadge()}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <h3 className="text-lg font-medium">
                    {selectedLanguage === 'bangla' ? word.bangla : word.korean}
                  </h3>
                  {/* Removed pronunciation since it’s not in WordPair type */}
                </div>
                <p className="mt-1 text-foreground/80">
                  {selectedLanguage === 'bangla' ? word.korean : word.bangla}
                </p>
              </div>

              {showAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log('Remove not implemented', word.id)}
                  className="text-muted-foreground hover:text-destructive"
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
                className="mt-4 pt-4 border-t border-border/50"
              >
                <h4 className="text-sm font-medium mb-2">Examples:</h4>
                <ul className="space-y-2">
                  {word.examples.map((example, index) => (
                    <li key={index} className="text-sm">
                      <p className="text-foreground">
                        {selectedLanguage === 'bangla' ? example.bangla : example.korean}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {selectedLanguage === 'bangla' ? example.korean : example.bangla}
                      </p>
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