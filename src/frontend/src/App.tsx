import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetUnlockedAvatars } from './hooks/useQueries';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import AssistantDashboard from './pages/AssistantDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import { UserRole } from './backend';
import { AppErrorBoundary } from './components/AppErrorBoundary';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, refetch } = useGetCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Trigger early fetch of unlocked avatars to enable monthly unlock reveal
  useGetUnlockedAvatars();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched) {
      setShowProfileSetup(userProfile === null);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  // Refetch profile when transitioning from profile setup
  useEffect(() => {
    if (isAuthenticated && !showProfileSetup && !userProfile && isFetched) {
      // Profile was just created, refetch to get the updated profile
      const timer = setTimeout(() => {
        refetch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, showProfileSetup, userProfile, isFetched, refetch]);

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

  // Defensive role check: only render manager dashboard for managers
  if (userProfile.role === UserRole.manager) {
    return <ManagerDashboard userProfile={userProfile} />;
  }

  // Defensive role check: only render assistant dashboard for assistants
  if (userProfile.role === UserRole.assistant) {
    return <AssistantDashboard userProfile={userProfile} />;
  }

  // Fallback for unknown roles
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-destructive">Unknown user role. Please contact support.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}
