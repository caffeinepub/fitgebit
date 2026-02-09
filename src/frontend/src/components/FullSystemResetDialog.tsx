import { useState } from 'react';
import { useFullSystemReset } from '../hooks/useQueries';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { getUserFacingErrorMessage } from '../utils/userFacingError';
import { clearAllSessionState } from '../utils/sessionStateReset';

interface FullSystemResetDialogProps {
  triggerVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  triggerClassName?: string;
}

export default function FullSystemResetDialog({ 
  triggerVariant = 'destructive',
  triggerClassName = ''
}: FullSystemResetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const resetMutation = useFullSystemReset();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isConfirmValid = confirmText === 'FULL SYSTEM RESET';
  const isResetting = resetMutation.isPending;

  const handleReset = async () => {
    if (!isConfirmValid) return;

    setError(null);

    try {
      // Call backend to reset all state
      await resetMutation.mutateAsync();

      // Clear all session state (role, tokens, validation flags)
      clearAllSessionState();

      // Clear React Query cache
      queryClient.clear();

      // Sign out via Internet Identity
      await clear();

      // Close dialog (user will be redirected to login)
      setIsOpen(false);
      setConfirmText('');
    } catch (err: any) {
      // Show error but keep user logged in
      const friendlyMessage = getUserFacingErrorMessage(err);
      setError(friendlyMessage);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isResetting) {
      setIsOpen(open);
      if (!open) {
        setConfirmText('');
        setError(null);
      }
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant={triggerVariant} className={triggerClassName}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Full System Reset
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Full System Reset
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p className="font-semibold text-foreground">
              This action will permanently delete ALL user accounts and ALL system data.
            </p>
            <p>
              This includes all profiles, tasks, overtime records, audit logs, preferences, and history for every user in the system.
            </p>
            <p>
              After the reset, the system will return to its initial state as if it were freshly deployed. All users will need to register again.
            </p>
            <p className="text-destructive font-semibold">
              This action cannot be undone. Only administrators can perform this operation.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm-full-reset">
              Type <span className="font-mono font-bold">FULL SYSTEM RESET</span> to confirm
            </Label>
            <Input
              id="confirm-full-reset"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="FULL SYSTEM RESET"
              disabled={isResetting}
              className="font-mono"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
            disabled={!isConfirmValid || isResetting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting System...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Reset Entire System
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
