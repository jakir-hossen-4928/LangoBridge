import React, { useState, useEffect } from 'react';
import { useVocabulary } from '@/context/VocabularyContext';
import { motion } from 'framer-motion';
import { Check, Trash2, Edit, Search, Plus, Sparkles, ArrowDownAZ, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { WordPair } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Loading from '@/components/Loading';

const VocabularyManagement: React.FC = () => {
  const { wordPairs, removeWordPair, addWordPair, updateWordPair, currentPage, setCurrentPage, totalPages, isLoading, setSearchTerm } = useVocabulary();
  const [searchInput, setSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState<'alpha'>('alpha');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editWord, setEditWord] = useState<WordPair | null>(null);
  const [operation, setOperation] = useState<'adding' | 'editing' | 'deleting' | null>(null);

  const [newWord, setNewWord] = useState({
    bangla: '',
    korean: '',
    partOfSpeech: null as string | null,
    examples: [{ bangla: '', korean: '' }]
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, setSearchTerm, setCurrentPage]);

  useEffect(() => {
    console.log('WordPairs:', wordPairs);
    console.log('Current Page:', currentPage);
    console.log('Context Total Pages:', totalPages);
  }, [wordPairs, currentPage, totalPages]);

  const handleInputChange = (field: string, value: string, isEdit = false) => {
    const setter = isEdit ? setEditWord : setNewWord;
    setter(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleExampleChange = (lang: 'bangla' | 'korean', value: string, isEdit = false) => {
    const setter = isEdit ? setEditWord : setNewWord;
    setter(prev => prev ? {
      ...prev,
      examples: [{ ...prev.examples[0], [lang]: value }]
    } : null);
  };

  const handleAddWord = async () => {
    if (!newWord.bangla.trim() || !newWord.korean.trim()) {
      toast.error("Bangla and Korean words are required");
      return;
    }

    setOperation('adding');
    const wordToAdd: Omit<WordPair, 'id'> = {
      bangla: newWord.bangla.trim(),
      korean: newWord.korean.trim(),
      partOfSpeech: newWord.partOfSpeech || null,
      examples: newWord.examples.filter(ex => ex.bangla.trim() || ex.korean.trim())
    };

    try {
      await addWordPair(wordToAdd);
      toast.success(`Word "${newWord.bangla}" added successfully`);
      setNewWord({ bangla: '', korean: '', partOfSpeech: null, examples: [{ bangla: '', korean: '' }] });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add word");
    } finally {
      setOperation(null);
    }
  };

  const handleEditWord = async () => {
    if (!editWord || !editWord.bangla.trim() || !editWord.korean.trim()) {
      toast.error("Bangla and Korean words are required");
      return;
    }

    setOperation('editing');
    const updatedWord: WordPair = {
      id: editWord.id,
      bangla: editWord.bangla.trim(),
      korean: editWord.korean.trim(),
      partOfSpeech: editWord.partOfSpeech || null,
      examples: editWord.examples.filter(ex => ex.bangla.trim() || ex.korean.trim())
    };

    console.log('Sending update payload:', updatedWord);

    try {
      const response = await updateWordPair(updatedWord);
      console.log('Update response:', response);

      // Check if response exists and has the expected success message
      if (response && response.message === 'Word updated successfully') {
        toast.success(`Word "${editWord.bangla}" updated successfully`);
        setIsEditDialogOpen(false);
        setEditWord(null);
      } else {
        // Handle unexpected or missing response
        throw new Error(response?.error || 'Unexpected response from server');
      }
    } catch (error: any) {
      console.error('Error updating word:', error);
      toast.error(error.message || "Failed to update word. Please try again.");
    } finally {
      setOperation(null);
    }
  };

  const handleDeleteWord = async (id: string, bangla: string) => {
    setOperation('deleting');
    try {
      await removeWordPair(id);
      toast.success(`Word "${bangla}" removed`);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete word");
    } finally {
      setOperation(null);
    }
  };

  const generateAIExample = async (isEdit = false) => {
    const word = isEdit ? editWord : newWord;
    if (!word || !word.bangla || !word.korean) {
      toast.error("Please enter Bangla and Korean words first");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_AI_API_KEY}`,
          "HTTP-Referer": "http://localhost:8080",
          "X-Title": "Vocabulary Builder",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-chat-v3-0324:free",
          "messages": [
            {
              "role": "user",
              "content": `Generate one example sentence in Bangla using "${word.bangla}" and one in Korean using "${word.korean}". Do not include English translations. Return in format: Bangla: [sentence]\nKorean: [sentence]`
            }
          ]
        })
      });
      if (!response.ok) throw new Error('Failed to generate AI example');
      const data = await response.json();
      const content = data.choices[0].message.content;
      const [banglaLine, koreanLine] = content.split('\n');
      const banglaExample = banglaLine.replace('Bangla: ', '').trim();
      const koreanExample = koreanLine.replace('Korean: ', '').trim();

      const setter = isEdit ? setEditWord : setNewWord;
      setter(prev => prev ? {
        ...prev,
        examples: [{ bangla: banglaExample, korean: koreanExample }]
      } : null);
      toast.success('AI-generated example added!');
    } catch (error) {
      toast.error('Failed to generate AI example');
    } finally {
      setIsGenerating(false);
    }
  };

  const sortedWords = [...wordPairs].sort((a, b) => a.bangla.localeCompare(b.bangla));
  const isOperationInProgress = isLoading || isGenerating || !!operation;

  return (
    <div className="relative">
      {isOperationInProgress && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
            </svg>
            <span>{operation ? `Word is ${operation}...` : 'Processing...'}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vocabulary Management</h1>
          <p className="text-muted-foreground">Add, edit, and remove vocabulary pairs</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isOperationInProgress}>
                <Plus className="h-4 w-4 mr-2" />
                Add Word
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-word-description">
              <DialogHeader>
                <DialogTitle>Add New Word</DialogTitle>
                <DialogDescription id="add-word-description">
                  Fill in the details for the new vocabulary pair
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bangla">Bangla Word</Label>
                    <Input
                      id="bangla"
                      value={newWord.bangla}
                      onChange={(e) => handleInputChange('bangla', e.target.value)}
                      placeholder="Bangla word"
                      disabled={isOperationInProgress}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="korean">Korean Word</Label>
                    <Input
                      id="korean"
                      value={newWord.korean}
                      onChange={(e) => handleInputChange('korean', e.target.value)}
                      placeholder="Korean word"
                      disabled={isOperationInProgress}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partOfSpeech">Part of Speech</Label>
                  <select
                    id="partOfSpeech"
                    value={newWord.partOfSpeech || ''}
                    onChange={(e) => handleInputChange('partOfSpeech', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isOperationInProgress}
                  >
                    <option value="">Select (none)</option>
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="pronoun">Pronoun</option>
                    <option value="preposition">Preposition</option>
                    <option value="conjunction">Conjunction</option>
                    <option value="interjection">Interjection</option>
                    <option value="expression">Expression</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Example</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateAIExample(false)}
                      disabled={isOperationInProgress}
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" /> Generate AI Example
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                    <Textarea
                      value={newWord.examples[0].bangla}
                      onChange={(e) => handleExampleChange('bangla', e.target.value)}
                      placeholder="Bangla example sentence"
                      className="resize-none"
                      disabled={isOperationInProgress}
                    />
                    <Textarea
                      value={newWord.examples[0].korean}
                      onChange={(e) => handleExampleChange('korean', e.target.value)}
                      placeholder="Korean example sentence"
                      className="resize-none"
                      disabled={isOperationInProgress}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isOperationInProgress}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddWord}
                  disabled={isOperationInProgress}
                >
                  {operation === 'adding' ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    'Add Word'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {editWord && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          if (!open) setEditWord(null);
          setIsEditDialogOpen(open);
        }}>
          <DialogContent aria-describedby="edit-word-description">
            <DialogHeader>
              <DialogTitle>Edit Word</DialogTitle>
              <DialogDescription id="edit-word-description">
                Update the details for this vocabulary pair
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-bangla">Bangla Word</Label>
                  <Input
                    id="edit-bangla"
                    value={editWord.bangla}
                    onChange={(e) => handleInputChange('bangla', e.target.value, true)}
                    placeholder="Bangla word"
                    disabled={isOperationInProgress}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-korean">Korean Word</Label>
                  <Input
                    id="edit-korean"
                    value={editWord.korean}
                    onChange={(e) => handleInputChange('korean', e.target.value, true)}
                    placeholder="Korean word"
                    disabled={isOperationInProgress}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-partOfSpeech">Part of Speech</Label>
                <select
                  id="edit-partOfSpeech"
                  value={editWord.partOfSpeech || ''}
                  onChange={(e) => handleInputChange('partOfSpeech', e.target.value, true)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isOperationInProgress}
                >
                  <option value="">Select (none)</option>
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                  <option value="pronoun">Pronoun</option>
                  <option value="preposition">Preposition</option>
                  <option value="conjunction">Conjunction</option>
                  <option value="interjection">Interjection</option>
                  <option value="expression">Expression</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Example</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateAIExample(true)}
                    disabled={isOperationInProgress}
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" /> Generate AI Example
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                  <Textarea
                    value={editWord.examples[0].bangla}
                    onChange={(e) => handleExampleChange('bangla', e.target.value, true)}
                    placeholder="Bangla example sentence"
                    className="resize-none"
                    disabled={isOperationInProgress}
                  />
                  <Textarea
                    value={editWord.examples[0].korean}
                    onChange={(e) => handleExampleChange('korean', e.target.value, true)}
                    placeholder="Korean example sentence"
                    className="resize-none"
                    disabled={isOperationInProgress}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isOperationInProgress}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleEditWord}
                disabled={isOperationInProgress}
              >
                {operation === 'editing' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search vocabulary..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
                disabled={isOperationInProgress}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto" disabled={isOperationInProgress}>
                  <Filter className="h-4 w-4 mr-2" />
                  Sort by
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder('alpha')} className="flex items-center">
                  <ArrowDownAZ className="h-4 w-4 mr-2" />
                  Alphabetical
                  {sortOrder === 'alpha' && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Bangla</TableHead>
                    <TableHead className="w-[200px]">Korean</TableHead>
                    <TableHead>Part of Speech</TableHead>
                    <TableHead>Examples</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wordPairs.length > 0 ? (
                    sortedWords.map((word) => (
                      <TableRow key={word.id}>
                        <TableCell className="font-medium">{word.bangla}</TableCell>
                        <TableCell>{word.korean}</TableCell>
                        <TableCell className="capitalize">{word.partOfSpeech || 'N/A'}</TableCell>
                        <TableCell>
                          {word.examples.length > 0 ? (
                            <>
                              <div>{word.examples[0].bangla}</div>
                              <div>{word.examples[0].korean}</div>
                            </>
                          ) : (
                            'No examples'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditWord({ ...word, examples: word.examples.length ? word.examples : [{ bangla: '', korean: '' }] });
                                setIsEditDialogOpen(true);
                              }}
                              disabled={isOperationInProgress}
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteWord(word.id, word.bangla)}
                              disabled={isOperationInProgress}
                            >
                              {operation === 'deleting' ? (
                                <svg className="animate-spin h-4 w-4 text-destructive" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                                </svg>
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchInput
                          ? "No words found matching your search"
                          : "No words in the vocabulary yet. Add your first word!"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={isOperationInProgress || currentPage === 1}
                >
                  Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={isOperationInProgress || currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VocabularyManagement;