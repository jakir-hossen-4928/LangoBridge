import React from 'react';
import { useForm } from 'react-hook-form';
import { Sparkles, Trash } from 'lucide-react';
import { WordPair } from '@/types';
import { useVocabulary } from '@/context/VocabularyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type FormData = Omit<WordPair, 'id'>;

const AddWordForm: React.FC = () => {
  const { addWordPair } = useVocabulary();
  const [example, setExample] = React.useState({ bangla: '', korean: '' });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      bangla: '',
      korean: '',
      partOfSpeech: 'noun',
      examples: [{ bangla: '', korean: '' }],
    }
  });

  const onSubmit = async (data: FormData) => {
    data.examples = example.bangla || example.korean ? [example] : [];
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bangla-korean-word-pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add word to server');
      const savedWord = await response.json();
      addWordPair(savedWord);
      toast.success(`Word "${data.bangla}" added successfully`);
    } catch (error) {
      console.error('Error adding word:', error);
      toast.error("Failed to add word to server");
      addWordPair(data); // Add locally as fallback
    }
    reset();
    setExample({ bangla: '', korean: '' });
  };

  const generateAIExample = async () => {
    try {
      const bangla = watch('bangla');
      const korean = watch('korean');
      if (!bangla || !korean) {
        toast.error("Please enter Bangla and Korean words first");
        return;
      }
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_AI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "google/gemma-3-27b-it:free",
          "messages": [
            {
              "role": "user",
              "content": `Generate one example sentence in Bangla and Korean using the words "${bangla}" and "${korean}" respectively. Return in format: Bangla: [sentence]\nKorean: [sentence]`
            }
          ]
        })
      });
      const data = await response.json();
      const content = data.choices[0].message.content;
      const [banglaLine, koreanLine] = content.split('\n');
      const banglaExample = banglaLine.replace('Bangla: ', '').trim();
      const koreanExample = koreanLine.replace('Korean: ', '').trim();

      setExample({ bangla: banglaExample, korean: koreanExample });
      toast.success('AI-generated example added!');
    } catch (error) {
      console.error('AI fetch error:', error);
      toast.error('Failed to generate AI example');
    }
  };

  const handlePartOfSpeechChange = (value: string) => {
    setValue('partOfSpeech', value);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Word</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bangla">Bangla Word</Label>
              <Input
                id="bangla"
                {...register('bangla', { required: "Bangla word is required" })}
                placeholder="বাংলা শব্দ"
                className={errors.bangla ? "border-destructive" : ""}
              />
              {errors.bangla && <p className="text-xs text-destructive">{errors.bangla.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="korean">Korean Word</Label>
              <Input
                id="korean"
                {...register('korean', { required: "Korean word is required" })}
                placeholder="한국어 단어"
                className={errors.korean ? "border-destructive" : ""}
              />
              {errors.korean && <p className="text-xs text-destructive">{errors.korean.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partOfSpeech">Part of Speech</Label>
            <Select
              onValueChange={handlePartOfSpeechChange}
              defaultValue="noun"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select part of speech" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="noun">Noun</SelectItem>
                <SelectItem value="verb">Verb</SelectItem>
                <SelectItem value="adjective">Adjective</SelectItem>
                <SelectItem value="adverb">Adverb</SelectItem>
                <SelectItem value="pronoun">Pronoun</SelectItem>
                <SelectItem value="preposition">Preposition</SelectItem>
                <SelectItem value="conjunction">Conjunction</SelectItem>
                <SelectItem value="interjection">Interjection</SelectItem>
                <SelectItem value="expression">Expression</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Example</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIExample}
                className="flex items-center"
              >
                <Sparkles className="h-4 w-4 mr-1" /> Generate AI Example
              </Button>
            </div>

            <div className="space-y-3 p-3 border border-border rounded-md bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="example-bangla">Bangla Example</Label>
                <Textarea
                  id="example-bangla"
                  value={example.bangla}
                  onChange={(e) => setExample(prev => ({ ...prev, bangla: e.target.value }))}
                  placeholder="Type Bangla example sentence"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="example-korean">Korean Example</Label>
                <Textarea
                  id="example-korean"
                  value={example.korean}
                  onChange={(e) => setExample(prev => ({ ...prev, korean: e.target.value }))}
                  placeholder="Type Korean example sentence"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="w-full sm:w-auto"
            >
              Add Word
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddWordForm;