import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { 
  HelpCircle, 
  Upload, 
  MessageSquare, 
  Shield, 
  FileText, 
  BookOpen,
  ChevronRight,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HelpCenter = () => {
  const helpCategories = [
    {
      icon: Upload,
      title: 'Document Upload',
      description: 'Learn how to upload and analyze your financial documents',
      topics: [
        'Supported file formats (PDF, DOC, DOCX, images)',
        'Maximum file size limits',
        'How OCR processing works',
        'Tips for better document quality'
      ]
    },
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Get the most out of our AI-powered chat feature',
      topics: [
        'How to ask effective questions',
        'Understanding AI responses',
        'Exporting chat conversations',
        'Voice input and output features'
      ]
    },
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Understanding your analysis results',
      topics: [
        'Risk score interpretation',
        'Hidden clause detection',
        'Comparison features',
        'Saving and sharing analyses'
      ]
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'How we protect your sensitive information',
      topics: [
        'Data encryption standards',
        'Document storage policies',
        'Account security best practices',
        'GDPR compliance'
      ]
    },
    {
      icon: BookOpen,
      title: 'Learning Resources',
      description: 'Expand your financial literacy',
      topics: [
        'Financial terms glossary',
        'Document type guides',
        'Best practices for reviews',
        'Common clause explanations'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions and learn how to get the most out of ClauseWise
              </p>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search for help topics..." 
                  className="pl-12 py-6 text-lg"
                />
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {helpCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <category.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{category.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                      <ul className="space-y-2">
                        {category.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-center text-sm text-muted-foreground">
                            <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Quick Links</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/upload">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <Upload className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Start Analysis</div>
                      <div className="text-xs text-muted-foreground">Upload a document</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <MessageSquare className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">AI Chat</div>
                      <div className="text-xs text-muted-foreground">Ask questions</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <HelpCircle className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Contact Support</div>
                      <div className="text-xs text-muted-foreground">Get personalized help</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HelpCenter;
