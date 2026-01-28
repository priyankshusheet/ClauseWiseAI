import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Reply, 
  CheckCircle, 
  Send,
  MoreVertical,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  clause_reference?: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  user_email?: string;
  replies?: Comment[];
}

interface DocumentCommentsProps {
  documentId: string;
  clauseReference?: string;
}

const DocumentComments: React.FC<DocumentCommentsProps> = ({ 
  documentId, 
  clauseReference 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`comments-${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_comments',
          filter: `document_id=eq.${documentId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize into threads
      const rootComments: Comment[] = [];
      const replyMap: Record<string, Comment[]> = {};

      (data || []).forEach((comment: any) => {
        if (comment.parent_id) {
          if (!replyMap[comment.parent_id]) {
            replyMap[comment.parent_id] = [];
          }
          replyMap[comment.parent_id].push(comment);
        } else {
          rootComments.push({ ...comment, replies: [] });
        }
      });

      rootComments.forEach(comment => {
        comment.replies = replyMap[comment.id] || [];
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('document_comments')
        .insert({
          document_id: documentId,
          user_id: user.id,
          content: newComment.trim(),
          clause_reference: clauseReference,
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted',
      });
    } catch (error) {
      toast({
        title: 'Error adding comment',
        variant: 'destructive',
      });
    }
  };

  const addReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      const { error } = await supabase
        .from('document_comments')
        .insert({
          document_id: documentId,
          user_id: user.id,
          content: replyContent.trim(),
          parent_id: parentId,
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      toast({
        title: 'Error adding reply',
        variant: 'destructive',
      });
    }
  };

  const updateComment = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('document_comments')
        .update({ content: editContent.trim() })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditContent('');
    } catch (error) {
      toast({
        title: 'Error updating comment',
        variant: 'destructive',
      });
    }
  };

  const deleteComment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Comment deleted',
      });
    } catch (error) {
      toast({
        title: 'Error deleting comment',
        variant: 'destructive',
      });
    }
  };

  const toggleResolved = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('document_comments')
        .update({ is_resolved: !currentState })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      toast({
        title: 'Error updating comment',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ 
    comment, 
    isReply = false 
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isReply ? 'ml-8 mt-2' : ''}`}
    >
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {getInitials(comment.user_id)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">User</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
          {comment.is_resolved && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <CheckCircle className="w-3 h-3" />
              Resolved
            </Badge>
          )}
          {comment.clause_reference && (
            <Badge variant="outline" className="text-xs">
              {comment.clause_reference}
            </Badge>
          )}
        </div>
        
        {editingId === comment.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateComment(comment.id)}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => { setEditingId(null); setEditContent(''); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className={`text-sm ${comment.is_resolved ? 'text-muted-foreground' : ''}`}>
            {comment.content}
          </p>
        )}

        {!isReply && editingId !== comment.id && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
            {user?.id === comment.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}>
                    <Edit2 className="w-3 h-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleResolved(comment.id, comment.is_resolved)}>
                    <CheckCircle className="w-3 h-3 mr-2" />
                    {comment.is_resolved ? 'Unresolve' : 'Resolve'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteComment(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {/* Reply input */}
        {replyingTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex gap-2"
          >
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px] flex-1"
            />
            <Button size="sm" onClick={() => addReply(comment.id)}>
              <Send className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add comment */}
        {user && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(user.id)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button size="sm" onClick={addComment} disabled={!newComment.trim()}>
                <Send className="w-4 h-4 mr-1" />
                Comment
              </Button>
            </div>
          </div>
        )}

        {/* Comments list */}
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4 pt-4 border-t">
            <AnimatePresence>
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentComments;
