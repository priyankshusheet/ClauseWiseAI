import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import TemplateManager from '@/components/TemplateManager';
import ApiKeyManager from '@/components/ApiKeyManager';
import WebhookManager from '@/components/WebhookManager';
import GDPRSettings from '@/components/GDPRSettings';
import AuditLogViewer from '@/components/AuditLogViewer';
import CountryLanguageSettings from '@/components/CountryLanguageSettings';
import { BarChart3, FileText, Key, Webhook, Shield, History, Settings2 } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('preferences');
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-1">
              <TabsTrigger value="preferences" className="gap-2">
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.preferences')}</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.analytics')}</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.templates')}</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2">
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.apiKeys')}</span>
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="gap-2">
                <Webhook className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.webhooks')}</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.privacy')}</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.auditLog')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences"><CountryLanguageSettings /></TabsContent>
            <TabsContent value="analytics"><AnalyticsDashboard /></TabsContent>
            <TabsContent value="templates"><TemplateManager /></TabsContent>
            <TabsContent value="api"><ApiKeyManager /></TabsContent>
            <TabsContent value="webhooks"><WebhookManager /></TabsContent>
            <TabsContent value="privacy"><GDPRSettings /></TabsContent>
            <TabsContent value="audit"><AuditLogViewer /></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
