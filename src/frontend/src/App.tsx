import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import AssistantDashboard from './pages/AssistantDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading state while initializing or fetching profile
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LoginPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show profile setup if authenticated but no profile exists
  const showProfileSetup = isAuthenticated && isFetched && userProfile === null;
  if (showProfileSetup) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ProfileSetupPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show appropriate dashboard based on role
  if (userProfile) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {userProfile.role === 'manager' ? (
          <ManagerDashboard userProfile={userProfile} />
        ) : (
          <AssistantDashboard userProfile={userProfile} />
        )}
        <Toaster />
      </ThemeProvider>
    );
  }

  return null;
}
