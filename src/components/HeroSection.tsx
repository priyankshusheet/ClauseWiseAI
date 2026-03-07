import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, FileSearch, MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tapFeedback } from '@/utils/haptics';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();

  const capabilities = [
    { 
      icon: FileSearch, 
      title: t('hero.capabilities.doc_analysis.title'), 
      description: t('hero.capabilities.doc_analysis.description')
    },
    { 
      icon: MessageSquare, 
      title: t('hero.capabilities.interactive_chat.title'), 
      description: t('hero.capabilities.interactive_chat.description')
    },
    { 
      icon: Shield, 
      title: t('hero.capabilities.risk_detection.title'), 
      description: t('hero.capabilities.risk_detection.description')
    },
    { 
      icon: Sparkles, 
      title: t('hero.capabilities.plain_language.title'), 
      description: t('hero.capabilities.plain_language.description')
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
              <span>{t('common.ai_powered')}</span>
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
              {t('hero.description')}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/upload" onClick={() => tapFeedback()}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {t('common.buttons.try_free_analysis')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
            
            <Link to="/chat" onClick={() => tapFeedback()}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-border px-8 py-6 text-lg font-semibold rounded-xl hover:bg-muted transition-all duration-300"
                >
                  {t('common.buttons.try_ai_chat')}
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Capabilities Grid */}
          <motion.div variants={itemVariants} className="pt-8">
            <p className="text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wide">
              {t('hero.capabilities_title')}
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
              <span className="font-semibold text-foreground">{t('common.secure_private')}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('common.bank_level_encryption')}
            </p>
          </motion.div>

          {/* Trial Notice */}
          <motion.div variants={itemVariants} className="pt-4">
            <p className="text-sm text-muted-foreground">
              {t('common.trial_notice')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
