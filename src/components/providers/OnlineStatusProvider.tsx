'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { syncPendingChanges } from '@/lib/api';

export const OnlineStatusProvider = () => {
  useEffect(() => {
    const { setOnlineStatus } = useAppStore.getState();
    
    // Set initial online status
    setOnlineStatus(navigator.onLine);
    
    // Handle online status changes
    const handleOnlineStatus = () => {
      setOnlineStatus(true);
      // Sync changes when back online
      syncPendingChanges();
    };
    
    const handleOfflineStatus = () => {
      setOnlineStatus(false);
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    // Try to sync on initial load if we're online
    if (navigator.onLine) {
      syncPendingChanges();
    }
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);
  
  return null;
};

export default OnlineStatusProvider;
