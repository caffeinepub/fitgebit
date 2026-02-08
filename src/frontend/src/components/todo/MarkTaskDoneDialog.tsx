import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import type { ToDoTask } from '../../backend';
import TaskCompletionPhotoInput from './TaskCompletionPhotoInput';

interface MarkTaskDoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    photoData: ExternalBlob | null;
    photoFormat: string | null;
    completionComment: string | null;
  }) => Promise<void>;
  task: ToDoTask | null;
  isLoading: boolean;
}

export default function MarkTaskDoneDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  isLoading,
}: MarkTaskDoneDialogProps) {
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePhotoSelected = (file: File | null, preview: string | null) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let photoData: ExternalBlob | null = null;
      let photoFormat: string | null = null;

      if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        photoData = ExternalBlob.fromBytes(bytes);
        photoFormat = selectedFile.type;
      }

      await onSubmit({
        photoData,
        photoFormat,
        completionComment: comment.trim() || null,
      });

      // Reset form
      setComment('');
      setSelectedFile(null);
      setPreviewUrl(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to mark task done:', error);
    }
  };

  const handleCancel = () => {
    setComment('');
    setSelectedFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mark Task as Done</DialogTitle>
            <DialogDescription>
              Completing: <span className="font-medium">{task?.title || ''}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any notes about completing this task..."
                rows={3}
              />
            </div>

            <TaskCompletionPhotoInput
              onPhotoSelected={handlePhotoSelected}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Done
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
