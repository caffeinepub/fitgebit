import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { getUserFacingErrorMessage } from '../utils/userFacingError';

interface AuthBootstrapErrorScreenProps {
  error: Error | null;
  onRetry: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export default function AuthBootstrapErrorScreen({ 
  error, 
  onRetry, 
  onSignOut 
}: AuthBootstrapErrorScreenProps) {
  const errorMessage = getUserFacingErrorMessage(error);

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
              onClick={onRetry} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            
            <Button 
              onClick={onSignOut} 
              className="w-full"
              variant="outline"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            If the problem persists, try signing out and logging in again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
