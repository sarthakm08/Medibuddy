'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

/**
 * Listens for specialized FirestorePermissionErrors and surfaces them
 * via the system toast notifications.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Surface the error to the user via a toast.
      // We do not console.error here to avoid triggering the Next.js error overlay
      // multiple times, as the error is already handled by the global listener.
      toast({
        variant: 'destructive',
        title: 'Security Permission Denied',
        description: 'You do not have permission to perform this action. Please sign in or check your access levels.',
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}
