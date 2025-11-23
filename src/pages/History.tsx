import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, Clock, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    getHistory,
    clearHistory,
    removeFromHistory,
    formatHistoryDate,
    type HistoryItem
} from '@/utils/history';
import { speakKorean, isTTSAvailable } from '@/utils/textToSpeech';
import { toast } from 'sonner';

const HistoryPage: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const ttsAvailable = isTTSAvailable();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        const items = getHistory();
        setHistory(items);
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all history?')) {
            clearHistory();
            setHistory([]);
            toast.success('History cleared');
        }
    };

    const handleRemoveItem = (id: string) => {
        removeFromHistory(id);
        setHistory(prev => prev.filter(item => item.id !== id));
        toast.success('Item removed from history');
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (history.length === 0) {
        return (
            <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                            <History className="h-6 w-6 sm:h-8 sm:w-8" />
                            History
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your recently viewed vocabulary
                        </p>
                    </div>
                </div>

                <Card className="text-center py-12">
                    <CardContent>
                        <History className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg sm:text-xl font-medium mb-2">No History Yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Words you view will appear here
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        <History className="h-6 w-6 sm:h-8 sm:w-8" />
                        History
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {history.length} {history.length === 1 ? 'item' : 'items'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                </Button>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {history.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                    <div className="p-3 sm:p-4">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatHistoryDate(item.timestamp)}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-base sm:text-lg font-medium break-words">
                                                        {item.korean}
                                                    </h3>
                                                    {ttsAvailable && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 flex-shrink-0"
                                                            onClick={() => speakKorean(item.korean)}
                                                            title="Listen to pronunciation"
                                                        >
                                                            <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">
                                                    {item.bangla}
                                                </p>

                                                {item.examples && item.examples.length > 0 && (
                                                    <button
                                                        onClick={() => toggleExpand(item.id)}
                                                        className="text-xs text-primary hover:underline mt-2"
                                                    >
                                                        {expandedId === item.id ? 'Hide' : 'Show'} examples
                                                    </button>
                                                )}

                                                {expandedId === item.id && item.examples && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-3 pt-3 border-t"
                                                    >
                                                        <h4 className="text-xs font-medium mb-2">Examples:</h4>
                                                        <ul className="space-y-2">
                                                            {item.examples.map((example, idx) => (
                                                                <li key={idx} className="text-xs sm:text-sm">
                                                                    <div className="flex items-start gap-2">
                                                                        <div className="flex-1">
                                                                            <p className="break-words">{example.korean}</p>
                                                                            <p className="text-muted-foreground mt-1 break-words">
                                                                                {example.bangla}
                                                                            </p>
                                                                        </div>
                                                                        {ttsAvailable && example.korean && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6 flex-shrink-0"
                                                                                onClick={() => speakKorean(example.korean)}
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

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-muted-foreground hover:text-destructive flex-shrink-0 h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HistoryPage;
