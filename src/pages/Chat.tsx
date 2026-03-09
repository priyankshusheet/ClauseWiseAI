import React from 'react';
import Navigation from '@/components/Navigation';
import ChatInterface from '@/components/ChatInterface';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';

const Chat = () => {
  useSEO({ title: 'AI Chat', description: 'Chat with our AI assistant to analyze financial documents, understand clauses, and get instant answers about terms & conditions.', path: '/chat' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20 pb-4 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-4">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Financial Document Assistant</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Chat with ClauseWise to analyze policies, agreements, and financial terms.
            </p>
          </div>

          <section className="flex-1 min-h-0" aria-label="AI Chat">
            <ChatInterface />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chat;

