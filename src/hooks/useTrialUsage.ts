import { useState, useEffect, useCallback } from 'react';

interface TrialUsage {
  documentsAnalyzed: number;
  chatMessagesUsed: number;
  lastReset: string;
}

const TRIAL_LIMITS = {
  documents: 2,
  chatMessages: 10,
} as const;

const TRIAL_STORAGE_KEY = 'clausewise_trial_usage';

export const useTrialUsage = () => {
  const [usage, setUsage] = useState<TrialUsage>(() => {
    try {
      const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Reset if older than 24 hours
        const lastReset = new Date(parsed.lastReset);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
        if (hoursDiff >= 24) {
          return {
            documentsAnalyzed: 0,
            chatMessagesUsed: 0,
            lastReset: now.toISOString(),
          };
        }
        return parsed;
      }
    } catch {
      // Ignore parsing errors
    }
    return {
      documentsAnalyzed: 0,
      chatMessagesUsed: 0,
      lastReset: new Date().toISOString(),
    };
  });

  // Persist to localStorage whenever usage changes
  useEffect(() => {
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(usage));
  }, [usage]);

  const canAnalyzeDocument = usage.documentsAnalyzed < TRIAL_LIMITS.documents;
  const canSendChatMessage = usage.chatMessagesUsed < TRIAL_LIMITS.chatMessages;

  const remainingDocuments = Math.max(0, TRIAL_LIMITS.documents - usage.documentsAnalyzed);
  const remainingChatMessages = Math.max(0, TRIAL_LIMITS.chatMessages - usage.chatMessagesUsed);

  const recordDocumentAnalysis = useCallback(() => {
    setUsage(prev => ({
      ...prev,
      documentsAnalyzed: prev.documentsAnalyzed + 1,
    }));
  }, []);

  const recordChatMessage = useCallback(() => {
    setUsage(prev => ({
      ...prev,
      chatMessagesUsed: prev.chatMessagesUsed + 1,
    }));
  }, []);

  const resetTrial = useCallback(() => {
    setUsage({
      documentsAnalyzed: 0,
      chatMessagesUsed: 0,
      lastReset: new Date().toISOString(),
    });
  }, []);

  return {
    usage,
    canAnalyzeDocument,
    canSendChatMessage,
    remainingDocuments,
    remainingChatMessages,
    recordDocumentAnalysis,
    recordChatMessage,
    resetTrial,
    limits: TRIAL_LIMITS,
  };
};
