import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { ToDoTask, TaskFrequency } from '../../backend';
import { TaskFrequency as TaskFrequencyEnum } from '../../backend';

interface ToDoTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    frequency: TaskFrequency;
    isWeekly: boolean;
  }) => Promise<void>;
  task?: ToDoTask | null;
  isLoading: boolean;
}

export default function ToDoTaskDialog({ open, onOpenChange, onSubmit, task, isLoading }: ToDoTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<TaskFrequency>(TaskFrequencyEnum.weekly);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const isWeekly = frequency === TaskFrequencyEnum.weekly;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setFrequency(task.frequency);
    } else {
      setTitle('');
      setDescription('');
      setFrequency(TaskFrequencyEnum.weekly);
    }
    setErrors({});
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        frequency,
        isWeekly,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {task ? 'Update task details below' : 'Add a new task to the shared to-do list'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="Enter task title"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">
                Frequency <span className="text-destructive">*</span>
              </Label>
              <Select
                value={frequency}
                onValueChange={(value) => {
                  setFrequency(value as TaskFrequency);
                }}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskFrequencyEnum.daily}>Daily</SelectItem>
                  <SelectItem value={TaskFrequencyEnum.weekly}>Weekly</SelectItem>
                  <SelectItem value={TaskFrequencyEnum.monthly}>Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
