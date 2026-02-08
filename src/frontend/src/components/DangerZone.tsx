import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useWipeStorage } from '../hooks/useQueries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function DangerZone() {
  const [showWipeDialog, setShowWipeDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const wipeStorageMutation = useWipeStorage();
  const queryClient = useQueryClient();
  const { clear } = useInternetIdentity();

  const handleWipeStorage = async () => {
    if (confirmText !== 'WIPE ALL DATA') {
      toast.error('Please type the confirmation text exactly');
      return;
    }

    try {
      await wipeStorageMutation.mutateAsync();
      toast.success('All data has been wiped successfully');
      setShowWipeDialog(false);
      setConfirmText('');
      
      // Clear all cached data and log out
      queryClient.clear();
      await clear();
      
      // Reload the page to reset the app state
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to wipe storage');
    }
  };

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently delete all data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Wipe All Data</h4>
              <p className="text-sm text-muted-foreground">
                This will permanently delete:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>All user profiles and accounts</li>
                <li>All tasks and task history</li>
                <li>All overtime entries and records</li>
                <li>All audit logs</li>
                <li>All avatars and uploaded files</li>
                <li>All task preferences and settings</li>
              </ul>
              <p className="text-sm font-medium text-destructive mt-3">
                This action cannot be undone. The database will be completely reset.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowWipeDialog(true)}
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Wipe All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showWipeDialog} onOpenChange={setShowWipeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Data Wipe
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                You are about to permanently delete <strong>all data</strong> from the system.
                This includes all users, tasks, overtime records, and files.
              </p>
              <p className="font-semibold text-destructive">
                This action is irreversible and cannot be undone.
              </p>
              <div className="space-y-2 pt-2">
                <Label htmlFor="confirm-text">
                  Type <span className="font-mono font-bold">WIPE ALL DATA</span> to confirm:
                </Label>
                <Input
                  id="confirm-text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="WIPE ALL DATA"
                  className="font-mono"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmText('');
              }}
              disabled={wipeStorageMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWipeStorage}
              disabled={confirmText !== 'WIPE ALL DATA' || wipeStorageMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {wipeStorageMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wiping...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Wipe All Data
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
