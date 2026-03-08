import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface ShareAnalysisProps {
  analysisId: string;
  fileName: string;
}

const ShareAnalysis: React.FC<ShareAnalysisProps> = ({ analysisId, fileName }) => {
  const [open, setOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateShareLink = async () => {
    if (!user) return;
    setIsCreating(true);

    try {
      // Create a share record — shared_with is a "public" placeholder UUID
      const publicUUID = '00000000-0000-0000-0000-000000000000';
      
      const { data, error } = await supabase
        .from('document_shares')
        .insert({
          document_id: analysisId,
          shared_by: user.id,
          shared_with: publicUUID,
          permission: 'view',
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/shared/${data.id}`;
      setShareLink(link);
    } catch (err: any) {
      console.error('Share error:', err);
      toast({
        title: 'Failed to create share link',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({ title: 'Link copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!shareLink) generateShareLink();
  };

  return (
    <>
      <Button variant="outline" size="icon" onClick={handleOpen} title="Share analysis">
        <Share2 className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Share Analysis
            </DialogTitle>
            <DialogDescription>
              Share the analysis of "{fileName}" with anyone using this link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {isCreating ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-sm text-muted-foreground">Generating link...</span>
              </div>
            ) : shareLink ? (
              <div className="flex items-center gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="text-sm font-mono"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-secondary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground">
              Anyone with this link can view the analysis results. They won't be able to edit or delete.
            </p>

            {navigator.share && shareLink && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  navigator.share({
                    title: `ClauseWise Analysis: ${fileName}`,
                    text: `Check out this document analysis for "${fileName}"`,
                    url: shareLink,
                  });
                }}
              >
                <Share2 className="w-4 h-4" />
                Share via device
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareAnalysis;
