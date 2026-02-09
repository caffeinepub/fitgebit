import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, CheckSquare, Clock } from 'lucide-react';
import AccountResetDialog from '../components/AccountResetDialog';
import { clearAllManagerGateState } from '../utils/managerTokenGate';
import type { UserProfile } from '../backend';

interface AssistantDashboardProps {
  userProfile: UserProfile;
}

export default function AssistantDashboard({ userProfile }: AssistantDashboardProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    clearAllManagerGateState();
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/fitgebit-logo-transparent.dim_200x200.png"
              alt="FitGebit Logo"
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold">FitGebit Assistant</h1>
              <p className="text-xs text-muted-foreground">Your Personal Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:flex">
              <User className="mr-1 h-3 w-3" />
              Assistant
            </Badge>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            Welcome, {userProfile.username}
          </h2>
          <p className="text-muted-foreground">
            Assistant dashboard - Manage your tasks and track your overtime
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                My Tasks
              </CardTitle>
              <CardDescription>
                View and manage your assigned tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access your task list, mark tasks as complete, and track your progress.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Overtime Tracking
              </CardTitle>
              <CardDescription>
                Log and monitor your overtime hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Record overtime entries and view your accumulated overtime balance.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Assistant account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p className="text-lg font-semibold">{userProfile.username}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium text-muted-foreground">Initials</p>
                <p className="text-lg font-semibold">{userProfile.initials}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 border-destructive/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions - proceed with caution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <p className="font-medium">Reset Your Account</p>
                <p className="text-sm text-muted-foreground">
                  Delete your profile and start fresh
                </p>
              </div>
              <AccountResetDialog />
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-16 border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
