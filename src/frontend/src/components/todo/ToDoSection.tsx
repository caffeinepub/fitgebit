import { useState, useEffect } from 'react';
import { useGetAllTasks, useCreateTask, useUpdateTask, useDeleteTask, useMarkTaskDone, useSetTaskPinnedStatus } from '../../hooks/useQueries';
import ToDoTable from './ToDoTable';
import ToDoTaskDialog from './ToDoTaskDialog';
import MarkTaskDoneDialog from './MarkTaskDoneDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { ToDoTask, TaskFrequency } from '../../backend';
import { ExternalBlob } from '../../backend';

export default function ToDoSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ToDoTask | null>(null);
  const [markingDoneTask, setMarkingDoneTask] = useState<ToDoTask | null>(null);

  const { data: tasks = [], isLoading, refetch } = useGetAllTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const markTaskDoneMutation = useMarkTaskDone();
  const setTaskPinnedMutation = useSetTaskPinnedStatus();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    frequency: TaskFrequency;
    isWeekly: boolean;
  }) => {
    try {
      await createTaskMutation.mutateAsync(data);
      toast.success('Task created successfully');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
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
        taskId: Number(editingTask.id),
        ...data,
      });
      toast.success('Task updated successfully');
      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: bigint) => {
    try {
      await deleteTaskMutation.mutateAsync(Number(taskId));
      toast.success('Task deleted successfully');
      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleMarkTaskDone = async (data: {
    photoData: ExternalBlob | null;
    photoFormat: string | null;
    completionComment: string | null;
  }) => {
    if (!markingDoneTask) return;

    try {
      await markTaskDoneMutation.mutateAsync({
        taskId: Number(markingDoneTask.id),
        photoData: data.photoData || undefined,
        completionComment: data.completionComment || undefined,
      });
      toast.success('Task marked as done');
      setMarkingDoneTask(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark task as done');
    }
  };

  const handleTogglePin = async (taskId: bigint, isPinned: boolean) => {
    try {
      await setTaskPinnedMutation.mutateAsync({ taskId: Number(taskId), isPinned });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update pin status');
    }
  };

  const handleEditTask = (task: ToDoTask) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      task.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <ToDoTable
        tasks={filteredTasks}
        isLoading={isLoading}
        onEdit={handleEditTask}
        onMarkDone={setMarkingDoneTask}
        onTogglePin={handleTogglePin}
      />

      <ToDoTaskDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
        isDeleting={deleteTaskMutation.isPending}
      />

      {markingDoneTask && (
        <MarkTaskDoneDialog
          open={!!markingDoneTask}
          onOpenChange={(open) => !open && setMarkingDoneTask(null)}
          onSubmit={handleMarkTaskDone}
          task={markingDoneTask}
          isLoading={markTaskDoneMutation.isPending}
        />
      )}
    </div>
  );
}
