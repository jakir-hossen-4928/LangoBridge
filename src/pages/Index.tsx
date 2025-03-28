
import React from 'react';
import { motion } from 'framer-motion';
import { Book, Key, Languages, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { useVocabulary } from '@/context/VocabularyContext';
import TranslatedRequestWordForm from '@/components/TranslatedRequestWordForm';

const features = [
  {
    icon: <Languages className="h-6 w-6 text-primary" />,
    title: "Bangla-Korean Bridge",
    description: "Build vocabulary between Bangla and Korean languages with ease.",
  },
  {
    icon: <Search className="h-6 w-6 text-primary" />,
    title: "Advanced Search",
    description: "Find words quickly with powerful search functionality.",
  },
  {
    icon: <Key className="h-6 w-6 text-primary" />,
    title: "Admin Dashboard",
    description: "Easily add and manage vocabulary pairs through a simple interface.",
  },
];

const HomePage = () => {
  const { translate } = useVocabulary();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full filter blur-3xl" />
          </div>

          <div className="container mx-auto max-w-5xl relative">
            <motion.div
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-block mb-2"
              >
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {translate('vocabularyBuilder')}
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {translate('banglaTile')}
              </motion.h1>

              <motion.p
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {translate('buildVocabulary')}
                {' '}
                {translate('searchAddLearn')}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/vocabulary">
                    <Book className="mr-2 h-5 w-5" />
                    {translate('browseVocabulary')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link to="/request-word">
                    {translate('addNewWords')}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Floating elements */}
            <div className="hidden md:block absolute -right-16 top-20 animate-float opacity-30">
              <div className="text-6xl">한국어</div>
            </div>
            <div className="hidden md:block absolute -left-16 bottom-10 animate-float opacity-30" style={{ animationDelay: '1s' }}>
              <div className="text-6xl">বাংলা</div>
            </div>
          </div>
        </section>



        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{translate('keyFeatures')}</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {translate('appDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 stagger-fade-in">
              {features.map((feature, index) => (
                <div key={index} className="glass-card p-6 rounded-xl">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="glass-card rounded-2xl p-8 md:p-12 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">{translate('expandVocabulary')}</h2>
                <p className="text-muted-foreground mb-8">
                  {translate('bridgeGap')}
                </p>
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/vocabulary">
                    {translate('getStarted')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 border-t border-border/30">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LangoBridge. {translate('allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
