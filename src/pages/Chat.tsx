
import React from 'react';
import Navigation from '@/components/Navigation';
import ChatBot from '@/components/ChatBot';
import Footer from '@/components/Footer';

const Chat = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navigation />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Chat with ClauseWise AI
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your intelligent financial companion is ready to help you understand complex policies and terms. 
              Ask questions or upload documents for instant analysis! 🤖✨
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Analysis</h3>
              <p className="text-gray-600 text-sm">AI-powered analysis of insurance policies, credit card terms, and financial documents.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Document Upload</h3>
              <p className="text-gray-600 text-sm">Upload PDFs and documents for instant clause analysis and risk assessment.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Natural Language</h3>
              <p className="text-gray-600 text-sm">Ask questions in plain English and get easy-to-understand explanations.</p>
            </div>
          </div>

          {/* Chat Interface */}
          <ChatBot />

          {/* Quick Start Tips */}
          <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">💡 Quick Start Tips</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span>🎯</span>
                <span>Try asking: "What are the hidden fees in this credit card policy?"</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>📋</span>
                <span>Upload your insurance policy for instant risk analysis</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>🔍</span>
                <span>Ask: "Explain this clause in simple terms"</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>⚠️</span>
                <span>Get alerts about auto-renewal traps and penalty clauses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Chat;
