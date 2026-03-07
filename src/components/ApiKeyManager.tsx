import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  Shield,
  AlertTriangle,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  rate_limit_per_hour: number;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const generateApiKey = () => {
  const prefix = 'cw_';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return prefix + Array.from(randomBytes)
    .map(b => chars[b % chars.length])
    .join('');
};

const hashKey = async (key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const ApiKeyManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    scopes: ['read'] as string[],
    rate_limit: 1000,
    expires_in: 'never',
  });

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!user) return;

    try {
      const apiKey = generateApiKey();
      const keyHash = await hashKey(apiKey);
      const keyPrefix = apiKey.substring(0, 8);

      let expiresAt: string | null = null;
      if (formData.expires_in !== 'never') {
        const days = parseInt(formData.expires_in);
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      }

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: formData.name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          scopes: formData.scopes,
          rate_limit_per_hour: formData.rate_limit,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;

      setApiKeys(prev => [data, ...prev]);
      setNewKey(apiKey);
      setIsCreating(false);
      setFormData({
        name: '',
        scopes: ['read'],
        rate_limit: 1000,
        expires_in: 'never',
      });

      toast({ title: 'API key created', description: 'Copy your key now - it won\'t be shown again.' });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({ title: 'Error', description: 'Failed to create API key', variant: 'destructive' });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.filter(k => k.id !== keyId));
      toast({ title: 'API key deleted' });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({ title: 'Error', description: 'Failed to delete API key', variant: 'destructive' });
    }
  };

  const handleToggleKey = async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: isActive })
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, is_active: isActive } : k));
      toast({ title: isActive ? 'API key enabled' : 'API key disabled' });
    } catch (error) {
      console.error('Error toggling API key:', error);
    }
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    toast({ title: 'Copied to clipboard' });
  };

  const toggleScope = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
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
          <h2 className="text-2xl font-bold text-foreground">API Keys</h2>
          <p className="text-muted-foreground">Manage your API access credentials</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>Generate a new key for API access</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Key Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Production Server"
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {['read', 'write', 'delete'].map(scope => (
                    <Badge 
                      key={scope}
                      variant={formData.scopes.includes(scope) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleScope(scope)}
                    >
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate Limit</Label>
                  <Select 
                    value={formData.rate_limit.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, rate_limit: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100/hour</SelectItem>
                      <SelectItem value="1000">1,000/hour</SelectItem>
                      <SelectItem value="5000">5,000/hour</SelectItem>
                      <SelectItem value="10000">10,000/hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expires</Label>
                  <Select 
                    value={formData.expires_in}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, expires_in: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCreateKey} 
                className="w-full mt-4"
                disabled={!formData.name || formData.scopes.length === 0}
              >
                Generate Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Alert */}
      {newKey && (
        <Alert className="border-accent bg-accent/5">
          <Key className="w-4 h-4 text-accent" />
          <AlertDescription className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Your new API key:</p>
              <code className="text-sm bg-muted px-2 py-1 rounded">{newKey}</code>
              <p className="text-xs text-muted-foreground">Copy this key now. It won't be shown again.</p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                copyToClipboard(newKey);
                setNewKey(null);
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy & Close
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No API Keys</h3>
              <p className="text-muted-foreground mb-4">Create an API key to start using the ClauseWise API</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id} className={!key.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${key.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Key className={`w-5 h-5 ${key.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{key.name}</h3>
                        {!key.is_active && <Badge variant="secondary">Disabled</Badge>}
                        {key.expires_at && new Date(key.expires_at) < new Date() && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{key.key_prefix}...</code>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {key.scopes?.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {key.rate_limit_per_hour}/hour
                        </span>
                      </div>
                      {key.last_used_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last used: {new Date(key.last_used_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={key.is_active}
                      onCheckedChange={(checked) => handleToggleKey(key.id, checked)}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteKey(key.id)}
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

      {/* API Documentation Link */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground">API Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Learn how to integrate ClauseWise into your applications
              </p>
            </div>
            <Button variant="outline">View Docs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyManager;