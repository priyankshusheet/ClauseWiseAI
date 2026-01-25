import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import ChatInterface from '@/components/ChatInterface';
import Footer from '@/components/Footer';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/PageTransition';

const Chat = () => {
  const features = [
    {
      icon: '🔍',
      title: 'Document Analysis',
      description: 'Advanced parsing of insurance policies, credit agreements, and financial documents.',
    },
    {
      icon: '📄',
      title: 'File Processing',
      description: 'Support for PDF, DOC, and text files with instant analysis capabilities.',
    },
    {
      icon: '💬',
      title: 'Interactive Q&A',
      description: 'Natural conversation interface for understanding complex financial terms.',
    }
  ];

  const quickTips = [
    { icon: '🎯', text: 'Ask about hidden fees in your credit card agreement' },
    { icon: '📋', text: 'Upload insurance policies for comprehensive risk analysis' },
    { icon: '🔍', text: 'Request plain-English explanations of complex clauses' },
    { icon: '⚠️', text: 'Get alerts about auto-renewal and penalty terms' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Financial Document Assistant
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your intelligent companion for understanding financial documents and policies.
                Upload files or ask questions to get started.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <motion.div 
                  className="bg-card rounded-xl p-6 shadow-lg border border-border card-interactive"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.3}>
            <ChatInterface />
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4 text-center">Quick Start Guide</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                {quickTips.map((tip, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <span>{tip.icon}</span>
                    <span>{tip.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Chat;
