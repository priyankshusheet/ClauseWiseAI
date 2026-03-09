import React, { useState } from 'react';
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
  Search,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  ExternalLink,
  Zap,
  Settings,
  Users,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: Upload,
      title: 'Document Upload',
      description: 'Learn how to upload and analyze your financial documents',
      link: '/upload'
    },
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Get the most out of our AI-powered chat feature',
      link: '/chat'
    },
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Understanding your analysis results and risk scores',
      link: '/history'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'How we protect your sensitive information',
      link: '/privacy'
    },
    {
      icon: BookOpen,
      title: 'Learning Resources',
      description: 'Expand your financial literacy with our courses',
      link: '/learn'
    },
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Manage your profile, preferences, and data',
      link: '/settings'
    }
  ];

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign Up" button on our homepage or authentication page. Enter your full name, email address, and create a password. You\'ll receive a 6-digit verification code to confirm your email address. Once verified, you can start using ClauseWise immediately.'
        },
        {
          q: 'What file formats are supported for document upload?',
          a: 'ClauseWise supports PDF documents, Microsoft Word files (DOC, DOCX), and image files (JPG, PNG). For best results with scanned documents, we recommend high-resolution PDFs. Our OCR technology can extract text from images and scanned documents automatically.'
        },
        {
          q: 'Is there a file size limit for uploads?',
          a: 'Yes, the maximum file size for document uploads is 10MB. If your document exceeds this limit, consider compressing it or splitting it into multiple files. Most financial documents fall well within this limit.'
        }
      ]
    },
    {
      category: 'Document Analysis',
      questions: [
        {
          q: 'How does the risk scoring system work?',
          a: 'Our AI analyzes your document for potentially problematic clauses, hidden fees, unfavorable terms, and legal complexity. The risk score ranges from 0-100, where: Low Risk (0-30) indicates a standard agreement with few concerns, Medium Risk (31-60) suggests some clauses need attention, and High Risk (61-100) indicates significant issues that require careful review.'
        },
        {
          q: 'What types of documents can ClauseWise analyze?',
          a: 'ClauseWise specializes in financial documents including loan agreements, insurance policies, credit card terms, mortgage contracts, investment prospectuses, lease agreements, and service contracts. Our AI is trained to identify industry-specific risks and terminology.'
        },
        {
          q: 'How accurate is the AI analysis?',
          a: 'Our AI provides highly accurate clause identification and risk assessment. However, ClauseWise is designed as an educational and informational tool, not a substitute for professional legal or financial advice. We recommend consulting qualified professionals for important decisions.'
        },
        {
          q: 'Can I save and revisit my analyzed documents?',
          a: 'Yes! All your document analyses are automatically saved to your Analysis History. You can access them anytime from the History page, view detailed breakdowns, compare documents, and export your analysis results.'
        }
      ]
    },
    {
      category: 'AI Chat Assistant',
      questions: [
        {
          q: 'What can I ask the AI chat assistant?',
          a: 'You can ask about financial terms, document clauses, risk explanations, comparisons between financial products, general financial literacy questions, and clarifications about your analyzed documents. The AI remembers context from your uploaded documents for more relevant answers.'
        },
        {
          q: 'Does the AI chat have memory of previous conversations?',
          a: 'Yes, ClauseWise maintains conversation history within your session and can reference previously analyzed documents. Your chat sessions are saved so you can continue conversations later.'
        },
        {
          q: 'Can I export my chat conversations?',
          a: 'Yes, you can export chat conversations in multiple formats including PDF and plain text. Look for the export option in the chat interface to download your conversation history.'
        }
      ]
    },
    {
      category: 'Privacy & Security',
      questions: [
        {
          q: 'How is my data protected?',
          a: 'We use industry-standard TLS/SSL encryption for all data in transit. Your documents are processed securely and stored with encryption at rest. We comply with GDPR and other data protection regulations. You can request data export or deletion at any time from your Settings.'
        },
        {
          q: 'Who can see my uploaded documents?',
          a: 'Only you can access your uploaded documents and analysis results. Your data is never shared with third parties for marketing purposes. Our AI processes your documents to provide analysis but does not store document contents beyond what\'s necessary for the service.'
        },
        {
          q: 'How can I delete my data?',
          a: 'You can delete individual documents from your Analysis History, or request complete account deletion from Settings > Privacy (GDPR). Data deletion requests are processed within 30 days as required by law.'
        }
      ]
    },
    {
      category: 'Account & Billing',
      questions: [
        {
          q: 'How do I reset my password?',
          a: 'On the sign-in page, click "Forgot password?" and enter your email address. You\'ll receive a 6-digit verification code. Enter the code and create your new password. The code expires in 5 minutes for security.'
        },
        {
          q: 'Can I change my email address?',
          a: 'Currently, email changes require contacting our support team. This is for security purposes to prevent unauthorized account transfers. Contact us at support@clausewise.com with your request.'
        },
        {
          q: 'Is ClauseWise free to use?',
          a: 'ClauseWise offers a free tier with limited document analyses per month. Premium features including unlimited analyses, advanced AI insights, and priority support are available through our subscription plans.'
        }
      ]
    }
  ];

  const filteredFaqs = searchQuery
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
               q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs;

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Access Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {helpCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link to={category.link}>
                    <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <category.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{category.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* FAQs */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Frequently Asked Questions
              </h2>
              
              {filteredFaqs.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  <Button variant="link" onClick={() => setSearchQuery('')}>Clear search</Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredFaqs.map((category, catIndex) => (
                    <Card key={category.category} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-muted/50 px-6 py-3 border-b border-border">
                          <h3 className="font-semibold text-foreground">{category.category}</h3>
                        </div>
                        <Accordion type="single" collapsible className="px-6">
                          {category.questions.map((faq, qIndex) => (
                            <AccordionItem key={qIndex} value={`${catIndex}-${qIndex}`}>
                              <AccordionTrigger className="text-left hover:no-underline">
                                <span className="text-foreground pr-4">{faq.q}</span>
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground leading-relaxed">
                                {faq.a}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Support */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Still need help?</h2>
                  <p className="text-muted-foreground">Our support team is here to assist you</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-2">Get help via email</p>
                    <a href="mailto:support@clausewise.com" className="text-primary hover:underline text-sm">
                      support@clausewise.com
                    </a>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">AI Assistant</h3>
                    <p className="text-sm text-muted-foreground mb-2">Chat with our AI</p>
                    <Link to="/chat" className="text-primary hover:underline text-sm">
                      Start a conversation →
                    </Link>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                    <p className="text-sm text-muted-foreground mb-2">We respond within</p>
                    <span className="text-primary text-sm font-medium">24-48 hours</span>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Link to="/contact">
                    <Button size="lg" className="gap-2">
                      Contact Support
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HelpCenter;
