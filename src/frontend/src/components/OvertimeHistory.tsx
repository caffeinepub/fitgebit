import { useState, useMemo } from 'react';
import type { OvertimeEntry } from '../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, Plus, Minus, Check, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getOvertimeCellClass } from '../utils/overtimeStyles';
import { formatOvertimeDate, getLocalToday, isFutureDate } from '../utils/overtimeDates';
import { useEditLatestOvertimeEntry } from '../hooks/useQueries';
import { toast } from 'sonner';

interface OvertimeHistoryProps {
  entries: OvertimeEntry[];
  isLoading: boolean;
  username: string;
}

const ENTRIES_PER_PAGE = 50;

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

export default function OvertimeHistory({ entries, isLoading, username }: OvertimeHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editMinutes, setEditMinutes] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editIsAdd, setEditIsAdd] = useState(true);
  const [editError, setEditError] = useState('');

  const editMutation = useEditLatestOvertimeEntry();

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    
    const term = searchTerm.toLowerCase();
    return entries.filter(
      (entry) =>
        formatOvertimeDate(entry.date).includes(term) ||
        entry.comment.toLowerCase().includes(term)
    );
  }, [entries, searchTerm]);

  const totalPages = Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + ENTRIES_PER_PAGE);

  // Find the latest entry by timestamp
  const latestEntry = entries.length > 0 
    ? entries.reduce((latest, current) => 
        Number(current.timestamp) > Number(latest.timestamp) ? current : latest
      )
    : null;

  const handleRowClick = (entry: OvertimeEntry, index: number) => {
    // Only allow editing the latest entry
    if (latestEntry && entry.timestamp === latestEntry.timestamp) {
      setEditingIndex(index);
      setEditDate(entry.date);
      setEditMinutes(Number(entry.minutes).toString());
      setEditComment(entry.comment);
      setEditIsAdd(entry.isAdd);
      setEditError('');
    }
  };

  const handleSave = async () => {
    setEditError('');

    // Validation
    if (!editDate) {
      setEditError('Date is required');
      return;
    }

    if (isFutureDate(editDate)) {
      setEditError('Cannot select a future date');
      return;
    }

    const minutes = parseInt(editMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) {
      setEditError('Minutes must be a positive number');
      return;
    }

    if (!editComment.trim()) {
      setEditError('Comment is required');
      return;
    }

    try {
      const updatedEntry: OvertimeEntry = {
        date: editDate,
        minutes: BigInt(minutes),
        comment: editComment.trim(),
        isAdd: editIsAdd,
        timestamp: latestEntry!.timestamp,
      };

      await editMutation.mutateAsync({
        username,
        entry: updatedEntry,
      });
      
      toast.success('Overtime entry updated successfully');
      setEditingIndex(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update overtime entry';
      setEditError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditError('');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by date or comment..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9"
        />
      </div>

      {filteredEntries.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {searchTerm ? 'No entries found matching your search' : 'No overtime entries yet'}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.map((entry, index) => {
                  const isLatest = latestEntry && entry.timestamp === latestEntry.timestamp;
                  const isEditing = editingIndex === index;

                  return (
                    <TableRow 
                      key={index}
                      onClick={() => !isEditing && handleRowClick(entry, index)}
                      className={isLatest && !isEditing ? 'cursor-pointer hover:bg-muted/50' : ''}
                    >
                      {isEditing ? (
                        <>
                          <TableCell>
                            <Input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              max={getLocalToday()}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <select
                              value={editIsAdd ? 'add' : 'use'}
                              onChange={(e) => setEditIsAdd(e.target.value === 'add')}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="add">Added</option>
                              <option value="use">Used</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editMinutes}
                              onChange={(e) => setEditMinutes(e.target.value)}
                              placeholder="Minutes"
                              min="1"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Input
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                placeholder="Comment"
                                className="w-full"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSave}
                                  disabled={editMutation.isPending}
                                >
                                  <Check className="mr-1 h-3 w-3" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                  disabled={editMutation.isPending}
                                >
                                  <X className="mr-1 h-3 w-3" />
                                  Cancel
                                </Button>
                              </div>
                              {editError && (
                                <p className="text-sm text-destructive">{editError}</p>
                              )}
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">
                            {formatOvertimeDate(entry.date)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={entry.isAdd ? 'default' : 'secondary'}>
                              {entry.isAdd ? (
                                <>
                                  <Plus className="mr-1 h-3 w-3" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <Minus className="mr-1 h-3 w-3" />
                                  Used
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className={getOvertimeCellClass(entry.isAdd)}>
                            {formatMinutes(Number(entry.minutes))}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.comment || '-'}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + ENTRIES_PER_PAGE, filteredEntries.length)} of{' '}
                {filteredEntries.length} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
