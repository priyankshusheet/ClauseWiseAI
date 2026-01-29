import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Search, 
  FileText,
  Upload,
  MessageSquare,
  Share2,
  Trash2,
  Eye,
  Edit,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import type { Json } from '@/integrations/supabase/types';

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Json;
  ip_address: string | null;
  created_at: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  upload: <Upload className="w-4 h-4" />,
  view: <Eye className="w-4 h-4" />,
  edit: <Edit className="w-4 h-4" />,
  delete: <Trash2 className="w-4 h-4" />,
  share: <Share2 className="w-4 h-4" />,
  analyze: <FileText className="w-4 h-4" />,
  chat: <MessageSquare className="w-4 h-4" />,
};

const actionColors: Record<string, string> = {
  upload: 'bg-secondary/10 text-secondary',
  view: 'bg-primary/10 text-primary',
  edit: 'bg-accent/10 text-accent',
  delete: 'bg-destructive/10 text-destructive',
  share: 'bg-chart-4/10 text-chart-4',
  analyze: 'bg-primary/10 text-primary',
  chat: 'bg-secondary/10 text-secondary',
};

const AuditLogViewer = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterResource, setFilterResource] = useState('all');

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesResource = filterResource === 'all' || log.resource_type === filterResource;

    return matchesSearch && matchesAction && matchesResource;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueResources = [...new Set(logs.map(l => l.resource_type))];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Audit Log</h2>
          <p className="text-muted-foreground">Track all activity on your account</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterResource} onValueChange={setFilterResource}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {uniqueResources.map(resource => (
                  <SelectItem key={resource} value={resource}>{resource}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Activity History
          </CardTitle>
          <CardDescription>
            {filteredLogs.length} events recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Activity Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterAction !== 'all' || filterResource !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Your activity will appear here'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredLogs.map((log, index) => (
                  <div 
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${actionColors[log.action] || 'bg-muted text-muted-foreground'}`}>
                      {actionIcons[log.action] || <History className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground capitalize">{log.action}</span>
                        <Badge variant="outline" className="text-xs">{log.resource_type}</Badge>
                      </div>
                      {log.resource_id && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          ID: {log.resource_id}
                        </p>
                      )}
                      {log.metadata && typeof log.metadata === 'object' && !Array.isArray(log.metadata) && Object.keys(log.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Object.entries(log.metadata as Record<string, unknown>).slice(0, 2).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {String(value).substring(0, 30)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-muted-foreground">{formatTime(log.created_at)}</p>
                      {log.ip_address && (
                        <p className="text-xs text-muted-foreground">{log.ip_address}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogViewer;