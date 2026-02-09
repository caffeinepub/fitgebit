import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useValidateManagerToken } from './hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ManagerDashboard from './pages/ManagerDashboard';
import AssistantDashboard from './pages/AssistantDashboard';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import AuthBootstrapErrorScreen from './components/AuthBootstrapErrorScreen';
import { 
  isManagerTokenValidated, 
  setManagerTokenValidated,
  setGateMessage, 
  clearManagerGateStateForRetry,
  getStoredManagerToken 
} from './utils/managerTokenGate';

function AppContent() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    isFetched,
    isError,
    error,
    refetch
  } = useGetCallerUserProfile();

  const validateTokenMutation = useValidateManagerToken();
  const [isValidatingToken, setIsValidatingToken] = useState(false);

  const isAuthenticated = !!identity;

  // Backend token validation for managers after authentication
  useEffect(() => {
    const validateManagerAccess = async () => {
      // Only validate if:
      // 1. User is authenticated
      // 2. Profile is loaded and is a manager
      // 3. Not already validated this session
      // 4. Not currently validating
      if (
        isAuthenticated && 
        userProfile && 
        userProfile.role === 'manager' && 
        !isManagerTokenValidated() &&
        !isValidatingToken
      ) {
        setIsValidatingToken(true);

        const storedToken = getStoredManagerToken();

        if (!storedToken) {
          // No token found - sign out and redirect with message
          setGateMessage('Manager access requires a valid token. Please sign in again with the manager token.');
          clearManagerGateStateForRetry();
          await clear();
          queryClient.clear();
          setIsValidatingToken(false);
          return;
        }

        try {
          // Call backend validation
          const isValid = await validateTokenMutation.mutateAsync(storedToken);

          if (isValid) {
            // Token is valid - set session flag and allow access
            setManagerTokenValidated();
            setIsValidatingToken(false);
          } else {
            // Token is invalid - sign out and redirect with message
            setGateMessage('Invalid manager token. Please try again with a valid token.');
            clearManagerGateStateForRetry();
            await clear();
            queryClient.clear();
            setIsValidatingToken(false);
          }
        } catch (error: any) {
          // Backend validation failed - sign out and redirect with message
          setGateMessage('Manager token validation failed. Please try again with a valid token.');
          clearManagerGateStateForRetry();
          await clear();
          queryClient.clear();
          setIsValidatingToken(false);
        }
      }
    };

    validateManagerAccess();
  }, [isAuthenticated, userProfile, isValidatingToken, validateTokenMutation, clear, queryClient]);

  // Handle authenticated profile fetch error
  if (isAuthenticated && isError && isFetched) {
    const handleRetry = async () => {
      await refetch();
    };

    const handleSignOut = async () => {
      await clear();
      queryClient.clear();
    };

    return (
      <AuthBootstrapErrorScreen 
        error={error}
        onRetry={handleRetry}
        onSignOut={handleSignOut}
      />
    );
  }

  // Derive showProfileSetup directly from auth + profile state (no local state)
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (showProfileSetup) {
    return <ProfileSetupPage />;
  }

  // Show loading state while profile is being fetched after registration
  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show loading state while validating manager token
  if (userProfile.role === 'manager' && isValidatingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Validating manager access...</p>
        </div>
      </div>
    );
  }

  // Render dashboards based on role
  if (userProfile.role === 'manager') {
    return <ManagerDashboard userProfile={userProfile} />;
  }

  return <AssistantDashboard userProfile={userProfile} />;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}
