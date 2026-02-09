import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SimpleDashboard from './pages/SimpleDashboard';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import AuthBootstrapErrorScreen from './components/AuthBootstrapErrorScreen';

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

  const isAuthenticated = !!identity;

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

  return <SimpleDashboard userProfile={userProfile} />;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}
