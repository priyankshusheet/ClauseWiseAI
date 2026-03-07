import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Upload, FileText, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService, Message, DocumentContext } from '@/services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceInput from './VoiceInput';
import SuggestedQuestions from './SuggestedQuestions';
import ChatExport from './ChatExport';
import { useTrialUsage } from '@/hooks/useTrialUsage';
import { useAuth } from '@/components/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { pdfService } from '@/services/pdfService';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  initialDocumentContext?: DocumentContext;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialDocumentContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm ClauseWise, your AI-powered financial document assistant. I can analyze insurance policies, loan agreements, credit card terms, and other financial documents. Upload a document or ask me anything about financial products!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentContext, setDocumentContext] = useState<DocumentContext | null>(initialDocumentContext || null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canSendChatMessage, remainingChatMessages, recordChatMessage, limits } = useTrialUsage();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Load document context from localStorage
  useEffect(() => {
    const storedContext = localStorage.getItem('documentContext');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        
        // Build proper DocumentContext with extracted text
        const docContext: DocumentContext = {
          fileName: context.fileName,
          fileType: context.fileType || 'application/pdf',
          riskScore: context.analysisResult?.riskScore || context.riskScore,
          riskLevel: context.analysisResult?.riskLevel || context.riskLevel,
          ocrConfidence: context.ocrResult?.confidence,
          extractedText: context.ocrResult?.extractedText || context.extractedText || '',
          detectedClauses: context.ocrResult?.hiddenClauses?.map?.((c: any) => 
            typeof c === 'string' ? c : c.clause
          ) || [],
          sections: context.ocrResult?.sections || [],
        };
        
        setDocumentContext(docContext);
        
        const riskScore = docContext.riskScore || 0;
        const riskLevel = docContext.riskLevel || 'unknown';
        const textPreview = docContext.extractedText 
          ? `\n\nI have the full document text (${docContext.extractedText.length} characters) loaded and ready for detailed discussion.` 
          : '';
        
        const contextMessage: ChatMessage = {
          id: `context-${Date.now()}`,
          content: `I've loaded **"${context.fileName}"** for analysis.\n\n📊 **Risk Score:** ${riskScore}/100 (${riskLevel})\n📝 **Document loaded with full text context**${textPreview}\n\nAsk me anything specific about this document — I can reference exact clauses and terms!`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, contextMessage]);
        localStorage.removeItem('documentContext');
        
        toast({
          title: "Document loaded",
          description: `Full analysis context for ${context.fileName} is ready.`,
        });
      } catch (error) {
        console.error('Error parsing document context:', error);
      }
    }
  }, [toast]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const validTypes = ['application/pdf', 'text/plain'];
    const validExtensions = ['.pdf', '.txt', '.doc', '.docx'];
    
    const isValidType = validTypes.includes(file.type) || 
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF, DOC, or text file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsExtractingFile(true);

    // Actually extract text from the file
    try {
      let extractedText = '';
      
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        extractedText = await file.text();
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          const pdfResult = await pdfService.extractTextWithFallback(file);
          extractedText = pdfResult.text;
        } catch {
          // If PDF extraction fails, try sending as base64 to AI
          extractedText = '[PDF content - will be analyzed by AI]';
        }
      }

      if (extractedText && extractedText.length > 50) {
        const newContext: DocumentContext = {
          fileName: file.name,
          fileType: file.type,
          extractedText: extractedText,
        };
        setDocumentContext(newContext);

        toast({
          title: "Document loaded",
          description: `${file.name} text extracted (${extractedText.length} chars). Ask questions about it!`,
        });
      } else {
        // For files where extraction is difficult, send to backend for analysis
        const base64 = await fileToBase64(file);
        
        const { data, error } = await supabase.functions.invoke('analyze-document', {
          body: {
            fileName: file.name,
            fileType: file.type,
            fileBase64: base64,
            fileMimeType: file.type,
          },
        });

        if (!error && data?.extractedText) {
          const newContext: DocumentContext = {
            fileName: file.name,
            fileType: file.type,
            extractedText: data.extractedText,
            riskScore: data.riskScore,
            riskLevel: data.riskLevel,
          };
          setDocumentContext(newContext);

          toast({
            title: "Document analyzed",
            description: `${file.name} analyzed. Risk: ${data.riskLevel}. Ask questions about it!`,
          });
        } else {
          toast({
            title: "File selected",
            description: `${file.name} ready — mention it in your question.`,
          });
        }
      }
    } catch (err) {
      console.error('File extraction error:', err);
      toast({
        title: "File selected",
        description: `${file.name} ready for discussion`,
      });
    } finally {
      setIsExtractingFile(false);
    }
  };

  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processMessage = async () => {
    if (!inputValue.trim() && !uploadedFile) return;

    if (!user && !canSendChatMessage) {
      toast({
        title: "Trial Limit Reached",
        description: "Please sign in to continue chatting.",
        variant: "destructive"
      });
      return;
    }

    setError(null);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: uploadedFile ? `[Attached: ${uploadedFile.name}]\n${inputValue}` : inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    const newMessage: Message = { role: 'user', content: inputValue };
    const newHistory = [...conversationHistory, newMessage];
    setConversationHistory(newHistory);
    
    setInputValue('');
    setIsProcessing(true);
    setStreamingContent('');

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true,
    }]);

    try {
      let accumulatedContent = '';

      await aiService.streamChat(
        newHistory,
        documentContext,
        {
          onDelta: (delta) => {
            accumulatedContent += delta;
            setStreamingContent(accumulatedContent);
            
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: accumulatedContent }
                : msg
            ));
          },
          onDone: () => {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: accumulatedContent, isStreaming: false }
                : msg
            ));
            
            if (!user) {
              recordChatMessage();
            }
            
            if (user && newHistory.length % 3 === 0 && accumulatedContent.length > 100) {
              supabase.functions.invoke('memory', {
                body: {
                  action: 'store',
                  content: `User asked: "${inputValue.substring(0, 200)}" — AI responded about: ${accumulatedContent.substring(0, 300)}`,
                  memoryType: documentContext ? 'document_discussion' : 'general_chat',
                  metadata: {
                    documentName: documentContext?.fileName,
                    timestamp: new Date().toISOString(),
                  },
                },
              }).catch(err => console.warn('Memory store failed (non-critical):', err));
            }
            
            setConversationHistory(prev => [...prev, { role: 'assistant', content: accumulatedContent }]);
            setStreamingContent('');
            setIsProcessing(false);
          },
          onError: (err) => {
            console.error('Chat error:', err);
            setError(err.message);
            
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: `I encountered an error: ${err.message}. Please try again.`, isStreaming: false }
                : msg
            ));
            
            setIsProcessing(false);
            
            toast({
              title: "Error",
              description: err.message,
              variant: "destructive",
            });
          },
        }
      );

      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Message processing error:', error);
      setIsProcessing(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: `I'm having trouble connecting. ${errorMessage}`, isStreaming: false }
          : msg
      ));
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

  const handleCancel = () => {
    aiService.cancel();
    setIsProcessing(false);
  };

  return (
    <Card className="flex flex-col h-[600px] bg-card border-border shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md">
            <span className="text-primary-foreground font-bold text-sm">CW</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">ClauseWise AI</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Financial Document Expert
              {documentContext && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {documentContext.fileName}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChatExport 
            messages={messages} 
            documentContext={documentContext ? {
              fileName: documentContext.fileName,
              riskScore: documentContext.riskScore,
              riskLevel: documentContext.riskLevel,
            } : undefined}
          />
          {isProcessing && (
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <span className="w-1.5 h-1.5 bg-success rounded-full mr-1.5 animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  {message.isUser ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          h1: ({ children }) => <h3 className="font-bold text-lg mb-2">{children}</h3>,
                          h2: ({ children }) => <h4 className="font-semibold text-base mb-2">{children}</h4>,
                          h3: ({ children }) => <h5 className="font-medium mb-1">{children}</h5>,
                          code: ({ children }) => (
                            <code className="bg-background/50 px-1 py-0.5 rounded text-xs">{children}</code>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-3 rounded-lg border border-border">
                              <table className="min-w-full divide-y divide-border text-sm">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                          tbody: ({ children }) => <tbody className="divide-y divide-border bg-card">{children}</tbody>,
                          tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
                          th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap">{children}</th>,
                          td: ({ children }) => <td className="px-3 py-2 text-foreground">{children}</td>,
                        }}
                      >
                        {message.content || ' '}
                      </ReactMarkdown>
                      {message.isStreaming && !message.content && (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="text-sm text-muted-foreground italic">Thinking</span>
                          <span className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      )}
                      {message.isStreaming && message.content && (
                        <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5" />
                      )}
                    </div>
                  )}
                </div>
                <p className={`text-xs text-muted-foreground mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/50">
        {!user && (
          <Alert className="mb-3 bg-primary/5 border-primary/20">
            <AlertDescription className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                <strong>Free Trial:</strong> {remainingChatMessages} of {limits.chatMessages} messages remaining.
              </span>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="ml-4">
                  <LogIn className="w-3 h-3 mr-1" />
                  Sign in
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground flex-1 truncate">
              {uploadedFile.name}
              {isExtractingFile && <span className="text-muted-foreground ml-2">(extracting text...)</span>}
              {!isExtractingFile && documentContext?.extractedText && (
                <span className="text-success ml-2">✓ Text loaded</span>
              )}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUploadedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Remove
            </Button>
          </motion.div>
        )}
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || isExtractingFile}
            className="shrink-0"
          >
            <Upload className="w-4 h-4" />
          </Button>
          
          <VoiceInput 
            onTranscript={(text) => setInputValue(prev => prev + ' ' + text)}
            disabled={isProcessing}
          />
          
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={documentContext ? `Ask about "${documentContext.fileName}"...` : "Ask about financial products..."}
            disabled={isProcessing}
            className="flex-1"
          />
          
          <Button
            onClick={processMessage}
            disabled={isProcessing || isExtractingFile || (!inputValue.trim() && !uploadedFile)}
            className="shrink-0"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Suggested Questions */}
        <div className="mt-3">
          <SuggestedQuestions 
            documentContext={documentContext ? {
              fileName: documentContext.fileName,
              documentType: undefined,
              riskLevel: documentContext.riskLevel,
              riskScore: documentContext.riskScore,
              detectedClauses: documentContext.detectedClauses,
            } : undefined}
            conversationHistory={messages.map(m => ({ content: m.content, isUser: m.isUser }))}
            onSelectQuestion={(q) => setInputValue(q)}
            isProcessing={isProcessing}
          />
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by AI • Responses are for informational purposes only
        </p>
      </div>
    </Card>
  );
};

export default ChatInterface;
