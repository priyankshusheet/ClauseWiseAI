// Push notification utility for analysis completion
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendAnalysisCompleteNotification = (fileName: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  try {
    const notification = new Notification('ClauseWise Analysis Complete', {
      body: `Your analysis of "${fileName}" is ready to view.`,
      icon: '/clausewise-logo-192.png',
      badge: '/clausewise-logo-192.png',
      tag: 'analysis-complete',
      renotify: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 8 seconds
    setTimeout(() => notification.close(), 8000);
  } catch (e) {
    // SW-based notifications might fail in some contexts, silently ignore
    console.warn('Notification failed:', e);
  }
};
