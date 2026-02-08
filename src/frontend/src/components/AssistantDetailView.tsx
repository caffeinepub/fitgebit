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
import { X, Download, Trash2, Calendar, Clock, CheckCircle2, XCircle, TrendingUp, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import { computeOnTimeMetrics, formatCompletionHistory, formatTimestamp, getPreferenceLabel, getPreferenceColor } from '../utils/taskHabits';
import { UserRole } from '../backend';
import ProfileAvatar from './profile/ProfileAvatar';
import { formatOvertimeDate } from '../utils/overtimeDates';

interface AssistantDetailViewProps {
  assistant: UserProfile;
  onDelete: (assistant: UserProfile) => void;
  onClose: () => void;
}

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

// Convert bigint timestamp to Date for formatting
const formatBigIntTimestamp = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) / 1000000);
  return formatTimestamp(date);
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
      formatOvertimeDate(entry.date),
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
    const link = document.createElement('a');
    link.href = url;
    const today = new Date();
    const dateStr = formatOvertimeDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    ).replace(/ /g, '-');
    link.download = `${assistant.username}-overtime-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  const onTimeMetrics = taskHabits ? computeOnTimeMetrics(taskHabits.completions) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            profilePicture={assistant.profilePicture}
            presetAvatarId={assistant.presetAvatarId}
            initials={assistant.initials}
            username={assistant.username}
            size="lg"
          />
          <div>
            <h2 className="text-2xl font-bold">{assistant.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{assistant.initials}</Badge>
              <Badge>{assistant.role}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => onDelete(assistant)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            {totalsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{days}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {totalsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{hours}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            {totalsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{minutes}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <OvertimeChart entries={entries} isLoading={entriesLoading} variant="bar" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overtime History</CardTitle>
              <CardDescription>All overtime entries for {assistant.username}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={entries.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <OvertimeHistory 
            entries={entries} 
            isLoading={entriesLoading}
            username={assistant.username}
          />
        </CardContent>
      </Card>

      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Task Habits
            </CardTitle>
            <CardDescription>Task completion patterns and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {taskHabitsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : taskHabitsError ? (
              <div className="py-8 text-center text-muted-foreground">
                Failed to load task habits
              </div>
            ) : taskHabits ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-bold">{Number(taskHabits.summary.totalTasks)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{Number(taskHabits.summary.completedTasks)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">On Time</p>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      {Number(taskHabits.summary.onTimeTasks)}
                      {onTimeMetrics && (
                        <span className="text-sm font-normal text-muted-foreground">
                          ({onTimeMetrics.onTimePercentage}%)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Task Types</p>
                    <p className="text-sm">
                      {Number(taskHabits.summary.dailyTasks)}D / {Number(taskHabits.summary.weeklyTasks)}W /{' '}
                      {Number(taskHabits.summary.monthlyTasks)}M
                    </p>
                  </div>
                </div>

                <Separator />

                {/* On-Time Metrics */}
                {onTimeMetrics && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        On-Time Performance
                      </h4>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            On Time: <strong>{onTimeMetrics.onTimeCompletions}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">
                            Late: <strong>{onTimeMetrics.lateCompletions}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            Rate: <strong>{onTimeMetrics.onTimePercentage}%</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Task Preferences */}
                {taskHabits.summary.taskPreferences.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-3">Task Preferences</h4>
                      <div className="space-y-2">
                        {taskHabits.summary.taskPreferences.map(([taskId, preference]) => (
                          <div key={taskId.toString()} className="flex items-center gap-2">
                            <Badge variant="outline" className={getPreferenceColor(preference)}>
                              {getPreferenceLabel(preference)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">Task #{Number(taskId)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Recent Completions */}
                {taskHabits.completions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recent Completions</h4>
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {taskHabits.completions.slice(0, 10).map((completion, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{completion.taskTitle}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{completion.frequency}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatBigIntTimestamp(completion.completionTimestamp)}
                              </TableCell>
                              <TableCell>
                                {completion.completedOnTime ? (
                                  <Badge variant="default" className="bg-green-600">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    On Time
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Late
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
