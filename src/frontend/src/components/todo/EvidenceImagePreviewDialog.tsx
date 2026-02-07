import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EvidenceImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  taskTitle: string;
}

export default function EvidenceImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  taskTitle,
}: EvidenceImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Evidence Photo - {taskTitle}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="relative w-full overflow-hidden rounded-md">
          <img
            src={imageUrl}
            alt={`Evidence for ${taskTitle}`}
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
