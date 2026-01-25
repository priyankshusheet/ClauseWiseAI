import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

interface NetworkInformation extends EventTarget {
  effectiveType: string;
  type: string;
  downlink: number;
  rtt: number;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

export const useNetworkStatus = (): NetworkStatus => {
  const getConnection = useCallback((): NetworkInformation | null => {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }, []);

  const getNetworkStatus = useCallback((): NetworkStatus => {
    const connection = getConnection();
    
    const isSlowConnection = connection
      ? connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' || 
        connection.rtt > 500
      : false;

    return {
      isOnline: navigator.onLine,
      isSlowConnection,
      connectionType: connection?.type || null,
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
    };
  }, [getConnection]);

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(getNetworkStatus);

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: false }));
    };

    const handleConnectionChange = () => {
      setNetworkStatus(getNetworkStatus());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = getConnection();
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      const conn = getConnection();
      if (conn) {
        conn.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [getConnection, getNetworkStatus]);

  return networkStatus;
};

export default useNetworkStatus;
