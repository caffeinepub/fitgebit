import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useState } from 'react';
import ProfileDialog from './ProfileDialog';
import ProfileAvatar from './profile/ProfileAvatar';
import AvatarModal from './profile/AvatarModal';
import { useTheme } from '../hooks/useTheme';

export default function Header() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const resolvedTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/fitgebit-logo-transparent.dim_200x200.png"
              alt="FitGebit"
              className="h-16 w-16"
            />
            <h1 className="text-lg font-semibold"></h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {userProfile && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAvatarModal(true)}
                  className="gap-2"
                >
                  <ProfileAvatar
                    profilePicture={userProfile.profilePicture}
                    presetAvatarId={userProfile.presetAvatarId}
                    initials={userProfile.initials}
                    username={userProfile.username}
                    size="sm"
                  />
                  <span className="hidden sm:inline">{userProfile.username}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfileDialog(true)}
                  className="hidden sm:inline-flex"
                >
                  Profile
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <ProfileDialog open={showProfileDialog} onOpenChange={setShowProfileDialog} />
      <AvatarModal open={showAvatarModal} onOpenChange={setShowAvatarModal} />
    </>
  );
}
