import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, FileSearch, MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const capabilities = [
    { 
      icon: FileSearch, 
      title: 'Document Analysis', 
      description: 'Upload and analyze financial documents with AI-powered insights'
    },
    { 
      icon: MessageSquare, 
      title: 'Interactive Chat', 
      description: 'Ask questions about terms, clauses, and conditions in plain English'
    },
    { 
      icon: Shield, 
      title: 'Risk Detection', 
      description: 'Identify hidden fees, penalties, and potentially problematic clauses'
    },
    { 
      icon: Sparkles, 
      title: 'Plain-Language Explanations', 
      description: 'Complex financial jargon translated into simple terms'
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 rounded-full text-sm font-medium text-primary border border-primary/20 shadow-sm">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">CW</span>
              </div>
              <span>AI-Powered Financial Document Analysis</span>
            </div>
          </motion.div>
          
          {/* Main Heading */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Decode Your{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Financial
              </span>
              <br />
              Documents with{' '}
              <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Upload insurance policies, credit agreements, or loan documents and get instant, 
              plain-English explanations of complex terms, hidden fees, and risks.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/upload">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  Try Free Analysis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
            
            <Link to="/chat">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-border px-8 py-6 text-lg font-semibold rounded-xl hover:bg-muted transition-all duration-300"
                >
                  Try AI Chat
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Capabilities Grid */}
          <motion.div variants={itemVariants} className="pt-8">
            <p className="text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wide">
              What ClauseWise Can Do For You
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {capabilities.map((capability, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 text-left hover:shadow-lg transition-all duration-300"
                >
                  <capability.icon className="w-8 h-8 mb-3 text-primary" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {capability.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {capability.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 p-6 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-2xl border border-secondary/20 max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Shield className="w-6 h-6 text-secondary" />
              <span className="font-semibold text-foreground">Secure & Private</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your documents are processed securely and never stored permanently. 
              We use bank-level encryption to protect your sensitive financial information.
            </p>
          </motion.div>

          {/* Trial Notice */}
          <motion.div variants={itemVariants} className="pt-4">
            <p className="text-sm text-muted-foreground">
              No sign-up required to try. Analyze up to 2 documents free.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
