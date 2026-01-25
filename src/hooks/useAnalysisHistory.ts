import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface AnalysisRecord {
  id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  risk_score: number | null;
  risk_level: string | null;
  analysis_summary: string | null;
  analysis_result: Record<string, unknown> | null;
  ocr_result: Record<string, unknown> | null;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
}

interface UseAnalysisHistoryReturn {
  analyses: AnalysisRecord[];
  loading: boolean;
  error: string | null;
  saveAnalysis: (analysis: Omit<AnalysisRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<AnalysisRecord | null>;
  toggleSaved: (id: string, isSaved: boolean) => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  refreshAnalyses: () => Promise<void>;
}

export const useAnalysisHistory = (): UseAnalysisHistoryReturn => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAnalyses = useCallback(async () => {
    if (!user) {
      setAnalyses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('document_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAnalyses((data || []) as unknown as AnalysisRecord[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analyses';
      setError(errorMessage);
      console.error('Error fetching analyses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const saveAnalysis = async (
    analysis: Omit<AnalysisRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<AnalysisRecord | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save analyses',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const insertData = {
        user_id: user.id,
        file_name: analysis.file_name,
        file_type: analysis.file_type,
        file_size: analysis.file_size,
        risk_score: analysis.risk_score,
        risk_level: analysis.risk_level,
        analysis_summary: analysis.analysis_summary,
        analysis_result: analysis.analysis_result,
        ocr_result: analysis.ocr_result,
        is_saved: analysis.is_saved,
      };

      const { data, error: insertError } = await supabase
        .from('document_analyses')
        .insert(insertData as never)
        .select()
        .single();

      if (insertError) throw insertError;

      const newRecord = data as unknown as AnalysisRecord;
      setAnalyses(prev => [newRecord, ...prev]);

      toast({
        title: 'Analysis saved',
        description: `${analysis.file_name} has been saved to your history`,
      });

      return newRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save analysis';
      toast({
        title: 'Save failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error saving analysis:', err);
      return null;
    }
  };

  const toggleSaved = async (id: string, isSaved: boolean): Promise<void> => {
    try {
      const { error: updateError } = await supabase
        .from('document_analyses')
        .update({ is_saved: isSaved })
        .eq('id', id);

      if (updateError) throw updateError;

      setAnalyses(prev =>
        prev.map(a => (a.id === id ? { ...a, is_saved: isSaved } : a))
      );

      toast({
        title: isSaved ? 'Analysis saved' : 'Analysis unsaved',
        description: isSaved ? 'Added to your saved analyses' : 'Removed from saved analyses',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update analysis';
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error updating analysis:', err);
    }
  };

  const deleteAnalysis = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('document_analyses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setAnalyses(prev => prev.filter(a => a.id !== id));

      toast({
        title: 'Analysis deleted',
        description: 'The analysis has been removed from your history',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete analysis';
      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error deleting analysis:', err);
    }
  };

  return {
    analyses,
    loading,
    error,
    saveAnalysis,
    toggleSaved,
    deleteAnalysis,
    refreshAnalyses: fetchAnalyses,
  };
};

export default useAnalysisHistory;
