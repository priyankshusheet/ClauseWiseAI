
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
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
        onClick={() => window.location.href = '/chat'}
        aria-label="Open Chat"
      >
        <div className="text-2xl transition-transform group-hover:scale-110">💬</div>
      </button>
    </div>
  );
};

export default Index;
