import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { useState } from 'react';
import { toast } from 'sonner';
import ProfileAvatar from './profile/ProfileAvatar';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  const [editedInitials, setEditedInitials] = useState('');
  const [isEditingInitials, setIsEditingInitials] = useState(false);

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case UserRole.manager:
        return 'Manager';
      case UserRole.assistant:
        return 'Assistant';
      default:
        return 'User';
    }
  };

  const getRoleBadgeVariant = (role: UserRole): 'default' | 'secondary' => {
    return role === UserRole.manager ? 'default' : 'secondary';
  };

  const handleSaveInitials = async () => {
    if (!userProfile) return;

    const trimmedInitials = editedInitials.trim().toUpperCase();
    if (!trimmedInitials) {
      toast.error('Initials cannot be empty');
      return;
    }

    if (trimmedInitials.length > 4) {
      toast.error('Initials must be 4 characters or less');
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({
        ...userProfile,
        initials: trimmedInitials,
      });
      toast.success('Initials updated successfully');
      setIsEditingInitials(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update initials');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Profile Avatar Section */}
          <div className="flex items-center gap-4">
            <ProfileAvatar
              profilePicture={userProfile?.profilePicture}
              presetAvatarId={userProfile?.presetAvatarId}
              initials={userProfile?.initials || ''}
              username={userProfile?.username || ''}
              size="lg"
            />
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-semibold">{userProfile?.username || 'User'}</h3>
              {userProfile?.role && (
                <Badge variant={getRoleBadgeVariant(userProfile.role)}>
                  {getRoleLabel(userProfile.role)}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Initials Section */}
          <div className="space-y-2">
            <Label>Initials</Label>
            {isEditingInitials ? (
              <div className="flex gap-2">
                <Input
                  value={editedInitials}
                  onChange={(e) => setEditedInitials(e.target.value)}
                  placeholder="Enter initials"
                  maxLength={4}
                  autoFocus
                />
                <Button
                  onClick={handleSaveInitials}
                  disabled={saveProfileMutation.isPending}
                  size="sm"
                >
                  {saveProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  onClick={() => setIsEditingInitials(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{userProfile?.initials || 'Not set'}</p>
                <Button
                  onClick={() => {
                    setEditedInitials(userProfile?.initials || '');
                    setIsEditingInitials(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Your initials will be shown when you complete tasks
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
