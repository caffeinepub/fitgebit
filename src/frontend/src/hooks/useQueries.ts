import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  ToDoTask,
  AuditLogEntry,
  OvertimeEntry,
  OvertimeTotals,
  TaskHistoryEntry,
  AssistantTaskHabits,
  TaskPreference,
  Language,
  TaskFrequency,
  Avatar,
} from '../backend';
import { ExternalBlob } from '../backend';
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

export function useUploadProfilePicture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadProfilePicture(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSetPresetAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarId: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPresetAvatar(BigInt(avatarId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Avatar Queries
export function useGetUnlockedAvatars() {
  const { actor, isFetching } = useActor();

  return useQuery<Avatar[]>({
    queryKey: ['unlockedAvatars'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnlockedAvatars();
    },
    enabled: !!actor && !isFetching,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

// Task Queries
export function useGetAllTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<ToDoTask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTask(taskId: number) {
  const { actor, isFetching } = useActor();

  return useQuery<ToDoTask | null>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTask(BigInt(taskId));
    },
    enabled: !!actor && !isFetching && taskId !== undefined,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      frequency: TaskFrequency;
      isWeekly: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(data.title, data.description, data.frequency, data.isWeekly);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskHistory'] });
      queryClient.invalidateQueries({ queryKey: ['auditLog'] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      taskId: number;
      title: string;
      description: string;
      frequency: TaskFrequency;
      isWeekly: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTask(
        BigInt(data.taskId),
        data.title,
        data.description,
        data.frequency,
        data.isWeekly
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskHistory'] });
      queryClient.invalidateQueries({ queryKey: ['auditLog'] });
    },
  });
}

export function useMarkTaskDone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      taskId: number;
      photoData?: ExternalBlob;
      completionComment?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markTaskDone(
        BigInt(data.taskId),
        data.photoData ?? null,
        data.completionComment ?? null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskHistory'] });
      queryClient.invalidateQueries({ queryKey: ['auditLog'] });
    },
  });
}

export function useSetTaskPinnedStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { taskId: number; isPinned: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setTaskPinnedStatus(BigInt(data.taskId), data.isPinned);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      if (!actor) throw new Error('Actor not available');
      throw new Error('Delete task not implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskHistory'] });
      queryClient.invalidateQueries({ queryKey: ['auditLog'] });
    },
  });
}

// Audit Log Queries
export function useGetAuditLog() {
  const { actor, isFetching } = useActor();

  return useQuery<AuditLogEntry[]>({
    queryKey: ['auditLog'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAuditLog();
    },
    enabled: !!actor && !isFetching,
  });
}

// Task History Queries
export function useGetTaskHistory(taskId: number) {
  const { actor, isFetching } = useActor();

  return useQuery<TaskHistoryEntry[]>({
    queryKey: ['taskHistory', taskId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskHistory(BigInt(taskId));
    },
    enabled: !!actor && !isFetching && taskId !== undefined,
  });
}

export function useGetAllTaskHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<TaskHistoryEntry[]>({
    queryKey: ['taskHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTaskHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

// Overtime Queries
export function useGetOvertimeEntries(username: string) {
  const { actor, isFetching } = useActor();

  return useQuery<OvertimeEntry[]>({
    queryKey: ['overtimeEntries', username],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOvertimeEntries(username);
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

export function useGetOvertimeTotals(username: string) {
  const { actor, isFetching } = useActor();

  return useQuery<OvertimeTotals>({
    queryKey: ['overtimeTotals', username],
    queryFn: async () => {
      if (!actor)
        return {
          totalDays: BigInt(0),
          totalHours: BigInt(0),
          totalMinutes: BigInt(0),
        };
      return actor.getOvertimeTotals(username);
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

export function useLogOvertime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      date: string;
      minutes: number;
      comment: string;
      isAdd: boolean;
      username: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logOvertime(data.date, BigInt(data.minutes), data.comment, data.isAdd);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['overtimeEntries', variables.username] });
      queryClient.invalidateQueries({ queryKey: ['overtimeTotals', variables.username] });
    },
  });
}

export function useEditLatestOvertimeEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { username: string; entry: OvertimeEntry }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editLatestOvertimeEntry(data.username, data.entry);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['overtimeEntries', variables.username] });
      queryClient.invalidateQueries({ queryKey: ['overtimeTotals', variables.username] });
    },
  });
}

// Assistant Queries
export function useGetAllAssistants() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['assistants'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAssistants();
    },
    enabled: !!actor && !isFetching,
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
      return actor.registerAssistant({
        username: data.username,
        language: data.language,
        initials: data.initials,
        overtime: overtimeValue,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
    },
  });
}

export function useDeleteAssistantData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assistantPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(assistantPrincipal);
      return actor.deleteAssistantData(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
    },
  });
}

// Manager Queries
export function useCheckManagerNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['managerNotifications'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.checkManagerNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

// Task Habits Queries
export function useGetAssistantTaskHabits(username: string) {
  const { actor, isFetching } = useActor();

  return useQuery<AssistantTaskHabits>({
    queryKey: ['taskHabits', username],
    queryFn: async () => {
      if (!actor)
        throw new Error('Actor not available');
      return actor.getAssistantTaskHabits(username);
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

// Task Preferences Queries
export function useGetTaskPreferences(assistantUsername: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[bigint, TaskPreference]>>({
    queryKey: ['taskPreferences', assistantUsername],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskPreferences(assistantUsername);
    },
    enabled: !!actor && !isFetching && !!assistantUsername,
  });
}

export function useSetTaskPreference() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      assistantUsername: string;
      taskId: number;
      preference: TaskPreference;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setTaskPreference(
        data.assistantUsername,
        BigInt(data.taskId),
        data.preference
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskPreferences', variables.assistantUsername] });
      queryClient.invalidateQueries({ queryKey: ['taskHabits', variables.assistantUsername] });
    },
  });
}

// Wipe Storage Mutation
export function useWipeStorage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.wipeStorage();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
