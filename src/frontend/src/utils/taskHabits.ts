import type { AssistantTaskCompletionRecord, TaskPreference } from '../backend';

export interface OnTimeMetrics {
  totalCompletions: number;
  onTimeCompletions: number;
  lateCompletions: number;
  onTimePercentage: number;
}

export interface CompletionDisplay {
  taskId: string;
  taskTitle: string;
  frequency: string;
  completionTimestamp: Date;
  completedOnTime: boolean;
  hasComment: boolean;
  hasPhoto: boolean;
}

export function computeOnTimeMetrics(completions: AssistantTaskCompletionRecord[]): OnTimeMetrics {
  if (completions.length === 0) {
    return {
      totalCompletions: 0,
      onTimeCompletions: 0,
      lateCompletions: 0,
      onTimePercentage: 0,
    };
  }

  const onTimeCount = completions.filter((c) => c.completedOnTime).length;
  const lateCount = completions.length - onTimeCount;

  return {
    totalCompletions: completions.length,
    onTimeCompletions: onTimeCount,
    lateCompletions: lateCount,
    onTimePercentage: Math.round((onTimeCount / completions.length) * 100),
  };
}

export function formatCompletionHistory(
  completions: AssistantTaskCompletionRecord[]
): CompletionDisplay[] {
  return completions
    .map((completion) => ({
      taskId: completion.taskId.toString(),
      taskTitle: completion.taskTitle,
      frequency: formatFrequency(completion.frequency),
      completionTimestamp: new Date(Number(completion.completionTimestamp) / 1000000),
      completedOnTime: completion.completedOnTime,
      hasComment: false, // Backend doesn't include this in completion records
      hasPhoto: false, // Backend doesn't include this in completion records
    }))
    .sort((a, b) => b.completionTimestamp.getTime() - a.completionTimestamp.getTime());
}

function formatFrequency(frequency: any): string {
  if (typeof frequency === 'object') {
    if ('daily' in frequency) return 'Daily';
    if ('weekly' in frequency) return 'Weekly';
    if ('monthly' in frequency) return 'Monthly';
  }
  return String(frequency);
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getPreferenceLabel(preference: TaskPreference): string {
  if (typeof preference === 'object') {
    if ('preferred' in preference) return 'Preferred';
    if ('hated' in preference) return 'Hated';
    if ('neutral' in preference) return 'Neutral';
  }
  return String(preference);
}

export function getPreferenceColor(preference: TaskPreference): string {
  if (typeof preference === 'object') {
    if ('preferred' in preference) return 'text-green-600 dark:text-green-400';
    if ('hated' in preference) return 'text-red-600 dark:text-red-400';
    if ('neutral' in preference) return 'text-muted-foreground';
  }
  return 'text-muted-foreground';
}
