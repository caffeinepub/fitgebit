import { useGetUserProfile } from '../../hooks/useQueries';
import type { Principal } from '@dfinity/principal';
import ProfileAvatar from '../profile/ProfileAvatar';

interface TaskCompletionAttributionProps {
  completerPrincipal: Principal;
  completerUsername: string;
}

export default function TaskCompletionAttribution({
  completerPrincipal,
  completerUsername,
}: TaskCompletionAttributionProps) {
  const { data: completerProfile } = useGetUserProfile(completerPrincipal.toString());

  const displayText = completerProfile?.initials || completerUsername;

  return (
    <span className="inline-flex items-center gap-1.5">
      {completerProfile && (
        <ProfileAvatar
          profilePicture={completerProfile.profilePicture}
          presetAvatarId={completerProfile.presetAvatarId}
          initials={completerProfile.initials}
          username={completerProfile.username}
          size="sm"
        />
      )}
      <span>by {displayText}</span>
    </span>
  );
}
