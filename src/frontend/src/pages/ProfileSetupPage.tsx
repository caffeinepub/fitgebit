import { useState } from 'react';
import { useRegisterAssistant } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { Language } from '../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfileSetupPage() {
  const [username, setUsername] = useState('');
  const [initials, setInitials] = useState('');
  const [language, setLanguage] = useState<Language>('english' as Language);
  const registerMutation = useRegisterAssistant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (!initials.trim()) {
      toast.error('Please enter your initials');
      return;
    }

    if (initials.trim().length > 4) {
      toast.error('Initials must be 4 characters or less');
      return;
    }

    try {
      await registerMutation.mutateAsync({ 
        username: username.trim(), 
        language,
        initials: initials.trim().toUpperCase()
      });
      toast.success('Profile created successfully! Loading your dashboard...');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="mb-8 text-center">
          <img
            src="/assets/generated/fitgebit-logo-transparent.dim_200x200.png"
            alt="FitGebit Logo"
            className="mx-auto mb-6 h-32 w-32"
          />
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="text-muted-foreground">Set up your account to get started</p>
        </div>

        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Setup
            </CardTitle>
            <CardDescription>
              Choose a unique username, your initials, and your preferred language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Note:</strong> The account with username "Jay" will be assigned the Manager role. All other accounts will be Assistants by default.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={registerMutation.isPending}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  This will be your display name (minimum 3 characters)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initials">Initials</Label>
                <Input
                  id="initials"
                  placeholder="e.g., JD"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value)}
                  disabled={registerMutation.isPending}
                  maxLength={4}
                />
                <p className="text-xs text-muted-foreground">
                  Your initials will be shown when you complete tasks (max 4 characters)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as Language)}
                  disabled={registerMutation.isPending}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="dutch">Nederlands (Dutch)</SelectItem>
                    <SelectItem value="french">Français (French)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
