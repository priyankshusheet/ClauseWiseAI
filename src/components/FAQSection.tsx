
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "What types of financial documents can ClauseWise analyze?",
      answer: "ClauseWise can analyze various financial documents including credit card agreements, insurance policies (health, life, auto), loan documents, mutual fund prospectuses, ULIPs, and other financial contracts. Our AI is trained to understand complex financial terminology and identify key clauses."
    },
    {
      id: 2,
      question: "How accurate is the AI analysis?",
      answer: "Our AI analysis is highly accurate for identifying standard financial terms and clauses. However, we always recommend consulting with a financial advisor for important decisions. The AI serves as a helpful tool to understand documents better, not as a replacement for professional advice."
    },
    {
      id: 3,
      question: "Is my financial information secure?",
      answer: "Yes, absolutely. We take data security very seriously. All documents are processed securely, and we don't store your personal financial information. Our systems are encrypted and comply with industry-standard security practices."
    },
    {
      id: 4,
      question: "Can I upload documents in different formats?",
      answer: "Yes, we support multiple formats including PDF, DOC, DOCX, TXT, and even images (JPG, PNG) through our OCR technology. Our system can extract text from various document types for analysis."
    },
    {
      id: 5,
      question: "How long does the analysis take?",
      answer: "Most document analyses are completed within 30-60 seconds. Complex documents or those requiring OCR processing may take slightly longer. You'll see real-time progress updates during the analysis."
    },
    {
      id: 6,
      question: "What makes ClauseWise different from other financial tools?",
      answer: "ClauseWise is specifically designed for Indian financial products and regulations. We understand local financial terminology, regulatory requirements, and common practices. Our AI is trained on Indian financial documents and provides context-aware analysis."
    },
    {
      id: 7,
      question: "Can I ask follow-up questions about my documents?",
      answer: "Absolutely! Our AI chat feature allows you to ask specific questions about your analyzed documents. You can clarify terms, understand implications, and get explanations in simple language."
    },
    {
      id: 8,
      question: "Is there a limit to how many documents I can analyze?",
      answer: "Currently, there are no strict limits on document analysis. However, we may implement fair usage policies in the future to ensure quality service for all users."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about ClauseWise and financial document analysis
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <Card key={item.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                <CardTitle className="flex items-center justify-between text-left">
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  {openItems.includes(item.id) ? (
                    <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  )}
                </CardTitle>
              </CardHeader>
              {openItems.includes(item.id) && (
                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed">
                    {item.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our AI chat is available 24/7 to help you understand your financial documents
            </p>
            <button 
              onClick={() => window.location.href = '/chat'}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Start Chat Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
