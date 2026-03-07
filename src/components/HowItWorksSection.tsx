import { Upload, Search, MessageCircle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Upload,
      title: t('how_it_works.steps.upload.title'),
      description: t('how_it_works.steps.upload.description'),
      details: t('how_it_works.steps.upload.details'),
      color: 'bg-primary',
      bgColor: 'bg-primary/10',
      step: '01'
    },
    {
      icon: Search,
      title: t('how_it_works.steps.analyze.title'),
      description: t('how_it_works.steps.analyze.description'),
      details: t('how_it_works.steps.analyze.details'),
      color: 'bg-secondary',
      bgColor: 'bg-secondary/10',
      step: '02'
    },
    {
      icon: MessageCircle,
      title: t('how_it_works.steps.chat.title'),
      description: t('how_it_works.steps.chat.description'),
      details: t('how_it_works.steps.chat.details'),
      color: 'bg-accent',
      bgColor: 'bg-accent/10',
      step: '03'
    },
    {
      icon: Check,
      title: t('how_it_works.steps.decide.title'),
      description: t('how_it_works.steps.decide.description'),
      details: t('how_it_works.steps.decide.details'),
      color: 'bg-primary',
      bgColor: 'bg-primary/10',
      step: '04'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {t('how_it_works.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('how_it_works.subtitle')}
          </p>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection lines */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30"></div>
            
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.step} className="relative text-center group">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg`}>
                      {step.step}
                    </div>
                  </div>

                  {/* Icon container */}
                  <div className={`w-24 h-24 ${step.bgColor} rounded-3xl flex items-center justify-center mx-auto mb-6 mt-8 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`w-12 h-12 text-foreground`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    <p className="text-sm text-muted-foreground/70">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-8">
          {steps.map((step) => (
            <div key={step.step} className="flex items-start space-x-4">
              {/* Step indicator */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-primary-foreground font-bold`}>
                  {step.step}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${step.bgColor} rounded-xl flex items-center justify-center`}>
                    <step.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="text-muted-foreground">{step.description}</p>
                <p className="text-sm text-muted-foreground/70">{step.details}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Demo CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 max-w-2xl mx-auto border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-4">{t('how_it_works.cta_title')}</h3>
            <p className="text-muted-foreground mb-6">{t('how_it_works.cta_subtitle')}</p>
            <Link to="/upload">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Upload className="w-4 h-4 mr-2" />
                {t('how_it_works.try_demo')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
