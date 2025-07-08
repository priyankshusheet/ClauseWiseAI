
import { Button } from '@/components/ui/button';
import { Upload, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section id="home" className="pt-16 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-accent-100 dark:bg-accent-800 text-accent-600 dark:text-accent-300 rounded-full text-sm font-medium">
                🤖 AI-Powered Financial Companion
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                Don't Get Trapped in{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Fine Print
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                Meet ClauseWise – Your AI buddy that simplifies complex terms and conditions, 
                hidden fees, and confusing clauses in seconds. 💡
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/chat">
                <Button 
                  size="lg" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  💬 Start Chat
                </Button>
              </Link>
              <Link to="/upload">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-8 py-4 rounded-xl font-semibold text-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Try Demo
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
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
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
              {/* Mock Chat Interface */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">ClauseWise AI</div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">● Online</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md p-4 max-w-xs">
                    <p className="text-sm text-gray-800 dark:text-gray-200">Hi! I just uploaded my credit card terms. Can you explain the late payment fees?</p>
                  </div>
                  
                  <div className="bg-primary-500 text-white rounded-2xl rounded-br-md p-4 max-w-xs ml-auto">
                    <p className="text-sm">Great question! 📄 Your card charges $25 for the first late payment, then $35 for subsequent ones. There's also a 29.99% penalty APR that kicks in after 60 days late. Want me to find alternatives with better terms?</p>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md p-4 max-w-xs">
                    <p className="text-sm text-gray-800 dark:text-gray-200">Yes please! That sounds expensive 😰</p>
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
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-secondary-200 to-accent-200 dark:from-secondary-800 dark:to-accent-800 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-br from-primary-200 to-coral-200 dark:from-primary-800 dark:to-coral-800 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>

        {/* Ready to Try It Out Section */}
        <div className="text-center mt-24 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ready to Try It Out?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload your financial documents and get instant, clear explanations of complex terms and conditions.
          </p>
          <Link to="/upload">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Upload className="w-5 h-5 mr-2" />
              Try Demo Now
            </Button>
          </Link>
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
