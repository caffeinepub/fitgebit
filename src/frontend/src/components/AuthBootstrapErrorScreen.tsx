import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { getUserFacingErrorMessage } from '../utils/userFacingError';
import AccountResetDialog from './AccountResetDialog';
import FullSystemResetDialog from './FullSystemResetDialog';

interface AuthBootstrapErrorScreenProps {
  error: Error | null;
  onRetry: () => Promise<void>;
  onSignOut: () => Promise<void>;
  isAuthenticated?: boolean;
}

export default function AuthBootstrapErrorScreen({ 
  error, 
  onRetry, 
  onSignOut,
  isAuthenticated = false
}: AuthBootstrapErrorScreenProps) {
  const errorMessage = getUserFacingErrorMessage(error);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Unable to Load Profile</CardTitle>
          </div>
          <CardDescription>
            We encountered an issue while loading your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="mt-2">
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button 
              onClick={handleRetry} 
              className="w-full"
              variant="default"
              disabled={isRetrying || isSigningOut}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleSignOut} 
              className="w-full"
              variant="outline"
              disabled={isRetrying || isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button>

            {isAuthenticated && (
              <>
                <div className="pt-2">
                  <AccountResetDialog 
                    triggerVariant="outline"
                    triggerClassName="w-full"
                  />
                </div>
                <div className="pt-1">
                  <FullSystemResetDialog 
                    triggerVariant="destructive"
                    triggerClassName="w-full"
                  />
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            If the problem persists, try resetting your account or performing a full system reset (admin only).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
