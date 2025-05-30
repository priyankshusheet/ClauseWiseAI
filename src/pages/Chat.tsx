
import React from 'react';
import Navigation from '@/components/Navigation';
import ChatInterface from '@/components/ChatInterface';
import Footer from '@/components/Footer';

const Chat = () => {
  const features = [
    {
      icon: '🔍',
      title: 'Document Analysis',
      description: 'Advanced parsing of insurance policies, credit agreements, and financial documents.',
      bgColor: 'bg-blue-100'
    },
    {
      icon: '📄',
      title: 'File Processing',
      description: 'Support for PDF, DOC, and text files with instant analysis capabilities.',
      bgColor: 'bg-green-100'
    },
    {
      icon: '💬',
      title: 'Interactive Q&A',
      description: 'Natural conversation interface for understanding complex financial terms.',
      bgColor: 'bg-purple-100'
    }
  ];

  const quickTips = [
    { icon: '🎯', text: 'Ask about hidden fees in your credit card agreement' },
    { icon: '📋', text: 'Upload insurance policies for comprehensive risk analysis' },
    { icon: '🔍', text: 'Request plain-English explanations of complex clauses' },
    { icon: '⚠️', text: 'Get alerts about auto-renewal and penalty terms' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Financial Document Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your intelligent companion for understanding financial documents and policies.
              Upload files or ask questions to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <ChatInterface />

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">Quick Start Guide</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              {quickTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span>{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Chat;
