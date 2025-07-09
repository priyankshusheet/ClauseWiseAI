import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Upload, FileText, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { comprehensiveFinancialData, searchByKeyword, searchByCategory, formatProductResponse } from '@/data/comprehensiveFinancialData';
import { getDocumentContext, getFinancialAdvice } from '@/data/documentTrainingData';

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
      content: "Hello! I'm ClauseWise, your financial document assistant. I have comprehensive knowledge of loans, credit cards, and insurance products from your document collection. I can help you understand policies, compare products, and provide personalized advice. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [documentContext, setDocumentContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for document context from Upload page
  useEffect(() => {
    const storedContext = localStorage.getItem('documentContext');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        setDocumentContext(context);
        
        // Add initial message about the document
        const contextMessage: ChatMessage = {
          id: `context-${Date.now()}`,
          content: `I see you've uploaded "${context.fileName}" for analysis. I have the complete analysis results including the OCR data and risk assessment (${context.analysisResult.riskScore}/100 - ${context.analysisResult.riskLevel} risk). Feel free to ask me any questions about this document!`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, contextMessage]);
        
        // Clear the context from localStorage to avoid repeated loading
        localStorage.removeItem('documentContext');
        
        toast({
          title: "Document loaded",
          description: `Analysis for ${context.fileName} is now available in this chat.`,
        });
      } catch (error) {
        console.error('Error parsing document context:', error);
      }
    }
  }, [toast]);

  const formatTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold">{boldText}</strong>;
      }
      return part;
    });
  };

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

  const generateEnhancedLocalResponse = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    
    // Check if asking about the uploaded document context
    if (documentContext && (lowerQuery.includes('document') || lowerQuery.includes('file') || lowerQuery.includes('analysis'))) {
      const { fileName, analysisResult, ocrResult } = documentContext;
      
      if (lowerQuery.includes('risk') || lowerQuery.includes('score')) {
        return `Based on the analysis of "${fileName}", here's the risk assessment:

**Risk Score: ${analysisResult.riskScore}/100**
**Risk Level: ${analysisResult.riskLevel.toUpperCase()}**

${analysisResult.riskLevel === 'high' ? '🚨 **High Risk Document**' : 
  analysisResult.riskLevel === 'medium' ? '⚠️ **Medium Risk Document**' : 
  '✅ **Low Risk Document**'}

${analysisResult.summary}

${ocrResult.hiddenClauses.length > 0 ? 
  `**Hidden Clauses Found:** ${ocrResult.hiddenClauses.length} potentially concerning clauses were detected during OCR analysis.` : 
  '**No major hidden clauses detected.**'}

Would you like me to explain specific aspects of this risk assessment?`;
      }
      
      if (lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
        return `Here's a summary of your document "${fileName}":

${analysisResult.analysis}

**Key Statistics:**
- OCR Confidence: ${ocrResult.confidence.toFixed(1)}%
- Text Length: ${ocrResult.extractedText.length} characters
- Hidden Clauses: ${ocrResult.hiddenClauses.length}
- Processing Time: ${ocrResult.processingTime}ms

What specific aspect would you like to discuss further?`;
      }
      
      if (lowerQuery.includes('hidden') || lowerQuery.includes('clause')) {
        if (ocrResult.hiddenClauses.length > 0) {
          return `I found ${ocrResult.hiddenClauses.length} potentially hidden or concerning clauses in "${fileName}":

${ocrResult.hiddenClauses.map((clause, index) => `${index + 1}. ${clause}`).join('\n\n')}

These clauses require careful attention as they might have significant implications. Would you like me to explain any of these in detail?`;
        } else {
          return `Good news! I didn't detect any obviously hidden or concerning clauses in "${fileName}". However, I still recommend reviewing the document carefully, especially sections about:

- Cancellation and termination
- Fee structures and penalties
- Auto-renewal terms
- Liability limitations

Is there a specific section you'd like me to analyze further?`;
        }
      }
    }
    
    // First check comprehensive financial dataset
    const keywordResults = searchByKeyword(query);
    if (keywordResults.length > 0) {
      const product = keywordResults[0];
      return formatProductResponse(product);
    }
    
    // Check document training data
    const documentTrainingContext = getDocumentContext(query);
    if (documentTrainingContext) {
      const advice = getFinancialAdvice('', query);
      return `${documentTrainingContext}\n\n${advice}\n\nWould you like more specific information about any of these products?`;
    }
    
    // Category-based responses with enhanced data
    if (lowerQuery.includes('loan') || lowerQuery.includes('home loan')) {
      const loanProducts = searchByCategory('Loan').slice(0, 3);
      const response = `Here are some loan products from our database:

${loanProducts.map((product, index) => `${index + 1}. **${product.product_name}**
   - Interest Rate: ${product.key_details.interest_rate || 'Varies'}
   - Loan Term: ${product.key_details.loan_term || 'Flexible terms'}
   - Source: ${product.source_pdf}`).join('\n\n')}

${getFinancialAdvice('loan', query)}

Which loan product interests you most, or would you like a detailed comparison?`;
      return response;
    }

    if (lowerQuery.includes('credit card')) {
      const cardProducts = searchByCategory('Credit Card').slice(0, 3);
      const response = `Here are credit card products from our database:

${cardProducts.map((product, index) => `${index + 1}. **${product.product_name}**
   - Annual Fee: ${product.key_details.annual_fee || 'Varies'}
   - Benefits: ${product.key_details.welcome_bonus || product.key_details.lounge_access || 'Multiple benefits'}
   - Source: ${product.source_pdf}`).join('\n\n')}

${getFinancialAdvice('credit card', query)}

Would you like detailed analysis of any specific card or feature comparison?`;
      return response;
    }

    if (lowerQuery.includes('insurance')) {
      const insuranceProducts = searchByCategory('Insurance').slice(0, 3);
      const response = `Here are insurance products from our database:

${insuranceProducts.map((product, index) => `${index + 1}. **${product.product_name}**
   - Policy Term: ${product.key_details.policy_term || 'Flexible'}
   - Sum Assured: ${product.key_details.sum_assured || 'Variable'}
   - Source: ${product.source_pdf}`).join('\n\n')}

${getFinancialAdvice('insurance', query)}

Which insurance product would you like to know more about?`;
      return response;
    }

    // Comparison queries
    if (lowerQuery.includes('compare') || lowerQuery.includes('difference')) {
      return `I can help you compare financial products from our comprehensive database! 

**Available Categories:**
• **Loans** - Home loans, personal loans with interest rates and terms
• **Credit Cards** - Premium cards with benefits, fees, and rewards
• **Insurance** - Life and health insurance with coverage details

**What I can compare:**
• Interest rates and fees
• Benefits and features
• Terms and conditions
• Risk factors and advantages

Please specify which products or categories you'd like me to compare, and I'll provide detailed analysis based on our document database.`;
    }

    // General financial advice
    if (lowerQuery.includes('advice') || lowerQuery.includes('recommend')) {
      return `Based on our comprehensive financial database, here's some general advice:

**For Loans:**
• Compare interest rates across multiple products in our database
• Check prepayment charges and processing fees
• Consider loan tenure impact on total interest

**For Credit Cards:**
• Evaluate annual fees against actual benefits you'll use
• Look for cards with lounge access if you travel frequently
• Consider reward point redemption options

**For Insurance:**
• Choose adequate coverage based on your dependents
• Compare policy terms and exclusions
• Review premium payment options

I have detailed information about specific products in each category. What type of financial product are you most interested in?`;
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
    
    const currentQuery = inputValue;
    const newHistory = [...conversationHistory, `User: ${currentQuery}`];
    setConversationHistory(newHistory);
    
    setInputValue('');
    setIsProcessing(true);

    try {
      // First try enhanced local response with comprehensive dataset
      let assistantResponse = generateEnhancedLocalResponse(currentQuery);
      
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

        let enhancedMessage = currentQuery;
        if (documentAnalysis) {
          enhancedMessage += `\n\nDocument Analysis Context: ${documentAnalysis}`;
        }

        // Add document context if available
        if (documentContext) {
          enhancedMessage += `\n\nUploaded Document Context: User has uploaded "${documentContext.fileName}" with ${documentContext.analysisResult.riskScore}/100 risk score (${documentContext.analysisResult.riskLevel} risk). OCR extracted ${documentContext.ocrResult.extractedText.length} chars with ${documentContext.ocrResult.confidence}% confidence and found ${documentContext.ocrResult.hiddenClauses.length} hidden clauses.`;
        }

        enhancedMessage += `\n\nConversation Context: ${newHistory.slice(-6).join(' | ')}`;
        enhancedMessage += `\n\nComprehensive Financial Products Database: I have detailed information about ${comprehensiveFinancialData.length} financial products including loans, credit cards, and insurance policies with specific terms, rates, and conditions.`;
        
        const docContext = getDocumentContext(currentQuery);
        if (docContext) {
          enhancedMessage += `\n\nDocument Training Context: ${docContext}`;
        }

        const { data, error } = await supabase.functions.invoke('ai-chat-analysis', {
          body: {
            message: enhancedMessage,
            hasDocument: !!uploadedFile,
            fileName: uploadedFile?.name,
            conversationHistory: newHistory.slice(-10),
            previousContext: conversationHistory.slice(-5).join(' '),
            documentContext: documentContext
          }
        });

        if (error) {
          console.error('AI Chat error:', error);
          throw error;
        }

        assistantResponse = data.response || "I'm here to help with your financial documents and products. Could you provide more details about what you're looking for?";
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
        content: `I'm experiencing technical difficulties, but I can still help you with information about financial products using my comprehensive database of ${comprehensiveFinancialData.length} products. Please try asking about specific loans, credit cards, or insurance products.`,
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
            <span className="text-white font-bold text-sm">CW</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">ClauseWise Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Financial Document & Product Expert
              {documentContext && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Document Loaded
                </span>
              )}
            </p>
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
                  <span className="text-white font-bold text-xs">CW</span>
                )}
              </div>
              <Card className={`${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                <CardContent className="p-3">
                  <div className={`text-sm whitespace-pre-wrap leading-relaxed ${message.isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                    {message.isUser ? message.content : formatTextWithBold(message.content)}
                  </div>
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
                <span className="text-white font-bold text-xs">CW</span>
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
            title="Upload document"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
          />
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={documentContext ? `Ask about ${documentContext.fileName} or other financial products...` : "Ask about financial documents, products, or upload a file..."}
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
          {documentContext 
            ? `Currently discussing: ${documentContext.fileName} • Ask about specific financial products or upload new documents`
            : "Ask about specific financial products or upload documents for analysis. I have comprehensive data on loans, credit cards, and insurance."
          }
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
