import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ThumbsDown, Minus, Users } from 'lucide-react';
import { useGetAllAssistants, useGetAllTasks, useGetTaskPreferences, useSetTaskPreference } from '../../hooks/useQueries';
import { TaskPreference } from '../../backend';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function TaskPreferencesManager() {
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');

  const { data: assistants = [], isLoading: assistantsLoading } = useGetAllAssistants();
  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const { data: preferences = [], isLoading: preferencesLoading } = useGetTaskPreferences(selectedAssistant);
  const setPreferenceMutation = useSetTaskPreference();

  const preferencesMap = useMemo(() => {
    const map = new Map<string, TaskPreference>();
    preferences.forEach(([taskId, pref]) => {
      map.set(taskId.toString(), pref);
    });
    return map;
  }, [preferences]);

  const handlePreferenceChange = async (taskId: bigint, preference: TaskPreference) => {
    if (!selectedAssistant) return;

    try {
      await setPreferenceMutation.mutateAsync({
        assistantUsername: selectedAssistant,
        taskId,
        preference,
      });
      toast.success('Preference updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update preference');
    }
  };

  const getPreferenceIcon = (pref: TaskPreference | undefined) => {
    switch (pref) {
      case TaskPreference.preferred:
        return <Heart className="h-4 w-4 fill-current text-green-600" />;
      case TaskPreference.hated:
        return <ThumbsDown className="h-4 w-4 fill-current text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPreferenceLabel = (pref: TaskPreference | undefined) => {
    switch (pref) {
      case TaskPreference.preferred:
        return 'Preferred';
      case TaskPreference.hated:
        return 'Hated';
      default:
        return 'Neutral';
    }
  };

  if (assistantsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Task Preferences
          </CardTitle>
          <CardDescription>Loading assistants...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Task Preferences
        </CardTitle>
        <CardDescription>
          Track which tasks each assistant prefers or dislikes to help distribute workload fairly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Assistant</label>
          <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an assistant..." />
            </SelectTrigger>
            <SelectContent>
              {assistants.map((assistant) => (
                <SelectItem key={assistant.username} value={assistant.username}>
                  {assistant.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAssistant && (
          <>
            {tasksLoading || preferencesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No tasks available
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Current Preference</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => {
                      const currentPref = preferencesMap.get(task.id.toString());
                      return (
                        <TableRow key={task.id.toString()}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{task.title}</p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPreferenceIcon(currentPref)}
                              <span className="text-sm">{getPreferenceLabel(currentPref)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant={currentPref === TaskPreference.preferred ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePreferenceChange(task.id, TaskPreference.preferred)}
                                disabled={setPreferenceMutation.isPending}
                              >
                                <Heart className="mr-1 h-3 w-3" />
                                Preferred
                              </Button>
                              <Button
                                variant={currentPref === TaskPreference.neutral ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePreferenceChange(task.id, TaskPreference.neutral)}
                                disabled={setPreferenceMutation.isPending}
                              >
                                <Minus className="mr-1 h-3 w-3" />
                                Neutral
                              </Button>
                              <Button
                                variant={currentPref === TaskPreference.hated ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => handlePreferenceChange(task.id, TaskPreference.hated)}
                                disabled={setPreferenceMutation.isPending}
                              >
                                <ThumbsDown className="mr-1 h-3 w-3" />
                                Hated
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
