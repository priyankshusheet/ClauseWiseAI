
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import UseCasesSection from '@/components/UseCasesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <UseCasesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <Footer />
      
      {/* Floating Chat Button */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
        onClick={() => window.location.href = '/chat'}
      >
        <span className="text-xl">💬</span>
      </button>
    </div>
  );
};

export default Index;
