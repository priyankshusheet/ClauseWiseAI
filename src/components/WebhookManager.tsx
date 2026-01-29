import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  retry_count: number;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
}

const AVAILABLE_EVENTS = [
  { id: 'document.uploaded', label: 'Document Uploaded', description: 'When a new document is uploaded' },
  { id: 'document.analyzed', label: 'Document Analyzed', description: 'When analysis is complete' },
  { id: 'document.failed', label: 'Analysis Failed', description: 'When document processing fails' },
  { id: 'risk.threshold_crossed', label: 'Risk Threshold Crossed', description: 'When risk exceeds configured threshold' },
  { id: 'portfolio.updated', label: 'Portfolio Updated', description: 'When portfolio changes' },
  { id: 'export.completed', label: 'Export Completed', description: 'When data export is ready' },
];

const WebhookManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    retry_count: 3,
  });

  useEffect(() => {
    if (user) {
      fetchWebhooks();
    }
  }, [user]);

  const fetchWebhooks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async () => {
    if (!user) return;

    try {
      // Generate a secret for webhook signature
      const secret = crypto.randomUUID();

      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: user.id,
          name: formData.name,
          url: formData.url,
          events: formData.events,
          secret,
          retry_count: formData.retry_count,
        })
        .select()
        .single();

      if (error) throw error;

      setWebhooks(prev => [data, ...prev]);
      setIsCreating(false);
      setFormData({
        name: '',
        url: '',
        events: [],
        retry_count: 3,
      });

      toast({ 
        title: 'Webhook created', 
        description: 'Your webhook endpoint has been configured.' 
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({ title: 'Error', description: 'Failed to create webhook', variant: 'destructive' });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
      toast({ title: 'Webhook deleted' });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({ title: 'Error', description: 'Failed to delete webhook', variant: 'destructive' });
    }
  };

  const handleToggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: isActive, failure_count: 0 })
        .eq('id', webhookId);

      if (error) throw error;

      setWebhooks(prev => prev.map(w => w.id === webhookId ? { ...w, is_active: isActive, failure_count: 0 } : w));
      toast({ title: isActive ? 'Webhook enabled' : 'Webhook disabled' });
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  const toggleEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Webhooks</h2>
          <p className="text-muted-foreground">Receive real-time notifications for platform events</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>Configure a webhook endpoint to receive event notifications</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Webhook Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Production Notifications"
                />
              </div>

              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input 
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-server.com/webhook"
                />
              </div>

              <div className="space-y-3">
                <Label>Events to Subscribe</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {AVAILABLE_EVENTS.map(event => (
                    <div 
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleEvent(event.id)}
                    >
                      <Checkbox 
                        checked={formData.events.includes(event.id)}
                        onCheckedChange={() => toggleEvent(event.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">{event.label}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreateWebhook} 
                className="w-full mt-4"
                disabled={!formData.name || !formData.url || formData.events.length === 0}
              >
                Create Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Webhooks Configured</h3>
              <p className="text-muted-foreground mb-4">Set up webhooks to receive real-time event notifications</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id} className={!webhook.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      webhook.failure_count > 0 
                        ? 'bg-destructive/10' 
                        : webhook.is_active 
                          ? 'bg-primary/10' 
                          : 'bg-muted'
                    }`}>
                      <Webhook className={`w-5 h-5 ${
                        webhook.failure_count > 0 
                          ? 'text-destructive' 
                          : webhook.is_active 
                            ? 'text-primary' 
                            : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{webhook.name}</h3>
                        {!webhook.is_active && <Badge variant="secondary">Disabled</Badge>}
                        {webhook.failure_count > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {webhook.failure_count} failures
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="w-3 h-3" />
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-[300px]">
                          {webhook.url}
                        </code>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {webhook.events?.map(event => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          {webhook.retry_count} retries
                        </span>
                        {webhook.last_triggered_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last: {new Date(webhook.last_triggered_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={webhook.is_active}
                      onCheckedChange={(checked) => handleToggleWebhook(webhook.id, checked)}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WebhookManager;