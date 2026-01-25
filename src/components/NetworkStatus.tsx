import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const NetworkStatus: React.FC = () => {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      // Show "back online" message briefly
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (isSlowConnection) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [isOnline, isSlowConnection, wasOffline]);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[100]"
        >
          {!isOnline ? (
            <div className="bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-center gap-3 shadow-lg">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">You're offline</span>
              <span className="text-sm opacity-90">
                Check your internet connection
              </span>
            </div>
          ) : wasOffline ? (
            <div className="bg-secondary text-secondary-foreground px-4 py-3 flex items-center justify-center gap-3 shadow-lg border-b-2 border-secondary-600">
              <Wifi className="w-5 h-5" />
              <span className="font-medium">Back online</span>
              <span className="text-sm opacity-90">
                Connection restored
              </span>
            </div>
          ) : isSlowConnection ? (
            <div className="bg-accent text-accent-foreground px-4 py-3 flex items-center justify-center gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Slow connection</span>
              <span className="text-sm opacity-90">
                Some features may be delayed
              </span>
            </div>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatus;
