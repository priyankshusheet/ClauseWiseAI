import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { successFeedback, tapFeedback } from '@/utils/haptics';

const PWAInstallBanner: React.FC = () => {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner after 3 seconds if installable and not previously dismissed this session
    const wasDismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (canInstall && !isInstalled && !wasDismissed) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    tapFeedback();
    const accepted = await install();
    if (accepted) {
      successFeedback();
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    tapFeedback();
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-primary-foreground font-bold text-sm">CW</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">Install ClauseWise</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get instant access, offline support & push notifications
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} className="h-8 text-xs gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 text-xs text-muted-foreground">
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
