import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Globe, Type } from 'lucide-react';
import type { UserProfile } from '../backend';

interface SimpleDashboardProps {
  userProfile: UserProfile;
}

export default function SimpleDashboard({ userProfile }: SimpleDashboardProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'manager' ? 'default' : 'secondary';
  };

  const getLanguageDisplay = (lang: string) => {
    const languages: Record<string, string> = {
      english: 'English',
      dutch: 'Nederlands (Dutch)',
      french: 'Français (French)',
    };
    return languages[lang] || lang;
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
            <h1 className="text-xl font-bold">FitGebit</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight">Welcome to FitGebit</h2>
            <p className="text-muted-foreground">Your profile has been successfully created</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
              <CardDescription>
                Your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Username</p>
                      <p className="text-lg font-semibold">{userProfile.username}</p>
                    </div>
                  </div>
                  <Badge variant={getRoleBadgeVariant(userProfile.role)}>
                    {userProfile.role}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Type className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Initials</p>
                    <p className="text-lg font-semibold">{userProfile.initials}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Language</p>
                    <p className="text-lg font-semibold">{getLanguageDisplay(userProfile.language)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Principal ID:</strong>
                </p>
                <p className="mt-1 break-all font-mono text-xs">
                  {userProfile.principal.toString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Additional features will be available soon.
            </p>
          </div>
        </div>
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
