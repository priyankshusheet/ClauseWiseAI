import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LearningProgress from '@/components/LearningProgress';
import { FadeIn } from '@/components/PageTransition';

const LearnPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Learn Financial Literacy
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Master the skills to understand and analyze financial documents.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <LearningProgress />
          </FadeIn>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LearnPage;
