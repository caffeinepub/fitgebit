import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ManagerDashboard from './pages/ManagerDashboard';
import AssistantDashboard from './pages/AssistantDashboard';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import AuthBootstrapErrorScreen from './components/AuthBootstrapErrorScreen';
import { clearAllSessionState } from './utils/sessionStateReset';

const BOOTSTRAP_TIMEOUT_MS = 15000; // 15 seconds

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

  const [bootstrapTimedOut, setBootstrapTimedOut] = useState(false);
  const [timeoutError, setTimeoutError] = useState<Error | null>(null);

  const isAuthenticated = !!identity;

  // Watchdog timeout for bootstrap loading states
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const isBootstrapping = 
      isInitializing || 
      (isAuthenticated && profileLoading && !isFetched);

    if (isBootstrapping && !bootstrapTimedOut) {
      timeoutId = setTimeout(() => {
        setBootstrapTimedOut(true);
        setTimeoutError(new Error('Profile loading timed out. Please try again.'));
      }, BOOTSTRAP_TIMEOUT_MS);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isInitializing, isAuthenticated, profileLoading, isFetched, bootstrapTimedOut]);

  // Handle bootstrap timeout
  if (bootstrapTimedOut) {
    const handleRetry = async () => {
      setBootstrapTimedOut(false);
      setTimeoutError(null);
      if (isAuthenticated) {
        await refetch();
      }
    };

    const handleSignOut = async () => {
      setBootstrapTimedOut(false);
      setTimeoutError(null);
      clearAllSessionState();
      await clear();
      queryClient.clear();
    };

    return (
      <AuthBootstrapErrorScreen 
        error={timeoutError}
        onRetry={handleRetry}
        onSignOut={handleSignOut}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  // Handle authenticated profile fetch error (but not "no profile" case)
  if (isAuthenticated && isError && isFetched && userProfile !== null) {
    const handleRetry = async () => {
      await refetch();
    };

    const handleSignOut = async () => {
      clearAllSessionState();
      await clear();
      queryClient.clear();
    };

    return (
      <AuthBootstrapErrorScreen 
        error={error}
        onRetry={handleRetry}
        onSignOut={handleSignOut}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  // Derive showProfileSetup directly from auth + profile state
  // Post-reset, profile will be null and user should see profile setup
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
