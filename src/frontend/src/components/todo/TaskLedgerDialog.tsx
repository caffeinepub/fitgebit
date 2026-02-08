import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { useGetTaskHistory } from '../../hooks/useQueries';
import type { AuditLogAction } from '../../backend';
import { useState } from 'react';
import EvidenceImagePreviewDialog from './EvidenceImagePreviewDialog';
import { getExternalBlobUrl } from '../../utils/externalBlobUrl';

interface TaskLedgerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: bigint;
  taskTitle: string;
}

export default function TaskLedgerDialog({ open, onOpenChange, taskId, taskTitle }: TaskLedgerDialogProps) {
  const { data: history = [], isLoading } = useGetTaskHistory(Number(taskId));
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadgeVariant = (action: AuditLogAction): 'default' | 'secondary' | 'outline' => {
    switch (action) {
      case 'taskCreated':
        return 'default';
      case 'taskUpdated':
        return 'secondary';
      case 'taskMarkedDone':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getActionLabel = (action: AuditLogAction): string => {
    switch (action) {
      case 'taskCreated':
        return 'Created';
      case 'taskUpdated':
        return 'Updated';
      case 'taskMarkedDone':
        return 'Completed';
      default:
        return action;
    }
  };

  const handleViewPhoto = async (entry: typeof history[0]) => {
    if (!entry.evidencePhoto) return;
    
    try {
      const url = await getExternalBlobUrl(entry.evidencePhoto);
      setPreviewImage(url);
    } catch (error) {
      console.error('Failed to load photo:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task History</DialogTitle>
            <DialogDescription>{taskTitle}</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No history available</p>
              <p className="text-sm text-muted-foreground">Task actions will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => {
                    const displayName = entry.userInitials || entry.username;
                    
                    return (
                      <TableRow key={entry.id.toString()}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatTimestamp(entry.timestamp)}
                        </TableCell>
                        <TableCell className="font-medium">{displayName}</TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(entry.action)}>
                            {getActionLabel(entry.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{entry.summary}</p>
                            {entry.completionComment && (
                              <p className="text-sm text-muted-foreground italic">
                                "{entry.completionComment}"
                              </p>
                            )}
                            {entry.evidencePhoto && (
                              <button
                                onClick={() => handleViewPhoto(entry)}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <ImageIcon className="h-3 w-3" />
                                View photo
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {previewImage && (
        <EvidenceImagePreviewDialog
          open={!!previewImage}
          onOpenChange={(open) => !open && setPreviewImage(null)}
          imageUrl={previewImage}
          taskTitle={taskTitle}
        />
      )}
    </>
  );
}
