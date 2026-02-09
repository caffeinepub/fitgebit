import { useState, useEffect } from 'react';
import { useRegisterAssistant, useRegisterManager } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Language } from '../backend';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getUserFacingErrorMessage } from '../utils/userFacingError';
import { Badge } from '@/components/ui/badge';
import { clearAllManagerGateState } from '../utils/managerTokenGate';

export default function ProfileSetupPage() {
  const [username, setUsername] = useState('');
  const [initials, setInitials] = useState('');
  const [overtime, setOvertime] = useState('');
  const [language, setLanguage] = useState<Language>('english' as Language);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'manager' | 'assistant'>('assistant');
  
  const registerAssistantMutation = useRegisterAssistant();
  const registerManagerMutation = useRegisterManager();

  // Load the selected role from sessionStorage
  useEffect(() => {
    const storedRole = sessionStorage.getItem('caffeineSelectedRole');
    if (storedRole === 'manager' || storedRole === 'assistant') {
      setSelectedRole(storedRole);
    }
  }, []);

  const handleOvertimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty or digits only
    if (value === '' || /^\d+$/.test(value)) {
      setOvertime(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous error
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter a username');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters');
      return;
    }

    if (!initials.trim()) {
      setErrorMessage('Please enter your initials');
      return;
    }

    if (initials.trim().length > 4) {
      setErrorMessage('Initials must be 4 characters or less');
      return;
    }

    try {
      if (selectedRole === 'manager') {
        // Manager registration
        const adminToken = sessionStorage.getItem('caffeineAdminToken') || '';
        
        await registerManagerMutation.mutateAsync({
          username: username.trim(),
          language,
          initials: initials.trim().toUpperCase(),
          registrationToken: adminToken,
        });
        
        toast.success('Manager profile created successfully! Loading your dashboard...');
      } else {
        // Assistant registration
        await registerAssistantMutation.mutateAsync({ 
          username: username.trim(), 
          language,
          initials: initials.trim().toUpperCase(),
          overtime: overtime.trim()
        });
        
        toast.success('Assistant profile created successfully! Loading your dashboard...');
      }

      // Clear session storage and gate state after successful registration
      sessionStorage.removeItem('caffeineSelectedRole');
      sessionStorage.removeItem('caffeineAdminToken');
      clearAllManagerGateState();
    } catch (error: any) {
      // Extract user-friendly error message
      const friendlyMessage = getUserFacingErrorMessage(error);
      setErrorMessage(friendlyMessage);
      toast.error(friendlyMessage);
    }
  };

  const isSubmitting = registerAssistantMutation.isPending || registerManagerMutation.isPending;

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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {selectedRole === 'manager' ? (
                  <>
                    <Shield className="h-5 w-5" />
                    Manager Profile Setup
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5" />
                    Assistant Profile Setup
                  </>
                )}
              </CardTitle>
              <Badge variant={selectedRole === 'manager' ? 'default' : 'secondary'}>
                {selectedRole === 'manager' ? 'Manager' : 'Assistant'}
              </Badge>
            </div>
            <CardDescription>
              {selectedRole === 'manager' 
                ? 'Create your manager profile to access administrative features'
                : 'Create your assistant profile to access your tasks and overtime tracking'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  maxLength={4}
                />
                <p className="text-xs text-muted-foreground">
                  Your initials will be shown when you complete tasks (max 4 characters)
                </p>
              </div>

              {selectedRole === 'assistant' && (
                <div className="space-y-2">
                  <Label htmlFor="overtime">Overtime</Label>
                  <Input
                    id="overtime"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter overtime value (optional)"
                    value={overtime}
                    onChange={handleOvertimeChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional numeric value (leave empty if not applicable)
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as Language)}
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  `Create ${selectedRole === 'manager' ? 'Manager' : 'Assistant'} Profile`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
