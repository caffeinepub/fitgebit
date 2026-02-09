import { useState } from 'react';
import { useFlushUserAccount } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { getUserFacingErrorMessage } from '../utils/userFacingError';
import { clearAllManagerGateState } from '../utils/managerTokenGate';

export default function AccountResetDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flushMutation = useFlushUserAccount();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleReset = async () => {
    setError(null);

    try {
      // Call backend to flush the account
      await flushMutation.mutateAsync();

      // Success: clear session storage, gate state, React Query cache, and logout
      sessionStorage.removeItem('caffeineSelectedRole');
      sessionStorage.removeItem('caffeineAdminToken');
      clearAllManagerGateState();
      queryClient.clear();
      await clear();

      // Close dialog (user will be redirected to login by App.tsx)
      setIsOpen(false);
    } catch (err: any) {
      // Failure: show error in-page, do NOT logout
      const friendlyMessage = getUserFacingErrorMessage(err);
      setError(friendlyMessage);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Reset My Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Your Account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your profile and all associated data. You will be logged out and can start fresh with a new account.
            <br />
            <br />
            <strong>This action cannot be undone.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Reset Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={flushMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
            disabled={flushMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {flushMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
