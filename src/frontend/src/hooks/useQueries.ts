import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  Language,
} from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principalStr: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principalStr],
    queryFn: async () => {
      if (!actor) return null;
      const principal = Principal.fromText(principalStr);
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principalStr,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRegisterAssistant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { username: string; language: Language; initials: string; overtime: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Convert overtime to BigInt, default to 0 if empty
      const overtimeValue = data.overtime.trim() === '' ? BigInt(0) : BigInt(data.overtime.trim());
      
      try {
        const result = await actor.registerAssistant({
          username: data.username,
          language: data.language,
          initials: data.initials,
          overtime: overtimeValue,
        });

        // Backend returns Bool - throw if false
        if (!result) {
          throw new Error('Registration failed. Please try again.');
        }

        return result;
      } catch (error: any) {
        // Preserve backend trap messages for user-facing error utility
        throw error;
      }
    },
    onSuccess: async () => {
      // Invalidate and actively refetch the profile to ensure UI updates
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.refetchQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
