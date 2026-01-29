import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Trash2, 
  Shield, 
  FileDown,
  Clock,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface ExportRequest {
  id: string;
  status: string;
  export_type: string;
  completed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface DeletionRequest {
  id: string;
  status: string;
  scheduled_for: string | null;
  completed_at: string | null;
  created_at: string;
}

const GDPRSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const [{ data: exports }, { data: deletions }] = await Promise.all([
        supabase.from('data_export_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('deletion_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);

      setExportRequests(exports || []);
      setDeletionRequests(deletions || []);
    } catch (error) {
      console.error('Error fetching GDPR requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        'https://lyxybuizijsdfmrdbsxo.supabase.co/functions/v1/gdpr-export',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({ action: 'export' }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Decode base64 and download
        const jsonData = decodeURIComponent(escape(atob(result.data)));
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clausewise-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({ title: 'Data exported', description: 'Your data has been downloaded.' });
        fetchRequests();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({ title: 'Export failed', description: 'Failed to export your data', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!user) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        'https://lyxybuizijsdfmrdbsxo.supabase.co/functions/v1/gdpr-export',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({ action: 'delete' }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({ 
          title: 'Deletion scheduled', 
          description: `Your data will be deleted on ${new Date(result.scheduled_for).toLocaleDateString()}` 
        });
        setShowDeleteConfirm(false);
        fetchRequests();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast({ title: 'Request failed', description: 'Failed to schedule deletion', variant: 'destructive' });
    }
  };

  const handleCancelDeletion = async () => {
    if (!user) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        'https://lyxybuizijsdfmrdbsxo.supabase.co/functions/v1/gdpr-export',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({ action: 'cancel_deletion' }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({ title: 'Deletion cancelled', description: 'Your account will not be deleted.' });
        fetchRequests();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error cancelling deletion:', error);
      toast({ title: 'Failed', description: 'Could not cancel deletion request', variant: 'destructive' });
    }
  };

  const pendingDeletion = deletionRequests.find(d => d.status === 'scheduled');

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-40 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Privacy & Data</h2>
        <p className="text-muted-foreground">Manage your data and privacy settings (GDPR)</p>
      </div>

      {/* Pending Deletion Alert */}
      {pendingDeletion && (
        <Alert className="border-destructive bg-destructive/5">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Account Deletion Scheduled</p>
              <p className="text-sm text-muted-foreground">
                Your data will be permanently deleted on {new Date(pendingDeletion.scheduled_for!).toLocaleDateString()}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCancelDeletion}>
              Cancel Deletion
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Export Your Data
            </CardTitle>
            <CardDescription>
              Download a copy of all your personal data stored on ClauseWise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Your export will include:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>Profile information</li>
                <li>All uploaded documents and analyses</li>
                <li>Chat history and sessions</li>
                <li>Learning progress</li>
                <li>Activity logs</li>
              </ul>
            </div>

            <Button 
              onClick={handleExportData} 
              disabled={exporting}
              className="w-full gap-2"
            >
              {exporting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Preparing Export...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Download My Data
                </>
              )}
            </Button>

            {exportRequests.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Recent exports:</p>
                {exportRequests.slice(0, 3).map(request => (
                  <div key={request.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                    <Badge variant={request.status === 'completed' ? 'secondary' : 'outline'} className="text-xs">
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Your Account
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="text-destructive font-medium">Warning: This action is irreversible</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>All documents and analyses will be deleted</li>
                <li>Chat history will be permanently removed</li>
                <li>API keys will be revoked</li>
                <li>30-day grace period to cancel</li>
              </ul>
            </div>

            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full gap-2"
                  disabled={!!pendingDeletion}
                >
                  <Trash2 className="w-4 h-4" />
                  {pendingDeletion ? 'Deletion Pending' : 'Delete My Account'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive">Confirm Account Deletion</DialogTitle>
                  <DialogDescription>
                    This will permanently delete your account and all data after a 30-day grace period.
                    You can cancel this at any time during the grace period.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Alert className="border-destructive/30">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <AlertDescription>
                      We recommend exporting your data before deletion.
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleRequestDeletion}>
                    Yes, Delete My Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Data Retention Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Your Privacy Rights</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Under GDPR and other privacy regulations, you have the right to:
              </p>
              <div className="grid gap-2 md:grid-cols-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Access your data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Export your data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Delete your data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Correct inaccuracies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Restrict processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Object to processing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDPRSettings;