import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Top10Product {
  rank: number;
  name: string;
  provider: string;
  highlight: string;
  rating: number;
  pros: string[];
  cons: string[];
  keyFeatures?: string[];
  bestFor?: string;
}

export interface Top10List {
  id: string;
  category: string;
  products: Top10Product[];
  generated_at: string;
  metadata: {
    trendNote?: string;
    lastUpdated?: string;
    title?: string;
    icon?: string;
  };
}

export const useTop10Lists = (category?: string) => {
  const [data, setData] = useState<Top10List | null>(null);
  const [allLists, setAllLists] = useState<Top10List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (category) {
          // Fetch single category
          const { data: listData, error: fetchError } = await supabase
            .from('top_10_lists')
            .select('*')
            .eq('category', category)
            .single();

          if (fetchError) throw fetchError;
          setData(listData as unknown as Top10List);
        } else {
          // Fetch all categories
          const { data: listsData, error: fetchError } = await supabase
            .from('top_10_lists')
            .select('*')
            .order('category');

          if (fetchError) throw fetchError;
          setAllLists(listsData as unknown as Top10List[]);
        }
      } catch (err) {
        console.error('[useTop10Lists] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const refreshList = async (cat: string, force = false) => {
    try {
      const response = await supabase.functions.invoke('generate-top10', {
        body: { category: cat, force },
      });

      if (response.error) throw response.error;

      // Refetch the data
      if (category) {
        const { data: listData } = await supabase
          .from('top_10_lists')
          .select('*')
          .eq('category', cat)
          .single();
        
        if (listData) setData(listData as unknown as Top10List);
      }

      return response.data;
    } catch (err) {
      console.error('[useTop10Lists] Refresh error:', err);
      throw err;
    }
  };

  return { data, allLists, loading, error, refreshList };
};
