import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Shield, Zap, Eye, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';

const HeroSection = () => {
  const { theme } = useTheme();
  
  const stats = [
    { icon: Users, value: '10K+', label: 'Users Trust Us', color: 'text-primary' },
    { icon: Eye, value: '50K+', label: 'Documents Analyzed', color: 'text-secondary' },
    { icon: Shield, value: '99.9%', label: 'Accuracy Rate', color: 'text-primary' },
    { icon: Zap, value: '<2min', label: 'Average Analysis', color: 'text-accent' }
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
                  Start Free Analysis
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

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="pt-8">
            <p className="text-sm text-muted-foreground mb-6">
              Trusted by thousands of users for secure document analysis
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
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
              <span className="font-semibold text-foreground">100% Secure & Private</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your documents are processed securely and never stored permanently. 
              We use bank-level encryption to protect your sensitive financial information.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
