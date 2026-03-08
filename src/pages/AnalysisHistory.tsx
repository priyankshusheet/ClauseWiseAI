import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Upload,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { ListSkeleton } from '@/components/LoadingStates';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/PageTransition';
import EmptyState from '@/components/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AnalysisHistory = () => {
  const navigate = useNavigate();
  const { analyses, loading, toggleSaved, deleteAnalysis } = useAnalysisHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'saved'>('all');

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || analysis.is_saved;
    return matchesSearch && matchesFilter;
  });

  const getRiskBadge = (riskLevel: string | null) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            High Risk
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground gap-1">
            <AlertCircle className="w-3 h-3" />
            Medium Risk
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground gap-1">
            <CheckCircle className="w-3 h-3" />
            Low Risk
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Analysis History
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                View and manage your document analyses. Saved analyses are marked for quick access.
              </p>
            </div>
          </FadeIn>

          {/* Search and Filter */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by file name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filter === 'saved' ? 'default' : 'outline'}
                  onClick={() => setFilter('saved')}
                  size="sm"
                  className="gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  Saved
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* Analysis List */}
          {loading ? (
            <ListSkeleton count={5} />
          ) : filteredAnalyses.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  type="history"
                  title={searchQuery || filter !== 'all' ? 'No matching analyses' : 'No analyses yet'}
                  description={searchQuery || filter !== 'all' 
                    ? 'Try adjusting your search or filter' 
                    : 'Upload a document to get started with your first analysis'}
                >
                  <Button onClick={() => navigate('/upload')} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                </EmptyState>
              </CardContent>
            </Card>
          ) : (
            <StaggerContainer className="space-y-4">
              {filteredAnalyses.map((analysis) => (
                <StaggerItem key={analysis.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Left section - File info */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground truncate">
                                  {analysis.file_name}
                                </h3>
                                {analysis.is_saved && (
                                  <BookmarkCheck className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(analysis.created_at)}
                                </span>
                                <span>•</span>
                                <span>{formatFileSize(analysis.file_size)}</span>
                                {analysis.file_type && (
                                  <>
                                    <span>•</span>
                                    <span>{analysis.file_type}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {getRiskBadge(analysis.risk_level)}
                                {analysis.risk_score !== null && (
                                  <span className="text-sm text-muted-foreground">
                                    Score: {analysis.risk_score}/100
                                  </span>
                                )}
                              </div>
                              {analysis.analysis_summary && (
                                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                  {analysis.analysis_summary}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right section - Actions */}
                        <div className="flex sm:flex-col items-center justify-end gap-2 p-4 sm:p-6 bg-muted/30 sm:border-l border-t sm:border-t-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSaved(analysis.id, !analysis.is_saved)}
                            className="hover:bg-primary/10"
                          >
                            {analysis.is_saved ? (
                              <BookmarkCheck className="w-5 h-5 text-primary" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the analysis for "{analysis.file_name}"? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAnalysis(analysis.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AnalysisHistory;
