import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle2, Pin, PinOff, Image as ImageIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ToDoTask } from '../../backend';
import { TaskFrequency } from '../../backend';
import { getFrequencyLabel, computeNextDueDate, formatNextDueDate, getUrgencyLevel } from '../../utils/todoDates';
import { useState } from 'react';
import EvidenceImagePreviewDialog from './EvidenceImagePreviewDialog';
import TaskLedgerDialog from './TaskLedgerDialog';

interface ToDoTableProps {
  tasks: ToDoTask[];
  onEdit: (task: ToDoTask) => void;
  onMarkDone: (task: ToDoTask) => void;
  onTogglePin: (taskId: bigint, isPinned: boolean) => void;
  isLoading?: boolean;
}

export default function ToDoTable({ tasks, onEdit, onMarkDone, onTogglePin, isLoading }: ToDoTableProps) {
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<{ id: bigint; title: string } | null>(null);

  const formatTimestamp = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'Never';
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFrequencyColor = (frequency: TaskFrequency, urgency: 'high' | 'medium' | 'low') => {
    const baseColors = {
      [TaskFrequency.daily]: {
        low: 'oklch(0.85 0.08 120)',
        medium: 'oklch(0.75 0.12 120)',
        high: 'oklch(0.65 0.18 120)',
      },
      [TaskFrequency.weekly]: {
        low: 'oklch(0.85 0.08 240)',
        medium: 'oklch(0.75 0.12 240)',
        high: 'oklch(0.65 0.18 240)',
      },
      [TaskFrequency.monthly]: {
        low: 'oklch(0.85 0.08 300)',
        medium: 'oklch(0.75 0.12 300)',
        high: 'oklch(0.65 0.18 300)',
      },
    };

    return baseColors[frequency][urgency];
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm text-muted-foreground">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <>
      <TooltipProvider>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Last Completed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const nextDue = computeNextDueDate(task.frequency, undefined, task.lastCompleted, task.createdAt);
                const urgency = getUrgencyLevel(task.frequency, nextDue);
                const frequencyColor = getFrequencyColor(task.frequency, urgency);

                return (
                  <TableRow
                    key={task.id.toString()}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedTaskForHistory({ id: task.id, title: task.title })}
                    style={{
                      borderLeft: `4px solid ${frequencyColor}`,
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(task.id, !task.isPinned);
                            }}
                            className="h-8 w-8"
                          >
                            {task.isPinned ? (
                              <Pin className="h-4 w-4 fill-current" />
                            ) : (
                              <PinOff className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {task.isPinned ? 'Unpin task' : 'Pin to top'}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{task.title}</p>
                                <Badge variant="outline" className="text-xs">
                                  {getFrequencyLabel(task.frequency)}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Next due: {formatNextDueDate(nextDue)}</p>
                            </TooltipContent>
                          </Tooltip>
                          {task.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              Pinned
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                        {task.completionComment && (
                          <p className="text-sm text-muted-foreground italic">
                            "{task.completionComment}"
                          </p>
                        )}
                        {task.evidencePhotoPath && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage({ url: task.evidencePhotoPath!, title: task.title });
                            }}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <ImageIcon className="h-3 w-3" />
                            View photo
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{formatTimestamp(task.lastCompleted)}</p>
                        {task.completedByUsername && (
                          <p className="text-xs text-muted-foreground">by {task.completedByUsername}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                          }}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkDone(task);
                          }}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Done
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>

      {previewImage && (
        <EvidenceImagePreviewDialog
          open={!!previewImage}
          onOpenChange={(open) => !open && setPreviewImage(null)}
          imageUrl={previewImage.url}
          taskTitle={previewImage.title}
        />
      )}

      {selectedTaskForHistory && (
        <TaskLedgerDialog
          open={!!selectedTaskForHistory}
          onOpenChange={(open) => !open && setSelectedTaskForHistory(null)}
          taskId={selectedTaskForHistory.id}
          taskTitle={selectedTaskForHistory.title}
        />
      )}
    </>
  );
}
