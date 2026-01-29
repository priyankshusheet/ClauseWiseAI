import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  FileText, 
  Building2, 
  Shield, 
  CreditCard, 
  Home, 
  Star,
  Trash2,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface Template {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  document_types: string[] | null;
  analysis_depth: string | null;
  risk_thresholds: Json | null;
  is_public: boolean | null;
  usage_count: number | null;
  user_id: string | null;
}

const industryIcons: Record<string, React.ReactNode> = {
  insurance: <Shield className="w-5 h-5" />,
  loans: <Home className="w-5 h-5" />,
  credit_cards: <CreditCard className="w-5 h-5" />,
  legal: <Building2 className="w-5 h-5" />,
  general: <FileText className="w-5 h-5" />,
};

const TemplateManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: 'general',
    analysis_depth: 'standard',
    risk_thresholds: { low: 30, medium: 60, high: 80 },
    is_public: false,
  });

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      let query = supabase.from('analysis_templates').select('*');
      
      if (user) {
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to create templates', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('analysis_templates')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          industry: formData.industry,
          analysis_depth: formData.analysis_depth,
          risk_thresholds: formData.risk_thresholds,
          is_public: formData.is_public,
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      setIsCreating(false);
      setFormData({
        name: '',
        description: '',
        industry: 'general',
        analysis_depth: 'standard',
        risk_thresholds: { low: 30, medium: 60, high: 80 },
        is_public: false,
      });

      toast({ title: 'Template created', description: 'Your analysis template has been saved.' });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({ title: 'Error', description: 'Failed to create template', variant: 'destructive' });
    }
  };

  const handleUseTemplate = async (template: Template) => {
    // Increment usage count
    await supabase
      .from('analysis_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', template.id);

    toast({ 
      title: 'Template applied', 
      description: `Using "${template.name}" for analysis.` 
    });
    
    setSelectedTemplate(template);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('analysis_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast({ title: 'Template deleted' });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
    }
  };

  const myTemplates = templates.filter(t => t.user_id === user?.id);
  const publicTemplates = templates.filter(t => t.is_public && t.user_id !== user?.id);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analysis Templates</h2>
          <p className="text-muted-foreground">Standardize your document analysis workflow</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Analysis Template</DialogTitle>
              <DialogDescription>Define custom analysis rules and risk thresholds</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Insurance Policy Review"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe when to use this template..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select 
                    value={formData.industry}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="loans">Loans</SelectItem>
                      <SelectItem value="credit_cards">Credit Cards</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Analysis Depth</Label>
                  <Select 
                    value={formData.analysis_depth}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, analysis_depth: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Label>Risk Thresholds</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Low → Medium: {formData.risk_thresholds.low}</span>
                    <Slider
                      value={[formData.risk_thresholds.low]}
                      onValueChange={([value]) => setFormData(prev => ({ 
                        ...prev, 
                        risk_thresholds: { ...prev.risk_thresholds, low: value }
                      }))}
                      max={100}
                      step={5}
                      className="w-48"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Medium → High: {formData.risk_thresholds.high}</span>
                    <Slider
                      value={[formData.risk_thresholds.high]}
                      onValueChange={([value]) => setFormData(prev => ({ 
                        ...prev, 
                        risk_thresholds: { ...prev.risk_thresholds, high: value }
                      }))}
                      max={100}
                      step={5}
                      className="w-48"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Public Template</Label>
                  <p className="text-xs text-muted-foreground">Allow others to use this template</p>
                </div>
                <Switch 
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                />
              </div>

              <Button 
                onClick={handleCreateTemplate} 
                className="w-full mt-4"
                disabled={!formData.name}
              >
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Template Indicator */}
      {selectedTemplate && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Active Template: {selectedTemplate.name}</p>
                <p className="text-sm text-muted-foreground">This template will be used for new analyses</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>
              Clear
            </Button>
          </CardContent>
        </Card>
      )}

      {/* My Templates */}
      {user && myTemplates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">My Templates</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTemplates.map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onUse={() => handleUseTemplate(template)}
                onDelete={() => handleDeleteTemplate(template.id)}
                isOwner
              />
            ))}
          </div>
        </div>
      )}

      {/* Public Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {user ? 'Public Templates' : 'Available Templates'}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publicTemplates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onUse={() => handleUseTemplate(template)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: Template;
  onUse: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

const TemplateCard = ({ template, onUse, onDelete, isOwner }: TemplateCardProps) => {
  const thresholds = template.risk_thresholds as { low: number; medium: number; high: number } | null;
  
  return (
    <Card className="card-interactive group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {industryIcons[template.industry || 'general']}
            </div>
            <div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              {template.industry && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {template.industry}
                </Badge>
              )}
            </div>
          </div>
          {template.usage_count && template.usage_count > 10 && (
            <div className="flex items-center gap-1 text-accent">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xs font-medium">{template.usage_count}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {template.description && (
          <CardDescription className="line-clamp-2">{template.description}</CardDescription>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {template.analysis_depth || 'standard'}
          </Badge>
          {thresholds && (
            <span>Thresholds: {thresholds.low}/{thresholds.high}</span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" onClick={onUse} className="flex-1">
            Use Template
          </Button>
          {isOwner && (
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateManager;