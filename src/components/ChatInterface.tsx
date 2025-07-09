import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Upload, FileText, Bot, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { financialProductsData, searchProducts, ProductCategory, getProductData } from '@/data/financialProductsData';
import { 
  searchAllProducts, 
  getProductsByCategory, 
  formatProductDetails,
  loanDataSet,
  creditCardDataSet,
  insuranceDataSet,
  type ProductInfo
} from '@/data/comprehensiveFinancialData';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm ClauseWise, your financial document assistant. I can help you understand insurance policies, credit card terms, loan agreements, and other financial documents. I have comprehensive information about financial products from actual PDFs and documents. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'text/plain'];
      const validExtensions = ['.pdf', '.txt', '.doc', '.docx'];
      
      const isValidType = validTypes.includes(file.type) || 
        validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (isValidType) {
        setUploadedFile(file);
        toast({
          title: "File selected",
          description: `${file.name} ready for analysis`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, DOC, or text file",
          variant: "destructive",
        });
      }
    }
  };

  const generateLocalResponse = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    
    // First, search comprehensive dataset
    const comprehensiveResults = searchAllProducts(query);
    if (comprehensiveResults.length > 0) {
      const topResult = comprehensiveResults[0];
      const productInfo: ProductInfo = {
        source_pdf: topResult.source_pdf,
        category: topResult.category,
        product_name: topResult.product_name,
        key_details: topResult.key_details
      };
      
      let response = formatProductDetails(productInfo);
      
      // Add related products
      if (comprehensiveResults.length > 1) {
        response += `\n\n**Related Products:**\n`;
        comprehensiveResults.slice(1, 4).forEach((product, index) => {
          response += `${index + 1}. ${product.product_name} (${product.category})\n`;
        });
      }
      
      response += `\n\nWould you like more details about any of these products or need help with document analysis?`;
      return response;
    }
    
    // Category-based responses with comprehensive data
    if (lowerQuery.includes('loan') || lowerQuery.includes('home loan') || lowerQuery.includes('personal loan')) {
      const loanProducts = loanDataSet.slice(0, 5);
      let response = `Here are loan products from our comprehensive database:\n\n`;
      
      loanProducts.forEach((loan, index) => {
        response += `${index + 1}. **${loan.product_name}**\n`;
        if (loan.key_details.interest_rate) {
          response += `   • Interest Rate: ${loan.key_details.interest_rate}\n`;
        }
        if (loan.key_details.loan_term) {
          response += `   • Loan Term: ${loan.key_details.loan_term}\n`;
        }
        response += `   • Source: ${loan.source_pdf}\n\n`;
      });
      
      response += `I can provide detailed analysis of any of these loan products or help you understand specific terms and conditions. Which one interests you?`;
      return response;
    }

    if (lowerQuery.includes('credit card')) {
      const cardProducts = creditCardDataSet.slice(0, 5);
      let response = `Here are credit card products from our comprehensive database:\n\n`;
      
      cardProducts.forEach((card, index) => {
        response += `${index + 1}. **${card.product_name}**\n`;
        if (card.key_details.annual_fee) {
          response += `   • Annual Fee: ${card.key_details.annual_fee}\n`;
        }
        if (card.key_details.reward_points) {
          response += `   • Rewards: ${card.key_details.reward_points}\n`;
        }
        if (card.key_details.lounge_access) {
          response += `   • Lounge Access: ${card.key_details.lounge_access}\n`;
        }
        response += `   • Source: ${card.source_pdf}\n\n`;
      });
      
      response += `I can provide detailed analysis of any of these credit cards or help you understand specific terms and conditions. Which one interests you?`;
      return response;
    }

    if (lowerQuery.includes('insurance') || lowerQuery.includes('life insurance') || lowerQuery.includes('health insurance')) {
      const insuranceProducts = insuranceDataSet.slice(0, 5);
      let response = `Here are insurance products from our comprehensive database:\n\n`;
      
      insuranceProducts.forEach((insurance, index) => {
        response += `${index + 1}. **${insurance.product_name}**\n`;
        if (insurance.key_details.policy_term) {
          response += `   • Policy Term: ${insurance.key_details.policy_term}\n`;
        }
        if (insurance.key_details.sum_assured) {
          response += `   • Sum Assured: ${insurance.key_details.sum_assured}\n`;
        }
        if (insurance.key_details.premium) {
          response += `   • Premium: ${insurance.key_details.premium}\n`;
        }
        response += `   • Source: ${insurance.source_pdf}\n\n`;
      });
      
      response += `I can provide detailed analysis of any of these insurance products or help you understand specific policy terms. Which one interests you?`;
      return response;
    }

    // Fallback to original dataset
    const productResults = searchProducts(query);
    if (productResults.length > 0) {
      const result = productResults[0];
      return `Here's information about ${result.productName}:

**Key Benefits:**
${result.data.Pros.map(pro => `• ${pro}`).join('\n')}

**Main Risks:**
${result.data.Cons.map(con => `• ${con}`).join('\n')}

This product falls under the ${result.category} category. Would you like more details about other products in this category or specific comparisons?`;
    }

    // General comparison queries
    if (lowerQuery.includes('compare') || lowerQuery.includes('difference')) {
      return `I can help you compare financial products! Here's what I can compare for you:

• **Loans** - Interest rates, processing fees, terms, prepayment charges
• **Credit Cards** - Annual fees, rewards, lounge access, welcome bonuses  
• **Insurance** - Policy terms, sum assured, premiums, riders, maturity benefits
• **Legacy Products** - Credit Cards, Health Insurance, Life Insurance, ULIPs, Mutual Funds

I have comprehensive data from actual product documents and PDFs. Which products would you like me to compare? Please specify the exact names or categories.`;
    }

    return null;
  };

  const processMessage = async () => {
    if (!inputValue.trim() && !uploadedFile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: uploadedFile ? `File: ${uploadedFile.name}\n${inputValue}` : inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    const newHistory = [...conversationHistory, `User: ${inputValue}`];
    setConversationHistory(newHistory);
    
    setInputValue('');
    setIsProcessing(true);

    try {
      let assistantResponse = generateLocalResponse(inputValue);
      
      if (!assistantResponse) {
        let documentAnalysis = null;
        if (uploadedFile) {
          try {
            const ocrResult = {
              extractedText: "Sample extracted text from document...",
              confidence: 85,
              sections: 3,
              hiddenClauses: 2
            };

            const { data: docData, error: docError } = await supabase.functions.invoke('document-analysis', {
              body: {
                fileName: uploadedFile.name,
                fileType: uploadedFile.type,
                analysisType: 'comprehensive',
                extractedText: ocrResult.extractedText,
                ocrConfidence: ocrResult.confidence,
                identifiedSections: ocrResult.sections,
                hiddenClausesCount: ocrResult.hiddenClauses
              }
            });

            if (!docError && docData) {
              documentAnalysis = docData.analysis || docData.summary;
            }
          } catch (docError) {
            console.error('Document analysis error:', docError);
          }
        }

        let enhancedMessage = inputValue;
        if (documentAnalysis) {
          enhancedMessage += `\n\nDocument Analysis Context: ${documentAnalysis}`;
        }

        enhancedMessage += `\n\nComprehensive Financial Database: I have detailed information about ${loanDataSet.length} loan products, ${creditCardDataSet.length} credit card products, and ${insuranceDataSet.length} insurance products from actual PDF documents with specific terms, conditions, and features.`;

        const { data, error } = await supabase.functions.invoke('ai-chat-analysis', {
          body: {
            message: enhancedMessage,
            hasDocument: !!uploadedFile,
            fileName: uploadedFile?.name,
            conversationHistory: newHistory.slice(-10)
          }
        });

        if (error) throw error;

        assistantResponse = data.response || "I'm here to help with your financial documents and products. Could you provide more details?";
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationHistory(prev => [...prev, `Assistant: ${assistantResponse}`]);
      
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Message processing error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: "I'm experiencing technical difficulties. However, I can still help you with information about financial products using my comprehensive local database. Please try asking about loans, credit cards, or insurance products.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Using local database for financial product information.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      processMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">ClauseWise Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Financial Document & Product Expert</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          ● Available
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gradient-to-br from-blue-500 to-purple-500'
              }`}>
                {message.isUser ? (
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <Card className={`${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                <CardContent className="p-3">
                  <p className={`text-sm whitespace-pre-wrap ${message.isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{message.content}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Analyzing your request...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {uploadedFile && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">File ready for analysis: {uploadedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUploadedFile(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-auto"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
        <div className="flex items-end space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
            title="Upload document"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about financial documents, products, or upload a file..."
              className="min-h-[40px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isProcessing}
            />
          </div>
          <Button
            onClick={processMessage}
            disabled={(!inputValue.trim() && !uploadedFile) || isProcessing}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Upload documents for analysis or ask questions about financial products from our comprehensive database.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
