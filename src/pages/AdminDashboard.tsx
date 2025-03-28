
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AddWordForm from '@/components/AddWordForm';
import WordCard from '@/components/WordCard';
import { useVocabulary } from '@/context/VocabularyContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboardPage: React.FC = () => {
  const { wordPairs } = useVocabulary();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8 px-4">
        <header className="max-w-2xl mx-auto mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Add new vocabulary pairs and manage your existing collection
          </p>
        </header>
        
        <Tabs defaultValue="add-word" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="add-word">Add New Word</TabsTrigger>
            <TabsTrigger value="manage-words">Manage Words</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-word" className="mt-4">
            <AddWordForm />
          </TabsContent>
          
          <TabsContent value="manage-words" className="mt-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Word Collection</h2>
              <p className="text-muted-foreground">
                {wordPairs.length} {wordPairs.length === 1 ? 'word' : 'words'} in your collection
              </p>
            </div>
            
            {wordPairs.length > 0 ? (
              <div className="space-y-4">
                {wordPairs.map(word => (
                  <WordCard key={word.id} word={word} showAdmin={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No words in your collection yet</p>
                <p className="mt-2 text-sm">Add your first word using the form</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
