import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Upload, FileText, Bot, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      content: "Hello! I'm ClauseWise, your financial document assistant. I can help you understand insurance policies, credit card terms, and other financial documents. How can I help you today?",
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

  const processMessage = async () => {
    if (!inputValue.trim() && !uploadedFile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: uploadedFile ? `File: ${uploadedFile.name}\n${inputValue}` : inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation history
    const newHistory = [...conversationHistory, `User: ${inputValue}`];
    setConversationHistory(newHistory);
    
    setInputValue('');
    setIsProcessing(true);

    try {
      // If file is uploaded, first analyze the document
      let documentAnalysis = null;
      if (uploadedFile) {
        try {
          // Simulate OCR analysis for demo purposes
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

      // Prepare enhanced message for chat
      let enhancedMessage = inputValue;
      if (documentAnalysis) {
        enhancedMessage += `\n\nDocument Analysis Context: ${documentAnalysis}`;
      }

      const { data, error } = await supabase.functions.invoke('ai-chat-analysis', {
        body: {
          message: enhancedMessage,
          hasDocument: !!uploadedFile,
          fileName: uploadedFile?.name,
          conversationHistory: newHistory.slice(-10) // Keep last 10 messages for context
        }
      });

      if (error) throw error;

      const assistantResponse = data.response || "I'm here to help with your financial documents. Could you provide more details?";
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation history with assistant response
      setConversationHistory(prev => [...prev, `Assistant: ${assistantResponse}`]);
      
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Message processing error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: "I'm experiencing technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to process your request. Please try again.",
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
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">ClauseWise Assistant</h3>
            <p className="text-sm text-gray-600">Financial Document Expert</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ● Available
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser ? 'bg-blue-100' : 'bg-gradient-to-br from-blue-500 to-purple-500'
              }`}>
                {message.isUser ? (
                  <User className="w-4 h-4 text-blue-600" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <Card className={`${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-50 border-gray-200'}`}>
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
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
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Analyzing your request...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {uploadedFile && (
        <div className="px-4 py-2 bg-blue-50 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700">File ready for analysis: {uploadedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUploadedFile(null)}
              className="text-gray-500 hover:text-gray-700 ml-auto"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
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
              placeholder="Ask about financial documents or upload a file..."
              className="min-h-[40px]"
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
        <p className="text-xs text-gray-500 mt-2 text-center">
          Upload documents for analysis or ask questions about financial products.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
