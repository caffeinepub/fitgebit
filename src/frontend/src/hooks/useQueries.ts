import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Language, OvertimeEntry, OvertimeTotals, UserProfile, ToDoTask, AuditLogEntry, TaskFrequency, TaskHistoryEntry, TaskPreference, AssistantTaskHabits } from '../backend';
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
    mutationFn: async (data: { username: string; language: Language }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerAssistant(data.username, data.language);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
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
      if (!actor) throw new Error('Actor not available');
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
      username: string;
      date: string;
      minutes: number;
      comment: string;
      isAdd: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logOvertime(
        data.date,
        BigInt(data.minutes),
        data.comment,
        data.isAdd
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['overtimeEntries', variables.username] });
      queryClient.invalidateQueries({ queryKey: ['overtimeTotals', variables.username] });
    },
  });
}

// Manager Queries
export function useGetAllAssistants() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allAssistants'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAssistants();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCheckManagerNotifications() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkManagerNotifications();
    },
  });
}

export function useDeleteAssistantData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assistantPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAssistantData(assistantPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAssistants'] });
    },
  });
}

// To-Do Task Queries
export function useGetAllTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<ToDoTask[]>({
    queryKey: ['allTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Poll every 30 seconds
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
      return actor.createTask(
        data.title,
        data.description,
        data.frequency,
        data.isWeekly
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      taskId: bigint;
      title: string;
      description: string;
      frequency: TaskFrequency;
      isWeekly: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTask(
        data.taskId,
        data.title,
        data.description,
        data.frequency,
        data.isWeekly
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Backend method will be added
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
    },
  });
}

export function useMarkTaskDone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      taskId: bigint;
      evidencePhotoPath: string | null;
      completionComment: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markTaskDone(
        data.taskId,
        data.evidencePhotoPath,
        data.completionComment
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
    },
  });
}

export function useSetTaskPinnedStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { taskId: bigint; isPinned: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setTaskPinnedStatus(data.taskId, data.isPinned);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
    },
  });
}

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

export function useGetTaskHistory(taskId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<TaskHistoryEntry[]>({
    queryKey: ['taskHistory', taskId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskHistory(taskId);
    },
    enabled: !!actor && !isFetching,
  });
}

// Task Preferences (Manager only)
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
      taskId: bigint;
      preference: TaskPreference;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setTaskPreference(
        data.assistantUsername,
        data.taskId,
        data.preference
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskPreferences', variables.assistantUsername] });
    },
  });
}

// Assistant Task Habits (Manager only)
export function useGetAssistantTaskHabits(username: string) {
  const { actor, isFetching } = useActor();

  return useQuery<AssistantTaskHabits>({
    queryKey: ['assistantTaskHabits', username],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAssistantTaskHabits(username);
    },
    enabled: !!actor && !isFetching && !!username,
  });
}
