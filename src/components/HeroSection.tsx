
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Shield, Zap, Eye, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';

const HeroSection = () => {
  const { theme } = useTheme();
  
  const stats = [
    { icon: Users, value: '10K+', label: 'Users Trust Us', color: 'text-blue-600 dark:text-blue-400' },
    { icon: Eye, value: '50K+', label: 'Documents Analyzed', color: 'text-green-600 dark:text-green-400' },
    { icon: Shield, value: '99.9%', label: 'Accuracy Rate', color: 'text-purple-600 dark:text-purple-400' },
    { icon: Zap, value: '<2min', label: 'Average Analysis', color: 'text-orange-600 dark:text-orange-400' }
  ];

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">CW</span>
              </div>
              <span>AI-Powered Financial Document Analysis</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              Decode Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Financial
              </span>
              <br />
              Documents with{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Upload insurance policies, credit agreements, or loan documents and get instant, 
              plain-English explanations of complex terms, hidden fees, and risks.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/upload">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/chat">
              <Button variant="outline" size="lg" className="border-2 border-gray-300 dark:border-gray-600 px-8 py-6 text-lg font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                Try AI Chat
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Trusted by thousands of users for secure document analysis
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-800 dark:text-green-300">100% Secure & Private</span>
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Your documents are processed securely and never stored permanently. 
              We use bank-level encryption to protect your sensitive financial information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
