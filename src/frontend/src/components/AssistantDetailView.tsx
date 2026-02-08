import type { UserProfile } from '../backend';
import { useGetOvertimeEntries, useGetOvertimeTotals, useGetAssistantTaskHabits, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OvertimeHistory from './OvertimeHistory';
import OvertimeChart from './OvertimeChart';
import { X, Download, Trash2, User, Calendar, Clock, CheckCircle2, XCircle, TrendingUp, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import { computeOnTimeMetrics, formatCompletionHistory, formatTimestamp, getPreferenceLabel, getPreferenceColor } from '../utils/taskHabits';
import { UserRole } from '../backend';

interface AssistantDetailViewProps {
  assistant: UserProfile;
  onDelete: (assistant: UserProfile) => void;
  onClose: () => void;
}

// Convert YYYY-MM-DD to DD-MM-YYYY
const formatDateEuropean = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

// Convert total minutes to days/hours/minutes display
const formatMinutes = (totalMinutes: number): string => {
  const days = Math.floor(totalMinutes / (8 * 60));
  const remainingAfterDays = totalMinutes % (8 * 60);
  const hours = Math.floor(remainingAfterDays / 60);
  const minutes = remainingAfterDays % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(' ');
};

export default function AssistantDetailView({ assistant, onDelete, onClose }: AssistantDetailViewProps) {
  const { data: entries = [], isLoading: entriesLoading } = useGetOvertimeEntries(assistant.username);
  const { data: totals, isLoading: totalsLoading } = useGetOvertimeTotals(assistant.username);
  const { data: taskHabits, isLoading: taskHabitsLoading, error: taskHabitsError } = useGetAssistantTaskHabits(assistant.username);
  const { data: currentUserProfile } = useGetCallerUserProfile();

  const days = Number(totals?.totalDays || 0);
  const hours = Number(totals?.totalHours || 0);
  const minutes = Number(totals?.totalMinutes || 0);

  const isManager = currentUserProfile?.role === UserRole.manager;

  const handleExportCSV = () => {
    if (entries.length === 0) {
      toast.error('No entries to export');
      return;
    }

    const headers = ['Date', 'Type', 'Minutes', 'Time Display', 'Comment'];
    const rows = entries.map((entry) => [
      formatDateEuropean(entry.date),
      entry.isAdd ? 'Added' : 'Used',
      Number(entry.minutes).toString(),
      formatMinutes(Number(entry.minutes)),
      entry.comment,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assistant.username}_overtime_${formatDateEuropean(new Date().toISOString().split('T')[0])}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  // Compute task habit metrics
  const onTimeMetrics = taskHabits ? computeOnTimeMetrics(taskHabits.completions) : null;
  const completionHistory = taskHabits ? formatCompletionHistory(taskHabits.completions) : [];
  const taskPreferences = taskHabits?.summary.taskPreferences || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{assistant.username}</CardTitle>
                <CardDescription className="capitalize">{assistant.language}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <Calendar className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{days}</p>
              <p className="text-xs text-muted-foreground">Days</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <Clock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{hours}</p>
              <p className="text-xs text-muted-foreground">Hours</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <Clock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{minutes}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(assistant)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <OvertimeChart entries={entries} isLoading={entriesLoading} variant="bar" />

      <Card>
        <CardHeader>
          <CardTitle>Overtime History</CardTitle>
          <CardDescription>All overtime entries for {assistant.username}</CardDescription>
        </CardHeader>
        <CardContent>
          <OvertimeHistory entries={entries} isLoading={entriesLoading} />
        </CardContent>
      </Card>

      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Task Habits
            </CardTitle>
            <CardDescription>Completion history and task preferences for {assistant.username}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {taskHabitsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : taskHabitsError ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
                Failed to load task habits. You may not have permission to view this data.
              </div>
            ) : !taskHabits || taskHabits.completions.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <ListChecks className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No task completions yet</p>
              </div>
            ) : (
              <>
                {/* On-Time Metrics */}
                {onTimeMetrics && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-2xl font-bold">{onTimeMetrics.onTimePercentage}%</p>
                      <p className="text-xs text-muted-foreground">On-Time Rate</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                      <p className="text-2xl font-bold">{onTimeMetrics.onTimeCompletions}</p>
                      <p className="text-xs text-muted-foreground">On Time</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <XCircle className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                      <p className="text-2xl font-bold">{onTimeMetrics.lateCompletions}</p>
                      <p className="text-xs text-muted-foreground">Late</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Task Preferences */}
                {taskPreferences.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-sm font-medium">Task Preferences</h4>
                    <div className="flex flex-wrap gap-2">
                      {taskPreferences.map(([taskId, preference]) => {
                        const task = taskHabits.completions.find((c) => c.taskId === taskId);
                        return (
                          <Badge
                            key={taskId.toString()}
                            variant="outline"
                            className={getPreferenceColor(preference)}
                          >
                            {task?.taskTitle || `Task ${taskId}`}: {getPreferenceLabel(preference)}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Completion History */}
                <div>
                  <h4 className="mb-3 text-sm font-medium">Completion History</h4>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Completed</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completionHistory.slice(0, 10).map((completion, idx) => (
                          <TableRow key={`${completion.taskId}-${idx}`}>
                            <TableCell className="font-medium">{completion.taskTitle}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {completion.frequency}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatTimestamp(completion.completionTimestamp)}
                            </TableCell>
                            <TableCell className="text-center">
                              {completion.completedOnTime ? (
                                <CheckCircle2 className="inline h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="inline h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {completionHistory.length > 10 && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Showing 10 of {completionHistory.length} completions
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
