import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Globe, Languages, Brain, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SUPPORTED_COUNTRIES } from '@/i18n/config';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

const CountryLanguageSettings = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [country, setCountry] = useState('IN');
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [memoryCount, setMemoryCount] = useState(0);
  const [isLoadingMemory, setIsLoadingMemory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearingMemory, setIsClearingMemory] = useState(false);

  // Load preferences from profile
  useEffect(() => {
    if (!user) return;
    const loadPreferences = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();
      
      if (data?.preferences) {
        const prefs = data.preferences as Record<string, any>;
        if (prefs.country) setCountry(prefs.country);
        if (prefs.language) {
          setLanguage(prefs.language);
          i18n.changeLanguage(prefs.language);
        }
      }
    };
    loadPreferences();
  }, [user, i18n]);

  // Load memory count
  useEffect(() => {
    if (!user) return;
    const loadMemoryCount = async () => {
      setIsLoadingMemory(true);
      try {
        const { data } = await supabase.functions.invoke('memory', {
          body: { action: 'list', limit: 100 },
        });
        setMemoryCount(data?.memories?.length || 0);
      } catch { /* ignore */ }
      setIsLoadingMemory(false);
    };
    loadMemoryCount();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Save to localStorage for immediate use
      localStorage.setItem('clausewise_country', country);
      localStorage.setItem('clausewise_language', language);
      
      // Change i18n language
      await i18n.changeLanguage(language);
      
      // Save to profile preferences
      const { data: existing } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();
      
      const currentPrefs = (existing?.preferences as Record<string, any>) || {};
      
      await supabase
        .from('profiles')
        .update({
          preferences: { ...currentPrefs, country, language },
        })
        .eq('user_id', user.id);

      toast({
        title: t('common.success'),
        description: t('settings.savePreferences'),
      });
    } catch (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleClearMemory = async () => {
    if (!user) return;
    setIsClearingMemory(true);
    try {
      await supabase.functions.invoke('memory', {
        body: { action: 'clear' },
      });
      setMemoryCount(0);
      toast({ title: t('common.success'), description: t('settings.clearMemory') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
    setIsClearingMemory(false);
  };

  return (
    <div className="space-y-6">
      {/* Country / Jurisdiction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t('settings.country')}
          </CardTitle>
          <CardDescription>{t('settings.countryDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {country === 'IN' && (
            <Alert className="mt-3 bg-primary/5 border-primary/20">
              <CheckCircle className="w-4 h-4 text-primary" />
              <AlertDescription className="text-sm">
                Analysis will use Indian regulations: IRDAI, RBI, SEBI, Indian Contract Act, Consumer Protection Act 2019, etc.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            {t('settings.language')}
          </CardTitle>
          <CardDescription>{t('settings.languageDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span>{lang.nativeName} ({lang.name})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* AI Memory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            {t('settings.aiMemory')}
          </CardTitle>
          <CardDescription>{t('settings.aiMemoryDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLoadingMemory ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Badge variant="secondary">
                  {t('settings.memoryCount', { count: memoryCount })}
                </Badge>
              )}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearMemory}
              disabled={isClearingMemory || memoryCount === 0}
            >
              {isClearingMemory ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {t('settings.clearMemory')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
        {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {t('settings.savePreferences')}
      </Button>
    </div>
  );
};

export default CountryLanguageSettings;
