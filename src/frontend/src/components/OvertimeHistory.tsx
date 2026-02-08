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
import { Search, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getOvertimeCellClass } from '../utils/overtimeStyles';

interface OvertimeHistoryProps {
  entries: OvertimeEntry[];
  isLoading: boolean;
}

const ENTRIES_PER_PAGE = 50;

// Convert YYYY-MM-DD to DD-MM-YYYY
const formatDateEuropean = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

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

export default function OvertimeHistory({ entries, isLoading }: OvertimeHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    
    const term = searchTerm.toLowerCase();
    return entries.filter(
      (entry) =>
        formatDateEuropean(entry.date).includes(term) ||
        entry.comment.toLowerCase().includes(term)
    );
  }, [entries, searchTerm]);

  const totalPages = Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + ENTRIES_PER_PAGE);

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
                {paginatedEntries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatDateEuropean(entry.date)}
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
                  </TableRow>
                ))}
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
