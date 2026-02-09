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
import { clearAllSessionState } from '../utils/sessionStateReset';
import FullSystemResetDialog from '../components/FullSystemResetDialog';

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
      // Clear stored manager token to allow retry
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
      clearAllSessionState();
    }
  }, [loginStatus, contextLoginError]);

  const handleRoleClick = (role: 'manager' | 'assistant') => {
    if (isLoggingIn || isInitializing) return;
    
    setSelectedRole(role);
    setLoginError(null);
    setShowRetryAction(false);
    
    // Clear all manager-specific state when switching roles
    if (role === 'assistant') {
      setManagerToken('');
      clearAllManagerGateState();
    } else {
      // Switching to manager - clear stale state
      clearAllManagerGateState();
    }
  };

  const handleClearError = () => {
    setLoginError(null);
    setShowRetryAction(false);
    setManagerToken('');
    clearAllSessionState();
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

      // Store token for registration
      setStoredManagerToken(managerToken.trim());
    } else {
      // Clear any existing admin token for assistant login
      clearAllManagerGateState();
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
                      className="mt-2"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Clear and Retry
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-6 space-y-3">
              <Label>Select Your Role</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleClick('assistant')}
                  disabled={isButtonDisabled}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    selectedRole === 'assistant'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  } ${isButtonDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <User className={`h-8 w-8 ${selectedRole === 'assistant' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${selectedRole === 'assistant' ? 'text-primary' : 'text-foreground'}`}>
                    Assistant
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleClick('manager')}
                  disabled={isButtonDisabled}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    selectedRole === 'manager'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  } ${isButtonDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <Shield className={`h-8 w-8 ${selectedRole === 'manager' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${selectedRole === 'manager' ? 'text-primary' : 'text-foreground'}`}>
                    Manager
                  </span>
                </button>
              </div>
            </div>

            {selectedRole === 'manager' && (
              <div className="mb-4 space-y-2">
                <Label htmlFor="managerToken">Manager Token</Label>
                <Input
                  id="managerToken"
                  type="password"
                  placeholder="Enter manager token"
                  value={managerToken}
                  onChange={(e) => setManagerToken(e.target.value)}
                  disabled={isButtonDisabled}
                />
                <p className="text-xs text-muted-foreground">
                  Required for manager access
                </p>
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={isButtonDisabled}
              className="w-full"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In with Internet Identity
                </>
              )}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 w-full max-w-md">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-sm">Troubleshooting</CardTitle>
              <CardDescription className="text-xs">
                If you're experiencing login issues or need to reset the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FullSystemResetDialog 
                triggerVariant="outline"
                triggerClassName="w-full"
              />
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Admin only: Resets all user accounts and system data
              </p>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2026. Built with love using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">caffeine.ai</a></p>
        </footer>
      </div>
    </div>
  );
}
