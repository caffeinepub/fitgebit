import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, LogIn, Shield, User, AlertCircle, RefreshCw } from 'lucide-react';
import { getUserFacingErrorMessage } from '../utils/userFacingError';
import { 
  setStoredManagerToken,
  clearStoredManagerToken,
  getGateMessage, 
  clearGateMessage,
  clearAllManagerGateState
} from '../utils/managerTokenGate';

export default function LoginPage() {
  const { login, loginStatus, loginError: contextLoginError } = useInternetIdentity();
  const [managerToken, setManagerToken] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'manager' | 'assistant'>('assistant');
  const [showRetryAction, setShowRetryAction] = useState(false);

  // Display any gate/redirect message on mount
  useEffect(() => {
    const gateMessage = getGateMessage();
    if (gateMessage) {
      setLoginError(gateMessage);
      setShowRetryAction(true);
      // Clear the gate message immediately after reading it
      clearGateMessage();
      // Clear stored manager token and validated flag to allow retry
      clearStoredManagerToken();
      // Clear the manager token input field
      setManagerToken('');
    }

    // Clear any stale session storage on mount to prevent auto-routing after reset
    if (loginStatus === 'idle') {
      sessionStorage.removeItem('caffeineSelectedRole');
    }
  }, [loginStatus]);

  // Watch for Internet Identity login errors from context
  useEffect(() => {
    if (loginStatus === 'loginError' && contextLoginError) {
      const friendlyMessage = getUserFacingErrorMessage(contextLoginError);
      setLoginError(friendlyMessage);
      
      // Clear stored values on error
      sessionStorage.removeItem('caffeineSelectedRole');
      clearStoredManagerToken();
    }
  }, [loginStatus, contextLoginError]);

  const handleRoleClick = (role: 'manager' | 'assistant') => {
    if (isLoggingIn || isInitializing) return;
    
    setSelectedRole(role);
    setLoginError(null);
    setShowRetryAction(false);
    
    // Clear manager-specific state when switching to assistant
    if (role === 'assistant') {
      setManagerToken('');
      clearStoredManagerToken();
    }
  };

  const handleClearError = () => {
    setLoginError(null);
    setShowRetryAction(false);
    setManagerToken('');
    clearAllManagerGateState();
  };

  const handleLogin = () => {
    setLoginError(null);
    setShowRetryAction(false);

    // Store the selected role in sessionStorage for ProfileSetupPage
    sessionStorage.setItem('caffeineSelectedRole', selectedRole);

    // If manager role, require and store token
    if (selectedRole === 'manager') {
      if (!managerToken.trim()) {
        setLoginError('Please enter the Manager Token to sign in as Manager');
        return;
      }

      // Store token for backend validation after authentication
      setStoredManagerToken(managerToken.trim());
    } else {
      // Clear any existing admin token for assistant login
      clearStoredManagerToken();
    }

    // Call login synchronously - errors will be handled via context state
    login();
  };

  const isLoggingIn = loginStatus === 'logging-in';
  const isInitializing = loginStatus === 'initializing';
  const isButtonDisabled = isLoggingIn || isInitializing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-12 text-center">
          <img
            src="/assets/generated/fitgebit-logo-transparent.dim_200x200.png"
            alt="FitGebit Logo"
            className="mx-auto mb-8 h-40 w-40"
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Welcome to FitGebit</h1>
          <p className="text-lg text-muted-foreground">
            Your personal assistant management platform
          </p>
        </div>

        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your role and connect with Internet Identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{loginError}</p>
                  {showRetryAction && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearError}
                      className="mt-2 w-full"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Clear Error and Try Again
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {isInitializing && !loginError && (
              <Alert className="mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Initializing</AlertTitle>
                <AlertDescription>
                  Authentication system is initializing. Please wait a moment...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Role selector with clickable role words */}
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex w-full items-center justify-between rounded-lg border-2 border-primary/20 bg-background p-4">
                  <div className="flex items-center gap-3">
                    {selectedRole === 'assistant' ? (
                      <User className="h-5 w-5 text-primary" />
                    ) : (
                      <Shield className="h-5 w-5 text-primary" />
                    )}
                    <div className="text-left">
                      <p className="font-semibold">
                        <button
                          type="button"
                          onClick={() => handleRoleClick(selectedRole === 'assistant' ? 'manager' : 'assistant')}
                          disabled={isButtonDisabled}
                          className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                        >
                          {selectedRole === 'assistant' ? 'Assistant' : 'Manager'}
                        </button>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedRole === 'assistant' 
                          ? 'Access your tasks and overtime tracking'
                          : 'Access administrative features'
                        }
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">Click role to switch</span>
                </div>
              </div>

              {/* Manager token input - only shown when Manager is selected */}
              {selectedRole === 'manager' && (
                <div className="space-y-2">
                  <Label htmlFor="managerToken">Manager Token</Label>
                  <Input
                    id="managerToken"
                    type="password"
                    placeholder="Enter manager token"
                    value={managerToken}
                    onChange={(e) => setManagerToken(e.target.value)}
                    disabled={isButtonDisabled}
                  />
                  <p className="text-sm text-muted-foreground">
                    You need the manager token to sign in as a Manager.
                  </p>
                </div>
              )}

              <Button
                onClick={handleLogin}
                disabled={isButtonDisabled}
                className="w-full"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in as {selectedRole === 'manager' ? 'Manager' : 'Assistant'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
