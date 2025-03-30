import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, X, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/Loading'; // Ensure this import is correct
import { useAuth } from '@/context/AuthContext';

interface WordRequest {
  id: string;
  bangla: string;
  korean: string;
  notes: string;
  status: string;
  submittedBy: string;
  submittedAt: string;
}

const WordRequests: React.FC = () => {
  const [requests, setRequests] = useState<WordRequest[]>([]);
  const [partOfSpeech, setPartOfSpeech] = useState<string | null>(null);
  const [banglaExample, setBanglaExample] = useState<string>('');
  const [koreanExample, setKoreanExample] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [operation, setOperation] = useState<'approving' | 'rejecting' | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/word-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const { data } = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching word requests:', error);
      toast.error('Failed to load word requests');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = useCallback(async (id: string, bangla: string, korean: string) => {
    if (!token) {
      toast.error('Not authenticated to approve word requests.');
      return;
    }

    setOperation('approving');
    setActiveRequestId(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/word-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          partOfSpeech, // Will be null if not set
          banglaExample,
          koreanExample,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve request');
      }

      setRequests(prev => prev.filter(req => req.id !== id));
      toast.success('Word request approved and added to vocabulary!');
      setPartOfSpeech(null); // Reset to null
      setBanglaExample('');
      setKoreanExample('');
    } catch (error) {
      console.error('Error approving word request:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setOperation(null);
      setActiveRequestId(null);
    }
  }, [partOfSpeech, banglaExample, koreanExample, token]);

  const handleReject = useCallback(async (id: string) => {
    if (!token) {
      toast.error('Not authenticated to reject word requests.');
      return;
    }

    setOperation('rejecting');
    setActiveRequestId(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/word-requests/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject request');
      }

      setRequests(prev => prev.filter(req => req.id !== id));
      toast.success('Word request rejected');
    } catch (error) {
      console.error('Error rejecting word request:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setOperation(null);
      setActiveRequestId(null);
    }
  }, [token]);

  const generateAIExample = async (bangla: string, korean: string, requestId: string) => {
    if (!bangla || !korean) {
      toast.error('Bangla and Korean words are required to generate examples');
      return;
    }

    setIsGenerating(true);
    setActiveRequestId(requestId);
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
              content: `Generate one example sentence in Bangla using "${bangla}" and one in Korean using "${korean}". Do not include English translations. Return in format: Bangla: [sentence]\nKorean: [sentence]`,
            }
          ]
        }),
      });

      if (!response.ok) throw new Error('Failed to generate AI example');
      const data = await response.json();
      const content = data.choices[0].message.content;
      const [banglaLine, koreanLine] = content.split('\n');
      const banglaEx = banglaLine.replace('Bangla: ', '').trim();
      const koreanEx = koreanLine.replace('Korean: ', '').trim();

      setBanglaExample(banglaEx);
      setKoreanExample(koreanEx);
      toast.success('AI-generated example added!');
    } catch (error) {
      console.error('AI fetch error:', error);
      toast.error('Failed to generate AI example');
    } finally {
      setIsGenerating(false);
      setActiveRequestId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const isOperationInProgress = isGenerating || !!operation;

  return (
    <div className="relative">
      {isOperationInProgress && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
            </svg>
            <span>
              {isGenerating
                ? 'Generating AI Example...'
                : operation === 'approving'
                  ? 'Approving Word...'
                  : 'Rejecting Word...'}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Word Requests</h1>
        <Badge variant="outline" className="px-4 py-2">
          {requests.length} Pending
        </Badge>
      </div>

      {isLoading ? (
        <Loading /> // Display Loading component when fetching data
      ) : requests.length > 0 ? (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {requests.map(request => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {request.bangla} / {request.korean}
                    </CardTitle>
                    <CardDescription>
                      Submitted by {request.submittedBy} on {formatDate(request.submittedAt)}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {request.notes || 'No additional notes provided.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`partOfSpeech-${request.id}`}>Part of Speech</Label>
                  <select
                    id={`partOfSpeech-${request.id}`}
                    value={partOfSpeech || ''} // Controlled value, empty string maps to null
                    onChange={(e) => setPartOfSpeech(e.target.value || null)} // Set to null if empty
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isOperationInProgress}
                  >
                    <option value="">Select (null)</option>
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
                    <Label htmlFor={`banglaExample-${request.id}`}>Bangla Example</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateAIExample(request.bangla, request.korean, request.id)}
                      disabled={isOperationInProgress}
                    >
                      {isGenerating && activeRequestId === request.id ? (
                        <>
                          <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Generate AI Example
                        </>
                      )}
                    </Button>
                  </div>
                  <Input
                    id={`banglaExample-${request.id}`}
                    value={banglaExample}
                    onChange={(e) => setBanglaExample(e.target.value)}
                    placeholder="Enter Bangla example sentence"
                    disabled={isOperationInProgress}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`koreanExample-${request.id}`}>Korean Example</Label>
                  <Input
                    id={`koreanExample-${request.id}`}
                    value={koreanExample}
                    onChange={(e) => setKoreanExample(e.target.value)}
                    placeholder="Enter Korean example sentence"
                    disabled={isOperationInProgress}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleReject(request.id)}
                  disabled={isOperationInProgress}
                >
                  {operation === 'rejecting' && activeRequestId === request.id ? (
                    <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                    </svg>
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Reject
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(request.id, request.bangla, request.korean)}
                  disabled={isOperationInProgress}
                >
                  {operation === 'approving' && activeRequestId === request.id ? (
                    <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                    </svg>
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No Pending Requests</h3>
          <p className="text-muted-foreground">
            All word requests have been processed
          </p>
        </div>
      )}
    </div>
  );
};

export default WordRequests;