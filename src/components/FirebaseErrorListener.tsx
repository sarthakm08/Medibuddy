
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In production, you might want a more subtle UI.
      // In development, this helps surface Security Rule issues clearly.
      toast({
        variant: 'destructive',
        title: 'Security Permission Denied',
        description: 'You do not have permission to perform this action. Check Firestore Security Rules.',
      });
      
      // Log for developer context
      console.error(error.message);
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}
