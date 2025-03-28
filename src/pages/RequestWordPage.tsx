import React from 'react';
import Navbar from '@/components/Navbar';
import TranslatedRequestWordForm from '@/components/TranslatedRequestWordForm';

const RequestWordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <TranslatedRequestWordForm />
        </div>
      </main>
    </div>
  );
};

export default RequestWordPage;