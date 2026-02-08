import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import type { ExternalBlob } from '../../backend';
import { useEffect, useState } from 'react';
import { getExternalBlobUrl } from '../../utils/externalBlobUrl';
import { getPresetAvatarPath } from '../../constants/dentalPresets';

interface ProfileAvatarProps {
  profilePicture?: ExternalBlob;
  presetAvatarId?: bigint;
  initials: string;
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ProfileAvatar({
  profilePicture,
  presetAvatarId,
  initials,
  username,
  size = 'md',
}: ProfileAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-32 w-32 text-3xl',
  };

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        // Priority: profile picture > preset avatar (static asset) > initials/icon
        if (profilePicture) {
          const url = await getExternalBlobUrl(profilePicture);
          if (mounted) setImageUrl(url);
        } else if (presetAvatarId !== undefined) {
          // Resolve preset directly from static assets (IDs 0-23)
          const staticPath = getPresetAvatarPath(Number(presetAvatarId));
          if (staticPath && mounted) {
            setImageUrl(staticPath);
          } else if (mounted) {
            setImageUrl(null);
          }
        } else {
          if (mounted) setImageUrl(null);
        }
      } catch (error) {
        console.error('Failed to load avatar image:', error);
        if (mounted) setImageUrl(null);
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [profilePicture, presetAvatarId]);

  return (
    <Avatar className={sizeClasses[size]}>
      {imageUrl && <AvatarImage src={imageUrl} alt={username} />}
      <AvatarFallback>
        {initials ? (
          <span className="font-semibold">{initials}</span>
        ) : (
          <User className="h-1/2 w-1/2" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
