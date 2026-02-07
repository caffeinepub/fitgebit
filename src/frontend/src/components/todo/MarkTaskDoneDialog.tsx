import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { ToDoTask } from '../../backend';

interface MarkTaskDoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    evidencePhotoPath: string | null;
    completionComment: string | null;
  }) => Promise<void>;
  task: ToDoTask | null;
  isLoading: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      toast.error('Please select a JPEG or PNG image');
      e.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Image must be smaller than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let photoData: string | null = null;

      if (selectedFile) {
        // Convert to base64 for storage
        const reader = new FileReader();
        photoData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      await onSubmit({
        evidencePhotoPath: photoData,
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

            <div className="space-y-2">
              <Label htmlFor="photo">Photo (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Camera className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                JPEG or PNG, max 2MB
              </p>
            </div>

            {previewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}
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
