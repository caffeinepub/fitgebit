import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import ToDoTaskDialog from './ToDoTaskDialog';
import MarkTaskDoneDialog from './MarkTaskDoneDialog';
import ToDoTable from './ToDoTable';
import { useGetAllTasks, useCreateTask, useUpdateTask, useMarkTaskDone, useSetTaskPinnedStatus } from '../../hooks/useQueries';
import type { ToDoTask, TaskFrequency } from '../../backend';
import { TaskFrequency as TaskFrequencyEnum } from '../../backend';
import { getFrequencyLabel, computeNextDueDate, computeUrgencyScore } from '../../utils/todoDates';

export default function ToDoSection() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ToDoTask | null>(null);
  const [markingDoneTask, setMarkingDoneTask] = useState<ToDoTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFrequency, setFilterFrequency] = useState<'all' | TaskFrequency>('all');

  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const markTaskDoneMutation = useMarkTaskDone();
  const setTaskPinnedMutation = useSetTaskPinnedStatus();

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    frequency: TaskFrequency;
    isWeekly: boolean;
  }) => {
    try {
      await createTaskMutation.mutateAsync(data);
      toast.success('Task created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
      throw error;
    }
  };

  const handleUpdateTask = async (data: {
    title: string;
    description: string;
    frequency: TaskFrequency;
    isWeekly: boolean;
  }) => {
    if (!editingTask) return;

    try {
      await updateTaskMutation.mutateAsync({
        taskId: editingTask.id,
        ...data,
      });
      toast.success('Task updated successfully');
      setEditingTask(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
      throw error;
    }
  };

  const handleMarkTaskDone = async (data: {
    evidencePhotoPath: string | null;
    completionComment: string | null;
  }) => {
    if (!markingDoneTask) return;

    try {
      await markTaskDoneMutation.mutateAsync({
        taskId: markingDoneTask.id,
        ...data,
      });
      toast.success('Task marked as done');
      setMarkingDoneTask(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark task as done');
      throw error;
    }
  };

  const handleTogglePin = async (taskId: bigint, isPinned: boolean) => {
    try {
      await setTaskPinnedMutation.mutateAsync({ taskId, isPinned });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update pin status');
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFrequency = filterFrequency === 'all' || task.frequency === filterFrequency;
      return matchesSearch && matchesFrequency;
    })
    .sort((a, b) => {
      const nextDueA = computeNextDueDate(a.frequency, undefined, a.lastCompleted, a.createdAt);
      const nextDueB = computeNextDueDate(b.frequency, undefined, b.lastCompleted, b.createdAt);
      const urgencyA = computeUrgencyScore(a.frequency, nextDueA, a.isPinned);
      const urgencyB = computeUrgencyScore(b.frequency, nextDueB, b.isPinned);
      return urgencyB - urgencyA;
    });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                To-Do List
              </CardTitle>
              <CardDescription>Shared tasks for the team</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterFrequency} onValueChange={(value) => setFilterFrequency(value as 'all' | TaskFrequency)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value={TaskFrequencyEnum.daily}>Daily</SelectItem>
                <SelectItem value={TaskFrequencyEnum.weekly}>Weekly</SelectItem>
                <SelectItem value={TaskFrequencyEnum.monthly}>Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ToDoTable
            tasks={filteredAndSortedTasks}
            onEdit={setEditingTask}
            onMarkDone={setMarkingDoneTask}
            onTogglePin={handleTogglePin}
            isLoading={tasksLoading}
          />
        </CardContent>
      </Card>

      <ToDoTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTask}
        isLoading={createTaskMutation.isPending}
      />

      <ToDoTaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={handleUpdateTask}
        task={editingTask}
        isLoading={updateTaskMutation.isPending}
      />

      <MarkTaskDoneDialog
        open={!!markingDoneTask}
        onOpenChange={(open) => !open && setMarkingDoneTask(null)}
        onSubmit={handleMarkTaskDone}
        task={markingDoneTask}
        isLoading={markTaskDoneMutation.isPending}
      />
    </>
  );
}
