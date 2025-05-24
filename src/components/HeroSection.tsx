
import { Button } from '@/components/ui/button';
import { Upload, ArrowDown } from 'lucide-react';

const HeroSection = () => {
  const handleChatClick = () => {
    window.location.href = '/chat';
  };

  const handleUploadClick = () => {
    window.location.href = '/upload';
  };

  return (
    <section id="home" className="pt-16 bg-gradient-to-br from-primary-50 via-white to-secondary-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-accent-100 text-accent-600 rounded-full text-sm font-medium">
                🤖 AI-Powered Financial Companion
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
                Don't Get Trapped in{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Fine Print
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Meet ClauseWise – Your AI buddy that simplifies complex terms and conditions, 
                hidden fees, and confusing clauses in seconds. 💡
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleChatClick}
              >
                💬 Start Chat
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary-200 text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-xl font-semibold text-lg"
                onClick={handleUploadClick}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Policy
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                <span>Used by all ages</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                <span>Free to try</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-coral-500 rounded-full"></div>
                <span>Secure & Private</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              {/* Mock Chat Interface */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">ClauseWise AI</div>
                    <div className="text-xs text-secondary-600">● Online</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md p-4 max-w-xs">
                    <p className="text-sm text-gray-800">Hi! I just uploaded my credit card terms. Can you explain the late payment fees?</p>
                  </div>
                  
                  <div className="bg-primary-500 text-white rounded-2xl rounded-br-md p-4 max-w-xs ml-auto">
                    <p className="text-sm">Great question! 📄 Your card charges $25 for the first late payment, then $35 for subsequent ones. There's also a 29.99% penalty APR that kicks in after 60 days late. Want me to find alternatives with better terms?</p>
                  </div>

                  <div className="bg-gray-100 rounded-2xl rounded-bl-md p-4 max-w-xs">
                    <p className="text-sm text-gray-800">Yes please! That sounds expensive 😰</p>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-400">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs">ClauseWise is typing...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-secondary-200 to-accent-200 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-br from-primary-200 to-coral-200 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="text-center mt-16">
          <ArrowDown className="w-6 h-6 text-gray-400 mx-auto animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
